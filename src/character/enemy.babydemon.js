/*
 *  enemy.babydemon.js
 *  2017/01/13
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ベビーデーモン
phina.define("qft.Enemy.BabyDemon", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 40,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 90,

    //得点
    point: 500,

    //アイテムドロップ率（％）
    dropRate: 5,
    dropItem: ITEM_JEWEL,

    //レアドロップ率（％）
    rareDropRate: 2,
    rareDropItem: ITEM_JEWELBOX,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 20, height: 20});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster02", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 0, 72, 128);

        this.hp += this.level * 5;
        this.power += this.level * 2;
        this.point += this.level * 100;

        this.setAnimation("walk");
        this.animationInterval = 6;
        this.setupLifeGauge();

        this.direction = 0;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        //プレイヤーとの距離
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        this.chaseAlgorithm(dis, look);

        //プレイヤーが近くにいたら攻撃
        if (this.isOnFloor && look && !this.isJump && dis < 64) {
            //飛びかかる
            this.isJump = true;
            this.vy = -6;
            var pl = this.parentScene.player;
            if (this.x > pl.x) {
                this.direction = 180;
            } else {
                this.direction = 0;
            }
        }
        if (this.isOnFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 1;
            } else {
                this.vx = -1;
            }
        }
        if (look || this.chaseTime > 0) {
            this.vx *= 4;
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
