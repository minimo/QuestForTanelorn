/*
 *  enemy.demon.js
 *  2017/01/13
 *  @auther minimo  
 *  This Program is MIT license.
 */

//デーモン（強)
phina.define("qft.Enemy.DemonHard", {
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
    viewAngle: 90,

    //得点
    point: 500,

    //飛行モード
    flying: false,
    flyingPhase: 0, //行動フェーズ
    flyingX: 0,     //飛行開始Ｘ座標

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 20, height: 20});

        this.level = options.level || 0;

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(this.level * 72, 640, 72, 128);

        this.setAnimation("walk");
        this.advanceTime = 6;
        this.setupLifeGauge();

        this.direction = 0;
        this.stopTime = 0;
    },

    update: function() {
        //プレイヤーとの距離
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        if (this.onFloor) {
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
                //火を吐く
                var b = this.parentScene.spawnEnemy(this.x, this.y, "Bullet", {explode: true});
                b.rotation = this.getPlayerAngle();
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
            if (!this.isJump && this.time % 300 == 0) {
                this.flying = true;
                this.flyingPhase = 0;
                this.flyingX = Math.floor(this.x);
                this.vx = 0;
                this.tweener.clear()
                    .by({y: -64}, 60, "easeSineOut")
                    .wait(15)
                    .call(function(){
                        this.flyingPhase = 1;
                    }.bind(this));
            }
        }
        if (!this.flying) {
            if (this.onFloor || this.isJump) {
                if (this.direction == 0) {
                    this.vx = 1;
                } else {
                    this.vx = -1;
                }
            }
        } else {
            if (this.flyingPhase == 1) {
                this.vx = 1;
                this.vy = -0.9 + Math.sin(this.time.toRad())*2;
            }
        }
        if (look) this.vx *= 3;

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
