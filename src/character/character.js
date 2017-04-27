/*
 *  character.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Character", {
    superClass: "phina.display.DisplayElement",

    //加速度
    vx: 0,
    vy: 0,

    //重力加速度
    gravity: 0.9,

    //横移動減衰率
    friction: 0.5,

    //床移動減衰率
    floorFriction: 0.5,

    //反発係数
    rebound: 0,

    //ジャンプ中フラグ
    isJump: false,

    //スルーしたフロア
    throughFloor: null,

    //床上フラグ
    onFloor: false,

    //はしご上フラグ
    onLadder: false,

    //階段上フラグ
    onStairs: false,

    //はしご掴みフラグ
    isCatchLadder: false,

    //死亡フラグ
    isDead: false,

    //落下死亡フラグ
    isDrop: false,

    //気絶フラグ
    isStun: false,

    //操作停止時間
    stopTime: 0,

    //無敵フラグ
    muteki: false,

    //無敵時間
    mutekiTime: 0,

    //現在実行中アクション
    nowAnimation: "stand",

    //前フレーム実行アクション
    beforeAnimation: "",

    //アニメーション進行可能フラグ
    isAdvanceAnimation: true,

    //アニメーション間隔
    advanceTime: 6,

    //地形無視
    ignoreCollision: false,

    //スクリーン内フラグ
    onScreen: false,

    //識別フラグ
    isPlayer: false,
    isEnemy: false,
    isItemBox: false,
    isItem: false,
    isBlock: false,

    //経過フレーム
    time: 0,

    init: function(parentScene, options) {
        this.superInit(options);
        this.parentScene = parentScene;
        this.boundingType = "rect";
        this.tweener.setUpdateType('fps');
        this.setupAnimation(options);

        //当り判定用（0:上 1:右 2:下 3:左）
        var w = Math.floor(this.width/4);
        var h = Math.floor(this.height/4);
        this._collision = [];
        this._collision[0] = phina.display.RectangleShape({width: w, height: 2});
        this._collision[1] = phina.display.RectangleShape({width: 2, height: h});
        this._collision[2] = phina.display.RectangleShape({width: w, height: 2});
        this._collision[3] = phina.display.RectangleShape({width: 2, height: h});
        this.collisionResult = null;

        //当たり判定チェック位置オフセット
        this.offsetCollisionX = options.offsetCollisionX || 0;
        this.offsetCollisionY = options.offsetCollisionY || 0;

        //当たり判定情報再設定
        this.setupCollision();

        //当たり判定デバッグ用
        if (DEBUG_COLLISION) {
            this.one('enterframe', e => {
                this._collision[0].addChildTo(this.parentScene.objLayer);
                this._collision[1].addChildTo(this.parentScene.objLayer);
                this._collision[2].addChildTo(this.parentScene.objLayer);
                this._collision[3].addChildTo(this.parentScene.objLayer);
                this._collision[0].alpha = 0.3;
                this._collision[1].alpha = 0.3;
                this._collision[2].alpha = 0.3;
                this._collision[3].alpha = 0.3;
                //ダメージ当たり判定表示
                var c = phina.display.RectangleShape({width: this.width, height: this.height}).addChildTo(this);
                c.alpha = 0.3;
            });
            this.one('removed', e => {
                this._collision[0].remove();
                this._collision[1].remove();
                this._collision[2].remove();
                this._collision[3].remove();
            });
        }

        //吹き出し
        var that = this;
        this.balloon = null;
        this.lastBalloon = "";
        this.balloonTime = 0;
        this.on('balloon', e => {
            if (this.time > this.balloonTime) this.lastBalloon = "";
            if (this.lastBalloon == e.pattern) return;
            if (this.balloon) this.balloon.remove();
            e.$safe({x: 0, y: -16});
            this.balloon = qft.Character.balloon({pattern: e.pattern, lifeSpan: e.lifeSpan, animationInterval: e.animationInterval})
                .addChildTo(this)
                .setPosition(e.x, e.y);
            this.lastBalloon = e.pattern;
            this.balloonTime = this.time + 120;
        });
        this.on('balloonerace', e => {
            if (this.balloon == null) return;
            this.balloon.remove();
            this.balloon = null;
            this.balloonTime = 0;
        });

        this.on('enterframe', function(e) {
            //画面内判定
            var ps = this.parentScene;
            if (ps.screenX-SC_W < this.x && this.x < ps.screenX + SC_W*2 && 
                ps.screenY-SC_H < this.y && this.y < ps.screenY + SC_H*2) {
                this.onScreen = true;
            } else {
                this.onScreen = false;
            }
            //画面外の場合は動作停止
            if (!this.onScreen) return;

            this.x += this.vx;
            if (this.onFloor) {
                this.vx *= this.floorFriction;
            } else {
                this.vx *= this.friction;
            }

            if (this.isCatchLadder) {
                this.y += this.vy;
                this.vy = 0;
            } else {
                this.y += this.vy;
                this.vy += this.gravity;
                //落下速度上限
                if (this.vy > 20) this.vy = 20;
            }
            if (Math.abs(this.vx) < 0.01) this.vx = 0;
            if (Math.abs(this.vy) < 0.01) this.vy = 0;

            //当たり判定
            this.resetCollisionPosition();
            this.checkMapCollision();

            //画面外落ち
            if (!this.isDead && this.y > this.parent.parent.map.height) this.dropDead();

            //アニメーション
            if (this.sprite && this.isAdvanceAnimation && this.time % this.advanceTime == 0) {
                this.index = (this.index+1) % this.frame[this.nowAnimation].length;
                //次フレーム番号が特殊指定の場合
                var next = this.frame[this.nowAnimation][this.index];
                if (next == "stop") {
                    //停止
                    this.index--;
                } else if (typeof next === "string") {
                    //指定アニメーションへ変更
                    this.setAnimation(next);
                } else {
                    this.sprite.frameIndex = next;
                }
            }

            //無敵時間処理
            if (this.mutekiTime > 0) {
                if (this.mutekiTime % 2 == 0) this.visible = !this.visible;
                this.mutekiTime--;
            } else {
                this.visible = true;
            }

            //操作停止時間
            this.stopTime--;
            if (this.stopTime < 0) this.stopTime = 0;

            //操作停止時間が終わったら気絶解除
            if (this.isStun && this.stopTime == 0) this.isStun = false;

            if (this.balloon) this.balloon.scaleX = this.scaleX;

            this.time++;
            this.beforeAnimation = this.nowAnimation;
        });
    },

    //画面外落ち
    dropDead: function() {
        this.isDead = true;
        this.isDrop = true;
        this.vx = 0;
        this.vy = -10;
        this.tweener.clear()
            .wait(60)
            .call(function(){
                this.flare('dead');
                this.remove();
            }.bind(this));
        return this;
    },

    //ノックバックモーション
    knockback: function(power, direction) {
        if (power == 0) return;
        var sx = Math.cos(direction.toRadian());
        var sy = Math.sin(direction.toRadian());
        var back = 32;
        this.tweener.clear().by({x: back*sx, y: back*sy}, 10, "easeOutElastic");
        this.vx = 0;
        this.vy = 0;
        return this;
    },

    //地形当たり判定
    checkMapCollision: function() {
        if (this.ignoreCollision) return this;

        this._collision[0].hit = null;
        this._collision[1].hit = null;
        this._collision[2].hit = null;
        this._collision[3].hit = null;

        var that = this;
        this.onLadder = false;
        this.onStairs = false;

        //地形接触判定
        this.parentScene.collisionLayer.children.forEach(function(e) {
            if (that.isDrop) return;
            if (e.ignore || e == that.throughFloor) return;
            if (e.type == "ladder" || e.type == "stairs") return;

            //上側
            if (that.vy < 0  && e.hitTestElement(that._collision[0])) that._collision[0].hit = e;
            //下側
            if (that.vy >= 0 && e.hitTestElement(that._collision[2])) that._collision[2].hit = e;
            //右側
            if (that.vx > 0  && e.hitTestElement(that._collision[1])) that._collision[1].hit = e;
            //左側
            if (that.vx < 0  && e.hitTestElement(that._collision[3])) that._collision[3].hit = e;
        });

        //当たり判定結果反映
        this.collisionProcess();

        //はしごのみ判定
        this.parentScene.collisionLayer.children.forEach(function(e) {
            //梯子判定
            if (e.type == "ladder" || e.type == "stairs") {
                if (that.ladderCollision && e.hitTestElement(that.ladderCollision)) {
                    that.onLadder = true;
                    that.onStairs = (e.type == "stairs");
                }
                return;
            }
        });
        return this;
    },

    //当たり判定結果反映処理
    collisionProcess: function() {
        var w = Math.floor(this.width/2)+6;
        var h = Math.floor(this.height/2)+6;
        this.onFloor = false;

        //上側接触
        if (this._collision[0].hit && !this.isCatchLadder) {
            var ret = this._collision[0].hit;
            this.y = ret.y+ret.height*(1-ret.originY)+h;
            this.vy = 0;
            this.resetCollisionPosition();
            if (ret.collisionScript) {
                ret.collisionScript(this, 0);
            }
        }
        //下側接触
        if (this._collision[2].hit && !this.isCatchLadder) {
            var ret = this._collision[2].hit;
            this.y = ret.y-ret.height*ret.originY-h;
            this.x += ret.vx || 0;
            if (ret.vy > 0) this.y += ret.vy || 0;
            this.isJump = false;
            this.onFloor = true;
            this.floorFriction = ret.friction == undefined? 0.5: ret.friction;

            this.throughFloor = null;
            if (this.rebound > 0) {
                this.isJump = true;
                this.vy = -this.vy * this.rebound;
            } else {
                this.vy = 0;
            }
            this.resetCollisionPosition();
            if (ret.collisionScript) {
                ret.collisionScript(this, 2);
            }
        }
        //右側接触
        if (this._collision[1].hit && !this.isCatchLadder) {
            var ret = this._collision[1].hit;
            this.x = ret.x-ret.width*ret.originX-w;
            this.vx = 0;
            this.resetCollisionPosition();
            if (ret.collisionScript) {
                ret.collisionScript(this, 1);
            }
        }
        //左側接触
        if (this._collision[3].hit && !this.isCatchLadder) {
            var ret = this._collision[3].hit;
            this.x = ret.x+ret.width*(1-ret.originX)+w;
            this.vx = 0;
            this.resetCollisionPosition();
            if (ret.collisionScript) {
                ret.collisionScript(this, 3);
            }
        }
    },

    //地形当たり判定（特定地点チェックのみ）衝突したものを配列で返す
    checkMapCollision2: function(x, y, width, height) {
        x = x || this.x;
        y = y || this.y;
        width = width || 1;
        height = height || 1;
        var c = phina.display.DisplayElement({width: width, height: height}).setPosition(x, y);
        var ret = null;
        this.parentScene.collisionLayer.children.forEach(function(e) {
            if (e.type == "ladder" || e.type == "stairs") return;
            if (e.hitTestElement(c)) {
                if (ret == null) ret = [];
                ret.push(e);
            }
        });
        return ret;
    },

    //キャラクタ同士当たり判定（ブロックのみ）
    checkCharacterCollision: function() {
        if (this.ignoreCollision) return;
        if (this.isDrop) return;

        var ret = [];
        var that = this;
        this.parentScene.objLayer.children.forEach(function(e) {
            if (!e.isBlock) return;
            if (e.isDead) return;

            //上側
            if (that.vy < 0 && e.hitTestElement(that._collision[0])) {
                that.y = e.y+e.height*(1-e.originY)+16;
                that.vy = 1;
                ret[0] = e;
                that.resetCollisionPosition();
            }
            //下側
            if (that.vy > 0 && e.hitTestElement(that._collision[2])) {
                that.y = e.y-e.height*e.originY-16;
                that.vx = e.vx;
                that.vy = 0;
                that.isJump = false;
                that.onFloor = true;
                that.throughFloor = null;
                ret[2] = e;
                if (that.rebound > 0) {
                    that.isJump = true;
                    that.vy = -that.vy * that.rebound;
                } else {
                    that.vy = 0;
                }
                that.resetCollisionPosition();
            }
            //右側
            if (that.vx > 0 && e.hitTestElement(that._collision[1])) {
                that.x = e.x-e.width*e.originX-10;
                that.vx = 0;
                ret[1] = e;
                that.resetCollisionPosition();
            }
            //左側
            if (that.vx < 0 && e.hitTestElement(that._collision[3])) {
                that.x = e.x+e.width*(1-e.originX)+10;
                that.vx = 0;
                ret[3] = e;
                that.resetCollisionPosition();
            }
        });
        return ret;
    },

    //当たり判定用エレメントの再設定
    setupCollision: function() {
        return;
    },

    //当たり判定用エレメントの位置再セット
    resetCollisionPosition: function() {
        var w = Math.floor(this.width/2) + 6 + this.offsetCollisionX;
        var h = Math.floor(this.height/2)+ 6 + this.offsetCollisionY;
        this._collision[0].setPosition(this.x, this.y - h);
        this._collision[1].setPosition(this.x + w, this.y);
        this._collision[2].setPosition(this.x, this.y + h);
        this._collision[3].setPosition(this.x - w, this.y);
        return this;
    },

    setupAnimation: function(options) {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [13, 14];
        this.frame["jump"] = [0, "stop"];
        this.frame["walk"] = [0];
        this.frame["up"] =   [0];
        this.frame["down"] = [0];
        this.frame["attack"] = [0, "stop"];
        this.index = 0;
        return this;
    },

    setAnimation: function(animName) {
        if (!this.frame[animName]) return;
        if (animName == this.nowAnimation) return;
        this.nowAnimation = animName;
        this.index = -1;
        return this;
    },

    //プレイヤーからの直線距離
    getDistancePlayer: function() {
        var x = this.x-this.parentScene.player.x;
        var y = this.y-this.parentScene.player.y;
        return Math.sqrt(x*x+y*y);
    },

    //物理現象情報のみオブジェクトで取得
    getPhisics: function() {
        return {
            vx: this.vx,
            vy: this.vy,
            gravity: this.gravity,
            friction: this.friction,
            rebound: this.rebound,
        };
    },
});
