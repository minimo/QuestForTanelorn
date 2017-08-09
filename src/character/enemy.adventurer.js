/*
 *  enemy.adventurer.js
 *  2017/08/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

//冒険者
phina.define("qft.Enemy.Adventurer", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 100,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 192,

    //視野角
    viewAngle: 90,

    //得点
    point: 5000,

    //アニメーション間隔
    animationInterval: 10,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_JEWEL,

    //レアドロップ率（％）
    rareDropRate: 3,
    rareDropItem: ITEM_LONGSWORD,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 25, height: 24});
        this.superInit(parentScene, options);

        //武器スプライト
        this.weapon = phina.display.Sprite("weapons", 24, 24)
            .addChildTo(this)
            .setFrameIndex(10 + Math.min(9, this.level))
            .setOrigin(1, 1)
            .setPosition(-6, 3)
            .setScale(-1.5, 1.5)
            .setRotation(430);
        this.weapon.tweener.setUpdateType('fps');
        this.weapon.kind = "sword";
        if (options.weapon == "ax") {
            this.weapon.setFrameIndex(20 + Math.min(9, this.level));
            this.weapon.kind = "ax";
        }
        if (options.weapon == "spear") {
            this.weapon.setFrameIndex(30 + Math.min(9, this.level));
            this.weapon.kind = "spear";
        }

        //表示用スプライト
        if (this.black) {
            this.sprite = phina.display.Sprite("player1Black", 32, 32).addChildTo(this);
        } else {
            this.sprite = phina.display.Sprite("player1", 32, 32).addChildTo(this);
        }

        this.hp += this.level * 5;
        this.power += this.level * 5;
        this.point += this.level * 1000;

        this.setAnimation("walk");
        this.setupLifeGauge();

        this.direction = 0;
        this.isAttack = false;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
    },

    //攻撃
    attack: function() {
    },

    //飛び道具弾き
    guard: function() {
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [13, 14];
        this.frame["jump"] = [36, "stop"];
        this.frame["walk"] = [ 3,  4,  5,  4];
        this.frame["up"] =   [ 9, 10, 11, 10];
        this.frame["down"] = [ 0,  1,  2,  1];
        this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
        this.frame["defense"] = [ 41, 42, 43, 44, "stop"];
        this.frame["damage"] = [ 18, 19, 20];
        this.frame["drop"] = [18, 19, 20];
        this.frame["dead"] = [18, 19, 20, 33, 34, 35, "stop"];
        this.frame["clear"] = [24, 25, 26];
        this.frame["stun"] = [ 18, 19, 20];
        this.index = 0;
        return this;
    },
});
