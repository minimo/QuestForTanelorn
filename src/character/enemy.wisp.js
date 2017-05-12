/*
 *  enemy.wisp.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ウィスプ
phina.define("qft.Enemy.Wisp", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 10,

    //重力加速度
    gravity: 0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 360,

    //地形無視
    ignoreCollision: true,

    //得点
    point: 100,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_STONE,

    //レアドロップ率（％）
    rareDropRate: 0,
    rareDropItem: ITEM_STONE,

    //属性ダメージ倍率
    damageFire: 0.8,
    damageIce: 2,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 512, 72, 128);

        this.setAnimation("stand");
        this.animationInterval = 10;
        this.setupLifeGauge();

        this.direction = 0;
        this.move = false;
    },

    algorithm: function() {
        //プレイヤーが近くにいたら寄っていく
        if (this.isLookPlayer()) {
            var player = this.parentScene.player;
            var p1 = phina.geom.Vector2(this.x, this.y);
            var p2 = phina.geom.Vector2(player.x, player.y);
            var p = p2.sub(p1);
            p.normalize();
            this.vx = p.x;
            this.vy = p.y;
        } else {
            this.vx = 0;
            this.vy = 0;
        }
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

//ウィスプ（強）
phina.define("qft.Enemy.WispHard", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 20,

    //重力加速度
    gravity: 0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 360,

    //地形無視
    ignoreCollision: true,

    //得点
    point: 300,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_STONE,

    //レアドロップ率（％）
    rareDropRate: 5,
    rareDropItem: ITEM_JEWEL,

    //属性ダメージ倍率
    damageFire: 0.5,
    damageIce: 2,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(288, 512, 72, 128);

        this.setAnimation("stand");
        this.animationInterval = 10;
        this.setupLifeGauge();

        this.direction = 0;
        this.move = false;
        this.attackCount = 0;
    },

    update: function() {
        //プレイヤーが近くにいたら寄っていく
        if (this.getDistancePlayer() < 128) {
            var player = this.parentScene.player;
            var p1 = phina.geom.Vector2(this.x, this.y);
            var p2 = phina.geom.Vector2(player.x, player.y);
            var p = p2.sub(p1);
            p.normalize();
            this.vx = p.x / 2;
            this.vy = p.y / 2;
        } else {
            this.vx = 0;
            this.vy = 0;
        }

        //攻撃
        if (this.getDistancePlayer() < 160) {
            this.attackCount--;
            if (this.attackCount == 0) {
                for (var i = 0; i < this.level+4; i++) {
                    var b = this.parentScene.spawnEnemy(this.x, this.y, "WispBomb", {pattern: 1});
                    b.vy = -10;
                    b.vx = (i*2) * this.scaleX;
                }
                this.attackCount = 180 - this.level * 15;
            }
        } else {
            this.attackCount = 60;
        }
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

phina.define("qft.Enemy.WispBomb", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 1,

    //横移動減衰率
    friction: 0.99,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //得点
    point: 0,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 10, height: 10});
        options = options || {};
        this.$extend(options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("particle", 16, 16).addChildTo(this).setFrameIndex(31);
        this.animationInterval = 3;

        this.pattern = options.pattern || 1;
        this.setAnimation("pattern"+this.pattern);

        this.on('dead', function() {
        });
    },

    update: function() {
        if (this.onFloor) {
            if (this.onScreen) app.playSE("bomb");
            var b = this.parentScene.spawnEnemy(this.x, this.y, "Flame", {pattern: 1});
            this.remove();
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["pattern1"] = [31, 30, 29, 28, 27, 26, "stop"];
        this.frame["pattern2"] = [31, 30, 29, 28, 27, 26, "stop"];
        this.index = 0;
    },

    dropDead: function() {
        this.isDead = true;
        this.isDrop = true;
        return this;
    },
});
