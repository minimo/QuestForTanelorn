/*
 *  stage1.js
 *  2017/01/24
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ１
phina.define("qft.Stage1", {
    superClass: "qft.StageController",

    //マップデータ
    tmx: null,

    init: function(parent, player, tmx) {
        this.superInit(parent, player, tmx);

        //初期化処理
        this.add(1, function() {
            app.playBGM("stage1", true);
            this.player.isAfterburner = true;
        });
        this.add(60, function() {
            this.ground.tweener.clear().to({scaleX:1.0, scaleY:1.0, speed:3.0}, 300, "easeInOutCubic");
            this.player.isAfterburner = false;
        });
    },
});
