/*
 *  stage1.js
 *  2017/01/24
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ１
phina.define("qft.Stage1", {
    superClass: "qft.StageController",

    //タイムリミット
    timeLimit: FPS*60*5,

    init: function(parentScene, tmx) {
        this.superInit(parentScene, tmx);

        //初期処理
        this.add(1, function() {
            //ＢＧＭ再生
            app.playBGM("bgm1");
            //ステージ開始メッセージ投入
            this.spawnMessage("STAGE 1", 24);
        });

        this.add(60, function() {
        });
    },

    //ステージクリア条件判定
    checkStageClearCondtion: function() {
        var keys = this.player.keys;
        if (keys.length != 0) return true;
        return false;
    },
});
