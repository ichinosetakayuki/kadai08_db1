// 祝日APIを使って、今年と来年の祝日データを取得し、祝日表示する関数
export function makeHolidays() {
  const url = "https://api.national-holidays.jp/recent";
  axios
    .get(url)
    .then(function (response) {
      const holidays = response.data;
      holidays.forEach(holiday => {
        const holidayId = `day${holiday.date.replace(/-/g,"")}`;
        $(`#${holidayId}>.day_box`).addClass('holiday').append(holiday.name);
      })
    })
    .catch(function (error) {
      console.error("祝日データの取得に失敗しました：", error);
    })
}