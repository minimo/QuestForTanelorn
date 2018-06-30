/*
 *  stage999.js
 *  2017/05/03
 *  @auther minimo  
 *  This Program is MIT license.
 */

//テストステージ
phina.define("qft.Stage999", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 1,

    //タイムリミット
    timeLimit: FPS*60*5,

    init: function(parentScene) {
        this.superInit(parentScene);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage999");
        this.mapLayer[0] = this.createMap(tmx);

       //初期処理
        this.add(1, function() {
            //ＢＧＭ再生
            app.playBGM("bgm1");

            //ステージ開始メッセージ投入
            this.spawnMessage("STAGE 1", 24);

            //マップ表示設定
            this.limitWidth = false;
            this.limitHeight = true;
        });
    },
});
