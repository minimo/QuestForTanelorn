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
        this.sprite.setFrameTrimming(288*2, 640*2, 72*2, 128*2).setPosition(0, -10);
        if (options.size) {
            var size = options.size || 1;
            this.sprite.setScale(size).setPosition(0, size * -12);
        }

        this.setAnimation("walk");
        this.setupLifeGauge();

        this.phase = 0;
        this.isAttack = false;
        this.stopTime = 0;
        this.direction = 0;

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
            if (look && !this.isJump && dis > 64 && dis < this.eyesight && this.stopTime == 0) {
                this.isAttack = true;
                this.stopTime = 60;
            }

            if (look && !this.isJump && dis < 64 && this.stopTime == 0) {
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
            this.isAttack = false;
            var b = this.parentScene.spawnEnemy(this.x, this.y, "Bullet", {explode: true});
            b.rotation = this.getPlayerAngle();
        }

        this.stopTime--;
        if (this.stopTime > 0) {
            this.vx = 0;
        }
        if (this.stopTime < 0) {
            this.stopTime = 0;
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
