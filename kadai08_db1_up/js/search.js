export function handleSearchEvents(state) {

  // 予定検索画面オープン
  $("#searchOpen").on("click", function () {
    $(".search_overlay").slideDown(300);
    $("#searchResult").empty();
    $("#searchInput").val("");
  });

  // 予定検索画面を閉じる
  $("#searchCancel").on("click", function () {
    $(".search_overlay").slideUp(300);
  });


  // 検索ボタンをクリックしてキーワードをsearch.phpにおくる。
  // 戻ってきたデータ（results）はオブジェクトになっている。
  $("#searchBtn").on("click", function () {
    const keyword = $("#searchInput").val();

    if (!keyword) {
      alert("キーワードを入力してください。")
    } else {
      $.post("search.php", { keyword: keyword }, function (results) {
        // resultsはすでにオブジェクトになっている。
        let html = "";

        if (results.length === 0) {
          html = `<p>該当する予定はありません。</p>`;
        } else {
          results.forEach(item => {
            html += `<div class="result_item" data-id=${item.id}>${item.start_date}：${item.title}</div>`
          });
        }
        $("#searchResult").html(html);
      }).fail(function (xhr, status, error) {
        console.error("検索に失敗しました");
        console.error("xhr.status", xhr.status);
        console.error("status", status);
        console.error("error", error);

        $("#searchResult").html(`<p>検索中にエラーが発生しました。${xhr.status}</p>`);
      })
    }
  });

  //予定検索し、結果の予定をクリック→予定編集画面に遷移
  $("#searchResult").on("click", ".result_item", function () {

    state.previousOverlay = 'searchResult';

    const id = parseInt($(this).attr("data-id"));
    const item = state.allScheduleData.find(item => item.id === id);

    if (item) {

      const dateId = `day${item.start_date.replace(/-/g, "")}` //正規表現：全ての"-"を削除
      const sheduleDate = `${dateId.slice(3, 7)}年${dateId.slice(7, 9)}月${dateId.slice(9, 11)}日`;

      $("#title").val(item.title);
      $("#startDate").val(item.start_date).prop("disabled", false);
      $("#startTime").val(item.start_time);
      $("#endDate").val(item.end_date).prop("disabled", false);
      $("#endTime").val(item.end_time);
      $("#place").val(item.place);
      $("#note").val(item.note);
      $("#repeat").val(item.repeat_type).prop("disabled", true);
      $("#repeatEnd").val(item.repeat_end).prop("disabled", true);

      $("#modalTitle").text(sheduleDate); // モーダル画面のタイトル日付
      $("#dateBoxId").html(dateId); // モーダル画面内部のID 例:"day20250726"
      $("#editingId").val(item.id);
      $("#groupId").val(item.repeat_group_id);

      $(".search_overlay").hide(); // 予定検索画面隠す
      $(".overlay").show(); // 予定編集画面を表示

      $("#save").hide();//保存ボタン削除
      $("#upDate, #delete").hide().show();
      //更新ボタン、削除ボタンは表示

      if (item.repeat_type !== "norepeat") {
        // 繰り返し予定の場合、
        $(".modal_item_update").show();
        // その日だけかその日以降全てか選択するラジオボタンを表示
        $("#startDate, #endDate").prop("disabled", true);
        // $("#endDate").prop("disabled", true);
        // 開始日と終了日は変更不可とする
      } else {
        $(".modal_item_update").hide();
      }

    } else {
      alert('該当データがありません')
    }

  });

}