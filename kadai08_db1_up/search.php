<?php
header('Content-Type: application/json');
//返すデータがJSONであることを伝える。
// db接続
require_once('connect.php');
$pdo = db_conn();

$keyword = $_POST['keyword'];

$sql = 'SELECT * FROM schedule_table WHERE title LIKE :keyword OR place LIKE :keyword OR note LIKE :keyword ORDER BY start_date DESC';

$stmt = $pdo->prepare($sql);

$stmt->bindValue(':keyword', '%' . $keyword . '%', PDO::PARAM_STR);

try {
  $status = $stmt->execute();
} catch (PDOException $e) {
  echo json_encode(["sql error" => "{$e->getMessage()}"]);
  exit();
}

$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($results, JSON_UNESCAPED_UNICODE);

?>