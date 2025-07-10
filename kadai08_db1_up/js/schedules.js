// 予定の配列を入力し、当該日に予定を描画する関数（複数日にまたがる予定も含む）
export function renderSchedules(state) {

  $(".memo_box, .multi_day_box").empty(); //一旦、既存予定を消去

  const dataArray = state.allScheduleData;
  // console.log(dataArray);
  if (!Array.isArray(dataArray)) {
    console.error("renderSchedules:データが配列ではありません", dataArray);
    return;
  }
  dataArray.forEach(item => {
    let curDate = new Date(item.start_date);
    const endDate = new Date(item.end_date);
    const startTime = item.start_time ? item.start_time.slice(0, 5) : "未定";

    const isSameDate =
      curDate.getFullYear() === endDate.getFullYear() &&
      curDate.getMonth() === endDate.getMonth() &&
      curDate.getDate() === endDate.getDate();


    if (isSameDate) { //1日の予定の場合
      const y = curDate.getFullYear();
      // const m = (curDate.getMonth() + 1).toString().padStart(2, "0");
      const m = String(curDate.getMonth() + 1).padStart(2, "0");
      // const d = curDate.getDate().toString().padStart(2, "0");
      const d = String(curDate.getDate()).padStart(2, "0");
      const dateId = `day${y}${m}${d}`;
      $(`#${dateId} .memo_box`).append(`<div class="memo_box_item" data-id="${item.id}">${startTime}:${item.title}<div>`);
    } else { //複数日にまたがる予定野場合
      while (curDate <= endDate) {
        const y = curDate.getFullYear();
        const m = String(curDate.getMonth() + 1).padStart(2, "0");
        const d = String(curDate.getDate()).padStart(2, "0");
        const dateId = `day${y}${m}${d}`;

        $(`#${dateId} .multi_day_box`).append(
          `<div class="multi_box_item" data-id="${item.id}">${startTime}:${item.title}<div>`
        );
        curDate.setDate(curDate.getDate() + 1);
      }
    }
  });
}