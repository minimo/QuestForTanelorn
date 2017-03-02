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
        this.bg.alpha = 0;
        this.bg.tweener.clear().fadeIn(500);

        this.scroll = phina.display.Sprite("menuframe")
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
            .setScale(0.7, 1);
        this.scroll.alpha = 0;
        this.scroll.tweener.clear().fadeIn(500);

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 5,

            fontFamily: "titlefont1",
            align: "center",
            baseline: "middle",
            fontSize: 70,
        };
        this.textLabel = phina.display.Label({text: "Menu", fontSize: 30}.$safe(labelParam))
            .addChildTo(this.scroll)
            .setPosition(0, -SC_H*0.3);

        this.menu = ["Configuration","Practice","Exit"];
        this.menuText = [];
        for (var i = 0; i < this.menu.length; i++) {
            this.menuText[i] = phina.display.Label({text: this.menu[i], fontSize: 40}.$safe(labelParam))
                .addChildTo(this.scroll)
                .setPosition(0, -SC_H*0.15+SC_H*0.15*i)
                .setScale(0.7);
        }

        this.select = 0;
        this.selectMax = 3;
        this.menuText[0].setScale(1);

        this.time = 0;
    },

    update: function() {
        if (this.time > 15) {
            var ct = app.controller;
            if (ct.down && this.select < this.selectMax-1) {
                this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                this.select++;
                this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
                this.time = 10;
                app.playSE("select");
            }
            if (ct.up && this.select > 0) {
                this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                this.select--;
                this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
                this.time = 10;
                app.playSE("select");
            }
            if (ct.ok || app.mouse.getPointing()) {
                this.bg.tweener.clear().fadeOut(500);
                this.scroll.tweener.clear()
                    .fadeOut(500)
                    .call(function() {
                        this.exit();
                    }.bind(this));
                this.time = 0;
            }
            if (ct.cancel) {
                this.bg.tweener.clear().fadeOut(500);
                this.scroll.tweener.clear()
                    .fadeOut(500)
                    .call(function() {
                        this.exit();
                    }.bind(this));
                this.time = 0;
            }
        }
        this.time++;
    },
});

