/*
 *  enemy.ogre.js
 *  2017/05/06
 *  @auther minimo  
 *  This Program is MIT license.
 */

//オーガ
phina.define("qft.Enemy.Ogre", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 100,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 90,

    //得点
    point: 3000,

    //アイテムドロップ率（％）
    dropRate: 7,
    dropItem: ITEM_BAG,

    //レアドロップ率（％）
    rareDropRate: 2,
    rareDropItem: ITEM_JEWEL,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 25, height: 40});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster02x2", 24*2, 32*2).addChildTo(this);
        this.sprite.setFrameTrimming(216*2, 0, 72*2, 128*2);
        this.sprite.setPosition(0, -5);

        this.hp += this.level * 10;
        this.power += this.level * 5;
        this.point += this.level * 500;

        this.setAnimation("walk");
        this.animationInterval = 10;
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

        //プレイヤー発見後一定時間追跡する
        if (this.forgotTime > 0 && !this.isAttack) {
            if (this.x > pl.x) {
                this.direction = 180;
            } else {
                this.direction = 0;
            }
        }

        //一定距離以上離れたら追跡解除
        if (dis > 512) this.forgotTime = 0;

        if (this.isOnFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 0.5;
            } else {
                this.vx = -0.5;
            }
            if (this.isJump) this.vx *= 2;
        }

        if (look) {
            this.forgotTime = 120;
            this.stopTime = 0;
        } else {
            if (this.forgotTime == 0) this.flare('balloonerace');
        }
        if (this.forgotTime > 0) this.vx *= 3;

        if (this.isOnFloor) {
            //これ以上進めない場合は折り返す
            var isReturnWall = false;
            var isReturnCliff = false;
            if (this.vx > 0) {
                if (this._collision[1].hit) isReturnWall = true;
                if (this.checkMapCollision2(this.x+5, this.y+40, 5, 5) == null) isReturnCliff = true;
            } else if (this.vx < 0) {
                if (this._collision[3].hit) isReturnWall = true;
                if (this.checkMapCollision2(this.x-5, this.y+40, 5, 5) == null) isReturnCliff = true;
            }
            if (isReturnWall || isReturnCliff) {
                if (this.forgotTime > 0) {
                    //プレイヤー追跡中で段差がある場合は飛び越える
                    if (isReturnWall) {
                        if (this.direction == 0) {
                            if (this.x < pl.x) {
                                this.isJump = true;
                                this.vy = -10;
                            }
                        } else {
                            if (this.x > pl.x) {
                                this.isJump = true;
                                this.vy = -10;
                            }
                        }
                    }
                    //プレイヤー追跡中で崖がある場合は着地点があるか調べて飛び降りる
                    if (isReturnCliff) {
                        var jumpOk = false;
                        if (this.direction == 0) {
                            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 96)) jumpOk = true;
                        } else {
                            if (this.checkMapCollision2(this.x-5, this.y+20, 5, 96)) jumpOk = true;
                        }
                        if (jumpOk) {
                            this.isJump = true;
                            this.vy = -5;
                        } else {
                            //着地点が無い場合は諦めて折り返す
                            this.forgotTime = 0;
                            this.stopTime = 30;
                            this.turnWait = 15;
                            this.direction = (this.direction + 180) % 360;
                            this.vx *= -1;
                            this.flare('balloon', {pattern: "..."});
                         }
                    }
                } else {
                    this.direction = (this.direction + 180) % 360;
                    this.vx *= -1;
                    this.turnWait = 1;
                }
            }

            //攻撃
            if (look && !this.isJump && dis < 64 && this.stopTime == 0 && !this.isAttack) {
                this.attack();
            }
        }

        //停止中処理
        if (this.stopTime > 0) {
            this.vx = 0;
        }

        this.stopTime--;
        if (this.stopTime < 0) this.stopTime = 0;

        this.forgotTime--;
        if (this.forgotTime < 0) this.forgotTime = 0;
        if (this.forgotTime == 30) this.flare('balloon', {pattern: "?"});
    },

    attack: function() {
        var that = this;
        var atk = qft.EnemyAttack(this.parentScene, {width: 1, height: 24, power: 40 + this.level * 5})
            .addChildTo(this.parentScene.enemyLayer)
            .setPosition(this.x + this.scaleX * 18, this.y)
            .setAlpha(0.0);
        if (DEBUG_COLLISION) atk.setAlpha(0.3);
        atk.master = this;
        atk.tweener.setUpdateType('fps');
        atk.update = function() {
            this.x = that.x + that.scaleX * 18;
        }

        atk.isActive = false;
        atk.tweener.clear()
            .wait(6)
            .call(function() {
                atk.isActive = true;
                that.vx = 24 * that.scaleX;
            })
            .wait(6)
            .call(function() {
                that.isAttack = false;
                atk.remove();
            });
        this.isAttack = true;
        this.stopTime = 30;

        qft.Character.balloon({pattern: "anger2"}).addChildTo(this).setPosition(0, -this.height/2-10);
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
