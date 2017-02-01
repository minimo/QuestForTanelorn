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
    hp: 100,

    //防御力
    deffence: 10,

    //攻撃力
    power: 30,

    //視力
    eyesight: 512,

    //視野角
    viewAngle: 160,

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
        //プレイヤーとの距離
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        if (this.onFloor) {
            //崖っぷちで折り返す
            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) {
                this.direction = 180;
            } else if (this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) {
                this.direction = 0;
            } else if (this.checkMapCollision2(this.x-12, this.y, 5, 5)) {
                this.direction = 0;
            } else if (this.checkMapCollision2(this.x+12, this.y, 5, 5)) {
                this.direction = 180;
            }
            //プレイヤーが近くにいたらジャンプ攻撃
            if (!this.isJump && dis < 40) {
                this.isJump = true;
                this.vy = -6;
                var pl = this.parentScene.player;
                if (this.x > pl.x) {
                    this.direction = 180;
                } else {
                    this.direction = 0;
                }
            }
        }
        if (this.onFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 1;
            } else {
                this.vx = -1;
            }
        }
        if (look) this.vx *= 4;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [69, 70, 71, 70];
        this.frame["jump"] = [69, "stop"];
        this.frame["walk"] = [69, 70, 71, 70];
        this.frame["up"] =   [69, 70, 71, 70];
        this.frame["down"] = [69, 70, 71, 70];
        this.frame["attack"] = [69, "stop"];
        this.index = 0;
    },
});
