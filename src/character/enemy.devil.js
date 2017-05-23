/*
 *  enemy.devil.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//悪魔
phina.define("qft.Enemy.Devil", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 30,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 160,

    //得点
    point: 500,

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
        options = (options || {}).$extend({width: 16, height: 18}).$safe(this.defaultOptions);
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster02", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(72, 0, 72, 128);

        this.setAnimation("stand");
        this.animationInterval = 6;
        this.setupLifeGauge();

        this.isVertical = this.options.vertical || false;
        this.direction = this.options.direction || this.isVertical? 90: 0;
        this.speed = this.options.speed || 2;
        this.returnTime = this.options.returnTime || 120;
        this.attackInterval = this.options.attackInterval || 90;

        //行動フェーズ
        this.phase = 0;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        //プレイヤーとの距離
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        if (look) {
            if (!this.isStill) this.flare('balloon', {pattern: "!"});
            this.isStill = false;
        } else {
            this.flare('balloonerace');
            this.isStill = true;
        }

        if (this.phase == 0) {
            this.setAnimation("stand");
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [6, 7, 8, 7];
        this.frame["up"] = [0, 1, 2, 1];
        this.frame["walk"] = [3, 4, 5, 4];
        this.index = 0;
    },
});
