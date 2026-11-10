# みぬくま (Minukuma) - 日本三大找房平台「一键脱水避坑」插件规格书

> **项目名称**：みぬくま (Minukuma / 英文名：SumuLens)
>
> **定位**：兼容日本三大平台（**SUUMO**、**LIFULL HOME'S**、**at home**）的桌面端租房透视扩展（Chrome / Edge / Brave）
>
> **Slogan**：日本の賃貸のウラを、見抜くま！ (识破虚标租金与暗坑的找房小侦探)
>
> **目标执行者**：Coding Agent (Claude Code / Cursor / Windsurf / Codex)
>
> **核心架构**：适配器模式 (Adapter Pattern) + 纯客户端 Content Script 注入（0 服务端依赖、0 反爬阻断）

---

## 1. 系统架构与适配器模式设计 (Adapter Pattern)

为了同时支撑三大平台，项目采用松耦合的适配器架构。无论是哪个网站，抓取到的数据统一归一化为标准的 `RawPropertyData`，输入给统一的规则与数学引擎：

```
                      [ SUUMO Adapter ]   ──┐
                                            │
               [ LIFULL HOME'S Adapter ]  ──┼─► [ 统一实体 RawPropertyData ]
                                            │                 │
                    [ at home Adapter ]   ──┘                 ▼
                                                   [ 共享计算与避坑核心引擎 ]
                                                    - costCalculator (实质月租)
                                                    - riskDetector (暗坑雷达)
                                                              │
                                                              ▼
                                                   [ 统一挂载 UI 组件 ]
                                                    - ListOverlay (列表徽章)
                                                    - HealthDrawer (详情抽屉)
```

---

## 2. 匹配规则与权限清单 (`wxt.config.ts`)

```typescript
import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'みぬくま (Minukuma) - 賃貸の実質家賃・落とし穴チェッカー',
    description: 'SUUMO、HOME\'S、at homeの「おとり・実質家賃・LPガス・木造」を一瞬で脱水・可視化する拡張機能',
    version: '1.0.0',
    permissions: ['storage'],
    host_permissions: [
      '*://*.suumo.jp/*',
      '*://*.homes.co.jp/*',
      '*://*.athome.co.jp/*'
    ],
    action: {
      default_title: 'みぬくま 设置'
    }
  },
  modules: ['@wxt-dev/module-react']
});
```

---

## 3. 统一数据契约与接口规范 (`src/types/index.ts`)

```typescript
export type PlatformType = 'suumo' | 'homes' | 'athome';

// 各平台归一化后的原始数据输入
export interface RawPropertyData {
  platform: PlatformType;
  propertyId: string;
  propertyName: string;
  roomNumber?: string;
  sourceUrl: string;
  
  // 租金核心数值（单位：日元）
  monthlyRent: number;          // 表面租金 (例: 85000)
  managementFee: number;        // 管理费/共益费 (例: 8000)
  depositFee: number;           // 敷金/保證金
  keyMoneyFee: number;          // 礼金 (不可退)
  
  // 建筑与房源属性文本（用于暗坑扫描）
  buildingStructureText: string;// 如: "木造", "鉄筋コンクリート(RC)"
  gasTypeText: string;          // 如: "プロパンガス", "都市ガス"
  floorText: string;            // 如: "1階", "3階/10階建"
  contractTypeText: string;     // 如: "普通借家", "定期借家 2年"
  rawTextBlob: string;          // 房源全部详细小字，用于兜底扫描
}

// 避坑检查项
export interface RiskBadge {
  id: string;
  label: string;
  severity: 'danger' | 'warning' | 'success' | 'info';
  detail: string;
}

// 统一脱水结算报告输出
export interface PropertyHealthReport {
  // 实质月租计算
  trueMonthlyCost: number;       // 2年摊销后的真实月付 (例: 104200)
  monthlyDiffAmount: number;     // 比表面租金多出的月支出 (例: 11200)
  
  // 头金构成
  initialCosts: {
    totalEstimated: number;      // 入住需备现金总额
    keyMoney: number;            // 礼金
    deposit: number;             // 敷金
    agencyFee: number;           // 中介手续费 (按1.1个月估算)
    fireInsurance: number;       // 火险 (默认 18000)
    guaranteeInitialFee: number; // 保证会社初回费 (按0.5个月月租估)
    lockExchangeFee: number;     // 换锁费 (默认 22000)
  };

  // 命中的风险暗坑
  risks: RiskBadge[];
}
```

---

## 4. 共享计算与避坑引擎 (`src/engine/`)

