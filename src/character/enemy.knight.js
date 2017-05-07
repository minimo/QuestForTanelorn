/*
 *  enemy.knight.js
 *  2017/05/06
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ナイト
phina.define("qft.Enemy.Knight", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 70,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 90,

    //得点
    point: 1000,

    //アイテムドロップ率（％）
    dropRate: 7,
    dropItem: ITEM_JEWEL,

    //レアドロップ率（％）
    rareDropRate: 2,
    rareDropItem: ITEM_LONGSWORD,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 20, height: 20});
        this.superInit(parentScene, options);

        //武器スプライト
        this.weapon = phina.display.Sprite("weapons", 24, 24)
            .addChildTo(this)
            .setFrameIndex(10 + Math.min(9, this.level))
            .setOrigin(1, 1)
            .setPosition(-2, 2)
            .setScale(-1, 1)
            .setRotation(430);
        this.weapon.tweener.setUpdateType('fps');
        this.weapon.kind = "sword";
        if (options.weapon == "spear") {
            this.weapon.setFrameIndex(30 + Math.min(9, this.level));
            this.weapon.kind = "spear";
        }

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster02", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(144, 128, 72, 128);
        this.sprite.setPosition(0, -5).setScale(1.3);

        this.setAnimation("walk");
        this.advanceTime = 6;
        this.setupLifeGauge();

        this.direction = 0;
        this.stopTime = 0;
        this.forgotTime = 0;
        this.isAttack = false;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        //プレイヤーとの距離
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        if (this.onFloor) {
            //これ以上進めない場合は折り返す
            if (this._collision[1].hit || this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) {
                this.direction = 180;
            } else if (this._collision[3].hit || this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) {
                this.direction = 0;
            }

            //攻撃
            if (look && !this.isJump && dis < 40 && this.stopTime == 0 && !this.isAttack) {
                this.attack();
            }
        }

        //プレイヤー発見後一定時間追跡する
        if (this.forgotTime > 0) {
            if (this.x > pl.x) {
                this.direction = 180;
            } else {
                this.direction = 0;
            }
        }

        if (this.onFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 1;
            } else {
                this.vx = -1;
            }
        }

        if (look) {
            this.forgotTime = 120;
            this.vx *= 3;
            this.flare('balloon', {pattern: "!"});
        } else {
            this.flare('balloonerace');
        }

        this.stopTime--;
        if (this.stopTime < 0) this.stopTime = 0;
        this.forgotTime--;
        if (this.forgotTime < 0) this.stopTime = 0;
    },

    attack: function() {
        var that = this;
        var width = 24, height = 24;
        var atk = qft.EnemyAttack(this.parentScene, {width: 24, height: 24, power: 20 + this.level * 5})
            .addChildTo(this.parentScene.enemyLayer)
            .setPosition(this.x + this.scaleX * 18, this.y)
            .setAlpha(0.0);
        if (DEBUG_COLLISION) atk.setAlpha(0.3);
        atk.tweener.setUpdateType('fps');

        if (this.weapon.kind == "sword") {
            this.weapon.tweener.clear()
                .set({rotation: 270})
                .to({rotation: 430}, 6)
                .call(function() {
                    that.isAttack = false;
                    atk.remove();
                });
        } else if (this.weapon.kind == "spear") {
            atk.width = 32;
            atk.height = 8;
            atk.setPosition(this.x + this.scaleX * 1, this.y);
            atk.tweener.clear().by({x: 30 * this.scaleX}, 10).by({x: -30 * this.scaleX}, 10);

            this.weapon.tweener.clear()
                .set({rotation: 45, x: -20})
                .by({x: 30}, 10)
                .by({x: -30}, 10)
               .call(function() {
                    that.isAttack = false;
                    atk.remove();
                })
                .set({rotation: 430, x: -2});
        }
        this.isAttack = true;
        this.stopTime = 30;
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
