/*
 *  enemy.slime.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//スライム
phina.define("qft.Enemy.Slime", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 2,

    //防御力
    deffence: 1,

    //攻撃力
    power: 1,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 90,

    init: function(options, parentScene) {
        this.superInit({width: 16, height: 18}, parentScene);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster08_a3", 24, 32).addChildTo(this).setFrameIndex(0);
        this.advanceTime = 10;

        this.setAnimation("walk");

        this.direction = 0;
    },

    update: function() {
        if (this.onFloor) {
            //崖っぷちで折り返す
            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) {
                this.direction = 0;
            } else if (this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) {
                this.direction = 180;
            } else if (this.checkMapCollision2(this.x-10, this.y, 5, 5)) {
                this.direction = 180;
            } else if (this.checkMapCollision2(this.x+10, this.y, 5, 5)) {
                this.direction = 0;
            }

            //プレイヤーが近くにいたらジャンプ攻撃
            if (!this.isJump && this.getDistancePlayer() < 40) {
                this.isJump = true;
                this.vy = -6;
                var pl = this.parentScene.player;
                if (this.x > pl.x) {
                    this.direction = 0;
                } else {
                    this.direction = 180;
                }
            }
        }
        if (this.onFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = -2;
            } else {
                this.vx = 2;
            }
            if (this.attack) this.attack *= 3;

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
