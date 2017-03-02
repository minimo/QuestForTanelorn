/*
 *  configscene.js
 *  2017/03/02
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.ConfigScene", {
    superClass: "phina.display.DisplayScene",

    init: function(currentScene) {
        this.superInit({width: SC_W, height: SC_H});
        this.currentScene = currentScene;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: "rgba(0,0,0,0.5)",
            stroke: "rgba(0,0,0,0.5)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        this.scroll = phina.display.Sprite("menuframe")
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
            .setScale(0.6, 0.8);
        this.scroll.alpha = 0;
        this.scroll.tweener.clear().fadeIn(500);

        this.time = 0;
    },

    update: function() {
        if (this.time > 15) {
            var ct = app.controller;
            if (ct.ok || app.mouse.getPointing()) {
                this.scroll.tweener.clear()
                    .fadeOut(500)
                    .call(function() {
                        this.exit();
                    }.bind(this));
            }
            if (ct.cancel) {
                this.scroll.tweener.clear()
                    .fadeOut(500)
                    .call(function() {
                        this.exit();
                    }.bind(this));
            }
        }
        this.time++;
    },
});

