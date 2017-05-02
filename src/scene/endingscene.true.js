/*
 *  endingcene.true.js
 *  2017/05/01
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

//トゥルーエンディング
phina.define("qft.EndingScene.true", {
    superClass: "phina.display.DisplayScene",
    
    init: function(parentScene) {
        this.superInit({width: SC_W, height: SC_H});
        this.parentScene = parentScene;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: "rgba(0,0,0,1)",
            stroke: "rgba(0,0,0,1)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.bg.tweener.clear()
            .set({alpha: 0})
            .to({alpha: 0.5}, 1000);

        app.playBGM("gameover", false);

        this.time = 0;
    },

    update: function(app) {
        var ct = app.controller;
        if (this.time > 120) {
            if (ct.ok || ct.cancel) {
                this.parentScene.flare('exitgame');
                this.exit();
            }
        }
        this.time++;
    },
});
