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
            //開始メッセージ投入
            this.spawnEventMessage(1, "You reached Tanelorn...");

            //マップ表示設定
            this.limitWidth = true;
            this.limitHeight = true;

            this.player.isAuto = true;
            this.player.autoKey.right = true;
        });

        this.add(240, function() {
            this.player.autoKey.right = false;
        });
    },

    //ステージクリア条件判定
    checkStageClearCondition: function() {
        return true;
    },

    //ステージクリア処理
    stageClear: function() {
    },
});
