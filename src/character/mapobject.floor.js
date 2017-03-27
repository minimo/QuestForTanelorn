/*
 *  mapobject.floor.js
 *  2017/03/27
 *  @auther minimo  
 *  This Program is MIT license.
 */

qft.MapObject = qft.MapObject || {};

//可動フロアクラス
phina.define("qft.MapObject.Floor", {
    superClass: "qft.Character",

    id: null,

    //識別フラグ
    isFloor: true,

    //重力加速度
    gravity: 0.0,

    isAdvanceAnimation: false,

    //地形無視
    ignoreCollision: true,

    init: function(parentScene, options) {
        this.options = (options || {}).$safe({
            width: 32,
            height: 32,
            index: 0,
        })
        this.superInit(parentScene, {width: this.options.width, height: this.options.height});

        this.id = options.id;
        this.moveAngle = options.moveAngle || 0;
        this.moveLength = options.moveLength || 128;
        this.moveSpeed = options.moveSpeed || 60;
        this.moveWait = options.moveWait || 60;

        //移動パターン
        this.startX = e.x + (e.width || 16) / 2;
        this.startY = e.y + (e.height || 16) / 2;
        var rad = this.moveAngle.toRad();
        this.endX = this.x + Math.cos(rad) * this.moveLength;
        this.endY = this.y + Math.sin(rad) * this.moveLength;
        this.tweener.clear()
            .moveTo(this.endX, this.endY, this.moveSpeed, "easeInOutSine")
            .wait(this.moveWait)
            .moveTo(this.startX, this.startY, this.moveSpeed, "easeInOutSine")
            .wait(this.moveWait)
            .setLoop(true);

        //スプライト
        this.index = options.index;
        this.sprite = phina.display.Sprite("block", 32, 32).addChildTo(this).setFrameIndex(this.index);
    },

    update: function(e) {
        if (this.collision) {
            this.collision.vx = this.collision.x - this.x;
            this.collision.vy = this.collision.y - this.y;
            this.collision.x = this.x;
            this.collision.y = this.y;
        }
    },

    //フロア当たり判定の追加
    addCollision: function (layer) {
        this.collision = phina.display.RectangleShape({width: this.width, height: this.height})
            .addChildTo(layer)
            .setPosition(this.x, this.y)
            .setVisible(DEBUG_COLLISION);
        this.collision.alpha = 0.3;
        this.collision.vx = 0;
        this.collision.vy = 0;
        this.collision.ignore = false;
    }
});
