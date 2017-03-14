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

    //視力
    eyesight: 64,

    //視野角
    viewAngle: 90,

    //進行方向（0:右 180:左）
    direction: 0,

    //ポイント
    point: 0,

    init: function(parentScene, options) {
        options = options || {};
        this.superInit(parentScene, options);
        this.$extend(options);
        this.setupAnimation();

        this.on('enterframe', function() {
            //向きの指定
            if (this.vx != 0) {
                if (this.vx > 0) {
                    this.scaleX = 1;
                } else {
                    this.scaleX = -1;
                }
            }

            //ステージクリアの場合は当たり判定無し
            if (this.parentScene.isStageCler) return;

            var pl = this.parentScene.player;
            //プレイヤー攻撃との当たり判定
            if (pl.attack && this.hitTestElement(pl.attackCollision)) {
                this.damage(pl);
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
        });

        this.on('dead', function() {
            this.remove();
        });
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
        this.knockback(power, dir);
        this.mutekiTime = 10;
        this.hp -= power;
        if (this.hp <= 0) {
            this.hp = 0;
            this.flare('dead');
            this.parentScene.player.kill++;
            this.parentScene.totalScore += this.point;
        }
        app.playSE("hit");
        if (dir == 0) this.direction = 180; else this.direction = 0;
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
