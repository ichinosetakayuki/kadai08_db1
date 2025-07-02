
let allScheduleData = []; //グルーバル変数　予定データ全体

// axiosでread.phpからJSONデータを読み込み
window.addEventListener("DOMContentLoaded", () => {
  axios.get("read.php")
    .then(function (response) {
      allScheduleData = response.data;
      // console.log("axiosで取得したデータ：", allScheduleData);
      renderSchedules(allScheduleData);
    })
    .catch(function (error) {
      console.error("データ取得エラー:", error);
    })
});

const today = new Date();
let month = today.getMonth();
let year = today.getFullYear();


// 見出しの年月と曜日
const days = ['月', '火', '水', '木', '金', '土', '日'];
$("#month").html(year + '年' + (month + 1) + '月');
days.forEach(d => $("#dayLabel").append(`<th class="day_of_week">${d}</th>`));


// 年と月を入力し当月のカレンダーに表示される
// 前月の終わりの日々の配列を作る関数
function getPrevMonthdays(year, month) {
  const prevMonthDate = new Date(year, month, 0);
  const d = prevMonthDate.getDate();
  const prevMonth = prevMonthDate.getMonth() + 1;
  const prevMonthYear = prevMonthDate.getFullYear();
  const startDay = new Date(year, month, 1).getDay();
  const dates = [];
  const numDays = startDay === 0 ? 6 : startDay - 1;
  for (let i = 0; i < numDays; i++) {
    dates.unshift({
      year: prevMonthYear,
      month: prevMonth,
      date: d - i,
      isToday: false,
      isDisabled: true,
    });
  }
  return dates;
}

getPrevMonthdays(year, month);

// 今月の日々の配列を作る関数
function getCurrentMonthDays(year, month) {
  const dates = [];
  const datesInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= datesInMonth; i++) {
    dates.push({
      year: year,
      month: month + 1,
      date: i,
      isToday: false,
      isDisabled: false,
    })
  }
  if (year === today.getFullYear() && month === today.getMonth()) {
    dates[today.getDate() - 1].isToday = true;
  }
  return dates;
}

getCurrentMonthDays(year, month);

// 当月のカレンダーに表示される翌月の日々の配列を作る関数
function getNextMonthdays(year, month) {
  const nextMonthDate = new Date(year, month + 1, 1);
  const nextMonth = nextMonthDate.getMonth() + 1;
  const nextMonthYear = nextMonthDate.getFullYear();
  const dates = [];
  const lastDay = new Date(year, month + 1, 0).getDay();
  if (lastDay !== 0) {
    for (let i = 1; i <= 7 - lastDay; i++) {
      dates.push({
        year: nextMonthYear,
        month: nextMonth,
        date: i,
        isToday: false,
        isDisabled: true,
      })
    }
  }
  return dates;
}

getNextMonthdays(year, month);

// カレンダーを描画する関数
function makeCalendar(year, month) {

  $("#month").html(year + '年' + (month + 1) + '月');

  $("tbody").empty();
  const dates = [
    ...getPrevMonthdays(year, month),
    ...getCurrentMonthDays(year, month),
    ...getNextMonthdays(year, month),
  ];
  // console.log(dates);

  const weeks = [];
  const weeksCount = dates.length / 7;

  for (let i = 0; i < weeksCount; i++) {
    weeks.push(dates.splice(0, 7));
  }

  for (let i = 0; i < weeksCount; i++) {
    $("tbody").append(`<tr id="row${i}"></tr>`);
    weeks[i].forEach(date => {
      const monthStr = String(date.month).padStart(2, '0');
      const dayStr = String(date.date).padStart(2, '0');
      const dateId = `day${date.year}${monthStr}${dayStr}`;
      // const dateKey = new Date(date.year, date.month - 1, date.date);
      $(`#row${i}`).append(
        `<td><div id="${dateId}" class="date_box"><div class="day_box">${date.date}</div><div class="multi_day_box"></div><div class="memo_box"></div></div></td>`);
      if (date.isToday) {
        $(`#${dateId}>.day_box`).addClass('today');
      }
      if (date.isDisabled) {
        $(`#${dateId}`).addClass('isdisabled');
      }
      if (date.month === 4 && date.date === 11) {
        $(`#${dateId} .day_box`).addClass('moritaka_birthday');
      }
    });
  }
  makeHolidays(); // 祝日を描画する
}

makeCalendar(year, month);

