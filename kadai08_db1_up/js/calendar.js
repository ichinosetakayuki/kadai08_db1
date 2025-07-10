import { makeHolidays } from './holidays.js';

export function initializeCalendarHeader() {
  const days = ['月', '火', '水', '木', '金', '土', '日'];
  $("#dayLabel").empty();
  days.forEach(d => $("#dayLabel").append(`<th class="day_of_week">${d}</th>`));
}

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

// 今月の日々の配列を作る関数
function getCurrentMonthDays(year, month) {
  const dates = [];
  const today = new Date();
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

// カレンダーを描画する関数
export function makeCalendar(year, month) {

  $("#month").html(`${year}年${month + 1}月`);

  $("tbody").empty();
  const dates = [
    ...getPrevMonthdays(year, month),
    ...getCurrentMonthDays(year, month),
    ...getNextMonthdays(year, month),
  ];

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