### 4.1 实质月租算法 (`src/engine/calculator.ts`)

```typescript
import { RawPropertyData, PropertyHealthReport } from '../types';

export function calculateTrueCost(raw: RawPropertyData): PropertyHealthReport {
  const { monthlyRent, managementFee, keyMoneyFee, depositFee } = raw;

  // 1. 估算初期不可退费用与头金明细
  const agencyFee = Math.round(monthlyRent * 1.1); // 默认 1.1 个月上限
  const guaranteeFee = Math.round((monthlyRent + managementFee) * 0.5); // 0.5 个月
  const fireInsurance = 18000;
  const lockExchange = 22000;

  // 不可退回的损耗总额
  const sunkInitialTotal = keyMoneyFee + agencyFee + guaranteeFee + fireInsurance + lockExchange;

  // 入住需备现金（含可退敷金）
  const totalCashNeeded = sunkInitialTotal + depositFee;

  // 24 个月标准租期摊销
  const amortizedMonthlySunk = Math.round(sunkInitialTotal / 24);
  const trueMonthly = monthlyRent + managementFee + amortizedMonthlySunk;
  const diff = trueMonthly - monthlyRent;

  return {
    trueMonthlyCost: trueMonthly,
    monthlyDiffAmount: diff,
    initialCosts: {
      totalEstimated: totalCashNeeded,
      keyMoney: keyMoneyFee,
      deposit: depositFee,
      agencyFee,
      fireInsurance,
      guaranteeInitialFee: guaranteeFee,
      lockExchangeFee: lockExchange,
    },
    risks: scanRisks(raw),
  };
}
```

### 4.2 全平台通用的暗坑规则库 (`src/engine/scanner.ts`)

```typescript
import { RawPropertyData, RiskBadge } from '../types';

export function scanRisks(raw: RawPropertyData): RiskBadge[] {
  const risks: RiskBadge[] = [];
  const fullText = `${raw.buildingStructureText} ${raw.gasTypeText} ${raw.floorText} ${raw.contractTypeText} ${raw.rawTextBlob}`;

  // 1. 燃气类型检测
  if (/プロパンガス|LPガス/i.test(fullText)) {
    risks.push({
      id: 'propane_gas',
      label: '🚨 LP瓦斯(高额煤气)',
      severity: 'danger',
      detail: '冬季洗澡取暖煤气费通常比都市瓦斯贵 1.5~2 倍（每月多掏 4k~8k 円）',
    });
  } else if (/都市ガス/i.test(fullText)) {
    risks.push({
      id: 'city_gas',
      label: '都市瓦斯',
      severity: 'success',
      detail: '能源成本正常',
    });
  }

  // 2. 隔音与建筑结构
  if (/木造|軽量鉄骨|ALC/i.test(raw.buildingStructureText)) {
    risks.push({
      id: 'wood_structure',
      label: '⚠️ 隔音较弱(木造/轻铁)',
      severity: 'warning',
      detail: '非混凝土构造，上下楼与隔壁生活音传导明显，对声音敏感者慎选',
    });
  } else if (/RC|鉄筋コンクリート|SRC/i.test(raw.buildingStructureText)) {
    risks.push({
      id: 'rc_structure',
      label: 'RC造/隔音优',
      severity: 'success',
      detail: '钢筋混凝土结构，隔音与气密性较好',
    });
  }

  // 3. 定期借家陷阱
  if (/定期借家/i.test(raw.contractTypeText) && !/再契約可/i.test(fullText)) {
    risks.push({
      id: 'fixed_term_lease',
      label: '🚨 定期借家(难续约)',
      severity: 'danger',
      detail: '租约期满后房东有绝对权力收房，不受法定普通租约保护',
    });
  }

  // 4. 1 楼与采光防盗
  if (/^1階|地下/i.test(raw.floorText)) {
    risks.push({
      id: 'ground_floor',
      label: '1楼/易潮湿',
      severity: 'info',
      detail: '低楼层可能存在采光差、潮湿易发霉、防盗隐私偏弱风险',
    });
  }

  return risks;
}
```

---

## 5. 三大平台适配器 DOM 抓取规则 (`src/adapters/`)

每个适配器实现统一接口 `SiteAdapter`：

```typescript
export interface SiteAdapter {
  isListPage(): boolean;
  isDetailPage(): boolean;
  parseListItems(): Array<{ element: HTMLElement; data: RawPropertyData }>;
  parseDetailPage(): RawPropertyData | null;
  getInsertionPointForDetail(): HTMLElement | null;
}
```

