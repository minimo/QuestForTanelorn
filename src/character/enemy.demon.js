/*
 *  enemy.demon.js
 *  2017/01/13
 *  @auther minimo  
 *  This Program is MIT license.
 */

//デーモン
phina.define("qft.Enemy.Demon", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 5,

    //防御力
    deffence: 1,

    //攻撃力
    power: 2,

    //視力
    eyesight: 256,

    //視野角
    viewAngle: 90,

    init: function(options, parentScene) {
        this.superInit({width: 20, height: 20}, parentScene);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster08_a3", 24, 32).addChildTo(this).setFrameIndex(0);
        this.advanceTime = 10;

        this.setAnimation("walk");
        this.setupLifeGauge();

        this.direction = 0;
    },

    update: function() {
        if (this.onFloor) {
            //崖っぷちで折り返す
            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) {
                this.direction = 0;
            } else if (this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) {
                this.direction = 180;
            } else if (this.checkMapCollision2(this.x-12, this.y, 5, 5)) {
                this.direction = 180;
            } else if (this.checkMapCollision2(this.x+12, this.y, 5, 5)) {
                this.direction = 0;
            }
        }
        if (this.onFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = -2;
            } else {
                this.vx = 2;
            }
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [45, 46, 47, 46];
        this.frame["jump"] = [1, "stop"];
        this.frame["walk"] = [45, 46, 47, 46];
        this.frame["up"] =   [45, 46, 47, 46];
        this.frame["down"] = [45, 46, 47, 46];
        this.frame["attack"] = [46, "stop"];
        this.index = 0;
    },
});
