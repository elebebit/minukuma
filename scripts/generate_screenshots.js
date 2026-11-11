import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const outputDir = path.resolve('promo_assets');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Convert local images to base64 data URLs for seamless offline rendering in Chrome headless
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
const imgAtHome = getBase64DataUrl(path.join(uploadsDir, 'media_1794377050185_8f4c0a19.jpg'));
const imgStations = getBase64DataUrl(path.join(uploadsDir, 'media_1794377385017_c0e6e705.jpg'));

// Base template styles
const commonStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
  body {
    width: 1280px;
    height: 800px;
    font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "PingFang SC", "Microsoft YaHei", sans-serif;
    background: #fdfaf5;
    color: #3e2723;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .bg-decor {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: 
      radial-gradient(#ebd9c5 1.2px, transparent 1.2px),
      radial-gradient(#ebd9c5 1.2px, #fdfaf5 1.2px);
    background-size: 28px 28px;
    background-position: 0 0, 14px 14px;
    opacity: 0.45;
    z-index: 0;
  }
  .bg-glow-1 {
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 214, 153, 0.45) 0%, rgba(255, 245, 230, 0) 70%);
    top: -100px;
    right: -100px;
    z-index: 1;
  }
  .bg-glow-2 {
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 183, 133, 0.35) 0%, rgba(255, 245, 230, 0) 70%);
    bottom: -150px;
    left: 200px;
    z-index: 1;
  }
  .navbar {
    position: relative;
    z-index: 10;
    height: 84px;
    padding: 0 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1.5px solid rgba(67, 37, 28, 0.08);
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .brand img {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(67, 37, 28, 0.15);
  }
  .brand-title {
    font-size: 26px;
    font-weight: 800;
    color: #43251c;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .brand-badge {
    background: #ffecd2;
    color: #b24d00;
    font-size: 13px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 20px;
    border: 1px solid #ffd099;
  }
  .brand-subtitle {
    font-size: 14px;
    color: #795548;
    font-weight: 500;
  }
  .nav-platforms {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .plat-pill {
    background: #fff;
    border: 1.5px solid #ebd0bc;
    color: #5d4037;
    font-size: 13px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: 20px;
    box-shadow: 0 2px 4px rgba(67, 37, 28, 0.04);
  }
  .plat-pill.active {
    background: #43251c;
    color: #fff;
    border-color: #43251c;
  }
  .content {
    position: relative;
    z-index: 10;
    flex: 1;
    display: grid;
    grid-template-columns: 460px 1fr;
    padding: 44px 56px;
    gap: 48px;
    align-items: center;
  }
  .hero-text {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #ff7e5f, #feb47b);
    color: #fff;
    font-size: 13px;
    font-weight: 800;
    padding: 5px 14px;
    border-radius: 20px;
    width: fit-content;
    box-shadow: 0 4px 10px rgba(255, 126, 95, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .hero-title {
    font-size: 38px;
    line-height: 1.25;
    font-weight: 900;
    color: #43251c;
    letter-spacing: -0.8px;
  }
  .hero-title span {
    background: linear-gradient(135deg, #d32f2f, #f57c00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .hero-desc {
    font-size: 17px;
    line-height: 1.6;
    color: #6d4c41;
    font-weight: 500;
  }
  .feature-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 6px;
  }
  .feat-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 15px;
    font-weight: 700;
    color: #43251c;
    background: rgba(255, 255, 255, 0.85);
    padding: 10px 16px;
    border-radius: 12px;
    border: 1px solid rgba(220, 190, 170, 0.6);
    box-shadow: 0 2px 6px rgba(67, 37, 28, 0.04);
  }
  .feat-item .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    background: #e8f5e9;
    color: #2e7d32;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 900;
  }
  .mockup-container {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .mac-window {
    background: #fff;
    border-radius: 18px;
    border: 2px solid #43251c;
    box-shadow: 
      0 18px 40px -8px rgba(67, 37, 28, 0.28),
      0 6px 16px rgba(0,0,0,0.06);
    overflow: hidden;
    position: relative;
    max-height: 590px;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  .mac-header {
    height: 38px;
    background: #fbf7f2;
    border-bottom: 1.5px solid #ebd0bc;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 8px;
  }
  .mac-dots {
    display: flex;
    gap: 6px;
  }
  .mac-dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }
  .dot-red { background: #ff5f56; border: 1px solid #e0443e; }
  .dot-yellow { background: #ffbd2e; border: 1px solid #dea123; }
  .dot-green { background: #27c93f; border: 1px solid #1aab29; }
  .mac-address-bar {
    flex: 1;
    margin: 0 30px;
    background: #fff;
    border: 1px solid #e2cfc2;
    height: 24px;
    border-radius: 6px;
    font-size: 11px;
    color: #8d6e63;
    display: flex;
    align-items: center;
    padding: 0 10px;
    gap: 6px;
    font-family: monospace;
  }
  .mac-body {
    flex: 1;
    overflow: hidden;
    background: #fdfdfd;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .callout-badge {
    position: absolute;
    background: #ff4757;
    color: #fff;
    padding: 8px 16px;
    border-radius: 30px;
    font-weight: 800;
    font-size: 14px;
    box-shadow: 0 8px 20px rgba(255, 71, 87, 0.4);
    border: 2px solid #fff;
    display: flex;
    align-items: center;
    gap: 6px;
    z-index: 20;
    animation: float 3s ease-in-out infinite;
  }
`;

// Slide 1: Real Monthly Rent POP Badges
const slide1 = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${commonStyles}
</style>
</head>
<body>
<div class="bg-decor"></div>
<div class="bg-glow-1"></div>
<div class="bg-glow-2"></div>
<nav class="navbar">
  <div class="brand">
    <img src="${icon128}" />
    <div>
      <div class="brand-title">みぬくま <span class="brand-badge">Minukuma v0.1.0</span></div>
      <div class="brand-subtitle">日本租房真实月租与避坑助手</div>
    </div>
  </div>
  <div class="nav-platforms">
    <div class="plat-pill active">SUUMO 专搜</div>
    <div class="plat-pill">LIFULL HOME'S</div>
    <div class="plat-pill">at home</div>
  </div>
</nav>

<div class="content">
  <div class="hero-text">
    <div class="hero-tag">FEATURE 01 · 真实月租脱水</div>
    <h1 class="hero-title">房源列表直击底价<br><span>真实月租 实时脱水</span></h1>
    <p class="hero-desc">告别被“低房租”套路的繁琐计算。自动合并管理费，均摊礼金押金与隐形成本，在列表页直接钉上醒目的日系爆款 POP 价格贴！</p>
    
    <div class="feature-list">
      <div class="feat-item"><span class="icon">✓</span> <span><b>醒目 POP 贴</b>：一眼看穿标价与真实实付差额</span></div>
      <div class="feat-item"><span class="icon">✓</span> <span><b>初期费用均摊</b>：基于 24 个月标准租期智能测算</span></div>
      <div class="feat-item"><span class="icon">✓</span> <span><b>一键红心收藏</b>：心仪房源秒速入袋，随心比对</span></div>
    </div>
  </div>

  <div class="mockup-container">
    <div class="mac-window">
      <div class="mac-header">
        <div class="mac-dots">
          <div class="mac-dot dot-red"></div>
          <div class="mac-dot dot-yellow"></div>
          <div class="mac-dot dot-green"></div>
        </div>
        <div class="mac-address-bar">🔒 suumo.jp/chintai/tokyo/</div>
      </div>
      <div class="mac-body" style="padding: 24px; flex-direction: column; gap: 20px; background: #f7f7f7;">
        <div style="background: #fff; border: 1.5px solid #ebd0bc; border-radius: 12px; padding: 14px; width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <div style="font-size: 13px; font-weight: 700; color: #ff5722; margin-bottom: 8px;">🔥 实时挂载 · 日本各大找房平台完美融合</div>
          <img src="${imgSuumoList}" style="width: 100%; height: auto; border-radius: 8px; border: 1px solid #ebd0bc;" />
        </div>
        
        <div style="background: #fff; border: 1.5px solid #ebd0bc; border-radius: 12px; padding: 14px; width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <div style="font-size: 13px; font-weight: 700; color: #2e7d32; margin-bottom: 8px;">🏡 at home 平台自动对齐管理费栏位</div>
          <img src="${imgAtHome}" style="width: 100%; max-height: 210px; object-fit: cover; object-position: top; border-radius: 8px; border: 1px solid #ebd0bc;" />
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

// Slide 2: Detective Diagnosis & Comprehensive Upfront Fees
const slide2 = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${commonStyles}
</style>
</head>
<body>
<div class="bg-decor"></div>
<div class="bg-glow-1"></div>
<div class="bg-glow-2"></div>
<nav class="navbar">
  <div class="brand">
    <img src="${icon128}" />
    <div>
      <div class="brand-title">みぬくま <span class="brand-badge">Minukuma v0.1.0</span></div>
      <div class="brand-subtitle">日本租房真实月租与避坑助手</div>
    </div>
  </div>
  <div class="nav-platforms">
    <div class="plat-pill">SUUMO</div>
    <div class="plat-pill active">HOME'S 详情页</div>
    <div class="plat-pill">at home</div>
  </div>
</nav>

<div class="content">
  <div class="hero-text">
    <div class="hero-tag">FEATURE 02 · 侦探级避坑诊断</div>
    <h1 class="hero-title">全景费用透视<br><span>侦探级 避坑诊断</span></h1>
    <p class="hero-desc">详情页右下角常驻贴心抽屉。礼金、押金、清扫费、火灾保费、首次保证费巨细靡遗；自动审查能源（都市燃气/LP液化气）与抗震结构。</p>
    
    <div class="feature-list">
      <div class="feat-item"><span class="icon">✓</span> <span><b>太鼓判综合诊断</b>：全方位评估房源性价比与暗坑风险</span></div>
      <div class="feat-item"><span class="icon">✓</span> <span><b>初期费用水份透视</b>：可退还押金与纯消耗礼金一目了然</span></div>
      <div class="feat-item"><span class="icon">✓</span> <span><b>日文谈判话术</b>：自带向中介砍价、免除多余费用的专属模板</span></div>
    </div>
  </div>

  <div class="mockup-container">
    <div class="mac-window">
      <div class="mac-header">
        <div class="mac-dots">
          <div class="mac-dot dot-red"></div>
          <div class="mac-dot dot-yellow"></div>
          <div class="mac-dot dot-green"></div>
        </div>
        <div class="mac-address-bar">🔒 suumo.jp/chintai/bc_100412857410/</div>
      </div>
      <div class="mac-body" style="padding: 20px; background: #faf8f5; justify-content: center; align-items: flex-start; overflow-y: hidden;">
        <div style="background: #fff; border-radius: 14px; box-shadow: 0 8px 24px rgba(67, 37, 28, 0.12); border: 2px solid #43251c; overflow: hidden; max-width: 420px; width: 100%;">
          <img src="${imgSuumoDrawer}" style="width: 100%; height: 500px; object-fit: cover; object-position: top; display: block;" />
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

// Slide 3: Multi-Station Access & Google Maps
const slide3 = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${commonStyles}
</style>
</head>
<body>
<div class="bg-decor"></div>
<div class="bg-glow-1"></div>
<div class="bg-glow-2"></div>
<nav class="navbar">
  <div class="brand">
    <img src="${icon128}" />
    <div>
      <div class="brand-title">みぬくま <span class="brand-badge">Minukuma v0.1.0</span></div>
      <div class="brand-subtitle">日本租房真实月租与避坑助手</div>
    </div>
  </div>
  <div class="nav-platforms">
    <div class="plat-pill">沿线车站全解析</div>
    <div class="plat-pill active">Google Maps 联动</div>
  </div>
</nav>

<div class="content">
  <div class="hero-text">
    <div class="hero-tag">FEATURE 03 · 出行与周边探索</div>
    <h1 class="hero-title">多线路到站解析<br><span>Google 地图一键查周边</span></h1>
    <p class="hero-desc">日本租房痛点：中介往往只标最近的一个小车站！みぬくま自动抽取全部沿线线路与步行耗时，并支持一键直达 Google 地图实景与生活配套。</p>
    
    <div class="feature-list">
      <div class="feat-item"><span class="icon">✓</span> <span><b>多站点全解析</b>：东京地下铁/JR/私铁多线路无遗漏</span></div>
      <div class="feat-item"><span class="icon">✓</span> <span><b>一键直达 Google Maps</b>：实景街景、通勤规划秒速查看</span></div>
      <div class="feat-item"><span class="icon">✓</span> <span><b>一键 Google 搜索</b>：快速检索楼盘事故履历与租客真实评价</span></div>
    </div>
  </div>

  <div class="mockup-container">
    <div class="mac-window">
      <div class="mac-header">
        <div class="mac-dots">
          <div class="mac-dot dot-red"></div>
          <div class="mac-dot dot-yellow"></div>
          <div class="mac-dot dot-green"></div>
        </div>
        <div class="mac-address-bar">🗺️ Google 地图与沿线交通智能联动</div>
      </div>
      <div class="mac-body" style="padding: 24px; flex-direction: column; gap: 16px; background: #fbf9f6; justify-content: flex-start;">
        <div style="background: #fff; border: 1.5px solid #43251c; border-radius: 12px; padding: 18px; width: 100%; box-shadow: 0 4px 14px rgba(67, 37, 28, 0.08);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <span style="font-size: 14px; font-weight: 800; color: #43251c;">📍 房源地址与周边直达</span>
            <span style="background: #e8f5e9; color: #2e7d32; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px;">自动提取</span>
          </div>
          <div style="font-size: 16px; font-weight: 800; color: #1a1a1a; margin-bottom: 12px; background: #f5f2ed; padding: 10px 14px; border-radius: 8px;">
            東京都荒川区東尾久１丁目
          </div>
          <div style="display: flex; gap: 10px;">
            <div style="flex: 1; background: #e8f0fe; color: #1a73e8; border: 1.5px solid #1a73e8; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 0 #1a73e8;">
              🗺️ Google 地图
            </div>
            <div style="flex: 1; background: #f8f9fa; color: #3c4043; border: 1.5px solid #dadce0; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 6px;">
              🔍 Google 搜索
            </div>
          </div>
        </div>

        <div style="background: #fff; border: 1.5px solid #43251c; border-radius: 12px; padding: 18px; width: 100%; box-shadow: 0 4px 14px rgba(67, 37, 28, 0.08);">
          <div style="font-size: 14px; font-weight: 800; color: #43251c; margin-bottom: 12px;">🚇 多沿线站点解析比对</div>
          <img src="${imgStations}" style="width: 100%; height: auto; border-radius: 8px; border: 1px solid #ebd0bc;" />
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

// Slide 4: Favorites & Privacy 100% Local
const slide4 = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${commonStyles}
</style>
</head>
<body>
<div class="bg-decor"></div>
<div class="bg-glow-1"></div>
<div class="bg-glow-2"></div>
<nav class="navbar">
  <div class="brand">
    <img src="${icon128}" />
    <div>
      <div class="brand-title">みぬくま <span class="brand-badge">Minukuma v0.1.0</span></div>
      <div class="brand-subtitle">日本租房真实月租与避坑助手</div>
    </div>
  </div>
  <div class="nav-platforms">
    <div class="plat-pill active">我的收藏清单</div>
    <div class="plat-pill">横向对比 PK</div>
    <div class="plat-pill">中日双语</div>
  </div>
</nav>

<div class="content">
  <div class="hero-text">
    <div class="hero-tag">FEATURE 04 · 收藏与智能比对</div>
    <h1 class="hero-title">跨平台收藏清单<br><span>房源横向对比 PK</span></h1>
    <p class="hero-desc">不论是 SUUMO 还是 HOME'S，轻点红心即刻将心仪房源装进口袋。支持 1 键跳转回原始房源、横向横评对比；100% 浏览器本地储存，零数据上传！</p>
    
    <div class="feature-list">
      <div class="feat-item"><span class="icon">✓</span> <span><b>↗ 直达房源</b>：永久保留房源直达链接，快速复查</span></div>
      <div class="feat-item"><span class="icon">✓</span> <span><b>中日双语支持</b>：随时在右上角自由切换简体中文与日本語</span></div>
      <div class="feat-item"><span class="icon">✓</span> <span><b>100% 本地运算</b>：无服务器，零收集用户个人信息与浏览记录</span></div>
    </div>
  </div>

  <div class="mockup-container">
    <div class="mac-window" style="max-width: 480px;">
      <div class="mac-header">
        <div class="mac-dots">
          <div class="mac-dot dot-red"></div>
          <div class="mac-dot dot-yellow"></div>
          <div class="mac-dot dot-green"></div>
        </div>
        <div class="mac-address-bar">みぬくま 随身收藏口袋</div>
      </div>
      <div class="mac-body" style="padding: 24px; background: #faf7f2; justify-content: center; align-items: center;">
        <div style="background: #fff; border-radius: 16px; border: 2px solid #43251c; box-shadow: 0 10px 28px rgba(67, 37, 28, 0.15); overflow: hidden; width: 100%;">
          <img src="${imgPopup}" style="width: 100%; height: auto; display: block;" />
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

// Small Promo Tile 440x280 (Required / highly recommended by Chrome Web Store)
const promoTile = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 440px;
    height: 280px;
    font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "PingFang SC", sans-serif;
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%);
    color: #43251c;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 24px;
    border: 3px solid #43251c;
  }
  .bg-circle {
    position: absolute;
    width: 280px;
    height: 280px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
    z-index: 1;
  }
  .content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .icon-img {
    width: 72px;
    height: 72px;
    border-radius: 18px;
    border: 2px solid #43251c;
    box-shadow: 0 4px 12px rgba(67, 37, 28, 0.18);
    margin-bottom: 12px;
  }
  .title {
    font-size: 26px;
    font-weight: 900;
    color: #43251c;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
  }
  .sub {
    font-size: 14px;
    font-weight: 700;
    color: #b45309;
    margin-bottom: 12px;
  }
  .pill-row {
    display: flex;
    gap: 8px;
  }
  .pill {
    background: #43251c;
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 20px;
    box-shadow: 0 2px 4px rgba(67, 37, 28, 0.15);
  }
</style>
</head>
<body>
<div class="bg-circle"></div>
<div class="content">
  <img src="${icon128}" class="icon-img" />
  <div class="title">みぬくま Minukuma</div>
  <div class="sub">日本租房真实月租与避坑助手</div>
  <div class="pill-row">
    <div class="pill">SUUMO</div>
    <div class="pill">HOME'S</div>
    <div class="pill">at home</div>
    <div class="pill">真实脱水</div>
  </div>
</div>
</body>
</html>`;

fs.writeFileSync(path.join(outputDir, 'slide-1.html'), slide1);
fs.writeFileSync(path.join(outputDir, 'slide-2.html'), slide2);
fs.writeFileSync(path.join(outputDir, 'slide-3.html'), slide3);
fs.writeFileSync(path.join(outputDir, 'slide-4.html'), slide4);
fs.writeFileSync(path.join(outputDir, 'promo-tile.html'), promoTile);

console.log('HTML templates written successfully.');
