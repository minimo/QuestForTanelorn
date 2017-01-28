/*
 *  GameOverScene.js
 *  2014/06/04
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("qft.GameOverScene", {
    superClass: "phina.display.DisplayScene",
    
    init: function(parentScene) {
        this.superInit();
        this.parentScene = parentScene;

        var labelParam = {
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 32,
            fontWeight: ''
        };
        var x = SC_W * 0.5-32*4;
        var n = 0;
        ["G", "A", "M", "E", "O", "V", "E", "R"].forEach(function(e) {
            var lb = phina.display.Label({text: e}.$safe(labelParam))
                .setPosition(x, SC_H*0.5+32)
                .setScale(0, 1)
                .addChildTo(this);
            lb.tweener.clear()
                .set({alpha: 0})
                .wait(n*50)
                .to({scaleX: 1.0, alpha: 1, y: SC_H*0.5}, 1000, "easeOutSine")
                .wait(1000-n*50)
                .set({alpha: 0})
                .to({scaleX: 0.0, alpha: 0, y: SC_H*0.5-32}, 1000, "easeOutSine")
            var pt = phina.display.Sprite("particle", 16, 16)
                .setFrameIndex(48)
                .setPosition(x, SC_H*0.5)
                .setScale(3, 3)
                .addChildTo(this);
            pt.alpha = 0;
            pt.tweener.clear()
                .wait(n*50+1000)
                .to({alpha: 1}, 1000-n*50, "easeOutSine")
                .to({scaleX: 0.0, alpha: 0, y: SC_H*0.5-32}, 1000, "easeOutSine")
            x += 32;
            n++;
        }.bind(this));

        app.playBGM("gameover", false);

        this.time = 0;
    },

    update: function(app) {
        var ct = app.controller;
        if (this.time > 120) {
            if (ct.ok || ct.cancel) {
                this.parentScene.flare('continue');
                this.exit();
            }
        }
        this.time++;
    },
});
