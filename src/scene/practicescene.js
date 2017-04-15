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

        this.menu = ["1", "2", "3", "4", "5", "6", "7"];
        this.menuText = [];
        for (var i = 0; i < this.menu.length; i++) {
            this.menuText[i] = phina.display.Label({text: this.menu[i], fontSize: 40}.$safe(labelParam))
                .addChildTo(this.menuBase)
                .setPosition(SC_W*0.5+(SC_W*0.1*i)-(SC_W*0.1*(this.menu.length-1)/2), SC_H*0.5)
                .setScale(0.7);
        }

        this.exitText = phina.display.Label({text: "Exit", fontSize: 40}.$safe(labelParam))
            .addChildTo(this.menuBase)
            .setPosition(SC_W*0.5, SC_H*0.7)
            .setScale(0.7);

        this.select = 0;
        this.selectMax = this.menu.length;
        this.menuText[0].setScale(1);

        this.vselect = 0;

        this.time = 0;
    },

    update: function() {
        if (this.time > 15) {
            var ct = app.controller;
            if (ct.right && this.select < this.selectMax-1 && this.vselect == 0) {
                this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                this.select++;
                this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
                app.playSE("select");
                this.time = 10;
            }
            if (ct.left && this.select > 0  && this.vselect == 0) {
                this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                this.select--;
                this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
                app.playSE("select");
                this.time = 10;
            }
            if (ct.down && this.vselect == 0) {
                this.vselect++;
                this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                this.exitText.tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
                app.playSE("select");
                this.time = 10;
            }
            if (ct.up && this.vselect == 1) {
                this.vselect--;
                this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
                this.exitText.tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                app.playSE("select");
                this.time = 10;
            }

            if (ct.ok || app.mouse.getPointing()) {
                if (this.vselect == 0) {
                    var stage = this.select+1;
                    if (stage == 1) {
                        app.pushScene(qft.MainScene({startStage: stage, practice: true}));
                    } else {
                        app.pushScene(qft.PracticePlatform({assetType: "stage"+stage ,startStage: stage}));
                    }
                    app.stopBGM();
                }
                if (this.vselect == 1) {
                    app.playSE("cancel");
                    this.exitMenu();
                }
                this.time = 0;
            }
            if (ct.cancel) {
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