// 祝日APIを使って、今年と来年の祝日データを取得し、祝日表示する関数
function makeHolidays() {
  const url = "https://api.national-holidays.jp/recent";
  axios
    .get(url)
    .then(function (response) {
      const holidays = response.data;
      holidays.forEach(holiday => {
        const holidayName = holiday.name;
        const holidayId = `day${holiday.date.slice(0, 4)}${holiday.date.slice(5, 7)}${holiday.date.slice(8, 10)}`;
        $(`#${holidayId}>.day_box`).addClass('holiday').append(holidayName);
      })
    })
    .catch(function (error) {
      console.error("祝日データの取得に失敗しました：", error);
    })
}


// 「前月」クリックで前月のカレンダーを描画する関数
$("#prev").on("click", function () {
  month--;
  if (month < 0) {
    year--;
    month = 11;
  }
  makeCalendar(year, month);
  renderSchedules(allScheduleData);

});

// 「翌月」クリックで翌月のカレンダーを描画する関数
$("#next").on("click", function () {
  month++;
  if (month > 11) {
    year++;
    month = 0;
  }
  makeCalendar(year, month);
  renderSchedules(allScheduleData);

});


// 予定の配列を入力し、当該日に予定を描画する関数（複数日にまたがる予定も含む）
function renderSchedules(dataArray) {
  // console.log("renderSchedules 実行中",dataArray);
  $(".memo_box").empty(); //一旦、既存予定を消去
  $(".multi_day_box").empty(); //一旦、既存予定を消去

  if(!Array.isArray(dataArray)) {
    console.error("renderSchedules:データが配列ではありません", dataArray);
    return;
  }
  dataArray.forEach(item => {
    let curDate = new Date(item.start_date);
    const endDate = new Date(item.end_date);
    const startTime = item.start_time ? item.start_time.slice(0, 5) : "未定";
    // console.log(startTime);

    const isSameDate =
      curDate.getFullYear() === endDate.getFullYear() &&
      curDate.getMonth() === endDate.getMonth() &&
      curDate.getDate() === endDate.getDate();


    if (isSameDate) { //1日の予定の場合
      const y = curDate.getFullYear();
      const m = (curDate.getMonth() + 1).toString().padStart(2, "0");
      const d = curDate.getDate().toString().padStart(2, "0");
      const dateId = `day${y}${m}${d}`;
      $(`#${dateId} .memo_box`).append(`<div class="memo_box_item" data-id="${item.id}">${startTime}:${item.title}<div>`);
    } else { //複数日にまたがる予定野場合
      while (curDate <= endDate) {
        const y = curDate.getFullYear();
        const m = (curDate.getMonth() + 1).toString().padStart(2, "0");
        const d = curDate.getDate().toString().padStart(2, "0");
        const dateId = `day${y}${m}${d}`;

        $(`#${dateId} .multi_day_box`).append(
          `<div class="multi_box_item" data-id="${item.id}">${startTime}:${item.title}<div>`
        );
        curDate.setDate(curDate.getDate() + 1);
      }
    }
  });
}

//予定の保存ボタン処理
$("#save").on("click", function () {
  // saveScheduleData();
  $(".overlay").css('display', 'none');
});

// 日付を入力し、時刻をはずず関数
function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// 日をクリックして予定リスト画面を呼出
$("tbody").on("click", ".date_box", function () {

  $(".event_overlay").slideDown(300);

  const dateBoxId = $(this).attr('id');
  $("#eventDayId").html(dateBoxId);
  $("#dateBoxId").html(dateBoxId);
  const sheduleDate = `${dateBoxId.slice(3, 7)}年${dateBoxId.slice(7, 9)}月${dateBoxId.slice(9, 11)}日`;
  $("#eventDay").text(sheduleDate);

  $("#eventList").empty(); // 一度リストを初期化

  //予定がはいっていたら、その予定を表示
  const result = $(this).find('.memo_box_item, .multi_box_item');
  if (result.length) {
    const eventList = allScheduleData.filter(item => {
      const curDate = stripTime(new Date(
        dateBoxId.slice(3, 7),
        parseInt(dateBoxId.slice(7, 9)) - 1,
        dateBoxId.slice(9, 11)
      ));

      const start = stripTime(new Date(item.start_date));
      const end = stripTime(new Date(item.end_date));
      return curDate >= start && curDate <= end;
    });

    // console.log(eventList);
    eventList.forEach(item => {
      const startTime = item.start_time ? item.start_time.slice(0, 5) : "未定";
      $("#eventList").append(`
        <li class="eventList_item" data-id="${item.id}">${startTime}：${item.title}</li>
        `);
    });

  }
});
//予定リスト画面のキャンセルボタン
// 予定リスト画面を閉じる
$("#eventCancel").on("click", function () {
  $(".event_overlay").slideUp(300);
});

