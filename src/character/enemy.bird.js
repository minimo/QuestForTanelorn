/*
 *  enemy.slime.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//鳥
phina.define("qft.Enemy.Bird", {
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

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 0,

    init: function(options, parentScene) {
        this.superInit({width: 16, height: 18}, parentScene);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster07_a1", 24, 32).addChildTo(this).setFrameIndex(0);
        this.advanceTime = 10;

        this.setAnimation("walk");
        this.setupLifeGauge();

        this.direction = 0;
        this.vx = 2;

        this.returnTime = 30;
    },

    update: function() {
        if (this.isDead) return;

        //壁に当たったら折り返し
        if (this.checkMapCollision2(this.x-12, this.y, 5, 5)) {
            this.vx = 2;
            this.returnTime = 30;
        } else if (this.checkMapCollision2(this.x+12, this.y, 5, 5)) {
            this.vx = -2;
            this.returnTime = 30;
        }

        if (this.returnTime < 0) {
            this.vx *= -1;
            this.returnTime = Math.randInt(30, 60);
        }
        this.returnTime--;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["walk"] = [51, 52, 53, 52];
        this.index = 0;
    },
});