### 5.1 SUUMO 适配器 (`src/adapters/suumo.ts`)
* **列表页规则**：识别 `.cassetteitem` 容器及其子行 `.cassetteitem_other tr`。
* **租金抓取**：提取 `.cassetteitem_price--rent` 或包含 `万円` 的加粗字段。
* **结构与年份**：取 `.cassetteitem_detail-col1` 内部文本。

### 5.2 LIFULL HOME'S 适配器 (`src/adapters/homes.ts`)
* **列表页规则**：识别 `.mod-mergeBuilding` 或 `.mod-bukkenCassette`。
* **租金抓取**：提取 `.price` / `.money` 字段中的数值。
* **瓦斯/结构抓取**：HOME'S 在详情页表格的 `th:contains('建物構造')` 和 `th:contains('ガス')` 查找对应的 `td`。

### 5.3 at home 适配器 (`src/adapters/athome.ts`)
* **列表页规则**：识别 `.object-item` 或 `.mod-pickupItem`。
* **租金抓取**：提取 `.num` 包含的租金与管理费。
* **结构抓取**：提取规格栏目中标记 `鉄骨`、`木造` 的标签文本。

---

## 6. UI 原地注入规范与みぬくま小熊视觉

### 6.1 列表页徽章注入 (`<ListCostBadge />`)
在三大平台的房源列表页表面租金旁边，原地挂载 React 根节点并渲染：
* **核心内容**：
  * 醒目翡翠绿胶囊：`実質月額: ¥104,200`
  * 差额标签：`(+¥19,200)`
  * 暗坑标签：`[🚨 LP瓦斯]`、`[⚠️ 木造]`
* **顶部超级筛选条**：
  在搜索列表顶部注入一行轻量工具栏：
  * `[ 隐藏 LP 瓦斯 ]` (开关，一键 display:none)
  * `[ 仅看 RC 隔音造 ]`
  * `[ 按实质月租重新排位 ]`

### 6.2 详情页抽屉 (`<MinukumaDrawer />`)
在三大平台详情页右下角悬浮戴侦探帽的小熊图标，点击滑出 360px 宽的半透明抽屉面板：
1. **小熊诊断报告**：
   * 顶部显示 Minukuma 头像与综合评分：“小熊提示：这套房表面看着便宜，但加上礼金和 LP 瓦斯，每月其实要多付 ¥14,000！”
2. **头金支出明细账**（敷金、礼金、中介费、保证费清单）；
3. **一键生成砍中介费模板**：
   * 点击 `[ 📋 复制中介费半额/0円询盘话术 ]`，将当前房源的网址与编号套入礼貌的商务日文模板中，写入用户剪贴板。

---

## 7. 给 Coding Agent 的分步实施计划 (Roadmap)

请按以下顺序分阶段执行并自测：

* [ ] **Step 1: 初始化 WXT 多网站插件项目**
  * 使用 WXT 初始化 React + Tailwind 模板；
  * 在 `wxt.config.ts` 中配置针对 SUUMO、HOME'S、at home 的三方匹配权限；
  * 安装图标与工具依赖：`pnpm add lucide-react clsx tailwind-merge`。
* [ ] **Step 2: 编写共享计算与避坑核心引擎**
  * 创建 `src/types/index.ts`，录入归一化接口；
  * 编写 `src/engine/calculator.ts`，验证 24 个月实质月租公式；
  * 编写 `src/engine/scanner.ts`，验证 LP 瓦斯、木造、定期借家的正则命中率。
* [ ] **Step 3: 编写首个平台适配器 (SUUMO Adapter)**
  * 在 `src/adapters/suumo.ts` 中实现列表页与详情页的 DOM 提取；
  * 调试列表页挂载，确保在每行租金旁成功渲染 `<ListCostBadge />`；
  * 调试详情页，确保右下角能弹出带有头金明细的 `<MinukumaDrawer />`。
* [ ] **Step 4: 扩展支持 HOME'S 与 at home 适配器**
  * 实现 `src/adapters/homes.ts`，匹配 LIFULL HOME'S 列表与详情页面；
  * 实现 `src/adapters/athome.ts`，匹配 at home 房源节点；
  * 在入口 Content Script 中根据 `window.location.hostname` 自动分发到对应适配器。
* [ ] **Step 5: 顶部快捷过滤栏与多平台联调测试**
  * 实现列表页顶部注入的快速隐藏（LP瓦斯/木造）开关；
  * 分别打开真实的 SUUMO、HOME'S、at home 页面加载未解压扩展进行实战测试，确保样式不塌陷、无跨域异常。