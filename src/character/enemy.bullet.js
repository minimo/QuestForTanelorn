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

    //重力加速度
    gravity: 0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 20,

    //地形無視
    ignoreCollision: true,

    init: function(options, parentScene) {
        this.superInit({width: 20, height: 20}, parentScene);

        //表示用スプライト
        this.sprite = phina.display.Sprite("bullet", 24, 32).addChildTo(this).setFrameIndex(0);
        this.advanceTime = 10;

        this.setAnimation("pattern1");
    },

    update: function() {
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["pattern1"] = [9, 10, 11, 10];
        this.index = 0;
    },
});
