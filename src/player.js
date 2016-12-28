/*
 *  player.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Player", {
    superClass: "qft.Character",

    //加速度
    vx: 0,
    vy: 0,

    //ジャンプ中フラグ
    jump: false,

    //無敵フラグ
    muteki: false,

    //経過フレーム
    time: 0,

    init: function(parentScene) {
        this.superInit({width: 32, height: 32}, parentScene);
        this.boundingType = "rect";

        //表示用スプライト
        this.sprite = phina.display.Sprite("player", 32, 32).addChildTo(this).setFrameIndex(0);

        this.setupAnimation();
        this.tweener.setUpdateType('fps');
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

        this.getCollision();

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
                this.vy = -10;
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
