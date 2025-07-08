// 壁紙選択と保存に関するロジックを管理
export function initializeWallpaperSelection() {

  let selectedWallPaper = null;//画像パス

  // 画像選択アクション
  $(".wallPaper").on("click", function () {
    $(".wallPaper").removeClass('selected');//初期化、選択状態リセット
    $(this).addClass('selected');
    //クリック画像を選択状態に
    selectedWallPaper = $(this).find("img").attr("src");//選択画像のパスを取得
  });

  //選択した壁紙へ壁紙の変更、ストレージにパスを保存
  $("#wallPaperChange").on("click", function () {
    if (selectedWallPaper) {
      $(".cal_wrapper").css(
        'background-image', `linear-gradient(to top, rgba(217, 175, 217, 0.5) 0%, rgba(151, 217, 225, 0.5) 100%),
       url(${selectedWallPaper})`);//背景変更

      localStorage.setItem('wallPaper', selectedWallPaper);//ストレージに保存
      $(".wallPaper_overlay").css('display', 'none');
    } else {
      alert('壁紙を選択してください');
    }
  });

  // ストレージに保存した壁紙の読み込み
  $(function () {
    const savedWallPaper = localStorage.getItem('wallPaper');
    if (savedWallPaper) {
      $(".cal_wrapper").css(
        'background-image', `linear-gradient(to top, rgba(217, 175, 217, 0.5) 0%, rgba(151, 217, 225, 0.5) 100%),
       url(${savedWallPaper})`);
    }
  });

  // 壁紙選択画面のキャンセル
  $("#wallPaperCancelBtn").on("click", function () {
    $(".wallPaper_overlay").css('display', 'none');
  });
}