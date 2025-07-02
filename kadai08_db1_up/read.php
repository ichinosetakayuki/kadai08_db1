<?php

header('Content-Type: application/json');
//返すデータがJSONであることを伝える。APIとしてfetchやaxiosで取得する想定
// db接続
require_once('connect.php');
$pdo = db_conn();

$sql =  'SELECT * FROM schedule_table ORDER BY start_date ASC, start_time ASC';
$stmt = $pdo->prepare($sql);

try {
  $atatus = $stmt->execute();
} catch (PDOException $e) {
  echo json_encode(["sql error" => "{$e->getMessage()}"]);
  exit();
}

$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($result, JSON_UNESCAPED_UNICODE);

?>

