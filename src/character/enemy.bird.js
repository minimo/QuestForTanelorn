/*
 *  enemy.bird.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//鳥
phina.define("qft.Enemy.Bird", {
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
    viewAngle: 60,

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
        options = (options || {}).$extend({width: 16, height: 18});
        options = options.$safe(this.defaultOptions);
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 0, 72, 128);

        this.setAnimation("walk");
        this.advanceTime = 6;
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

        //移動
        var rad = this.direction.toRadian();
        this.vx = Math.cos(rad) * this.speed;
        this.vy = Math.sin(rad) * this.speed;

        //落し物
        if (this.onScreen && this.time % this.bombInterval == 0) {
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

//鳥の落し物
phina.define("qft.Enemy.BirdBomb", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 1,

    //防御力
    deffence: 10,

    //攻撃力
    power: 5,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 5, height: 5});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("bullet", 24, 32).addChildTo(this).setFrameIndex(72);

        this.setAnimation("normal");
        this.advanceTime = 6;
    },

    update: function() {
        if (this.onFloor) this.remove();
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["normal"] = [72, 73, 74, 73];
        this.index = 0;
    },

    dropDead: function() {
        this.isDead = true;
        this.isDrop = true;
        return this;
    },
});
