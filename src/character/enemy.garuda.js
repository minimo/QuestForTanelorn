/*
 *  enemy.garuda.js
 *  2017/07/07
 *  @auther minimo  
 *  This Program is MIT license.
 */

//怪鳥
phina.define("qft.Enemy.Garuda", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 80,

    //防御力
    deffence: 10,

    //攻撃力
    power: 20,

    //視力
    eyesight: 256,

    //視野角
    viewAngle: 60,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 0,

    //得点
    point: 3000,

    //属性ダメージ倍率
    damageArrow: 5,

    defaultOptions: {
        speed: 2,
        direction: 0,
        returnTime: 120,
    },

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_COIN,

    //レアドロップ率（％）
    rareDropRate: 3,
    rareDropItem: ITEM_BAG,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 18});
        options = options.$safe(this.defaultOptions);
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01x2", 48, 64).addChildTo(this);
        this.sprite.setFrameTrimming(72 * 2, 0, 72 * 2, 128 * 2).setScale(2);

        this.sprite2 = phina.display.Sprite("monster01x2", 48, 64).addChildTo(this);
        this.sprite.setFrameTrimming(288 * 2, 0, 72 * 2, 128 * 2).setScale(2).setAlpha(0);
        var that = this;
        this.sprite2.update = function() {
            this.frameIndex = that.sprite.frameIndex;
        }

        this.setAnimation("walk");
        this.animationInterval = 6;
        this.setupLifeGauge();

        this.isVertical = this.options.vertical || false;
        this.direction = this.options.direction || this.isVertical? 90: 0;
        this.speed = this.options.speed || 2;
        this.returnTime = this.options.returnTime || 120;
        this.bombInterval = this.options.bombInterval || 90;

        this.on('damaged', e => {
            if (this.isVertical) return;
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["up"] =   [0, 1, 2, 1];
        this.frame["down"] = [6, 7, 8, 7];
        this.frame["walk"] = [3, 4, 5, 4];
        this.index = 0;
    },
});
