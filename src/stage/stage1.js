/*
 *  stage1.js
 *  2017/01/24
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ１
phina.define("qft.Stage1", {
    superClass: "qft.StageController",

    tmx: null,

    init: function(parent, player, tmx) {
        this.superInit(parent, player, tmx);

        //初期処理
        this.add(1, function() {
            app.playBGM("stage1", true);
        });
        this.add(60, function() {
        });
    },
});
