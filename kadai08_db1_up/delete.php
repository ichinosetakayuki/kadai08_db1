<?php
header('Content-Type: application/json');
require_once('funcs.php');

$id = nullAndEmpty($_POST['id'] ?? null);
$start_date = nullAndEmpty($_POST['start_date'] ?? null);
$repeat_type = $_POST['repeat_type'] ?? null;
$repeat_group_id = $_POST['repeat_group_id'] ?? null;
$update_scope = $_POST['update_scope'] ?? null;

$target_date = $start_date; // 基準日を選択した日に設定

require_once('connect.php');
$pdo = db_conn();

try {
  // === 1.単独予定の削除ロジック ===
  if ($repeat_type === 'norepeat') {
    $sql = 'UPDATE schedule_table SET deleted_at=now() WHERE id=:id';

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);

    $status = $stmt->execute();
    echo json_encode(["status" => "success", "message" => "単独予定の削除が完了しました"]);

    // ===2.繰り返し予定の更新ロジック ===
  } else { // repeat_typeが'norepeat'以外の場合
    if (empty($repeat_group_id)) {
      echo json_encode(["status" => "error", "message" => "repeat_group_id がありません。繰り返し予定の削除には必須です。"]);
      exit();
    }
    if ($update_scope === 'single') {
      // --- 2-1. この日だけの更新 ---
      $sql = 'UPDATE schedule_table SET deleted_at=now() WHERE id=:id AND repeat_group_id=:repeat_group_id';

      $stmt = $pdo->prepare($sql);
      $stmt->bindValue(':id', $id, PDO::PARAM_INT);
      $stmt->bindValue(':repeat_group_id', $repeat_group_id, PDO::PARAM_STR);

      $status = $stmt->execute();
      echo json_encode(["status" => "success", "message" => "選択した日のみの予定を削除しました。"]);
    } elseif ($update_scope === 'following') {
      // --- 2-2. この日以降すべての予定更新 ---
      // 日時は固定とし、ずらさない
      $sql = 'UPDATE schedule_table SET deleted_at=now() WHERE repeat_group_id=:repeat_group_id AND start_date>=:target_date';

      $stmt = $pdo->prepare($sql);
      $stmt->bindValue(':repeat_group_id', $repeat_group_id, PDO::PARAM_STR);
      $stmt->bindValue(':target_date', $target_date, PDO::PARAM_STR);

      $status = $stmt->execute();
      echo json_encode(["status" => "success", "message" => "選択した日以降、すべての予定を削除しました。"]);
    } else {
      // update_scopeが予期せぬ値の場合
      echo json_encode(["status" => "error", "message" => "無効な更新範囲が指定されました。"]);
    }
  }
} catch (PDOException $e) {
  // 例外発生時の共通エラーハンドリング
  error_log("DB Error in update.php: " . $e->getMessage()); // エラーログに出力
  echo json_encode(["status" => "error", "message" => "DBエラー: " . $e->getMessage()]);
  exit();
}
