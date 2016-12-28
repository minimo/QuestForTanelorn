/*
 *  MainScene.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.MainScene", {
    superClass: "phina.display.DisplayScene",

    init: function() {
        this.superInit();

        //オブジェクト管理レイヤ
        this.objLayer = phina.display.DisplayElement().addChildTo(this);

        this.player = qft.Player()
            .addChildTo(this.objLayer)
            .setPosition(SC_W*0.5, SC_H*0.5);

        this.time = 0;
    },

    update: function(app) {
        this.time++;
    },
});
