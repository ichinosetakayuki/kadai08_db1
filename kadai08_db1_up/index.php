<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c&family=Pacifico&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="css/style.css">
  <title>Motitaka Calendar</title>
</head>

<body>
  <header>
    <p>（開発中 : データはすべてダミーです）</p>
  </header>
  <div class="wrapper">
    <div class="cal_wrapper">
      <!-- 森高タイトル部分h1 -->
      <h1 class="m-plus-rounded-1c-regular"><span class="yellow_under_line">森高千里 <span
            class="pacifico-regular calendar-cute">Calendar ver.3</span></span></h1>
      <!-- カレンダー月見出し -->
      <div class="cal_container">
        <div class="month_box">
          <div id="prev"><img src="img/caret-left.svg" alt="">前月</div>
          <h2 id="month"></h2>
          <div id="next">翌月<img src="img/caret-right.svg" alt=""></div>
        </div>
        <!-- カレンダー部分 -->
        <table>
          <thead>
            <tr id="dayLabel"></tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>

      <!-- セッティングボタン -->
      <div class="setting">
        <button id="searchOpen">予定検索</button>
        <button id="selectWallPaper">壁紙選択</button>
        <button id="toThisMonth">今月に戻る</button>
      </div>
    </div>

    <!-- 予定の新規入力・編集モーダル画面 -->
    <div class="overlay">
      <div class="modal_content">
        <p id="modalTitle">日付</p>
        <div id="dateBoxId"></div>

        <!-- ここからフォーム -->
        <form id="scheduleForm" action="create.php" method="POST"> <!-- create.phpに飛ばす-->
          <div class="modal_item_title">
            <label for="title">件　名</label>
            <input type="text" id="title" name="title" class="border_style" required>
          </div>
          <div class="modal_item_time_wrap">
            <div class="modal_item_time">
              <label for="startDate">開始日</label>
              <input type="date" id="startDate" name="start_date" class="border_style">
              <label for="startTime">開始時間</label>
              <input id="startTime" type="time" name="start_time" class="border_style">
            </div>
            <div class="modal_item_time">
              <label for="endDate">終了日</label>
              <input type="date" id="endDate" name="end_date" class="border_style">
              <label for="endTime">終了時間</label>
              <input id="endTime" type="time" name="end_time" class="border_style">
            </div>
          </div>
          <div class="modal_item_place">
            <label for="place">場　所</label>
            <input id="place" type="text" name="place" class="border_style">
          </div>
          <div class="modal_item_note">
            <label for="note">メ　モ</label>
            <textarea name="note" id="note" class="border_style"></textarea>
          </div>
          <div class="modal_item_repeat">
            <div>
              <label for="repeat">繰り返し</label>
              <select name="repeat_type" id="repeat" class="border_style">
                <option value="norepeat" selected>なし</option>
                <option value="daily">毎日</option>
                <option value="weekday">月〜金</option>
                <option value="weekly">毎週</option>
                <option value="monthly">毎月</option>
              </select>
            </div>
            <div>
              <label for="repeatEnd">終了日</label>
              <input type="date" id="repeatEnd" name="repeat_end" class="border_style">
            </div>
          </div>
          <input type="hidden" id="editingId">
          <div class="modal_item_buttons">
            <button id="save" type="submit">保　存</button>
            <button id="upDate" type="button">更　新</button>
            <button id="delete" type="button">削　除</button>
          </div>
        </form>
        <!-- フォームここまで -->

        <div class="modal_item_cancel">
          <button id="modalCancel">キャンセル</button>
        </div>
      </div>
    </div>

    <!-- 予定一覧のモーダル画面 -->
    <div class="event_overlay">
      <div id="eventListBox" class="event_modal">
        <p id="eventDay">日付</p>
        <div id="eventDayId"></div>
        <ul id="eventList"></ul>
        <div class="button_box">
          <div>
            <button id="newEntry">新規予定</button>
          </div>
          <div>
            <button id="eventCancel">閉じる</button>
          </div>
        </div>
      </div>
    </div>
    <!-- 予定検索画面 -->
    <div class="search_overlay">
      <div class="search_box">
        <div class="search_box_top">
          <input type="text" id="searchInput"  name="keyword" placeholder="タイトル、場所などキーワード">
          <button id="searchBtn">検　索</button>
        </div>
        <div id="searchResult"></div>
        <div class="search_btn_box">
          <button id="searchCancel">閉じる</button>
        </div>
      </div>
    </div>


    <!-- 壁紙選択モーダル画面 -->
    <div class="wallPaper_overlay">
      <div class="wallPaper_box">
        <p>壁紙選択</p>
        <div id="wallPapers">
          <div class="wallPaper">
            <img src="img/moritaka_img01.png" alt="森高壁紙">
          </div>
          <div class="wallPaper">
            <img src="img/moritaka_img03.png" alt="森高壁紙">
          </div>
          <div class="wallPaper">
            <img src="img/moritaka_anime05.png" alt="森高壁紙">
          </div>
        </div>
        <div id="wallPaperBtnBox">
          <button id="wallPaperChange" type="button">変　更</button>
          <button id="wallPaperCancelBtn" type="button">キャンセル</button>
        </div>
      </div>
    </div>
  </div>


  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
  <!-- axiosライブラリの読み込み -->
  <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
  <!-- js Firebase読み込み -->
  <!-- <script type="module" src="js/main.js"></script> -->
  <script src="js/main.js?v=1234"></script>

</body>

</html>