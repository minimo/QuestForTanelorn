/*
 *  stage1.js
 *  2017/01/24
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ１
phina.define("qft.Stage1", {
    superClass: "qft.StageController",

    init: function(parentScene) {
        this.superInit(parentScene);

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
});
