import { stripTime, changeFormatdate } from './utils.js';
import { renderSchedules } from './schedules.js';

export function handleModalEvents(state) {

  // 日をクリックして予定リスト画面を呼出
  $("tbody").on("click", ".date_box", function () {

    $(".event_overlay").slideDown(300);

    const dateBoxId = $(this).attr('id');
    $("#eventDayId, #dateBoxId").html(dateBoxId);
    const sheduleDate = `${dateBoxId.slice(3, 7)}年${dateBoxId.slice(7, 9)}月${dateBoxId.slice(9, 11)}日`;
    $("#eventDay").text(sheduleDate);
    $("#eventList").empty(); // 一度リストを初期化

    //予定がはいっていたら、その予定を表示
    const result = $(this).find('.memo_box_item, .multi_box_item');
    if (result.length) {
      const eventList = state.allScheduleData.filter(item => {
        const curDate = stripTime(new Date(
          dateBoxId.slice(3, 7),
          parseInt(dateBoxId.slice(7, 9)) - 1,
          dateBoxId.slice(9, 11)
        ));

        const start = stripTime(new Date(item.start_date));
        const end = stripTime(new Date(item.end_date));
        return curDate >= start && curDate <= end;
      });

      eventList.forEach(item => {
        const startTime = item.start_time ? item.start_time.slice(0, 5) : "未定";
        $("#eventList").append(`
        <li class="eventList_item" data-id="${item.id}">${startTime}：${item.title}</li>
        `);
      });
    }
  });

  //予定リスト画面のキャンセルボタン
  // 予定リスト画面を閉じる
  $("#eventCancel").on("click", function () {
    $(".event_overlay").slideUp(300);
  });

  // 新規予定入力の表示、日付表示
  $("#newEntry").on("click", function () {
    state.previousOverlay = 'eventList'; // 前いた画面をセット

    const dateBoxId = $("#dateBoxId").text();
    const formattedDate = changeFormatdate(dateBoxId);

    $("#title").val("");
    $("#startDate").val(formattedDate).prop("disabled", false);
    $("#startTime").val("");
    $("#endDate").val(formattedDate).prop("disabled", false);
    $("#endTime").val("");
    $("#place").val("");
    $("#note").val("");
    $("#repeat").val("norepeat").prop("disabled", false);
    $("#repeatEnd").val("").prop("disabled", false);
    const sheduleDate = $("#eventDay").text();
    $("#modalTitle").text(sheduleDate);
    $(".event_overlay").hide();
    $(".overlay").show();
    $(".modal_item_update").hide(); // 繰り返し予定編集の確認
    $("#save").hide().show();//保存ボタン表示
    $("#upDate, #delete").hide();
    //更新ボタン、削除ボタンは削除
  });

  //既存予定をクリック→予定編集画面に遷移
  $("#eventList").on("click", ".eventList_item", function () {

    state.previousOverlay = 'eventList'; // 前にいた画面をセットし、記憶

    const id = parseInt($(this).attr("data-id"));
    const item = state.allScheduleData.find(item => item.id === id);

    // console.log(item);

    if (item) {

      $("#title").val(item.title);
      $("#startDate").val(item.start_date).prop("disabled", false);
      $("#startTime").val(item.start_time);
      $("#endDate").val(item.end_date).prop("disabled", false);
      $("#endTime").val(item.end_time);
      $("#place").val(item.place);
      $("#note").val(item.note);
      $("#repeat").val(item.repeat_type).prop("disabled", true);
      $("#repeatEnd").val(item.repeat_end).prop("disabled", true);
      const sheduleDate = $("#eventDay").text();
      $("#modalTitle").text(sheduleDate);

      $("#editingId").val(item.id);
      $("#groupId").val(item.repeat_group_id);
      $(".event_overlay").css('display', 'none');
      $(".overlay").css('display', 'block');

      $("#save").hide();//保存ボタン削除
      $("#upDate").hide().show();
      $("#delete").hide().show();
      //更新ボタン、削除ボタンは表示

      if (item.repeat_type !== "norepeat") {
        // 繰り返し予定の場合、
        $(".modal_item_update").show();
        // その日だけかその日以降全てか選択するラジオボタンを表示
        $("#startDate, #endDate").prop("disabled", true);
        // 開始日と終了日は変更不可とする
      } else {
        $(".modal_item_update").hide();
      }

    } else {
      alert('該当データがありません')
    }
  });


  //予定の保存ボタン処理
  // 保存ボタンによりindex.phpのformからcreate.phpにsubmitされる。
  $("#save").on("click", function () {
    $(".overlay").hide();
  });


  // 既存予定を編集し、更新ボタンで予定内容を更新
  $("#upDate").on("click", function () {

    // console.log($("input[name='update_scope']:checked").val());

    const updateData = {
      id: $("#editingId").val(),
      title: $("#title").val(),
      start_date: $("#startDate").val(),
      start_time: $("#startTime").val(),
      end_date: $("#endDate").val(),
      end_time: $("#endTime").val(),
      place: $("#place").val(),
      note: $("#note").val(),
      repeat_type: $("#repeat").val(),
      repeat_end: $("#repeatEnd").val(),
      repeat_group_id: $("#groupId").val(),
      update_scope: $("input[name='update_scope']:checked").val()
    };

    // console.log(updateData);

    $.post("update.php", updateData, function (results) {
      if (results.status === "success") {
        alert("更新が完了しました")
        $.getJSON("read.php", function (data) {
          state.allScheduleData = data;
          renderSchedules(state);
          $(".overlay").hide();
        });
      } else {
        console.error("更新失敗:", results);
      }
    }).fail(function (xhr, status, error) {
      console.error("検索に失敗しました");
      console.error("xhr.status", xhr.status);
      console.error("status", status);
      console.error("error", error);
    })
  });

  // 既存予定の削除処理
  $("#delete").on("click", function () {

    const deleteData = {
      id: $("#editingId").val(),
      start_date: $("#startDate").val(),
      repeat_type: $("#repeat").val(),
      repeat_group_id: $("#groupId").val(),
      update_scope: $("input[name='update_scope']:checked").val()
    };

    $.post("delete.php", deleteData, function (results) {
      if (results.status === "success") {
        alert("データが削除されました。");
        $.getJSON("read.php", function (data) {
          state.allScheduleData = data;
          renderSchedules(state);
          $(".overlay").hide();
        });
      } else {
        console.error("削除失敗:", results);
      }
    }).fail(function (xhr, status, error) {
      console.error("検索に失敗しました");
      console.error("xhr.status", xhr.status);
      console.error("status", status);
      console.error("error", error);
    })

  });

}