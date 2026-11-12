import fs from 'node:fs';
import path from 'node:path';

const outputDir = path.resolve('promo_assets/xhs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function getBase64DataUrl(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

const uploadsDir = '/Users/longlab/.gemini/antigravity/brain/33afa170-47ae-4abb-9133-7849facbde83/.user_uploaded';
const icon128 = getBase64DataUrl(path.resolve('public/icons/128.png'));
const imgSuumoList = getBase64DataUrl(path.join(uploadsDir, 'media_1794376263580_68efac68.png'));
const imgSuumoDrawer = getBase64DataUrl(path.join(uploadsDir, 'media_1794378441030_b1cc214a.jpg'));
const imgPopup = getBase64DataUrl(path.join(uploadsDir, 'media_1794376113604_f867feba.png'));
const imgStations = getBase64DataUrl(path.join(uploadsDir, 'media_1794377385017_c0e6e705.jpg'));

// Base styles for Xiaohongshu 1080x1440 (3:4 ratio)
const commonStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
  body {
    width: 1080px;
    height: 1440px;
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans", "Microsoft YaHei", sans-serif;
    background: #fdf8f2;
    color: #3e2723;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 60px 54px;
    justify-content: space-between;
  }
  .bg-decor {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: 
      radial-gradient(#ebd9c5 1.5px, transparent 1.5px),
      radial-gradient(#ebd9c5 1.5px, #fdf8f2 1.5px);
    background-size: 32px 32px;
    background-position: 0 0, 16px 16px;
    opacity: 0.5;
    z-index: 0;
  }
  .bg-glow {
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 214, 153, 0.5) 0%, rgba(255, 245, 230, 0) 70%);
    top: -100px;
    right: -100px;
    z-index: 1;
  }
  .top-header {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px dashed #ebd0bc;
    padding-bottom: 24px;
  }
  .brand-pill {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fff;
    padding: 8px 18px;
    border-radius: 30px;
    border: 2px solid #43251c;
    box-shadow: 0 4px 0 #43251c;
  }
  .brand-pill img {
    width: 38px;
    height: 38px;
    border-radius: 8px;
  }
  .brand-pill span {
    font-size: 20px;
    font-weight: 900;
    color: #43251c;
    letter-spacing: -0.5px;
  }
  .page-num {
    font-size: 18px;
    font-weight: 800;
    color: #8d6e63;
    background: #faeedd;
    padding: 6px 16px;
    border-radius: 20px;
    border: 1.5px solid #ebd0bc;
  }
  .content-main {
    position: relative;
    z-index: 10;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 32px;
    margin: 20px 0;
  }
  .bottom-footer {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 2px dashed #ebd0bc;
    padding-top: 24px;
    font-size: 16px;
    font-weight: 700;
    color: #8d6e63;
  }
  .footer-tags {
    display: flex;
    gap: 10px;
  }
  .f-tag {
    background: #ebd8c8;
    color: #43251c;
    padding: 4px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 700;
  }
  .card-box {
    background: #fff;
    border: 3px solid #43251c;
    border-radius: 24px;
    box-shadow: 0 8px 0 #43251c;
    overflow: hidden;
  }
`;

// Slide 1: Cover
const slide1 = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${commonStyles}
.cover-tag-row {
  display: flex;
  gap: 12px;
}
.cover-tag {
  background: #ff5722;
  color: #fff;
  font-size: 22px;
  font-weight: 900;
  padding: 8px 22px;
  border-radius: 30px;
  border: 2.5px solid #43251c;
  box-shadow: 0 4px 0 #43251c;
}
.cover-tag.secondary {
  background: #ffc107;
  color: #43251c;
}
.cover-hero-title {
  font-size: 64px;
  line-height: 1.22;
  font-weight: 900;
  color: #43251c;
  letter-spacing: -1.5px;
}
.cover-hero-title mark {
  background: #ff5722;
  color: #fff;
  padding: 0 8px;
  border-radius: 8px;
}
.vs-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 3px solid #43251c;
  border-radius: 20px;
  box-shadow: 0 8px 0 #43251c;
  padding: 24px 32px;
  gap: 20px;
}
.vs-item {
  flex: 1;
  text-align: center;
}
.vs-item.fake {
  opacity: 0.7;
}
.vs-item.real {
  background: #fff8e1;
  border: 2px solid #ff9800;
  border-radius: 16px;
  padding: 16px;
}
.vs-label {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 6px;
}
.vs-price {
  font-size: 38px;
  font-weight: 900;
}
.cover-badge-banner {
  background: #43251c;
  color: #fff;
  padding: 18px 24px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.c-pill-wrap {
  display: flex;
  gap: 8px;
}
.c-pill {
  background: #ffecd2;
  color: #b24d00;
  font-size: 15px;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 20px;
}
</style>
</head>
<body>
<div class="bg-decor"></div>
<div class="bg-glow"></div>

<div class="top-header">
  <div class="brand-pill">
    <img src="${icon128}" />
    <span>みぬくま Minukuma</span>
  </div>
  <div class="page-num">01 / 05</div>
</div>

<div class="content-main">
  <div class="cover-tag-row">
    <div class="cover-tag">🚨 日本租房避坑指南</div>
    <div class="cover-tag secondary">留学生必看</div>
  </div>

  <h1 class="cover-hero-title">
    在日租房别当冤种！<br>
    中介不敢说的<mark>真实月租</mark>
  </h1>

  <div class="vs-container">
    <div class="vs-item fake">
      <div class="vs-label" style="color: #757575;">❌ 页面标价房租</div>
      <div class="vs-price" style="color: #757575; text-decoration: line-through;">13.3 万円</div>
      <div style="font-size: 15px; color: #9e9e9e; margin-top: 4px;">不含管理费与隐性费用</div>
    </div>
    <div style="font-size: 32px; font-weight: 900; color: #e65100;">VS</div>
    <div class="vs-item real">
      <div class="vs-label" style="color: #e65100;">⭕️ 真实实付月租</div>
      <div class="vs-price" style="color: #d84315;">约 14.5 万/月</div>
      <div style="font-size: 15px; font-weight: 700; color: #e65100; margin-top: 4px;">每月多出 +12,000円！</div>
    </div>
  </div>

  <div class="card-box" style="padding: 20px;">
    <div style="font-size: 17px; font-weight: 800; color: #43251c; margin-bottom: 12px;">🐻 自制免费 Chrome 插件「みぬくま」· 自动脱水</div>
    <img src="${imgSuumoList}" style="width: 100%; border-radius: 12px; border: 1.5px solid #ebd0bc;" />
  </div>

  <div class="cover-badge-banner">
    <div style="font-size: 19px; font-weight: 800;">🔥 全面支持日本主流租房平台</div>
    <div class="c-pill-wrap">
      <div class="c-pill">SUUMO</div>
      <div class="c-pill">HOME'S</div>
      <div class="c-pill">at home</div>
    </div>
  </div>
</div>

<div class="bottom-footer">
  <div>💬 留学生 / 在日华人 / 搬家找房神器</div>
  <div class="footer-tags">
    <span class="f-tag">#日本租房</span>
    <span class="f-tag">#留学生避坑</span>
  </div>
</div>
</body>
</html>`;

// Slide 2: Real Rent POP Badge Detail
const slide2 = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${commonStyles}
.point-tag {
  background: #ff5722;
  color: #fff;
  font-size: 18px;
  font-weight: 900;
  padding: 6px 16px;
  border-radius: 20px;
  display: inline-block;
  width: fit-content;
}
.point-title {
  font-size: 44px;
  font-weight: 900;
  color: #43251c;
  line-height: 1.25;
}
.pitfall-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pitfall-card {
  background: #fff;
  border: 2px solid #43251c;
  border-radius: 16px;
  box-shadow: 0 4px 0 #43251c;
  padding: 18px 24px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.p-icon {
  font-size: 28px;
}
.p-text h4 {
  font-size: 20px;
  font-weight: 800;
  color: #43251c;
  margin-bottom: 4px;
}
.p-text p {
  font-size: 16px;
  color: #6d4c41;
  line-height: 1.5;
}
</style>
</head>
<body>
<div class="bg-decor"></div>
<div class="bg-glow"></div>

<div class="top-header">
  <div class="brand-pill">
    <img src="${icon128}" />
    <span>みぬくま Minukuma</span>
  </div>
  <div class="page-num">02 / 05</div>
</div>

<div class="content-main">
  <div>
    <div class="point-tag">PITFALL 01 · 表面低租金的套路</div>
    <h2 class="point-title" style="margin-top: 10px;">为什么只看房租标价<br>一定会亏大钱？</h2>
  </div>

  <div class="pitfall-list">
    <div class="pitfall-card">
      <div class="p-icon">💸</div>
      <div class="p-text">
        <h4>管理费 / 共益费往往不写在标价里</h4>
        <p>很多房源把房租压到 6.5 万吸引点击，点进去才发现管理费 1.5 万！实际每月支出根本不少一分钱。</p>
      </div>
    </div>

    <div class="pitfall-card">
      <div class="p-icon">📑</div>
      <div class="p-text">
        <h4>礼金与杂费是纯消耗，摊到每月吓一跳</h4>
        <p>2 个月礼金 + 昂贵换锁清扫费，住 2 年相当于每个月多掏 8,000~15,000 円的隐形房租！</p>
      </div>
    </div>
  </div>

  <div class="card-box" style="padding: 24px; background: #fffcf8;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
      <span style="font-size: 18px; font-weight: 900; color: #43251c;">✨ みぬくま解决方案：POP 爆款实付价格贴</span>
      <span style="background: #e8f5e9; color: #2e7d32; font-weight: 800; font-size: 14px; padding: 4px 10px; border-radius: 8px;">列表页即刻生效</span>
    </div>
    <img src="${imgSuumoList}" style="width: 100%; border-radius: 12px; border: 1.5px solid #43251c;" />
    <div style="font-size: 15px; color: #795548; font-weight: 700; margin-top: 12px; text-align: center;">
      👆 不用点进详情页逐一算算盘，列表页直接钉上真实实付与差价！
    </div>
  </div>
</div>

<div class="bottom-footer">
  <div>24个月租期科学均摊 · 假便宜无所遁形</div>
  <div class="footer-tags">
    <span class="f-tag">#真实月租</span>
    <span class="f-tag">#日本生活避坑</span>
  </div>
</div>
</body>
</html>`;

// Slide 3: LP Gas vs City Gas & Detective Diagnosis
const slide3 = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${commonStyles}
.point-tag {
  background: #ff9800;
  color: #43251c;
  font-size: 18px;
  font-weight: 900;
  padding: 6px 16px;
  border-radius: 20px;
  display: inline-block;
  width: fit-content;
}
.point-title {
  font-size: 44px;
  font-weight: 900;
  color: #43251c;
  line-height: 1.25;
}
.gas-compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.gas-card {
  padding: 20px;
  border-radius: 18px;
  border: 2px solid #43251c;
  box-shadow: 0 4px 0 #43251c;
}
.gas-card.good {
  background: #e8f5e9;
  border-color: #2e7d32;
}
.gas-card.bad {
  background: #ffebee;
  border-color: #c62828;
}
</style>
</head>
<body>
<div class="bg-decor"></div>
<div class="bg-glow"></div>

<div class="top-header">
  <div class="brand-pill">
    <img src="${icon128}" />
    <span>みぬくま Minukuma</span>
  </div>
  <div class="page-num">03 / 05</div>
</div>

<div class="content-main">
  <div>
    <div class="point-tag">PITFALL 02 · 煤气与结构暗坑</div>
    <h2 class="point-title" style="margin-top: 10px;">住进去才发现 LP 液化气？<br>冬天洗澡账单直接破万！</h2>
  </div>

  <div class="gas-compare-grid">
    <div class="gas-card good">
      <div style="font-size: 20px; font-weight: 900; color: #2e7d32; margin-bottom: 6px;">🟢 都市燃气 (都市ガス)</div>
      <div style="font-size: 15px; color: #1b5e20; line-height: 1.5; font-weight: 600;">
        管网集中供气，价格透明稳定。冬天洗澡做饭每月仅需 3,000~5,000 円！
      </div>
    </div>
    <div class="gas-card bad">
      <div style="font-size: 20px; font-weight: 900; color: #c62828; margin-bottom: 6px;">🔴 LP 液化气 (プロパン)</div>
      <div style="font-size: 15px; color: #b71c1c; line-height: 1.5; font-weight: 600;">
        私人小供气商垄断，单价翻倍！冬天稍微多洗几分钟，月账单破 15,000 円！
      </div>
    </div>
  </div>

  <div class="card-box" style="padding: 20px; display: flex; gap: 20px; align-items: center; background: #fffcf8;">
    <div style="flex: 1.2;">
      <div style="background: #2e7d32; color: #fff; padding: 4px 12px; border-radius: 8px; font-weight: 800; font-size: 14px; width: fit-content; margin-bottom: 8px;">
        🌸 みぬくま 侦探综合诊断
      </div>
      <h3 style="font-size: 22px; font-weight: 900; color: #43251c; margin-bottom: 8px;">
        太鼓判 · 优质推荐
      </h3>
      <p style="font-size: 15px; color: #6d4c41; line-height: 1.5; font-weight: 600;">
        自动审查房源能源类型（都市燃气/LP气）与建筑抗震隔音结构（钢筋混凝土 RC vs 木造），并在详情页右下角给出侦探级避坑评分与建议！
      </p>
    </div>
    <div style="flex: 1; border: 2px solid #43251c; border-radius: 14px; overflow: hidden; max-height: 360px;">
      <img src="${imgSuumoDrawer}" style="width: 100%; height: auto; object-fit: cover; object-position: top;" />
    </div>
  </div>
</div>

<div class="bottom-footer">
  <div>初期费用全透视 · 礼金押金退还属性一目了然</div>
  <div class="footer-tags">
    <span class="f-tag">#都市燃气</span>
    <span class="f-tag">#日本租房攻略</span>
  </div>
</div>
</body>
</html>`;

// Slide 4: Multi-Stations & Google Maps
const slide4 = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${commonStyles}
.point-tag {
  background: #2196f3;
  color: #fff;
  font-size: 18px;
  font-weight: 900;
  padding: 6px 16px;
  border-radius: 20px;
  display: inline-block;
  width: fit-content;
}
.point-title {
  font-size: 44px;
  font-weight: 900;
  color: #43251c;
  line-height: 1.25;
}
</style>
</head>
<body>
<div class="bg-decor"></div>
<div class="bg-glow"></div>

<div class="top-header">
  <div class="brand-pill">
    <img src="${icon128}" />
    <span>みぬくま Minukuma</span>
  </div>
  <div class="page-num">04 / 05</div>
</div>

<div class="content-main">
  <div>
    <div class="point-tag">PITFALL 03 · 交通到站猫腻</div>
    <h2 class="point-title" style="margin-top: 10px;">房源只标最近的小车站？<br>实际主力通勤线要走 20 分！</h2>
  </div>

  <div class="card-box" style="padding: 22px;">
    <div style="font-size: 18px; font-weight: 900; color: #43251c; margin-bottom: 12px;">
      🚇 沿线车站全解析 · 步行时间尽收眼底
    </div>
    <img src="${imgStations}" style="width: 100%; border-radius: 12px; border: 1.5px solid #ebd0bc;" />
    <div style="font-size: 15px; color: #6d4c41; line-height: 1.5; margin-top: 12px; font-weight: 600;">
      无论是 JR 还是东京地下铁，全部沿线各车站步行耗时自动提取对比，不再被中介挑一个最近的小站忽悠！
    </div>
  </div>

  <div class="card-box" style="padding: 22px; background: #fffcf8;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <span style="font-size: 18px; font-weight: 900; color: #43251c;">🗺️ 一键 Google 地图街景 & 查周边</span>
      <span style="background: #e3f2fd; color: #1976d2; font-size: 13px; font-weight: 800; padding: 4px 10px; border-radius: 8px;">一键跳转</span>
    </div>
    <div style="display: flex; gap: 12px;">
      <div style="flex: 1; background: #e8f0fe; color: #1a73e8; border: 2px solid #1a73e8; padding: 12px; border-radius: 12px; font-size: 16px; font-weight: 800; text-align: center; box-shadow: 0 4px 0 #1a73e8;">
        🗺️ Google 地图（看街景与路线）
      </div>
      <div style="flex: 1; background: #f8f9fa; color: #3c4043; border: 2px solid #dadce0; padding: 12px; border-radius: 12px; font-size: 16px; font-weight: 800; text-align: center; box-shadow: 0 4px 0 #dadce0;">
        🔍 Google 搜索（查事故楼盘与评价）
      </div>
    </div>
  </div>
</div>

<div class="bottom-footer">
  <div>真实地址精准提取 · 查大岛てる事故物件神搭档</div>
  <div class="footer-tags">
    <span class="f-tag">#东京租房</span>
    <span class="f-tag">#大岛てる</span>
  </div>
</div>
</body>
</html>`;

// Slide 5: Favorites Pocket, Privacy & How to Get
const slide5 = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${commonStyles}
.point-tag {
  background: #4caf50;
  color: #fff;
  font-size: 18px;
  font-weight: 900;
  padding: 6px 16px;
  border-radius: 20px;
  display: inline-block;
  width: fit-content;
}
.point-title {
  font-size: 44px;
  font-weight: 900;
  color: #43251c;
  line-height: 1.25;
}
.step-row {
  display: flex;
  gap: 16px;
}
.step-card {
  flex: 1;
  background: #fff;
  border: 2px solid #43251c;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 4px 0 #43251c;
  text-align: center;
}
.step-num {
  font-size: 24px;
  font-weight: 900;
  color: #ff5722;
  margin-bottom: 6px;
}
.get-banner {
  background: #43251c;
  color: #fff;
  border-radius: 20px;
  padding: 24px 30px;
  text-align: center;
  box-shadow: 0 8px 0 #2b140e;
}
</style>
</head>
<body>
<div class="bg-decor"></div>
<div class="bg-glow"></div>

<div class="top-header">
  <div class="brand-pill">
    <img src="${icon128}" />
    <span>みぬくま Minukuma</span>
  </div>
  <div class="page-num">05 / 05</div>
</div>

<div class="content-main">
  <div>
    <div class="point-tag">GET IT · 如何获取与使用</div>
    <h2 class="point-title" style="margin-top: 10px;">已正式上架 Chrome 商店！<br>永久免费 · 100% 隐私安全</h2>
  </div>

  <div class="step-row">
    <div class="step-card">
      <div class="step-num">01</div>
      <div style="font-size: 17px; font-weight: 800; color: #43251c; margin-bottom: 4px;">打开电脑 Chrome</div>
      <div style="font-size: 14px; color: #795548;">访问 Chrome 应用商店</div>
    </div>
    <div class="step-card">
      <div class="step-num">02</div>
      <div style="font-size: 17px; font-weight: 800; color: #43251c; margin-bottom: 4px;">搜索「みぬくま」</div>
      <div style="font-size: 14px; color: #795548;">或搜 Minukuma</div>
    </div>
    <div class="step-card">
      <div class="step-num">03</div>
      <div style="font-size: 17px; font-weight: 800; color: #43251c; margin-bottom: 4px;">点击添加至扩展</div>
      <div style="font-size: 14px; color: #795548;">秒装秒用，零门槛</div>
    </div>
  </div>

  <div class="card-box" style="padding: 20px; background: #fffcf8; display: flex; gap: 20px; align-items: center;">
    <div style="flex: 1.2;">
      <h3 style="font-size: 20px; font-weight: 900; color: #43251c; margin-bottom: 8px;">
        ❤️ 跨平台心仪房源随身口袋
      </h3>
      <p style="font-size: 14px; color: #6d4c41; line-height: 1.5; font-weight: 600;">
        • 点红心一键收藏，永久保存原始链接<br>
        • 中日双语自由切换<br>
        • 100% 本地运算，无服务器，零数据上传！
      </p>
    </div>
    <div style="flex: 1; border: 2px solid #43251c; border-radius: 12px; overflow: hidden;">
      <img src="${imgPopup}" style="width: 100%; height: auto;" />
    </div>
  </div>

  <div class="get-banner">
    <div style="font-size: 22px; font-weight: 900; margin-bottom: 8px;">🔗 插件直达链接已置顶于主页 / 评论区</div>
    <div style="font-size: 15px; opacity: 0.9;">大家在日本租房还踩过哪些离谱的坑？欢迎评论区交流吐槽！👇</div>
  </div>
</div>

<div class="bottom-footer">
  <div>开发不易，如果觉得好用欢迎五星好评！🌟</div>
  <div class="footer-tags">
    <span class="f-tag">#小红书宝藏插件</span>
    <span class="f-tag">#留学生实用工具</span>
  </div>
</div>
</body>
</html>`;

fs.writeFileSync(path.join(outputDir, 'xhs-1.html'), slide1);
fs.writeFileSync(path.join(outputDir, 'xhs-2.html'), slide2);
fs.writeFileSync(path.join(outputDir, 'xhs-3.html'), slide3);
fs.writeFileSync(path.join(outputDir, 'xhs-4.html'), slide4);
fs.writeFileSync(path.join(outputDir, 'xhs-5.html'), slide5);

console.log('Xiaohongshu HTML slides written successfully.');
