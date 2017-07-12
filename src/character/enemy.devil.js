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

    //重力加速度
    gravity: 0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 256,

    //視野角
    viewAngle: 360,

    //地形無視
    ignoreCollision: true,

    //得点
    point: 800,

    //属性ダメージ倍率
    damageArrow: 5,

    defaultOptions: {
        speed: 2,
        direction: 0,
        returnTime: 120,
    },

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_BAG,

    //レアドロップ率（％）
    rareDropRate: 5,
    rareDropItem: ITEM_STONE,

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

        this.level = 0;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        //プレイヤー情報
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        //プレイヤーが近くにいたら寄っていく
        if (look) {
            var p1 = phina.geom.Vector2(this.x, this.y);
            var p2 = phina.geom.Vector2(pl.x, pl.y);
            var p = p2.sub(p1);
            p.normalize();
            this.vx = p.x * (1 + this.level * 0.2);
            this.vy = p.y * (1 + this.level * 0.2);
            this.flare('balloon', {pattern: "!"});

            var angle = this.getPlayerAngle();
            if (angle > 315 || angle < 45) this.setAnimation('horizon');
            if ( 45 < angle && angle < 135) this.setAnimation('down');
            if (135 < angle && angle < 225) this.setAnimation('horizon');
            if (225 < angle && angle < 315) this.setAnimation('down');
        } else {
            this.vx = 0;
            this.vy = 0;
            this.flare('balloonerace');
        }

        if (this.vx > 0) {
            this.scaleX = 1;
        } else {
            this.scaleX = -1;
        }

        if (this.isAttack) {
            this.attack();
        }
    },

    attack: function() {
        this.stopTime = 60;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [6, 7, 8, 7];
        this.frame["up"] = [0, 1, 2, 1];
        this.frame["down"] = [5, 6, 7, 6];
        this.frame["horizon"] = [3, 4, 5, 4];
        this.index = 0;
    },
});
