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

        //バックグラウンド
        this.background = phina.display.Sprite("background", 640, 480).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.5);

        //地形判定用レイヤー
        this.collisionLayer = phina.display.DisplayElement().addChildTo(this);
        phina.display.RectangleShape({width: 200, height: 50}).addChildTo(this.collisionLayer).setPosition(SC_W*0.5, 200);
        phina.display.RectangleShape({width: 150, height: 30}).addChildTo(this.collisionLayer).setPosition(SC_W*0.2, 300);
        phina.display.RectangleShape({width: 150, height: 30}).addChildTo(this.collisionLayer).setPosition(SC_W*0.8, 300);

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
