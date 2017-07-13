/*
 *  enemy.archdemon.js
 *  2017/05/01
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アークデーモン
phina.define("qft.Enemy.ArchDemon", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 100,

    //防御力
    deffence: 10,

    //攻撃力
    power: 30,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 180,

    //アニメーション間隔
    animationInterval: 15,

    //得点
    point: 5000,

    //飛行モード
    flying: false,
    flyingPhase: 0, //行動フェーズ
    flyingX: 0,     //飛行開始Ｘ座標

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_JEWEL,

    //レアドロップ率（％）
    rareDropRate: 2,
    rareDropItem: ITEM_JEWELBOX,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 35, height: 30});
        if (options.size) {
            var size = options.size || 1;
            options.width = size * 35;
            options.height = size * 30;
        }
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01x2", 24*2, 32*2).addChildTo(this);
        this.sprite.setFrameTrimming(288*2, 640*2, 72*2, 128*2).setPosition(0, -10);
        if (options.size) {
            var size = options.size || 1;
            this.sprite.setScale(size).setPosition(0, size * -12);
        }

        this.hp += this.level * 5;
        this.power += this.level * 5;
        this.point += this.level * 1000;

        this.setAnimation("walk");
        this.setupLifeGauge();

        this.phase = 0;
        this.direction = 0;
        this.isAttack = false;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        //プレイヤーとの距離
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        if (!this.flying && this.isOnFloor) {
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

            //プレイヤーが近くにいたら攻撃
            if (look && !this.isJump && dis > 64 && dis < this.eyesight) {
                this.isAttack = true;
                this.stopTime = 60;
            }

            if (look && !this.isJump && dis < 64) {
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

            //飛行モード移行
            if (!this.isJump && !this.flying && this.time % 120 == 0) {
                this.flying = true;
                this.flyingX = Math.floor(this.x);
                this.vx = 0;
                this.tweener.clear()
                    .by({y: -64}, 60, "easeSineOut")
                    .wait(15)
                    .call(function(){
                        this.phase = 1;
                    }.bind(this));
            }
        }

        //飛びます飛びます
        if (this.flying && this.phase == 1) {
            this.vx = Math.cos(this.time.toRadian());
            this.vy = Math.sin((this.time*180).toRadian());
            if (this.vx > 0) this.direction = 0; else this.direction = 180;
            if (look && this.time % 60 == 0) {
                this.isAttack = true;
            }
        }

        //プレイヤーを発見したらバルーンを出したり消したり
        if (look) {
            this.flare('balloon', {pattern: "!"});
        } else {
            if (dis < 128) {
                this.flare('balloon', {pattern: "?"});
            } else {
                this.flare('balloonerace');
            }
        }

        //攻撃するよ
        if (this.isAttack) {
            this.stopTime = 60;
            this.isAttack = false;
            this.flaming();
        }
    },

    //火球を吐く
    fireball: function() {
        this.isAttack = true;
        this.stopTime = 30;
        this.sprite2.tweener.clear()
            .fadeIn(10)
            .call(() => {
                this.parentScene.spawnEnemy(this.x, this.y, "Bullet", {explode: true, rotation: this.getPlayerAngle(), power: 30});
            })
            .wait(45)
            .call(() => {
                this.isAttack = false;
            })
            .fadeOut(10);
    },

    //火を吐く
    flaming: function() {
        this.isAttack = true;
        this.stopTime = 60;
        this.sprite2.tweener.clear()
            .fadeIn(15)
            .wait(60)
            .call(() => {
                this.isAttack = false;
            })
            .fadeOut(15);

        var rot = (this.scaleX == 1)? 0: 180;
        var ct = 0;
        var tw = phina.accessory.Tweener().attachTo(this)
            .setUpdateType('fps')
            .call(() => {
                var b = this.parentScene.spawnEnemy(this.x + 24 * this.scaleX, this.y-8, "Bullet", {type: "explode", power: 10, rotation: this.getPlayerAngle(), velocity: 5});
                b.setScale(0.1);
                b.tweener.clear().setUpdateType('fps').to({scaleX: 1, scaleY: 1}, 10);
                ct++;
                if (ct == 6 || this.attackCancel) {
                    tw.remove();
                    this.isAttackCancel = false;
                }
            })
            .wait(5)
            .setLoop(true);
    },

    //爆発
    exploding: function() {
        app.playSE("bomb");
        this.isAttack = true;
        this.stopTime = 60;
        this.sprite2.tweener.clear()
            .fadeIn(15)
            .wait(45)
            .call(() => {
                this.isAttack = false;
            })
            .fadeOut(15);

        var rot = (this.scaleX == 1)? 0: 180;
        var ct = 0;
        var tw = phina.accessory.Tweener().attachTo(this)
            .setUpdateType('fps')
            .call(() => {
                var rad = rot.toRadian();
                var ex = Math.cos(rad) * 16;
                var ey = Math.sin(rad) * 16;
                this.parentScene.spawnEnemy(this.x + ex, this.y + ey, "Bullet", {type: "explode", power: 10, rotation: rot, velocity: 3});
                rot += 22.5;
                ct++;
                if (ct == 16 || this.attackCancel) {
                    tw.remove();
                    this.isAttackCancel = false;
                }
            })
            .wait(1)
            .setLoop(true);
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
