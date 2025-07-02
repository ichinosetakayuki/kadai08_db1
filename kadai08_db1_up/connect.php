<?php
// DB接続関数 :db_conn()
function db_conn()
{
  require_once('env.php');

  $server_info = $_SERVER;

  $db_name = "";
  $db_host = "";
  $user = "";
  $pwd = "";

  $sakura_db_info = sakura_db_info();

  if ($server_info["SERVER_NAME"] == "localhost") {
    // ローカルホストの場合
    $db_name = 'gs_kadai08';
    $db_host = 'localhost';
    $user = 'root';
    $pwd = '';
  } else {
    // さくらサーバ
    $db_name = $sakura_db_info['db_name'];
    $db_host = $sakura_db_info['db_host'];
    $user = $sakura_db_info['user'];
    $pwd = $sakura_db_info['pwd'];
  }

  $dbn = "mysql:dbname={$db_name};charset=utf8mb4;port=3306;host={$db_host}";

  try {
    $pdo = new PDO($dbn, $user, $pwd);
    return $pdo;
  } catch (PDOException $e) {
    echo json_encode(["db error" => "{$e->getMessage()}"]);
    exit();
  }
}
