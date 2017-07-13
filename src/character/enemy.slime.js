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
        var capLevel = Math.min(this.level, 4);
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(capLevel * 72, 256, 72, 128)
            .setScale(1 + capLevel * 0.2)
            .setPosition(0, -2 + capLevel * -3);
        this.width += capLevel * 5;

        this.hp += this.level * 10;
        if (this.level > 3) this.hp += 30;
        this.power += this.level * 5;
        this.point += this.level * 200;

        this.setAnimation("walk");
        this.animationInterval = 10;
        this.setupLifeGauge();

        this.direction = 0;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
            if (this.level > 3　&& this.stopTime == 0) {
                this.attack();
                this.flare('balloon', {pattern: "anger1", lifeSpan: 60, y: 0, force: true});
            }
        });
    },

    algorithm: function() {
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

            //テリトリー指定
            if (this.territory) {
                //水平方向のみチェック
                var tx = this.x - this.firstX;
                if (Math.abs(tx) > this.territory) {
                    if (tx > 0) {
                        this.direction = 180;
                    } else {
                        this.direction = 0;
                    }
                }
            }

            if (this.level < 4) {
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
        }
        if (this.isOnFloor || this.isJump) {
            this.vx =  2 + Math.floor(this.level*0.5) * this.speed;
            if (this.direction == 180) {
                this.vx *= -1;
            }
        }
    },

    attack: function() {
        this.stopTime = 30;
        var vx = 1;
        if (this.direction == 180) vx = -1;
        for (var i = 0; i < this.level; i++) {
            var b = this.parentScene.spawnEnemy(this.x, this.y, "WispBomb", {pattern: 2});
            b.vy = -8;
            b.vx = i * 2 * vx;
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
