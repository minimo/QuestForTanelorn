/*
 *  stage10.js
 *  2017/09/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

//エンディングシーン
phina.define("qft.Stage10", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 10,

    //タイムリミット
    timeLimit: FPS*60*5,

    //BGMアセット名
    bgm: "ending",

    //特殊ステージフラグ
    isEnding: true,

    init: function(parentScene, tmx) {
        this.superInit(parentScene, tmx);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage10");
        this.mapLayer[0] = this.createMap(tmx);

        //初期処理
        this.add(1, function() {
            //マップ表示設定
            this.limitWidth = true;
            this.limitHeight = true;
        });

        this.add(60, function() {
        });
    },
});
