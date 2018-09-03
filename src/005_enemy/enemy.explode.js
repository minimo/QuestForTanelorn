/*
 *  enemy.explode.js
 *  2017/07/01
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Enemy.Explode", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 1,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 0.98,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //地形無視
    ignoreCollision: true,

    //得点
    point: 0,

    //無敵フラグ
    isMuteki: true,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 20, height: 20});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("effect", 48, 48)
            .addChildTo(this)
            .setFrameTrimming(0, 192, 192, 96);
        this.animationInterval = 3;

        this.power = options.power || this.power;

        this.pattern = options.pattern || "pattern1";
        this.setAnimation(this.pattern);
        this.animationInterval = 3;
    },

    algorithm: function() {
        if (this.index == 8) this.remove();
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["pattern1"] = [0, 1, 2, 3, 4, 5, 6, 7, 8, "stop"];
        this.index = 0;
    },
});
