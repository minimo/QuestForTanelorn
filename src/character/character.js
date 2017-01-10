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

    //反発係数
    rebound: 0,

    //ジャンプ中フラグ
    isJump: false,

    //スルーしたフロア
    throughFloor: null,

    //床上フラグ
    onFloor: false,

    //死亡フラグ
    isDead: false,

    //落下死亡フラグ
    isDrop: false,

    //操作停止時間
    stopTime: 0,

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

    //経過フレーム
    time: 0,

    init: function(options, parentScene) {
        this.superInit(options);
        this.parentScene = parentScene;
        this.boundingType = "rect";

        //当り判定用（0:上 1:右 2:下 3:左 4:攻撃）
        this._collision = [];
        this._collision[0] = phina.display.DisplayElement({width: 8, height: 3});
        this._collision[1] = phina.display.DisplayElement({width: 3, height: 8});
        this._collision[2] = phina.display.DisplayElement({width: 8, height: 3});
        this._collision[3] = phina.display.DisplayElement({width: 3, height: 8});

        this.on('enterframe', function(e) {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= this.friction;
            this.vy += this.gravity;
            if (Math.abs(this.vx) < 0.1) {
                this.vx = 0;
                this.x = Math.floor(this.x);
            }
            if (Math.abs(this.vy) < 0.1) {
                this.vy = 0;
                this.y = Math.floor(this.y);
            }

            //当たり判定
            this.resetCollisionPosition();
            this.checkMapCollision();

            //画面外落ち
            if (!this.isDead && this.y > this.parentScene.map.height) this.dropDead();

            //アニメーション
            if (this.isAdvanceAnimation && this.time % this.advanceTime == 0) {
                this.index = (this.index+1) % this.frame[this.nowAnimation].length;
                if (this.frame[this.nowAnimation][this.index] == "stop") this.index--;
                this.sprite.frameIndex = this.frame[this.nowAnimation][this.index];
            }

            //無敵時間処理
            if (this.mutekiTime > 0) {
                if (this.mutekiTime % 2 == 0) this.visible = !this.visible;
                this.mutekiTime--;
            } else {
                this.visible = true;
            }

            //操作停止時間
            if (this.stopTime > 0) this.stopTime--;

            this.time++;
            this.beforeAnimation = this.nowAnimation;
        });
        this.setupAnimation();
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
    },

    //ノックバックモーション
    knockback: function(pow, direction) {
        if (pow == 0) return;
        var sx = Math.cos(direction.toRadian());
        var sy = Math.sin(direction.toRadian());
        var back = 16+16*pow;
        this.tweener.clear().by({x: back*sx, y: back*sy}, 10, "easeOutElastic");
        this.vx = 0;
        this.vy = 0;
    },

    //地形当たり判定
    checkMapCollision: function() {
        if (this.ignoreCollision) return;
        var ret = [];
        var that = this;
        this.onFloor = false;
        this.parentScene.collisionLayer.children.forEach(function(e) {
            if (that.isDrop) return;
            if (e == that.throughFloor) return;
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

    //地形当たり判定（特定地点チェックのみ）
    checkMapCollision2: function(x, y, width, height) {
        x = x || this.x;
        y = y || this.y;
        width = width || 1;
        height = height || 1;
        var c = phina.display.DisplayElement({width: width, height: height}).setPosition(x, y);
        var ret = null;
        this.parentScene.collisionLayer.children.forEach(function(e) {
            if (e.hitTestElement(c)) ret = e;
        });
        return ret;
    },

    //キャラクタ同士当たり判定
    checkCharacterCollision: function() {
        if (this.ignoreCollision) return;
        var ret = [];
        var that = this;
        this.parentScene.objLayer.children.forEach(function(e) {
            if (that.isDrop) return;
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

    //当たり判定用エレメントの位置再セット
    resetCollisionPosition: function() {
        this._collision[0].setPosition(this.x, this.y - 16);
        this._collision[1].setPosition(this.x + 10, this.y - 4);
        this._collision[2].setPosition(this.x, this.y + 16);
        this._collision[3].setPosition(this.x - 10, this.y - 4);
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
    },

    setAnimation: function(animName) {
        if (!this.frame[animName]) return;
        if (animName == this.nowAnimation) return;
        this.nowAnimation = animName;
        this.index = -1;
    },
});
