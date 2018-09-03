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
    hp: 60,

    //防御力
    deffence: 10,

    //攻撃力
    power: 20,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 90,

    //得点
    point: 1000,

    //アイテムドロップ率（％）
    dropRate: 7,
    dropItem: ITEM_BAG,

    //レアドロップ率（％）
    rareDropRate: 2,
    rareDropItem: ITEM_JEWEL,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 20, height: 20});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster02", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(216, 0, 72, 128);
        this.sprite.setPosition(0, -5).setScale(1.3);

        this.hp += this.level * 5;
        this.power += this.level * 3;
        this.point += this.level * 300;

        this.setAnimation("walk");
        this.animationInterval = 10;
        this.setupLifeGauge();

        this.direction = 0;
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
        if (this.chaseTime > 0 && !this.isAttack && this.turnTime == 0) {
            if (this.x > pl.x) {
                if (this.direction == 0) this.turnCount++;
                this.direction = 180;
            } else {
                if (this.direction == 180) this.turnCount++;
                this.direction = 0;
            }
            this.turnTime = 15;
            if (look) this.turnCount = 0;
            //プレイヤーを見失った状態で三回振り返った場合は追跡終了
            if (this.turnCount > 3) {
                this.flare('balloon', {pattern: "?"});
                this.stopTime = 30;
                this.chaseTime = 0;
            }
        }

        //一定距離以上離れたら追跡解除
        if (dis > 512) this.chaseTime = 0;

        if (this.isOnFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 0.5;
            } else {
                this.vx = -0.5;
            }
            if (this.chaseTime > 0) this.vx *= 4;
        }

        if (look) {
            this.chaseTime = 150;
            this.turnCount = 0;
            this.stopTime = 0;
            this.flare('balloon', {pattern: "!"});
        } else {
            if (this.chaseTime == 0) this.flare('balloonerace');
        }

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
                if (this.chaseTime > 0) {
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
                            this.chaseTime = 0;
                            this.stopTime = 30;
                            this.turnWait = 15;
                            this.direction = (this.direction + 180) % 360;
                            this.vx = 0;
                            this.flare('balloon', {pattern: "..."});
                         }
                    }
                } else {
                    this.direction = (this.direction + 180) % 360;
                    this.vx *= -1;
                    this.turnWait = 1;
                }
            }
        }
        if (this.chaseTime == 30) this.flare('balloon', {pattern: "?"});
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
