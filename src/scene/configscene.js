/*
 *  configscene.js
 *  2017/03/02
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.ConfigScene", {
    superClass: "phina.display.DisplayScene",

    init: function() {
        this.superInit({width: SC_W, height: SC_H});

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
            .setScale(0.85, 1.1);
        this.scroll.alpha = 0;
        this.scroll.tweener.clear().fadeIn(500);

        this.menuBase = phina.display.DisplayElement().addChildTo(this.scroll);

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 5,

            fontFamily: "titlefont1",
            align: "center",
            baseline: "middle",
            fontSize: 70,
        };
        this.textLabel = phina.display.Label({text: "Menu", fontSize: 20}.$safe(labelParam))
            .addChildTo(this.menuBase)
            .setPosition(0, -SC_H*0.3);

        //メニューテキスト表示
        var that = this;
        this.menu = ["System", "Practice", "Exit"];
        this.menuText = [];
        for (var i = 0; i < this.menu.length; i++) {
            this.menuText[i] = phina.display.Label({text: this.menu[i], fontSize: 40}.$safe(labelParam))
                .addChildTo(this.menuBase)
                .setPosition(0, -SC_H*0.15+SC_H*0.15*i)
                .setScale(0.7);

            //タッチ判定用
            var param2 = {
                width: SC_W*0.3,
                height: SC_H*0.10,
                fill: "rgba(0,100,200,0.5)",
                stroke: "rgba(0,100,200,0.5)",
                backgroundColor: 'transparent',
            };
            var c = phina.display.RectangleShape(param2)
                .addChildTo(this.menuBase)
                .setPosition(0, -SC_H*0.15+SC_H*0.15*i)
                .setInteractive(true);
            c.alpha = 0;
            c.select = i;
            c.onpointstart = function() {
                if (that.isSelected || that.time < 10) return;
                if (this.select == that.select) {
                    that.ok = true;
                } else {
                    that.menuText[that.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                    that.select = this.select;
                    that.menuText[that.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
                }
            }
        }
        this.isSelected = false;
        this.select = 0;
        this.selectMax = 3;
        this.menuText[0].setScale(1);
        this.ok = false;
        this.cansel = false;

        this.time = 0;

        this.on('resume', function() {
            this.menuBase.tweener.clear().fadeIn(500);
            this.time = 0;
            this.isSelected = false;
            this.ok = false;
            this.cansel = false;
        });
    },

    update: function() {
        var ct = app.controller;
        if (ct.down && !ct.before.down && this.select < this.selectMax-1) {
            this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
            this.select++;
            this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
            this.time = 10;
            app.playSE("select");
        }
        if (ct.up && !ct.before.up && this.select > 0) {
            this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
            this.select--;
            this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
            this.time = 10;
            app.playSE("select");
        }

        if (this.time > 15) {
            //決定
            if (ct.ok || this.ok) {
                if (this.select == 0) {
                }
                if (this.select == 1) {
                    app.playSE("ok");
                    this.menuBase.tweener.clear()
                        .fadeOut(500)
                        .call(function() {
                            app.pushScene(qft.ConfigScene_Practice());
                        });
                }
                if (this.select == 2) {
                    app.playSE("cancel");
                    this.exitMenu();
                }
                this.time = 0;
            }

            //キャンセル        
            if (ct.cancel) {
                app.playSE("cancel");
                this.exitMenu();
                this.time = 0;
            }
        }
        this.time++;
    },

    exitMenu: function() {
        this.bg.tweener.clear().fadeOut(500);
        this.scroll.tweener.clear()
            .fadeOut(500)
            .call(function() {
                this.exit();
            }.bind(this));
    }
});
