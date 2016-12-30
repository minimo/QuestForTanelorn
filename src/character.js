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

    //ジャンプ中フラグ
    isJump: false,

    //床をスルーするか
    throughFloor: false,

    //床上フラグ
    onFloor: false,

    //死亡フラグ
    isDead: false,

    //無敵フラグ
    isMuteki: false,

    //現在実行中アクション
    nowAction: "stand",

    //前フレーム実行アクション
    beforeAction: "",

    //アニメーション進行可能フラグ   
    isAdvanceAnimation: true,

    //アニメーション間隔
    advanceTime: 6,

    //経過フレーム
    time: 0,

    init: function(options, parentScene) {
        this.superInit(options);
        this.parentScene = parentScene;

        //地形当り判定用（0:上 1:右 2:下 3:左）
        this._collision = [];
        this._collision[0] = phina.display.DisplayElement({width: 8, height: 3});
        this._collision[1] = phina.display.DisplayElement({width: 3, height: 8});
        this._collision[2] = phina.display.DisplayElement({width: 8, height: 3});
        this._collision[3] = phina.display.DisplayElement({width: 3, height: 8});

        this.on('enterframe', function(e) {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.8;
            this.vy += 0.9;
            if (Math.abs(this.vx) < 0.1) {
                this.vx = 0;
                this.x = Math.floor(this.x);
            }
            if (Math.abs(this.vy) < 0.1) {
                this.vy = 0;
                this.y = Math.floor(this.y);
            }

            this._collision[0].setPosition(this.x, this.y - 16);
            this._collision[1].setPosition(this.x + 10, this.y-3);
            this._collision[2].setPosition(this.x, this.y + 16);
            this._collision[3].setPosition(this.x - 10, this.y-3);
            this.getCollision();

            if (this.y > SC_H) {
                this.dead = true;
            }

            //アクション変更を検知
            if (this.nowAction != this.beforeAction) {
                this.time = 0;
                this.index = -1;
                this.isAdvanceAnimation = true;
                this.advanceTime = 6;
                if (this.nowAction == "attack") this.advanceTime = 3;

            } else {
                //歩行アニメーションの場合は移動している時のみ進める   
                if (this.nowAction == "walk" && this.vx == 0) {
                    this.isAdvanceAnimation = false;
                } else {
                    this.isAdvanceAnimation = true;
                }
            }

            //アニメーション
            if (this.isAdvanceAnimation && this.time % this.advanceTime == 0) {
                this.index = (this.index+1) % this.frame[this.nowAction].length;
                if (this.frame[this.nowAction][this.index] == "stop") this.index--;
                this.sprite.frameIndex = this.frame[this.nowAction][this.index];
                if (this.attack && this.index == 1) {
                    this.attack = false;
                }
            }

            this.time++;
            this.beforeAction = this.nowAction;

        });
    },

    getCollision: function() {
        var that = this;
        this.onFloor = false;
        this.parentScene.collisionLayer.children.forEach(function(e) {
            if (that.throughFloor) return;
            //上側
            if (that.vy < 0 && e.hitTestElement(that._collision[0])) {
                that.y = e.y+e.height*(1-e.originY)+16;
                that.vy = 1;
            }
            //下側
            if (that.vy > 0 && e.hitTestElement(that._collision[2])) {
                that.y = e.y-e.height*e.originY-16;
                that.vy = 0;
                that.isJump = false;
                that.onFloor = true;
            }
            //右側
            if (that.vx > 0 && e.hitTestElement(that._collision[1])) {
                that.x = e.x-e.width*e.originX-10;
                that.vx = 0;
            }
            //左側
            if (that.vx < 0 && e.hitTestElement(that._collision[3])) {
                var res = e.hitTestElement(that._collision[3]);
                that.x = e.x+e.width*(1-e.originX)+10;
                that.vx = 0;
            }
        });
    },

    setupAnimation: function() {
        this.spcialAction = false;
        this.frame = [];
        this.frame["stand"] = [13, 14];
        this.frame["jump"] = [0, "stop"];
        this.frame["walk"] = [0];
        this.frame["up"] =   [0];
        this.frame["down"] = [0];
        this.frame["attack"] = [0, "stop"];
        this.index = 0;
    },
});
