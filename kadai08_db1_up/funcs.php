<?php
// 値が存在しないか空文字ならエラーを返す。
function nullAndEmpty($value)
{
  if (!isset($value) || $value === "") {
    exit('パラメーターエラー');
  } else {
    return $value;
  }
}

// ""空文字だったらnullにする関数
function nullIfEmpty($value)
{
  return $value === "" ? null : $value;
}

// 時刻に秒を付加する関数
function addSecondTime($time)
{
  if ($time === "") return null;
  if (preg_match("/^\d{2}:\d{2}$/", $time)) {
    return $time . ":00";
  } else {
    return $time;
  }
}

// ユニークなidを作る関数：repeat_group_idに使用
function generateUUID() {
  return bin2hex(random_bytes(16));
}

?>