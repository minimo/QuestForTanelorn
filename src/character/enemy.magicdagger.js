/*
 *  enemy.magicdgger.js
 *  2017/07/19
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Enemy.MagicDagger", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 1,

    //寿命
    lifespan: 75,

    //速度
    velocity: 2,

    //加速度
    accel: 1.02,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 1.0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //地形無視
    ignoreCollision: true,

    //影表示フラグ
    isShadow: false,

    //得点
    point: 0,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        this.sprite = phina.display.Sprite("weapons", 24, 24).addChildTo(this).setFrameIndex(0);
        this.setAnimation("pattern1");

        this.power = options.power || this.power;
        this.power += this.level * 2;

        this.parentUnit = options.parent || null;
        this.offsetX = options.offsetX || Math.randint(-16, 16);
        this.offsetY = options.offsetY || Math.randint(-16, 16);
        this.order = options.order || 0;

        this.isAttack = false;
        this.isAttack_before = false;
        this.isDamaged = false;

        this.phase = 0;
    },

    algorithm: function() {
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        //待機開始
        if (this.phase == 0) {
            this.phase++;
            var x = this.parentUnit.x + this.offsetX;
            var y = this.parentUnit.y + this.offsetY;
            y += Math.cos(this.time.toRadian() * 6) * 5;
            this.tweener.clear()
                .moveTo(x, y, 5)
                .call(() => {
                    this.phase++;
                });
        }

        //待機中
        if (this.phase == 2) {
            this.x = this.parentUnit.x + this.offsetX;
            this.y = this.parentUnit.y + this.offsetY;
            this.y += Math.cos(this.time.toRadian() * 6) * 5;
            this.rotation -= 3;

            if (this.isAttack) {
                this.phase = 3;
                this.isAttack = false;
            }
        }

        //プレイヤー攻撃開始
        if (this.phase == 3) {
            this.phase++;
            this.rotation = this.getPlayerAngle() + 135;
            this.tweener.clear()
                .moveTo(pl.x, pl.y, 20, "easeInQuad")
                .call(() => {
                    this.phase++;
                });
        }

        //攻撃終了
        if (this.phase == 5) {
            this.phase++;
            this.isEnableAttackCollision = false;
            var x = this.parentUnit.x + this.offsetX;
            var y = this.parentUnit.y + this.offsetY;
            this.tweener.clear()
                .moveTo(x, y, 15, "easeInOutQuad")
                .wait(5)
                .call(() => {
                    this.phase = 0;
                    this.isEnableAttackCollision = true;
                });
        }

        //警戒待機開始
        if (this.phase == 10) {
            this.phase++;
            var deg = this.time.toRadian() * 6 + this.order * 60;
            var x = this.parentUnit.x + Math.cos(deg) * 16;
            var y = this.parentUnit.y + Math.sin(deg) * 16;
            this.tweener.clear()
                .moveTo(x, y, 5)
                .call(() => {
                    this.phase++;
                });
        }

        //警戒待機中
        if (this.phase == 12) {
            var deg = this.time.toRadian() * 6 + this.order * 60;
            this.x = this.parentUnit.x + Math.cos(deg) * 16;
            this.y = this.parentUnit.y + Math.sin(deg) * 16;
            this.rotation -= 6;

            if (this.isAttack) {
                this.phase = 13;
                this.isAttack = false;
            }
        }

        //近接攻撃開始
        if (this.phase == 13) {
            this.phase++;
            this.tweener.clear()
                .wait(10)
                .call(() => {
                    this.phase++;
                    this.rotation = this.getPlayerAngle() + 135;
                })
                .moveTo(pl.x, pl.y, 6)
                .call(() => {
                    this.phase++;
                });
        }

        //近接攻撃
        if (this.phase == 14) {
            var deg = this.time.toRadian() * 20 + this.order * 60;
            this.x = this.parentUnit.x + Math.cos(deg) * 24;
            this.y = this.parentUnit.y + Math.sin(deg) * 24;
            this.rotation -= 6;
        }

        //攻撃終了
        if (this.phase == 16) {
            this.phase++;
            this.isEnableAttackCollision = false;
            var x = this.parentUnit.x + this.offsetX;
            var y = this.parentUnit.y + this.offsetY;
            this.tweener.clear()
                .moveTo(x, y, 10)
                .call(() => {
                    this.phase = 10;
                    this.isEnableAttackCollision = true;
                });
        }

        //親ユニット同期
        if (this.parentUnit) {
            this.direction = this.parentUnit.direction;
            if (this.parentUnit.hp == 0) this.remove();
        }

        //飛び道具迎撃
        this.parentScene.playerLayer.children.forEach(function(e) {
            if (e instanceof qft.PlayerAttack && e.isCollision) {
                if (e.type != "arrow" && e.type != "masakari") return;
                var dis = this.getDistance(e);
                if (dis < 64) {
                    this.phase = 20;
                    this.tweener.clear()
                        .moveTo(e.x, e.y, 5)
                        .call(() => {
                            this.phase = 10;
                        });
                }
            }
        }.bind(this));

        this.isAttack_before = this.isAttack;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["pattern1"] = [0];
        this.index = 0;
    },

    damage: function(target) {
        this.isDamaged = true;
        if (this.phase < 10) this.phase = 6; else this.phase = 17;

        //効果音
        app.playSE("tinkling");
        this.tweener.clear()
            .by({y: -64, rotation: 700}, 15, "easeOutQuad")
            .call(function() {
                if (this.phase < 10) this.phase = 0; else this.phase = 10;
                this.isDamaged = false;
            }.bind(this));
    },
});
