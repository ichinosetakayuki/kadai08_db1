import { initializeWallpaperSelection } from './wallpaper.js';
import { initializeCalendarHeader, makeCalendar } from './calendar.js';
import { renderSchedules } from './schedules.js';
import { handleModalEvents } from './modal.js';
import { handleSearchEvents } from './search.js';

// モジュール間で共有する変数をstateオブジェクトにまとめて共有する
const state = {
  allScheduleData: [], // 予定データ全体
  previousOverlay: null // 現在の画面状態を記録する変数
};

const today = new Date();
let month = today.getMonth();
let year = today.getFullYear();

// axiosでread.phpからJSONデータを読み込み
window.addEventListener("DOMContentLoaded", () => {
  initializeCalendarHeader(); // カレンダー曜日見出しの描画
  axios.get("read.php")
    .then(function (response) {
      state.allScheduleData = response.data;
      // console.log("axiosで取得したデータ：", state.allScheduleData);
      makeCalendar(year, month); //カレンダー描画
      renderSchedules(state); // 予定データの描画
      handleModalEvents(state); // 予定モーダル画面の操作
      handleSearchEvents(state); // 予定検索画面の操作

    })
    .catch(function (error) {
      console.error("データ取得エラー:", error);
    })
});

// 壁紙機能の初期化とイベントリスナーの設定
initializeWallpaperSelection();


// 「前月」クリックで前月のカレンダーを描画する関数
$("#prev").on("click", function () {
  month--;
  if (month < 0) {
    year--;
    month = 11;
  }
  makeCalendar(year, month);
  renderSchedules(state);

});

// 「翌月」クリックで翌月のカレンダーを描画する関数
$("#next").on("click", function () {
  month++;
  if (month > 11) {
    year++;
    month = 0;
  }
  makeCalendar(year, month);
  renderSchedules(state);

});

// 今月に戻るボタン
$("#toThisMonth").on("click", function () {
  const today = new Date();
  year = today.getFullYear();
  month = today.getMonth();
  makeCalendar(year, month);
  renderSchedules(state);
});

// 壁紙選択画面オープン
$("#selectWallPaper").on("click", function () {
  $(".wallPaper_overlay").show();
});


//予定入力画面のキャンセルボタン
$("#modalCancel").on("click", function () {
  // $(".overlay").css('display', 'none');
  $(".overlay").hide();

  if (state.previousOverlay === 'eventList') {
    $(".event_overlay").show();
  }
  if (state.previousOverlay === 'searchResult') {
    $(".search_overlay").show();
  }
  state.previousOverlay = null;
});



