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
    eyesight: 256,

    //視野角
    viewAngle: 90,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 0,

    //得点
    point: 200,

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

        this.setAnimation("walk");
        this.advanceTime = 6;
        this.setupLifeGauge();

        this.isVertical = this.options.vertical || false;
        this.direction = this.options.direction || this.isVertical? 90: 0;
        this.speed = this.options.speed || 2;
        this.returnTime = this.options.returnTime || 120;
        this.attackInterval = this.options.attackInterval || 90;

        //停止フラグ
        this.isStill = false;
    },

    update: function() {
        //チェックする壁決定
        var chk = 0;
        if (!this.isVertical) chk = 1;

        //壁に当たるか一定時間経過で折り返し
        if (this._collision[chk].hit || this._collision[chk+2].hit || this.returnTime < 0) {
            this.direction = (this.direction + 180) % 360;
            this.returnTime = this.options.returnTime;
        }

        //プレイヤーをみつけたら加速
        if (this.isLookPlayer()) {
            this.speed = 4;
            this.returnTime -= 2;
        } else {
            this.speed = 2;
            this.returnTime--;
        }

        var rad = this.direction.toRadian();
        this.vx = Math.cos(rad) * this.speed;
        this.vy = Math.sin(rad) * this.speed;

        //落し物
        if (this.getDistancePlayer() < 512 && this.time % 90 == this.bombInterval) {
            this.parentScene.spawnEnemy(this.x, this.y, "BirdBomb", {});
        }

        //向きの指定
        if (this.vx != 0) {
            if (this.vx > 0) {
                this.scaleX = 1;
            } else {
                this.scaleX = -1;
            }
        }
        if (this.isVertical && this.getDistancePlayer() < 256) {
            if (this.x < this.parentScene.player.x) this.scaleX = 1; else this.scaleX = -1;
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["walk"] = [3, 4, 5, 4];
        this.index = 0;
    },
});
