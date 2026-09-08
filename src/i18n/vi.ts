/**
 * Từ điển tiếng Việt. Đây là từ điển GỐC — `en.ts` phải có đúng bộ khoá này, và
 * `tests/core/i18n.test.ts` khẳng định điều đó theo cả hai chiều: một khoá thiếu
 * ở một bên hiện ra thành nhãn trống chứ không thành lỗi.
 *
 * NFR-I18N-01: không chuỗi hiển thị nào được nằm ngoài thư mục này.
 * NFR-I18N-04: KHÔNG bên nào là "bản dài". Đo trên chính hai file này thì tiếng
 * Việt tổng 2038 ký tự, tiếng Anh 2134 — Việt NGẮN hơn 4,5%; nhưng từng nhãn
 * lệch nhau tới hai lần theo cả hai chiều. Nên bố cục phải kiểm ở CẢ HAI locale.
 */
export const vi = {
  'app.title': 'Phòng Tuyến',
  'app.tagline': 'Giữ đường. Đừng để chúng đi qua.',

  'common.back': 'Quay lại',
  'common.close': 'Đóng',
  'common.gold': 'Vàng',
  'common.cores': 'Lõi',
  'common.lives': 'Mạng',
  'common.settings': 'Cài đặt',

  'title.play': 'CHƠI',
  'title.continue': 'CHƠI TIẾP',
  'title.mapSelect': 'Chọn bản đồ',
  'title.workshop': 'Xưởng nâng cấp',
  'title.mapsUnlocked': 'Đã mở {n} / {total} bản đồ',
  'title.coresHeld': '{n} lõi',
  'title.lastMap': '{map} · đợt {wave} / {total}',

  'battle.wave': 'Đợt',
  'battle.nextWave': 'Đợt tới',
  'battle.callWave': 'GỌI ĐỢT TIẾP THEO',
  'battle.callWaveShort': 'GỌI ĐỢT',
  'battle.buildTower': 'Xây tháp',
  'battle.tapSlotToBuild': 'Chạm ô trống để xây',
  'battle.selectedSlot': 'Ô đang chọn',
  'battle.speed': 'Tốc độ trận',
  'battle.pause': 'Tạm dừng',
  'battle.resume': 'Tiếp tục',
  'battle.rangeHint': 'Vòng nét đứt trên bản đồ là tầm bắn của tháp đang chọn.',
  'battle.keyHint': 'Phím tắt: 1 2 3 chọn tháp · Space gọi đợt · Esc bỏ chọn',
  'battle.buildHere': 'XÂY VÀO Ô NÀY',
  'battle.deselect': 'Bỏ chọn',
  'battle.slotLabel': 'Ô số {n}',
  'battle.towerLabel': '{tower} bậc {level} ở ô số {n}',

  'tower.arrow': 'Cung',
  'tower.cannon': 'Pháo',
  'tower.frost': 'Băng',
  'tower.bolt': 'Sét',
  'tower.venom': 'Độc',
  'tower.arrow.desc': 'Bắn nhanh, một mục tiêu.',
  'tower.cannon.desc': 'Nổ lan, nhịp bắn chậm.',
  'tower.frost.desc': 'Làm chậm cả nhóm, sát thương thấp.',
  'tower.bolt.desc': 'Nổ lan rộng, tầm ngắn.',
  'tower.venom.desc': 'Xuyên giáp, nhắm con nhiều máu nhất.',
  'tower.level': 'Bậc {level}',
  'tower.levelOf': 'Bậc {level} / {max}',
  'tower.upgrade': 'Nâng',
  'tower.sell': 'Bán',
  'tower.maxLevel': 'Đã tối đa',
  'tower.damage': 'Sát thương',
  'tower.range': 'Tầm bắn',
  'tower.rate': 'Nhịp bắn',
  'tower.splash': 'Bán kính nổ',
  'tower.slow': 'Làm chậm',
  'tower.perSecond': '{n}/giây',
  'tower.cells': '{n} ô',

  'enemy.grunt': 'Lính',
  'enemy.armored': 'Giáp',
  'enemy.runner': 'Chạy nhanh',

  'map.m01': 'Đồng Cỏ',
  'map.m02': 'Hẻm Đá',
  'map.m03': 'Đầm Sương',
  'map.m04': 'Đèo Gió',
  'map.m05': 'Lò Rèn Cũ',

  'mapSelect.title': 'Chọn bản đồ',
  'mapSelect.cleared': 'Đã qua',
  'mapSelect.playing': 'Đang chơi',
  'mapSelect.locked': 'Chưa mở',
  'mapSelect.needsPrevious': 'Cần qua {map} để mở',
  'mapSelect.best': 'Tốt nhất: đợt {wave} / {total}',
  'mapSelect.clearedDetail': '{total} / {total} đợt · còn {lives} mạng',
  'mapSelect.notPlayed': 'Chưa chơi lần nào',
  'mapSelect.waves': '{n} đợt',

  'workshop.title': 'Xưởng nâng cấp',
  'workshop.branch.economy': 'Kinh tế',
  'workshop.branch.damage': 'Sát thương',
  'workshop.branch.utility': 'Tiện ích',
  'workshop.branch.unlock': 'Mở khoá',
  'workshop.upgrade': 'Nâng',
  'workshop.locked': 'Khoá',
  'workshop.needs': 'Cần {node} bậc {level}',
  'workshop.maxed': 'Đã tối đa',
  'workshop.cantAfford': 'Chưa đủ lõi',
  'workshop.invested': 'Đã đầu tư {n} / {total} lõi',
  'workshop.coresHint': 'Lõi kiếm được theo số đợt sống sót. Thắng lần đầu một bản đồ cho nhiều lõi nhất.',

  'upgrade.startGold': 'Tiền khởi đầu',
  'upgrade.startGold.desc': '+50 vàng khi vào trận, mỗi bậc',
  'upgrade.bounty': 'Tiền rơi',
  'upgrade.bounty.desc': '+5% vàng nhận được từ địch, mỗi bậc',
  'upgrade.waveInterest': 'Lãi cuối đợt',
  'upgrade.waveInterest.desc': 'Nhận thêm 3% số vàng đang giữ sau mỗi đợt, mỗi bậc',
  'upgrade.arrowDamage': 'Cung sắc bén',
  'upgrade.arrowDamage.desc': '+4% sát thương tháp Cung, mỗi bậc',
  'upgrade.cannonSplash': 'Thuốc nổ mạnh',
  'upgrade.cannonSplash.desc': '+4% bán kính nổ của tháp Pháo, mỗi bậc',
  'upgrade.frostDepth': 'Băng dày',
  'upgrade.frostDepth.desc': 'Tháp Băng làm chậm sâu hơn 5%, mỗi bậc',
  'upgrade.startLives': 'Mạng khởi đầu',
  'upgrade.startLives.desc': '+2 mạng khi vào trận, mỗi bậc',
  'upgrade.buildCost': 'Giá tháp',
  'upgrade.buildCost.desc': '-5% giá xây mọi loại tháp, mỗi bậc',
  'upgrade.sellRatio': 'Bán lại',
  'upgrade.sellRatio.desc': 'Bán tháp thu về 75% thay vì 50%',
  'upgrade.unlockBolt': 'Tháp Sét',
  'upgrade.unlockBolt.desc': 'Mở dòng tháp nổ lan rộng, tầm ngắn',
  'upgrade.unlockVenom': 'Tháp Độc',
  'upgrade.unlockVenom.desc': 'Mở dòng tháp xuyên giáp',

  'result.won': 'Thắng',
  'result.lost': 'Thua',
  'result.wavesSurvived': 'Sống sót {wave} / {total} đợt',
  'result.livesLeft': 'Còn {n} mạng',
  'result.coresEarned': 'Nhận {n} lõi',
  'result.firstClear': 'Thắng lần đầu — thưởng thêm {n} lõi',
  'result.replayReduced': 'Chơi lại nên lõi giảm',
  'result.killed': 'Diệt {n} địch',
  'result.retry': 'Chơi lại',
  'result.nextMap': 'Bản đồ tiếp theo',
  'result.toWorkshop': 'Xưởng nâng cấp',
  'result.toMapSelect': 'Chọn bản đồ',

  'settings.title': 'Cài đặt',
  'settings.language': 'Ngôn ngữ',
  'settings.music': 'Nhạc nền',
  'settings.sfx': 'Hiệu ứng âm thanh',
  'settings.off': 'Tắt',

  // Tên ngôn ngữ viết bằng CHÍNH ngôn ngữ đó (endonym), nên hai từ điển giống
  // nhau ở hai khoá này. Chúng vẫn phải nằm trong từ điển: NFR-I18N-01 không có
  // ngoại lệ, và hardcode ở component thì grep không ra.
  'locale.vi': 'Tiếng Việt',
  'locale.en': 'English',

  'storage.notWritable':
    'Trình duyệt không cho lưu dữ liệu, nên tiến trình sẽ KHÔNG được giữ lại. Game vẫn chơi được bình thường.',
  'storage.recovered':
    'Dữ liệu lưu cũ không đọc được nên đã bắt đầu tiến trình mới. Bản cũ vẫn được giữ lại, không bị xoá.',
  'error.assetFailed': 'Không tải được dữ liệu game.',
  'error.retry': 'Thử lại',
} as const;

export type StringKey = keyof typeof vi;
