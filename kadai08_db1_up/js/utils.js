// 日付を入力し、時刻をはずず関数
export function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// "day20250620"を"2025-06-20"に変換する関数
export function changeFormatdate(dateBoxId) {
  const yyyy = dateBoxId.slice(3, 7);
  const mm = dateBoxId.slice(7, 9);
  const dd = dateBoxId.slice(9, 11);
  const formattedDate = `${yyyy}-${mm}-${dd}`;
  return formattedDate;
}
