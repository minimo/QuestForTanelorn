/*
 *  enemy.bullet.js
 *  2017/01/13
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Enemy.Bullet", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 1,

    //寿命
    lifespan: 75,

    //速度
    velocity: 2,

    //加速度
    accel: 1.02,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 1.0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //地形無視
    ignoreCollision: true,

    init: function(options, parentScene) {
        this.superInit({width: 20, height: 20}, parentScene);
        options = options || {};
        this.$extend(options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("bullet", 24, 32).addChildTo(this).setFrameIndex(9);
        this.advanceTime = 3;

        this.setAnimation("pattern1");
    },

    update: function() {
        var rad = this.rotation.toRadian();
        this.vx = Math.cos(rad) * this.velocity;
        this.vy = Math.sin(rad) * this.velocity;
        this.velocity *= this.accel;
        if (this.time > this.lifespan) this.remove();
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["pattern1"] = [9, 10, 11, 10];
        this.index = 0;
    },
});
