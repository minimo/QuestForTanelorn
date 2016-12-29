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
    jump: false,

    //床上フラグ
    onFloor: false,

    //無敵フラグ
    muteki: false,

    //経過フレーム
    time: 0,

    init: function(options, parentScene) {
        this.superInit(options);
        this.parentScene = parentScene;

        //地形当り判定用（0:上 1:右 2:下 3:左）
        this._collision = [];
        this._collision[0] = phina.display.DisplayElement({width: 20, height: 3}).setPosition(0, -16);
        this._collision[1] = phina.display.DisplayElement({width: 3, height: 20}).setPosition( 16, 0);
        this._collision[2] = phina.display.DisplayElement({width: 20, height: 3}).setPosition(0,  16);
        this._collision[3] = phina.display.DisplayElement({width: 3, height: 20}).setPosition(-16, 0);

        this.on('enterframe', function(e) {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.9;
            this.vy += 0.9;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;

            this._collision[0].setPosition(this.x, this.y - 16);
            this._collision[1].setPosition(this.x + 16, this.y);
            this._collision[2].setPosition(this.x, this.y + 16);
            this._collision[3].setPosition(this.x - 16, this.y);
            this.getCollision();

            this.time++;
        });
    },

    getCollision: function() {
        var that = this;
        this.parentScene.collisionLayer.children.forEach(function(e) {
            //下側
            if (that.vy > 0 && e.hitTestElement(that._collision[2])) {
                that.y = (e.y-e.height/2)-16;
                that.vy = 0;
                that.jump = false;
                that.onFloor = true;
            } else {
                that.onFloor = false;
            }
        });
    },
});
