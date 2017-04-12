/*
 *  titlescene.js
 *  2017/02/09
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("qft.TitleScene", {
    superClass: "phina.display.DisplayScene",

    init: function() {
        this.superInit({width: SC_W, height: SC_H});

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.bg.tweener.setUpdateType('fps');

        var sprite1 = phina.display.Sprite("titleback").addChildTo(this).setPosition(SC_W * 0.5, SC_H * 0.5);
        sprite1.alpha = 0;
        sprite1.tweener.clear().fadeIn(500);

        //タイトルロゴの表示
        this.dispTitleLogo();

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 5,

            fontFamily: "titlefont2",
            align: "center",
            baseline: "middle",
            fontSize: 70,
        };
        this.textLabel1 = phina.display.Label({text: "Push button to START", fontSize: 15}.$safe(labelParam))
//            .addChildTo(this).setPosition(SC_W*0.5, SC_H*0.8);
        this.textLabel2 = phina.display.Label({text: "Push [X] to Configuration", fontSize: 15}.$safe(labelParam))
//            .addChildTo(this).setPosition(SC_W*0.5, SC_H*0.8+20);

        this.menu = ["Start", "Continue", "Config"];
        this.menuText = [];
        for (var i = 0; i < this.menu.length; i++) {
            this.menuText[i] = phina.display.Label({text: this.menu[i], fontSize: 30}.$safe(labelParam))
                .addChildTo(this)
                .setPosition(SC_W*0.5, SC_H*0.65+i*40)
                .setScale(0.7);
        }
        this.select = 0;
        this.selectMax = 3;
        this.menuText[0].setScale(1);

        this.fg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.fg.tweener.setUpdateType('fps');
        this.fg.tweener.clear().fadeOut(15);

        this.on('resume', function() {
            this.time = 0;
        });

        this.time = 0;
    },

    update: function(app) {
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
                this.time = 0;
                switch (this.select) {
                    case 0:
                        this.exit("main");
                        break;
                    case 1:
                        this.exit("main");
                        break;
                    case 2:
                        app.pushScene(qft.ConfigScene(this));
                        break;
                }
            }
            if (ct.cancel) {
                app.pushScene(qft.ConfigScene(this));
                this.time = 0;
            }
        }
        if (this.time > 30 * 120) {
            this.exit("opening");
        }
        this.time++;
    },

    //タイトルロゴ表示
    dispTitleLogo: function(x, y) {
        x = x || SC_W * 0.5;
        y = y || SC_H * 0.5;

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 10,

            fontFamily: "titlefont1",
            align: "center",
            baseline: "middle",
            fontSize: 60,
        };
        var num = 0;
        this.textLabel = phina.display.Label({text: "The", fontSize: 30}.$safe(labelParam))
            .addChildTo(this).setPosition(x-182, y-85);
        this.textLabel = phina.display.Label({text: "Quest"}.$safe(labelParam))
            .addChildTo(this).setPosition(x-47, y-85);
        this.textLabel = phina.display.Label({text: "for", fontSize: 40}.$safe(labelParam))
            .addChildTo(this).setPosition(x-17, y-40);
        this.textLabel = phina.display.Label({text: "Tanelorn"}.$safe(labelParam))
            .addChildTo(this).setPosition(x+48, y);
    },
});
