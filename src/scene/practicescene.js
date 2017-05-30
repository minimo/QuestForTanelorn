/*
 *  practicescene.js
 *  2017/04/15
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.ConfigScene_Practice", {
    superClass: "phina.display.DisplayScene",

    init: function() {
        this.superInit({width: SC_W, height: SC_H});

        this.menuBase = phina.display.DisplayElement().addChildTo(this);
        this.menuBase.alpha = 0;
        this.menuBase.tweener.clear().fadeIn(500);

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 5,

            fontFamily: "titlefont1",
            align: "center",
            baseline: "middle",
            fontSize: 70,
        };
        this.textLabel1 = phina.display.Label({text: "Practice", fontSize: 20}.$safe(labelParam))
            .addChildTo(this.menuBase)
            .setPosition(SC_W*0.5, SC_H*0.2);
        this.textLabel2 = phina.display.Label({text: "Stage select", fontSize: 20}.$safe(labelParam))
            .addChildTo(this.menuBase)
            .setPosition(SC_W*0.5, SC_H*0.3);

        //メニューテキスト表示
        var that = this;
        this.menu = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "P"];
        this.menuText = [];
        for (var i = 0; i < this.menu.length; i++) {
            this.menuText[i] = phina.display.Label({text: this.menu[i], fontSize: 40}.$safe(labelParam))
                .addChildTo(this.menuBase)
                .setPosition(SC_W*0.5+(SC_W*0.07*i)-(SC_W*0.07*(this.menu.length-1)/2), SC_H*0.5)
                .setScale(0.7);

            //タッチ判定用
            var param2 = {
                width: 30,
                height: SC_H*0.10,
                fill: "rgba(0,100,200,0.5)",
                stroke: "rgba(0,100,200,0.5)",
                backgroundColor: 'transparent',
            };
            var c = phina.display.RectangleShape(param2)
                .addChildTo(this.menuBase)
                .setPosition(SC_W*0.5+(SC_W*0.07*i)-(SC_W*0.07*(this.menu.length-1)/2), SC_H*0.5)
                .setInteractive(true);
            c.alpha = 0;
            c.select = i;
            c.onpointstart = function() {
                if (that.isSelected || that.time < 10) return;
                if (this.select == that.select) {
                    that.ok = true;
                } else {
                    if (that.vselect == 0) {
                        that.menuText[that.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                    } else {
                        that.exitText.tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                    }
                    that.select = this.select;
                    that.menuText[that.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
                    that.vselect = 0;
                }
            }
        }

        this.exitText = phina.display.Label({text: "Exit", fontSize: 40}.$safe(labelParam))
            .addChildTo(this.menuBase)
            .setPosition(SC_W*0.5, SC_H*0.7)
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
            .setPosition(SC_W*0.5, SC_H*0.7)
            .setInteractive(true);
        c.alpha = 0;
        c.onpointstart = function() {
            if (that.isSelected || that.time < 10) return;
            if (that.vselect == 1) {
                that.ok = true;
            } else {
                that.menuText[that.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                that.exitText.tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
                that.vselect = 1;
            }
        }

        this.vselect = 0;
        this.select = 0;
        this.isSelected = false;
        this.selectMax = this.menu.length;
        this.menuText[0].setScale(1);
        this.ok = false;
        this.cancel = false;

        this.time = 0;

        this.on('resume', function() {
            this.time = 0;
            this.isSelected = false;
            this.ok = false;
            this.cansel = false;
        });
    },

    update: function() {
        var ct = app.controller;
        if (ct.right && !ct.before.right && this.select < this.selectMax-1 && this.vselect == 0) {
            this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
            this.select++;
            this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
            app.playSE("select");
            this.time = 10;
        }
        if (ct.left && !ct.before.left && this.select > 0  && this.vselect == 0) {
            this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
            this.select--;
            this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
            app.playSE("select");
            this.time = 10;
        }
        if (ct.down && !ct.before.down && this.vselect == 0) {
            this.vselect++;
            this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
            this.exitText.tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
            app.playSE("select");
            this.time = 10;
        }
        if (ct.up && !ct.before.up && this.vselect == 1) {
            this.vselect--;
            this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
            this.exitText.tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
            app.playSE("select");
            this.time = 10;
        }

        if (this.time > 15) {
            if (ct.ok || this.ok) {
                if (this.vselect == 0) {
                    if (this.select == 0) {
                        app.pushScene(qft.MainScene({startStage: 1, isPractice: true}));
                    } else {
                        if (this.select == 9) {
                            app.pushScene(qft.MainScene({startStage: 999, isPractice: true}));
                        } else {
                            app.pushScene(qft.SceneFlow.Resume({stageNumber: this.select+1, isPractice: true}));
                        }
                    }
                    app.stopBGM();
                }
                if (this.vselect == 1) {
                    app.playSE("cancel");
                    this.exitMenu();
                }
                this.time = 0;
            }
            if (ct.cancel || this.cancel) {
                app.playSE("cancel");
                this.exitMenu();
                this.time = 0;
            }
        }
        this.time++;
    },

    exitMenu: function() {
        this.menuBase.tweener.clear()
            .fadeOut(500)
            .call(function() {
                this.exit();
            }.bind(this));
    },
});

phina.define("qft.PracticePlatform", {
    superClass: "phina.display.DisplayScene",

    init: function(options) {
        this.superInit();
        this.options = (options || {}).$safe({
            assetType: "stage2",
            startStage: 2,
        })
        this.count = 0;
    },

    onenter: function() {
        app.pushScene(qft.LoadingScene({
            assets: qft.Assets.get(this.options),
        }));
    },

    onresume: function() {
        this.count++;
        if (this.count == 1) {
            app.pushScene(qft.MainScene({startStage: this.options.startStage, isPractice: true}));
        }
        if (this.count == 2){
            this.exit();
        }
    }
});
