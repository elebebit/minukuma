import { defineContentScript } from 'wxt/utils/define-content-script';
import { detailRoom, listRooms } from '../src/homes';
import { setupOverlay } from '../src/overlay';

export default defineContentScript({
  matches: [
    'https://www.homes.co.jp/chintai/*',
  ],
  async main(ctx) {
    await setupOverlay(ctx, {
      isDetail: (pathname) => /^\/chintai\/(?:room|b-)/.test(pathname),
      listRooms,
      detailRoom,
    });
  },
});
