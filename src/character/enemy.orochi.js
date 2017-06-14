/*
 *  enemy.orochi.js
 *  2017/06/13
 *  @auther minimo  
 *  This Program is MIT license.
 */

//大蛇
phina.define("qft.Enemy.Orochi", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 20,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 90,

    //得点
    point: 700,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_COIN,

    //レアドロップ率（％）
    rareDropRate: 3,
    rareDropItem: ITEM_BAG,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 32, height: 36});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01x2", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(Math.min(this.level, 4) * 72*2, 384*2, 72*2, 128*2)
            .setScale(1 + Math.min(this.level, 4) * 0.1)
            .setPosition(0, Math.min(this.level, 4) * -1)

        this.hp += this.level * 10;
        this.power += this.level * 5;
        this.point += this.level * 150;

        this.setAnimation("walk");
        this.animationInterval = 15;
        this.setupLifeGauge();

        this.direction = 0;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        if (this.isDead) return;

        //プレイヤーとの距離
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        if (this.isOnFloor) {
            //崖っぷちで折り返す
            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) {
                this.direction = 180;
            } else if (this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) {
                this.direction = 0;
            }

            //壁に当たったら折り返す
            if (this._collision[1].hit) {
                this.direction = 180;
            } else if (this._collision[3].hit) {
                this.direction = 0;
            }

            //プレイヤーが近くにいたらジャンプ攻撃
            if (look && !this.isJump && dis < 40) {
                this.isJump = true;
                this.vy = -6;
                var pl = this.parentScene.player;
                if (this.x > pl.x) {
                    this.direction = 180;
                } else {
                    this.direction = 0;
                }
            }
        }
        if (this.isOnFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 0.5;
            } else {
                this.vx = -0.5;
            }
        }
        if (look) {
            this.vx *= 2;
            this.flare('balloon', {pattern: "!", lifeSpan: 15, y: -16});
        } else {
            this.flare('balloonerace');
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
