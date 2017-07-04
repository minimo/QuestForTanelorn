/*
 *  enemy.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//敵キャラクタ基本クラス
phina.define("qft.Enemy", {
    superClass: "qft.Character",

    //識別フラグ
    isEnemy: true,

    //レベル
    level: 0,

    //ヒットポイント
    hp: 10,

    //防御力
    deffence: 1,

    //攻撃力
    power: 0,

    //移動速度
    speed: 1,

    //気絶確率
    stunPower: 1,

    //視力
    eyesight: 0,

    //視野角
    viewAngle: 90,

    //進行方向（0:右 180:左）
    direction: 0,

    //ポイント
    point: 0,

    //攻撃当たり判定有効フラグ
    isEnableAttackCollision: true,

    //スーパーアーマー状態フラグ
    isSuperArmor: false,

    //属性ダメージ倍率
    damageSlash: 1,
    damageSting: 1,
    damageBlow: 1,
    damageArrow: 1,
    damageFire: 1,
    damageIce: 1,
    damageHoly: 1,
    damageDark: 1,

    //アイテムドロップ率（％）
    dropRate: 0,
    dropItem: ITEM_COIN,

    //レアドロップ率（％）
    rareDropRate: 0,
    rareDropItem: ITEM_BAG,

    //行動パターン用
    chaseTime: 0,
    turnTime: 0,
    stopTime: 0,
    turnCount: 0,

    init: function(parentScene, options) {
        options = options || {};
        this.superInit(parentScene, options);
        this.setupAnimation();
        this.options = options;
        this.level = options.level || 0;

        //デバッグ時視界の可視化
        if (DEBUG_EYESIGHT) {
            var that = this;
            var va = (this.viewAngle / 2).toRadian();
            phina.display.ArcShape({radius: this.eyesight, startAngle: -va, endAngle: va}).addChildTo(this).setAlpha(0.3);
        }

        this.on('enterframe', function() {
            if (this.parentScene.pauseScene) return;
            //画面外の場合は動作停止
            if (!this.onScreen) return;

            var pl = this.parentScene.player;

            //向きの指定
            if (this.vx != 0) {
                if (this.vx > 0) {
                    this.scaleX = 1;
                } else {
                    this.scaleX = -1;
                }
            }

            //ステージクリアの場合は当たり判定無し
            if (this.parentScene.isStageClear) return;

            //気絶中はアニメーションしない
            if (this.isStun) {
                this.isAdvanceAnimation = false;
            } else {
                this.isAdvanceAnimation = true;
            }

            //被ダメージ当たり判定
            if (!this.isMuteki && this.mutekiTime == 0) {
                //プレイヤー攻撃との当たり判定
                if (pl.isAttack && this.hitTestElement(pl.attackCollision)) {
                    this.damage(pl.attackCollision);
                }
                //プレイヤーショットとの当たり判定
                this.parentScene.playerLayer.children.forEach(function(e) {
                    if (e instanceof qft.PlayerAttack && e.isCollision && this.hitTestElement(e)) {
                        e.hit(this);
                        e.remove();
                        this.damage(e);
                    }
                }.bind(this));
            }

            //プレイヤーとの当たり判定
            if (this.isEnableAttackCollision && this.mutekiTime == 0) {
                if (!this.isDead && !pl.isDead && this.power > 0 && this.hitTestElement(pl)) {
                    this.hit();
                    pl.damage(this);
                }
            }

            if (this.stopTime == 0) {
                this.algorithm();
                if (this.chaseTime > 0) this.chaseTime--;
                if (this.turnTime > 0) this.turnTime--;
            }
        });

        this.on('dead', function() {
            //確定ドロップアイテム
            if (this.options.item) {
                var i = this.parentScene.spawnItem(this.x, this.y, {kind: this.options.item});
                i.vy = -5;
                if (this.options.item == "key") {
                    i.isEnemyDrop = false;
                } else {
                    i.isEnemyDrop = true;
                }
                this.remove();
                return;
            }
            //レアアイテムドロップ判定
            var dice = Math.randint(1, 100);
            if (dice <= this.rareDropRate) {
                var i = this.parentScene.spawnItem(this.x, this.y, {kind: this.rareDropItem});
                i.vy = -5;
                i.isEnemyDrop = true;
            } else {
                //通常アイテムドロップ判定
                var dice = Math.randint(1, 100);
                if (dice <= this.dropRate) {
                    var i = this.parentScene.spawnItem(this.x, this.y, {kind: this.dropItem});
                    i.vy = -5;
                    i.isEnemyDrop = true;
                }
            }
            this.remove();
        });
    },

    algorithm: function() {
    },

    damage: function(target) {
        if (this.mutekiTime > 0) return false;
        if (this.isMuteki) return false;

        //気絶キャンセル
        this.isStun = false;

        var dir = 0;
        if (target instanceof qft.PlayerAttack) {
            if (target.scaleX == 1) dir = 0; else dir = 180;
        } else {
            if (this.x > target.x) dir = 0; else dir = 180;
        }

        var power = target.power;
        if (target.isSlash) power *= this.damageSlash;
        if (target.isSting) power *= this.damageSting;
        if (target.isBlow) power *= this.damageBlow;
        if (target.isArrow) power *= this.damageArrow;
        if (target.isFire) power *= this.damageFire;
        if (target.isIce) power *= this.damageIce;
        if (target.isHoly) power *= this.damageHoly;
        if (target.isDark) power *= this.damageDark;
        power = Math.floor(power);
        if (!this.isSuperArmor) this.knockback(power, dir);
        this.mutekiTime = 10;
        this.hp -= power;
        if (this.hp <= 0) {
            this.hp = 0;
            this.parentScene.totalScore += this.point;
            this.parentScene.totalKill++;
            this.flare('dead');
        } else {
            this.flare('damaged', {direction: dir});

            //気絶判定
            var dice = Math.randint(1, 100);
            if (dice <= target.stunPower) this.flare('stun', {power: target.power});
        }
        app.playSE("hit");
        return true;
    },

    //プレイヤーが見える位置にいるのか判定
    isLookPlayer: function() {
        //視力外の場合は見えない
        if (this.getDistancePlayer() > this.eyesight) return false;

        //視野角外の場合は見えない
        if (this.viewAngle != 360) {
            //プレイヤーとの角度（右が360度）
            var angle = Math.floor(this.getPlayerAngle());

            //視界範囲内の判定
            if (this.direction == 0) {
                var va = this.viewAngle / 2;
                if (!(360-va < angle || angle < va)) return false;
            } else {
                var dir = this.direction;
                var va = this.viewAngle / 2;
                if (!(dir-va < angle && angle < dir+va)) return false;
            }
        }

        var result = true;
        var that = this;
        var player = this.parentScene.player;
        this.parentScene.collisionLayer.children.forEach(function(e) {
            if (e.type == "ladder" || this.type == "stairs") return;
            //自分とプレイヤー間に遮蔽物（地形当り判定）がある場合見えない
            if (phina.geom.Collision.testRectLine(e, that, player)) {
                result = false;
            }
        });
        return result;
    },

    //自分とプレイヤーを結ぶ直線の角度（弧度法）
    getPlayerAngle: function() {
        var p1 = phina.geom.Vector2(this.x, this.y);
        var p2 = phina.geom.Vector2(this.parentScene.player.x, this.parentScene.player.y);
        var p = p2.sub(p1);
        return p.toDegree();
    },

    //自分とプレイヤーを結ぶ直線の角度（ラジアン）
    getPlayerRadian: function() {
        var p1 = phina.geom.Vector2(this.x, this.y);
        var p2 = phina.geom.Vector2(this.parentScene.player.x, this.parentScene.player.y);
        var p = p2.sub(p1);
        return p.toAngle();
    },

    //体力ゲージ設置
    setupLifeGauge: function() {
        var that = this;
        //体力ゲージ
        var options = {
            width:  32,
            height: 2,
            backgroundColor: 'transparent',
            fill: 'red',
            stroke: 'white',
            strokeWidth: 1,
            gaugeColor: 'lime',
            cornerRadius: 0,
            value: this.hp,
            maxValue: this.hp,
        };
        this.lifeGauge = phina.ui.Gauge(options).addChildTo(this).setPosition(0, 0);
        this.lifeGauge.update = function() {
            this.visible = (that.hp != this.maxValue);
            this.value = that.hp;
            this.rotation = -that.rotation;
            this.scaleX = that.scaleX;

            if (this.dispTime > 150) this.visible = false;
            if (this.beforeValue == this.value) this.dispTime++; else this.dispTime = 0;
            this.beforeValue = this.value;
        };
        this.lifeGauge.dispTime = 0;
    },

    hit: function() {
    },

    //往復アルゴリズム（陸上）
    groundRoundtripAlgorithm: function(attack, dis, look) {
        var pl = this.parentScene.player;
        if (dis === undefined) dis = this.getDistancePlayer();
        if (look === undefined) look = this.isLookPlayer();

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

            //プレイヤーが近くにいたらジャンプ攻撃
            if (attack && look && !this.isJump && dis < 40) {
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

        if (this.isOnFloor || this.isJump) {
            this.vx =  this.speed;
            if (this.direction == 180) {
                this.vx *= -1;
            }
        }
    },

    //追跡アルゴリズム
    chaseAlgorithm: function(dis, look) {
        var pl = this.parentScene.player;
        if (dis === undefined) dis = this.getDistancePlayer();
        if (look === undefined) look = this.isLookPlayer();

        //プレイヤー発見
        if (look) {
            this.chaseTime = 120;
            this.stopTime = 0;
            this.flare('balloon', {pattern: "!"});
        } else {
            if (this.chaseTime == 0) this.flare('balloonerace');
        }

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

        //追跡ルーチン
        if (this.isOnFloor) {
            //これ以上進めない場合は折り返す
            var isReturnWall = false;
            var isReturnCliff = false;
            if (this.vx > 0) {
                if (this._collision[1].hit) isReturnWall = true;
                if (this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) isReturnCliff = true;
            } else if (this.vx < 0) {
                if (this._collision[3].hit) isReturnWall = true;
                if (this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) isReturnCliff = true;
            }
            if (isReturnWall || isReturnCliff) {
                if (this.chaseTime > 0) {
                    //プレイヤー追跡中で段差がある場合は飛び越える
                    if (isReturnWall) {
                        if (this.direction == 0) {
                            if (this.x < pl.x) {
                                this.isJump = true;
                                this.vy = -12;
                            }
                        } else {
                            if (this.x > pl.x) {
                                this.isJump = true;
                                this.vy = -12;
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
                            this.direction = (this.direction + 180) % 360;
                            this.vx *= -1;
                            this.flare('balloon', {pattern: "..."});
                         }
                    }
                } else {
                    this.direction = (this.direction + 180) % 360;
                    this.vx *= -1;
                }
            }
        }

        if (this.isOnFloor || this.isJump) {
            this.vx =  this.speed;
            if (this.direction == 180) {
                this.vx *= -1;
            }
        }
    },
});

//敵攻撃判定
phina.define("qft.EnemyAttack", {
    superClass: "phina.display.RectangleShape",

    //攻撃力
    power: 1,

    //有効フラグ
    isActive: true,

    //寿命
    lifeSpan: 15,

    init: function(parentScene, options) {
        options = (options || {}).$safe({width: 32, height: 32});
        this.superInit(options);
        this.parentScene = parentScene;

        this.$extend(options);
        this.time = 0;

        this.on('enterframe', e => {
            this.time++;
            if (this.time > this.lifeSpan) {
                this.remove();
                return;
            }
            if (!this.isActive) return;
            var pl = this.parentScene.player;

            //プレイヤー攻撃と当たった場合はエフェクトを出して無効化
            if (pl.isAttack && this.hitTestElement(pl.attackCollision)) {
                this.isActice = false;
                this.bump();
                return;
            }

            //プレイヤーショットとの当たり判定
            this.parentScene.playerLayer.children.forEach(function(e) {
                if (e instanceof qft.PlayerAttack && e.isCollision && this.hitTestElement(e)) {
                    e.snap(this);
                    e.isCollision = false;
                }
            }.bind(this));

            //プレイヤーとの当たり判定
            if (!pl.isDead && this.hitTestElement(pl)) {
                pl.damage(this);
            }
        });

        if (DEBUG_COLLISION) {
            phina.display.RectangleShape({width: this.width, height: this.height}).addChildTo(this).setAlpha(0.5);
        }
    },

    //判定同士がぶつかった場合の処理
    bump: function() {
        this.parentScene.spawnEffect(this.x, this.y, {name: "hit"});
        if (this.master) {
            var pl = this.parentScene.player;
            pl.knockback(5, this.master.direction);
            this.master.knockback(5, (this.master.direction + 180) % 360);
            app.playSE("tinkling");
        }
    },
});
