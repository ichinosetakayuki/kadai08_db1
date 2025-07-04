<?php
require_once('funcs.php');


$title = nullAndEmpty($_POST['title']);
$start_date = nullAndEmpty($_POST['start_date']);
$start_time = addSecondTime($_POST['start_time']);
$end_date = nullAndEmpty($_POST['end_date']);
$end_time = addSecondTime($_POST['end_time']);
$place = $_POST['place'];
$note = $_POST['note'];
$repeat_type = $_POST['repeat_type'];
$repeat_end = nullIfEmpty($_POST['repeat_end']);

// echo "<pre>";
// var_dump($_POST);
// echo "</pre>";
// exit();


if ($repeat_type !== 'norepeat' && empty($repeat_end)) {
  exit('繰り返しの終了日が必要です');
}

// 繰り返し予定の場合、ユニークなidを付加する。generateUUID→ユニークなIDを生成する関数。
$repeat_group_id = ($repeat_type !== 'norepeat') ? generateUUID() :null;

$max_repeat = 100; //無限ループ防止
$dates = [];

$start = new DateTime($start_date);
$end = new DateTime($repeat_end);
$count = 0;

// 繰り返し予定のタイプによって日付を生成
if ($repeat_type === 'daily') {
  while ($start <= $end && $count < $max_repeat) {
    $dates[] = $start->format('Y-m-d');
    $start->modify('+1 day');
    $count++;
  }
} elseif ($repeat_type === 'weekday') {
  while ($start <= $end && $count < $max_repeat) {
    $w = (int)$start->format('N'); // 曜日を取得 月=1、日=7
    if ($w >= 1 && $w <= 5) {
      $dates[] = $start->format('Y-m-d');
    }
    $start->modify('+1 day');
    $count++;
  }
} elseif ($repeat_type === 'weekly') {
  while ($start <= $end && $count < $max_repeat) {
    $dates[] = $start->format('Y-m-d');
    $start->modify('+1 week');
    $count++;
  }
} elseif ($repeat_type === 'monthly') {
  $day = (int)$start->format('d'); //初日の日にちだけ取り出す
  while ($start <= $end && $count < $max_repeat) {
    $dates[] = $start->format('Y-m-d');
    $start->modify('first day of next month')->setDate(
      (int)$start->format('Y'),
      (int)$start->format('m'),
      min($day, cal_days_in_month(CAL_GREGORIAN, (int)$start->format('m'), (int)$start->format('Y')))
      //翌月の1日にmodifyし、その月の日数をを出して、$dayと少ない方を日にちにセットし、次の$startにする。
    );
    $count++;
  }
} else {
  $dates[] = $start_date;
}


// DB接続
require_once('connect.php');
$pdo = db_conn();

$sql = 'INSERT INTO schedule_table (id, title, start_date, start_time, end_date, end_time, place, note, repeat_type, repeat_end, repeat_group_id, created_at, updated_at) VALUES(NULL, :title, :start_date, :start_time, :end_date, :end_time, :place, :note, :repeat_type, :repeat_end, :repeat_group_id, now(), now())';

$stmt = $pdo->prepare($sql);

foreach ($dates as $date) {
  $start_date = $date;
  if($repeat_type !== 'norepeat') { //繰り返しの場合
    $end_date = $date;
  } else { // 繰り返しでない場合
    $end_date = nullAndEmpty($_POST['end_date']);
  }

  // バインド変数を設定
  $stmt->bindValue(':title', $title, PDO::PARAM_STR);
  $stmt->bindValue(':start_date', $start_date, PDO::PARAM_STR);
  $stmt->bindValue(':start_time', $start_time, PDO::PARAM_STR);
  $stmt->bindValue(':end_date', $end_date, PDO::PARAM_STR);
  $stmt->bindValue(':end_time', $end_time, PDO::PARAM_STR);
  $stmt->bindValue(':place', $place, PDO::PARAM_STR);
  $stmt->bindValue(':note', $note, PDO::PARAM_STR);
  $stmt->bindValue(':repeat_type', $repeat_type, PDO::PARAM_STR);
  $stmt->bindValue(':repeat_end', $repeat_end, PDO::PARAM_STR);
  $stmt->bindValue(':repeat_group_id', $repeat_group_id, PDO::PARAM_STR);

  try {
    $status = $stmt->execute();
  } catch (PDOException $e) {
    echo json_encode(["sql error" => "{$e->getMessage()}"]);
    exit();
  }
}

header('Location: index.php');
exit();
