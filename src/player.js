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

        this.nowAction = "walk";
        this.beforeAction = "";
        this.setupAnimation();

        this.tweener.setUpdateType('fps');
    },

    update: function(app) {
        //プレイヤー操作
        var ct = app.controller;
        if (ct.left) {
            if (!this.isJump) this.nowAction = "walk";
            this.sprite.scaleX = 1;
            this.vx = -5;
        }
        if (ct.right) {
            if (!this.isJump) this.nowAction = "walk";
            this.sprite.scaleX = -1;
            this.vx = 5;
        }
        if (ct.up || ct.isJump) {
            if (!this.isJump && this.onFloor) {
                this.nowAction = "jump";
                this.isJump = true;
                this.vy = -10;
            }
        }
        if (ct.down) {
            this.throughFloor = true;
        }

        if (this.onFloor) {
            this.nowAction = "walk";
        } else {
            this.nowAction = "jump";
        }
        if (ct.attack) {
            this.attack = true;
            this.nowAction = "attack";
            this.index = 0;
        } else {
        }
    },

    damage: function() {
    },

    setupAnimation: function() {
        this.spcialAction = false;
        this.frame = [];
        this.frame["stand"] = [13, 14];
        this.frame["jump"] = [36, "stop"];
        this.frame["walk"] = [ 3,  4,  5,  4];
        this.frame["up"] =   [ 9, 10, 11, 10];
        this.frame["down"] = [ 0,  1,  2,  1];
        this.frame["attack"] = [ 43, 44, 45, "stop"];
        this.index = 0;
    },
});
