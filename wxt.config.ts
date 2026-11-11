import { defineConfig } from 'wxt';

const icons = Object.fromEntries([16, 32, 48, 128].map((size) => [size, `icons/${size}.png`]));

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    icons,
    action: { default_icon: icons, default_title: 'みぬくま · Minukuma' },
    permissions: ['storage', 'activeTab'],
    name: 'みぬくま (Minukuma)',
    description: "SUUMO・LIFULL HOME'S・at homeの賃貸物件の実質月額目安と初期費用を確認する拡張機能",
  },
});
