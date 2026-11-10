import { defineContentScript } from 'wxt/utils/define-content-script';
import { detailRoom, listRooms } from '../src/athome';
import { setupOverlay } from '../src/overlay';

export default defineContentScript({
  matches: [
    'https://www.athome.co.jp/chintai/*',
  ],
  async main(ctx) {
    await setupOverlay(ctx, {
      isDetail: (pathname) => /^\/chintai\/\d+\/?/.test(pathname),
      listRooms,
      detailRoom,
    });
  },
});
