/*
 *  player.js
 *  2014/09/05
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Player", {
    superClass: "phina.display.DisplayElement",

    init: function() {
        this.superInit();

        this.sprite = phina.display.Sprite("player", 32, 32)
            .addChildTo(this)
            .setFrameIndex(0);

        //当り判定設定
        this.boundingType = "rect";
        this.width = 32;
        this.height = 32;

        this.vx = 0;
        this.vy = 0;
        this.jump = false;
        this.muteki = false;

        this.setupAnimation();

        this.tweener.setUpdateType('fps');
        this.time = 0;
    },

    update: function(app) {
        if (this.time % 3 == 0) {
            //移動してたらアニメーションする
            if (this.bx != this.x || this.by != this.y) {
                this.index++;
                var idx = this.frame[this.index];
                if (idx == "stop") {
                    this.index--;
                } else {
                    this.index = this.index % this.frame.length;
                }
                this.frameIndex = this.frame[this.index];
            }
        }

        //プレイヤー操作
        var ct = app.controller;
        if (ct.left) {
            this.sprite.scaleX = 1;
            if (!this.jump) {
                this.vx = -5;
            } else {
                this.vx = -3;
            }
        }
        if (ct.right) {
            this.sprite.scaleX = -1;
            if (!this.jump) {
                this.vx = 5;
            } else {
                this.vx = 3;
            }
        }
        if (ct.up || ct.jump) {
            if (!this.jump) {
                this.vy = -20;
                this.jump = true;
            }
        }
        if (ct.attack) {
        }

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.9;
        this.vy += 0.9;

        this.time++;
    },

    damage: function() {
    },

    setupAnimation: function() {
        this.spcialAction = false;
        this.frameRight = [ 6,  7,  8,  7];
        this.frameLeft =  [ 3,  4,  5,  4];
        this.frameUp =    [ 9, 10, 11, 10];
        this.frameDown =  [ 0,  1,  2,  1];
        this.frame = this.frameDown;
        this.index = 0;
    },
});
