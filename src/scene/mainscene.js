/*
 *  MainScene.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.MainScene", {
    superClass: "phina.display.DisplayScene",

    init: function() {
        this.superInit();

        //地形判定用レイヤー
        this.collisionLayer = phina.display.DisplayElement().addChildTo(this);
        phina.display.DisplayElement({width: 400, height: 30}).addChildTo(this.collisionLayer).setPosition(0, 200);

        //オブジェクト管理レイヤ
        this.objLayer = phina.display.DisplayElement().addChildTo(this);

        //プレイヤーキャラクタ
        this.player = qft.Player(this).addChildTo(this.objLayer).setPosition(SC_W*0.5, SC_H*0.5);

        this.time = 0;
    },

    update: function(app) {
        this.time++;
    },
});