// "day20250620"を"2025-06-20"に変換する関数
function changeFormatdate(dateBoxId) {
  const yyyy = dateBoxId.slice(3, 7);
  const mm = dateBoxId.slice(7, 9);
  const dd = dateBoxId.slice(9, 11);
  const formattedDate = `${yyyy}-${mm}-${dd}`;
  return formattedDate;
}

let previousOverlay = null;
// 現在の画面状態を記録する変数

// 新規予定入力の表示、日付表示
$("#newEntry").on("click", function () {
  previousOverlay = 'eventList';

  const dateBoxId = $("#dateBoxId").text();
  const formattedDate = changeFormatdate(dateBoxId);

  $("#title").val("");
  $("#startDate").val(formattedDate);
  $("#startTime").val("");
  $("#endDate").val(formattedDate);
  $("#endTime").val("");
  $("#place").val("");
  $("#note").val("");
  $("#repeat").val("norepeat");
  $("#repeat").prop("disabled", false);
  $("#repeatEnd").val("");
  $("#repeatEnd").prop("disabled", false);
  const sheduleDate = $("#eventDay").text();
  $("#modalTitle").text(sheduleDate);
  $(".event_overlay").css('display', 'none');
  $(".overlay").css('display', 'block');

  $("#save").hide().show();//保存ボタン表示
  $("#upDate").hide();
  $("#delete").hide();
  //更新ボタン、削除ボタンは削除

});

//既存予定をクリック→予定編集画面に遷移
$("#eventList").on("click", ".eventList_item", function () {

  previousOverlay = 'eventList';

  const id = parseInt($(this).attr("data-id"));
  const item = allScheduleData.find(item => item.id === id);

  console.log(item);

  if (item) {

    $("#title").val(item.title);
    $("#startDate").val(item.start_date);
    $("#startTime").val(item.start_time);
    $("#endDate").val(item.end_date);
    $("#endTime").val(item.end_time);
    $("#place").val(item.place);
    $("#note").val(item.note);
    $("#repeat").val(item.repeat_type);
    $("#repeat").prop("disabled", true);
    $("#repeatEnd").val(item.repeat_end);
    $("#repeatEnd").prop("disabled", true);
    const sheduleDate = $("#eventDay").text();
    $("#modalTitle").text(sheduleDate);
    // $("#dateBoxId").text(item.date);
    // console.log(item.date);
    $("#editingId").val(item.id);
    $(".event_overlay").css('display', 'none');
    $(".overlay").css('display', 'block');

    $("#save").hide();//保存ボタン削除
    $("#upDate").hide().show();
    $("#delete").hide().show();
    //更新ボタン、削除ボタンは表示

  } else {
    alert('該当データがありません')
  }

});


//予定入力画面のキャンセルボタン
$("#modalCancel").on("click", function () {
  $(".overlay").css('display', 'none');

  if (previousOverlay === 'eventList') {
    $(".event_overlay").css('display', 'block');
  }
  previousOverlay === null;
});

// 壁紙選択関係アクション
$("#selectWallPaper").on("click", function () {
  $(".wallPaper_overlay").css('display', 'block');
});


// 画像選択アクション
let selectedWallPaper = null;//画像パス

$(".wallPaper").on("click", function () {
  $(".wallPaper").removeClass('selected');//初期化、選択状態リセット
  $(this).addClass('selected');
  //クリック画像を選択状態に

  selectedWallPaper = $(this).find("img").attr("src");//選択画像のパスを取得
});

//選択した壁紙へ壁紙の変更、ストレージにパスを保存
$("#wallPaperChange").on("click", function () {
  if (selectedWallPaper) {
    $(".cal_wrapper").css(
      'background-image', `linear-gradient(to top, rgba(217, 175, 217, 0.5) 0%, rgba(151, 217, 225, 0.5) 100%),
       url(${selectedWallPaper})`);//背景変更

    localStorage.setItem('wallPaper', selectedWallPaper);//ストレージに保存

    $(".wallPaper_overlay").css('display', 'none');

  } else {
    alert('壁紙を選択してください');
  }
});

// ストレージに保存した壁紙の読み込み
$(function () {
  const savedWallPaper = localStorage.getItem('wallPaper');
  if (savedWallPaper) {
    $(".cal_wrapper").css(
      'background-image', `linear-gradient(to top, rgba(217, 175, 217, 0.5) 0%, rgba(151, 217, 225, 0.5) 100%),
       url(${savedWallPaper})`);
  }
});

// 壁紙選択画面のキャンセル
$("#wallPaperCancelBtn").on("click", function () {
  $(".wallPaper_overlay").css('display', 'none');
});

// 今月に戻るボタン
$("#toThisMonth").on("click", function () {
  const today = new Date();
  year = today.getFullYear();
  month = today.getMonth();
  makeCalendar(year, month);
  renderSchedules(allScheduleData);
});


