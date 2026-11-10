import { defineContentScript } from 'wxt/utils/define-content-script';
import { setupOverlay } from '../src/overlay';
import { detailRoom, listRooms } from '../src/suumo';

export default defineContentScript({
  matches: [
    'https://suumo.jp/chintai/*',
    'https://suumo.jp/jj/chintai/*',
  ],
  async main(ctx) {
    await setupOverlay(ctx, {
      isDetail: (pathname) => /^\/chintai\/(?:jnc|bc)_/.test(pathname),
      listRooms,
      detailRoom,
    });
  },
});
