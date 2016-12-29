/*
 *  player.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Player", {
    superClass: "qft.Character",

    init: function(parentScene) {
        this.superInit({width: 32, height: 32}, parentScene);
        this.boundingType = "rect";

        //表示用スプライト
        this.sprite = phina.display.Sprite("player1", 32, 32).addChildTo(this).setFrameIndex(0);

        this.setupAnimation();
        this.tweener.setUpdateType('fps');
    },

    update: function(app) {
        if (this.time % 6 == 0) {
            this.index = (this.index+1) % this.frame.length;
            if (this.frame[this.index] == "stop") this.index--;
            this.sprite.frameIndex = this.frame[this.index];

            if (this.attack && this.index == 1) {
                this.attack = false;
                if (this.jump) {
                    this.frame = this.frameJump;
                } else {
                    this.frame = this.frameMove;
                }
            }
        }
        //プレイヤー操作
        var ct = app.controller;
        if (ct.left) {
            if (!this.jump) this.frame = this.frameMove;
            this.sprite.scaleX = 1;
            this.vx = -5;
            this.time = 0;
        }
        if (ct.right) {
            if (!this.jump) this.frame = this.frameMove;
            this.sprite.scaleX = -1;
            this.vx = 5;
            this.time = 0;
        }
        if (ct.up || ct.jump) {
            if (!this.jump) {
                this.frame = this.frameJump;
                this.vy = -15;
                this.jump = true;
                this.time = 0;
            }
        }
        if (ct.attack) {
            this.attack = true;
            this.frame = this.frameAttack;
            this.index = 0;
            this.time = 0;
        }
        this.bx = this.x;
        this.by = this.y;
    },

    damage: function() {
    },

    setupAnimation: function() {
        this.spcialAction = false;
        this.frameStand = [13];
        this.frameJump = [36, "stop"];
        this.frameMove = [ 3,  4,  5,  4];
        this.frameUp =   [ 9, 10, 11, 10];
        this.frameDown = [ 0,  1,  2,  1];
        this.frameAttack = [ 43, 44, 45, "stop"];
        this.frame = this.frameMove;
        this.index = 0;
    },
});
