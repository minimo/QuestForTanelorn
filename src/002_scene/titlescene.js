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

        //メニューアイテム表示
        var that = this;
        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 5,

            fontFamily: "titlefont2",
            align: "center",
            baseline: "middle",
            fontSize: 30,
        };
        this.menu = ["Start", "Continue", "Config"];
        this.menuComment = ["ゲームを開始します", "前回ゲームオーバーになったステージの最初から開始します", "設定メニューを開きます"];
        this.menuText = [];
        for (var i = 0; i < this.menu.length; i++) {
            this.menuText[i] = phina.display.Label({text: this.menu[i]}.$safe(labelParam))
                .addChildTo(this)
                .setPosition(SC_W*0.5, SC_H*0.6+i*30)
                .setScale(0.7);

            //タッチ判定用
            var param2 = {
                width: SC_W*0.3,
                height: SC_H*0.08,
                fill: "rgba(0,100,200,0.5)",
                stroke: "rgba(0,100,200,0.5)",
                backgroundColor: 'transparent',
            };
            var c = phina.display.RectangleShape(param2)
                .addChildTo(this)
                .setPosition(SC_W*0.5, SC_H*0.6+i*30)
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
                    app.playSE("select");
                }
            }
        }
        this.isSelected = false;
        this.select = 0;
        this.selectMax = 3;
        this.menuText[0].setScale(1);
        this.ok = false;
        this.cansel = false;

        //メニューコメント
        var that = this;
        this.comment = phina.display.Label({text: "", fontSize: 10}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.9);
        this.comment.update = function() {
            this.text = that.menuComment[that.select];
        }

        this.fg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.fg.tweener.setUpdateType('fps');
        this.fg.tweener.clear().fadeOut(15);

        this.on('resume', e => {
            this.fg.tweener.clear().fadeOut(15);
            this.time = 0;
            this.isSelected = false;
            this.ok = false;
            this.cansel = false;
        });

        this.time = 0;
    },

    update: function(app) {
        if (this.isSelected) return;

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
            if (ct.ok || this.ok){
                this.isSelected = true;
                this.time = 0;
                switch (this.select) {
                    case 0:
                        //通常開始
                        app.playSE("ok");
                        this.fg.tweener.clear()
                            .fadeIn(3)
                            .call(function() {
                                this.exit("main");
                            }.bind(this));
                        break;
                    case 1:
                        //コンティニュー
                        app.playSE("ok");
                        this.fg.tweener.clear()
                            .fadeIn(3)
                            .call(function() {
                                var data = localStorage.getItem("stage");
                                if (data) {
                                    var d = JSON.parse(data).$safe({stageNumber: 1});
                                    if (d.stageNumber == 1) {
                                        this.exit("main");
                                    } else {
                                        app.pushScene(qft.SceneFlow.Resume({isPractice: false, isContinue: true}));
                                    }
                                } else {
                                    this.exit("main");
                                }
                            }.bind(this));
                        break;
                    case 2:
                        //設定メニュー
                        app.pushScene(qft.ConfigScene(this));
                        break;
                }
            }
            if (ct.cancel || this.cancel) {
                app.pushScene(qft.ConfigScene(this));
                this.isSelected = true;
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
        y = y || SC_H * 0.45;

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
