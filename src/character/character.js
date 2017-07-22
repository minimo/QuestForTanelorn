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

    //初期座標
    firstX: 0,
    firstY: 0,

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
    isOnFloor: false,

    //乗っているオブジェクト
    floorObject: null,

    //はしご上フラグ
    isOnLadder: false,

    //階段上フラグ
    isOnStairs: false,

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
    isMuteki: false,

    //無敵時間
    mutekiTime: 0,

    //現在実行中アクション
    nowAnimation: "stand",

    //前フレーム実行アクション
    beforeAnimation: "",

    //アニメーション進行可能フラグ
    isAdvanceAnimation: true,

    //アニメーション変更検知フラグ
    isChangeAnimation: false,

    //アニメーション間隔
    animationInterval: 6,

    //地形無視
    ignoreCollision: false,

    //スクリーン内フラグ
    onScreen: false,

    //活動フラグ
    isActive: true,

    //影表示
    isShadow: false,
    shadowY: 0,

    //識別フラグ
    isPlayer: false,
    isEnemy: false,
    isItemBox: false,
    isItem: false,
    isBlock: false,
    isMapAccessory: false,

    //経過フレーム
    time: 0,

    init: function(parentScene, options) {
        this.superInit(options);
        this.parentScene = parentScene;
        this.boundingType = "rect";
        this.tweener.setUpdateType('fps');

        this.options = options || {};
        this.setupAnimation();

        //当たり判定情報初期化
        if (!this.isMapAccessory) this.initCollision(options);

        //吹き出し
        var that = this;
        this.balloon = null;
        this.lastBalloon = "";
        this.balloonTime = 0;
        this.on('balloon', e => {
            if (this.isStun) return;
            if (this.time > this.balloonTime) this.lastBalloon = "";
            if (this.lastBalloonPattern == e.pattern && !e.force) return;
            if (this.balloon) this.balloon.remove();
            e.$safe({x: 0, y: -this.height/2-10});
            this.balloon = qft.Character.balloon({pattern: e.pattern, lifeSpan: e.lifeSpan, animationInterval: e.animationInterval})
                .addChildTo(this)
                .setPosition(e.x, e.y);
            this.balloon.on('removed', e => {
                that.balloon = null;
                that.flare('balloonend');
            });
            this.lastBalloonPattern = e.pattern;
            this.balloonTime = this.time + 120;
        });
        this.on('balloonerace', e => {
            if (this.balloon == null) return;
            this.balloon.remove();
            this.balloon = null;
            this.balloonTime = 0;
        });

        //気絶状態
        this.on('stun', e => {
            this.isStun = true;
            this.stopTime = e.power * 10;
            this.balloon = qft.Character.balloon({pattern: "stun", lifeSpan: this.stopTime})
                .addChildTo(this)
                .setPosition(0, -this.height/2-10);
            this.lastBalloon = e.pattern;
            this.balloonTime = this.time + 120;
        });

        this.on('enterframe', function(e) {
            if (this.parentScene.pauseScene) return;

            //初期座標の記録と初回フレーム処理
            if (this.time == 0) {
                this.firstX = this.x;
                this.firstY = this.y;
                this.firstFrame();
            }

            //画面内判定
            var ps = this.parentScene;
            if (ps.screenX-SC_W < this.x && this.x < ps.screenX + SC_W*2 && 
                ps.screenY-SC_H < this.y && this.y < ps.screenY + SC_H*2) {
                this.onScreen = true;
            } else {
                this.onScreen = false;
            }
            //画面外の場合は動作停止
//            if (!this.onScreen) return;

            //活動フラグ
            if (!this.isActive) return;

            this.x += this.vx;
            if (this.isOnFloor) {
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
            if (!this.isMapAccessory) {
                this.resetCollisionPosition();
                this.checkMapCollision();
            }

            //画面外落ち
            if (!this.isDead && this.y > this.parent.parent.map.height) this.dropDead();

            //アニメーション
            if (this.sprite && this.isAdvanceAnimation && this.time % this.animationInterval == 0) {
                this.index = (this.index+1) % this.frame[this.nowAnimation].length;
                //次フレーム番号が特殊指定の場合
                var next = this.frame[this.nowAnimation][this.index];
                if (next == "stop") {
                    //停止
                    this.index--;
                } else if (next == "remove") {
                    //リムーブ
                    this.remove();
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
            if (this.isStun && this.stopTime == 0) {
                this.isStun = false;
                this.flare('balloonerace');
            }

            if (this.balloon) this.balloon.scaleX = this.scaleX;

            //乗っている床の取得
            if (this.isOnFloor) {
                this.floorObject = this._collision[2].hit;
            } else {
                this.floorObject = null;
            }

            //影処理
            if (this.shadowSprite) {
                this.shadowSprite.x = this.x;
                this.shadowSprite.y = this.shadowY;
            }

            this.time++;
            this.beforeAnimation = this.nowAnimation;
        });

        this.on('added', () => {
            this.one('enterframe', () => {
                if (this.isShadow) this.setupShadow();
            });
        });

        this.on('removed', () => {
            if(this.shadowSprite) this.shadowSprite.remove();
        });
    },

    //一回目のenterframeで一度だけ呼ばれる
    firstFrame: function() {
    },

    //影表示セットアップ
    setupShadow: function() {
        var that = this;
        this.shadowSprite = phina.display.Sprite("shadow", 24, 8)
            .addChildTo(this.parentScene.shadowLayer)
            .setAlpha(0.5);
    },

    //当たり判定情報初期化
    initCollision: function(options) {
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
        return this;
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
        power = power || 0;
        if (power == 0) return;
        if (direction === undefined) direction = (this.direction + 180) % 360;

        var back = 32 + Math.floor(power / 10);
        var sx = Math.cos(direction.toRadian());
        var sy = Math.sin(direction.toRadian());

        //ノックバック先に壁が無いかチェック
        var chk = this.checkMapCollision2(this.x + sx * back, this.y + sy * back, 8, 8);
        if (chk) {
            //壁に当たる所までバックする
            var c = chk[0];
            switch (direction) {
                case 0:
                    back = (c.x - c.width / 2) - this.x;
                    back *= 0.8;
                    break;
                case 180:
                    back = this.x - (c.x + c.width / 2);
                    back *= 0.8;
                    break;
                default:
            }
        }

        this.tweener.clear().by({x: sx * back, y: sy * back}, 10, "easeOutElastic");
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

        this.isOnLadder = false;
        this.isOnStairs = false;

        if (this.shadowSprite) {
            //キャラクターの下方向にレイを飛ばして直下の地面座標を取る
            this.shadowY = 99999;
            var p1 = phina.geom.Vector2(this.x, this.y);
            var p2 = phina.geom.Vector2(this.x, this.y + 128);
            this.shadowSprite.visible = false;
        }

        //地形接触判定
        this.parentScene.collisionLayer.children.forEach(e => {
            if (this.isDrop) return;
            if (e.ignore || e == this.throughFloor) return;
            if (e.type == "ladder" || e.type == "stairs") return;

            //上側
            if (this.vy < 0  && e.hitTestElement(this._collision[0])) this._collision[0].hit = e;
            //下側
            if (this.vy >= 0 && e.hitTestElement(this._collision[2])) this._collision[2].hit = e;
            //右側
            if (this.vx > 0  && e.hitTestElement(this._collision[1])) this._collision[1].hit = e;
            //左側
            if (this.vx < 0  && e.hitTestElement(this._collision[3])) this._collision[3].hit = e;

            if (this.shadowSprite) {
                var x = e.x - e.width / 2;
                var y = e.y - e.height / 2;
                var p3 = phina.geom.Vector2(x, y);
                var p4 = phina.geom.Vector2(x + e.width, y);                    
                if (phina.geom.Collision.testLineLine(p1, p2, p3, p4) && y < this.shadowY) {
                    this.shadowSprite.setPosition(this.x, y);
                    this.shadowSprite.visible = true;
                    this.shadowY = y;
                }
            }
        });

        //当たり判定結果反映
        this.collisionProcess();

        //はしごのみ判定
        this.parentScene.collisionLayer.children.forEach(e => {
            //梯子判定
            if (e.type == "ladder" || e.type == "stairs") {
                if (this.ladderCollision && e.hitTestElement(this.ladderCollision)) {
                    this.isOnLadder = true;
                    this.isOnStairs = (e.type == "stairs");
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
        this.isOnFloor = false;

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
            this.isOnFloor = true;
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
        return this;
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
                that.isOnFloor = true;
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
        return this;
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

    setupAnimation: function() {
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
        this.isChangeAnimation = true;
        return this;
    },

    //プレイヤーからの直線距離
    getDistancePlayer: function() {
        var x = this.x-this.parentScene.player.x;
        var y = this.y-this.parentScene.player.y;
        return Math.sqrt(x*x+y*y);
    },

    //オブジェクト間の直線距離
    getDistance: function(element) {
        var x = this.x - element.x;
        var y = this.y - element.y;
        return Math.sqrt(x*x+y*y);
    },

    //自分と他エレメントを結ぶ直線の角度（弧度法）
    getAngle: function(element) {
        var p1 = phina.geom.Vector2(this.x, this.y);
        var p2 = phina.geom.Vector2(element.x, element.y);
        var p = p2.sub(p1);
        return p.toDegree();
    },

    //自分と他エレメントを結ぶ直線の角度（ラジアン）
    getAngleRadian: function(element) {
        var p1 = phina.geom.Vector2(this.x, this.y);
        var p2 = phina.geom.Vector2(element.x, element.y);
        var p = p2.sub(p1);
        return p.toAngle();
    },

    //物理現象情報のみオブジェクトで取得
    getPhysics: function() {
        return {
            vx: this.vx,
            vy: this.vy,
            gravity: this.gravity,
            friction: this.friction,
            rebound: this.rebound,
        };
    },

    //移動パスの設定
    setPath: function(path, loop) {
        this.path = [];
        this.loop = loop;

        //パス情報の作成
        var sum = 0;
        var ptb = null;
        for (var i = 0; i < path.polyline.length; i++) {
            var pt = phina.geom.Vector2(path.x + path.polyline[i].x, path.y + path.polyline[i].y);
            if (i > 0) {
                sum += Math.floor(ptb.distance(pt));
            }
            pt.time = sum;
            this.path.push(pt);
            ptb = pt;
        }

        //ループ有り指定の場合、始点の座標を終点に加える
        if (loop) {
            var end = phina.geom.Vector2(path.x + path.polyline[path.polyline.length - 1].x, path.y + path.polyline[path.polyline.length - 1].y);
            var start = phina.geom.Vector2(path.x + path.polyline[0].x, path.y + path.polyline[0].y);
            sum += Math.floor(start.distance(end));
            start.time = sum;
            this.path.push(start);
        }
        this.path.maxTime = sum;

        return this;
    },

    //パス座標の取得
    getPathPosition: function(time) {
        if (!this.path || time < 0) return null;
        time %= this.path.maxTime;

        var len = this.path.length;
        for (var i = 0; i < len; i++) {
            var p = this.path[i];
            if (time == p.time) return p;
            if (time < p.time) {
                var p2 = this.path[i - 1];
                var t = (time - p2.time) / (p.time - p2.time);
                return phina.geom.Vector2.lerp(p2, p, t);
            }
        }
        return null;
    },
});
