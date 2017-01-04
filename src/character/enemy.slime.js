/*
 *  enemy.slime.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//スライム
phina.define("qft.Slime", {
    superClass: "qft.Enemy",

    //攻撃力
    power: 1,

    init: function(parentScene) {
        this.superInit({width: 16, height: 16}, parentScene);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster", 25, 32).addChildTo(this).setFrameIndex(0);
        this.advanceTime = 10;

        this.setAnimation("walk");

        this.dir = 0;
    },

    update: function() {
        if (this.onFloor) {
            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) {
                this.dir = 0;
            } else if (this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) {
                this.dir = 90;
            }
            if (!this.isJump && this.getDistancePlayer() < 64) {
                this.isJump = true;
                this.vy = -8;
                var pl = this.parentScene.player;
                if (this.x > pl.x) {
                    this.dir = 0;
                } else {
                    this.dir = 90;
                }
            }
        }
        if (this.onFloor || this.isJump) {
            if (this.dir == 0) {
                this.vx = -2;
            } else {
                this.vx = 2;
            }
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [0, 1, 2, 1];
        this.frame["jump"] = [1, "stop"];
        this.frame["walk"] = [0, 1, 2, 1];
        this.frame["up"] =   [0, 1, 2, 1];
        this.frame["down"] = [0, 1, 2, 1];
        this.frame["attack"] = [0, "stop"];
        this.index = 0;
    },
});
