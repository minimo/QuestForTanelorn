/*
 *  enemy.slime.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//スライム
phina.define("qft.Enemy.Slime", {
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
    point: 100,

    //属性ダメージ倍率
    damageSting: 0.8,
    damageBlow: 0.5,

    //アイテムドロップ率（％）
    dropRate: 30,
    dropItem: ITEM_COIN,

    //レアドロップ率（％）
    rareDropRate: 5,
    rareDropItem: ITEM_BAG,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(Math.min(this.level, 4) * 72, 256, 72, 128)
            .setScale(1 + Math.min(this.level, 4) * 0.2)
            .setPosition(0, Math.min(this.level, 4) * -2)
        this.hp += this.level * 10;
        this.power += this.level * 5;

        this.setAnimation("walk");
        this.animationInterval = 10;
        this.setupLifeGauge();

        this.direction = 0;
        this.speed = 1;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
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

            if (this.level < 4) {
                //プレイヤーが近くにいたらジャンプ攻撃
                if (look && !this.isJump && this.getDistancePlayer() < 40) {
                    this.isJump = true;
                    this.vy = -6;
                    var pl = this.parentScene.player;
                    if (this.x > pl.x) {
                        this.direction = 180;
                    } else {
                        this.direction = 0;
                    }
                }
            } else {
                //プレイヤーが近くにいたら攻撃
                if (look && !this.isJump && this.getDistancePlayer() < 64 && this.time % 180 == 0) {
                    for (var i = 0; i < this.level+4; i++) {
                        var b = this.parentScene.spawnEnemy(this.x, this.y, "WispBomb", {pattern: 2});
                        b.vy = -10;
                        b.vx = (i*2) * this.scaleX;
                    }
                }
            }
        }
        if (this.isOnFloor || this.isJump) {
            this.vx =  2 + Math.floor(this.level*0.5) * this.speed;
            if (this.direction == 180) {
                this.vx *= -1;
            }
            if (this.attack) this.vx *= 3;
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [0, 1, 2, 1];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },
});
