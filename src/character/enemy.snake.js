/*
 *  enemy.snake.js
 *  2017/01/27
 *  @auther minimo  
 *  This Program is MIT license.
 */

//スライム
phina.define("qft.Enemy.Snake", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 20,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 90,

    init: function(options, parentScene) {
        this.superInit({width: 16, height: 18}, parentScene);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 384, 72, 128)

        this.setAnimation("walk");
        this.advanceTime = 10;
        this.setupLifeGauge();

        this.direction = 0;
    },

    update: function() {
        if (this.isDead) return;

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
            if (look && !this.isJump && dis < 40) {
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
        this.frame["stand"] = [3, 4, 5, 4];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },
});
