/*
 *  endingcene.js
 *  2017/02/07
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("qft.EndingScene", {
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

        var labelParam = {
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 26,
            fontWeight: ''
        };
        phina.display.Label({text: "Thank you for playing."}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.4);

        phina.display.Label({text: "This game is a test version."}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        phina.display.Label({text: "Push button to title.", fontSize: 20}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.8);

        app.playBGM("gameover", false);

        this.time = 0;
    },

    update: function(app) {
        var ct = app.controller;
        if (this.time > 120) {
            if (ct.ok || ct.cancel) {
                app.playBGM("openingbgm");
                app.replaceScene(qft.TitleScene());
            }
        }
        this.time++;
    },
});
