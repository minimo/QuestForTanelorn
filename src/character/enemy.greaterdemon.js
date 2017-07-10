/*
 *  enemy.greaterdemon.js
 *  2017/05/01
 *  @auther minimo  
 *  This Program is MIT license.
 */

//グレーターデーモン
phina.define("qft.Enemy.GreaterDemon", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 100,

    //防御力
    deffence: 10,

    //攻撃力
    power: 20,

    //視力
    eyesight: 256,

    //視野角
    viewAngle: 180,

    //アニメーション間隔
    animationInterval: 15,

    //得点
    point: 500,

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
        this.sprite.setFrameTrimming(72*2*2, 640*2, 72*2, 128*2).setPosition(0, -10);
        if (options.size) {
            var size = options.size || 1;
            this.sprite.setScale(size).setPosition(0, size * -12);
        }

        this.sprite2 = phina.display.Sprite("monster01x2", 24*2, 32*2).addChildTo(this).setAlpha(0);
        this.sprite2.setFrameTrimming(288*2, 640*2, 72*2, 128*2).setPosition(0, -10);
        this.sprite2.tweener.setUpdateType('fps');
        if (options.size) {
            var size = options.size || 1;
            this.sprite2.setScale(size).setPosition(0, size * -12);
        }
        var that = this;
        this.sprite2.update = function() {
            this.frameIndex = that.sprite.frameIndex;
        }

        this.setAnimation("walk");
        this.setupLifeGauge();

        this.phase = 0;
        this.direction = 0;
        this.isAttack = false;
        this.isAttackCancel = false;
        this.chaseTime = 0;
        this.turnTime = 0;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
            this.isAttackCancel = true;
        });
    },

    algorithm: function() {
        //プレイヤー情報
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        //進行方向決定
        if (this.isOnFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 1;
            } else {
                this.vx = -1;
            }
        }

        //プレイヤー発見後一定時間追跡する
        if (look) {
            this.chaseTime = 120;
            this.stopTime = 0;
            this.vx *= 3;
            this.flare('balloon', {pattern: "!"});
        }
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

            //プレイヤーへの攻撃
            if (look && !this.isAttack && !this.isJump) {
                if (dis > 128) {
                    this.flaming();
                } else {
                    this.exploding();
                }
            }
        }

        if (this.chaseTime == 30) this.flare('balloon', {pattern: "?"});
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
                var b = this.parentScene.spawnEnemy(this.x, this.y-8, "Bullet", {type: "explode", power: 10, rotation: this.getPlayerAngle(), velocity: 5});
                b.setScale(0.1);
                b.tweener.clear().setUpdateType('fps').to({scaleX: 1,scaleY: 1}, 10);
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
