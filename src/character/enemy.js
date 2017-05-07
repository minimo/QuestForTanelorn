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
    power: 10,

    //気絶確率
    stunPower: 1,

    //視力
    eyesight: 64,

    //視野角
    viewAngle: 90,

    //進行方向（0:右 180:左）
    direction: 0,

    //ポイント
    point: 0,

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

    init: function(parentScene, options) {
        options = options || {};
        this.superInit(parentScene, options);
        this.setupAnimation();
        this.options = options;
        this.level = options.level || 0;

        this.on('enterframe', function() {
            //画面外の場合は動作停止
            if (!this.onScreen) return;

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

            var pl = this.parentScene.player;
            //プレイヤー攻撃との当たり判定
            if (pl.attack && this.hitTestElement(pl.attackCollision)) {
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
            //プレイヤーとの当たり判定
            if (!this.isDead && !pl.isDead && this.hitTestElement(pl)) {
                this.hit();
                pl.damage(this);
            }

            if (this.stopTime == 0) this.algorithm();
        });

        this.on('dead', function() {
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
        if (this.muteki) return false;

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
        this.knockback(power, dir);
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
        };
    },

    hit: function() {
    },
});

//敵攻撃判定
phina.define("qft.EnemyAttack", {
    superClass: "phina.display.RectangleShape",

    //攻撃力
    power: 1,

    //有効フラグ
    isActive: true,

    init: function(parentScene, options) {
        options = (options || {}).$safe({width: 32, height: 32});
        this.superInit(options);
        this.parentScene = parentScene;

        this.$extend(options);
        this.time = 0;
    },

    update: function() {
        if (!this.isActive) return;
        var pl = this.parentScene.player;

        //プレイヤーとの当たり判定
        if (!pl.isDead && this.hitTestElement(pl)) {
            pl.damage(this);
        }
        this.time++;
    },
});
