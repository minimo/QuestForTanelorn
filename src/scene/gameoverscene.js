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
        this.superInit({width: SC_W, height: SC_H});
        this.parentScene = parentScene;

        //バックグラウンド
        var param = {
            width: SC_W,
            height: SC_H,
            fill: "rgba(0,0,0,1)",
            stroke: "rgba(0,0,0,1)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.alpha = 0;

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

        this.select = 0; //0:YES 1:NO

        this.time = 0;
    },

    update: function(app) {
        var ct = app.controller;
        if (this.time == 90) {
            this.dispContinue();
        }
        if (this.time > 105) {
            if (ct.left && this.select == 1) {
                this.select = 0;
                this.yes.tweener.clear().to({scaleX: 1, scaleY: 1}, 500, "easeOutBounce");
                this.no.tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                app.playSE("select");
                this.text3.text = "ステージ開始時の状態に戻ってやり直します";
            } else if (ct.right && this.select == 0) {
                this.select = 1;
                this.yes.tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                this.no.tweener.clear().to({scaleX: 1, scaleY: 1}, 500, "easeOutBounce");
                app.playSE("select");
                this.text3.text = "タイトルに戻ります";
            }
            if (ct.ok || ct.cancel) {
                if (this.select == 0) {
                    this.parentScene.flare('continue');
                    this.exit();
                } else {
                    //コンティニュー時はセーブしない
                    if (this.parentScene.isContinue) {
                        this.parentScene.flare('exitgame_nosave');
                    } else {
                        this.parentScene.flare('exitgame');
                    }
                    this.exit();
                }
            }
        }
        this.time++;
    },

    dispContinue: function() {
        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 36,
            fontWeight: ''
        };
        this.text1 = phina.display.Label({text: "CONTINUE?"}.$safe(labelParam))
            .setPosition(SC_W*0.5, SC_H*0.4+10)
            .addChildTo(this);
        this.text1.alpha = 0;
        this.text1.tweener.clear().to({y: SC_H*0.4, alpha: 1}, 500, "easeInSine");

        this.yes = phina.display.Label({text: "YES", fontSize: 30}.$safe(labelParam))
            .setScale(1)
            .setPosition(SC_W*0.4, SC_H*0.6+10)
            .addChildTo(this);
        this.yes.alpha = 0;
        this.yes.tweener.clear().to({y: SC_H*0.6, alpha: 1}, 500, "easeInSine");

        this.no = phina.display.Label({text: "NO", fontSize: 30}.$safe(labelParam))
            .setScale(0.7)
            .setPosition(SC_W*0.6, SC_H*0.6+10)
            .addChildTo(this);
        this.no.alpha = 0;
        this.no.tweener.clear().to({y: SC_H*0.6, alpha: 1}, 500, "easeInSine");

        this.text3 = phina.display.Label({text: "ステージ開始時の状態に戻ってやり直します", fontSize: 10}.$safe(labelParam))
            .setPosition(SC_W*0.5, SC_H*0.75+10)
            .addChildTo(this);
        this.text3.alpha = 0;
        this.text3.tweener.clear().to({y: SC_H*0.75, alpha: 1}, 500, "easeInSine");

        this.bg.tweener.clear().to({alpha:0.3}, 500, "easeInSine");
    },
});
