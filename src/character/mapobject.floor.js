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
        this.moveAngle = options.properties.moveAngle || 0;
        this.moveLength = options.properties.moveLength || 128;
        this.moveSpeed = options.properties.moveSpeed || 60;
        this.moveWait = options.properties.moveWait || 60;

        //移動パターン
        this.startX = options.x + (options.width || 16) / 2;
        this.startY = options.y + (options.height || 16) / 2;
        var rad = this.moveAngle.toRadian();
        this.endX = this.startX + Math.cos(rad) * this.moveLength;
        this.endY = this.startY + Math.sin(rad) * this.moveLength;
        this.tweener.clear()
            .moveTo(this.endX, this.endY, this.moveSpeed, "easeInOutSine")
            .wait(this.moveWait)
            .moveTo(this.startX, this.startY, this.moveSpeed, "easeInOutSine")
            .wait(this.moveWait)
            .setLoop(true);

        //スプライト
        this.index = options.index;
//        this.sprite = phina.display.Sprite("block", 32, 32).addChildTo(this).setFrameIndex(this.index);
    },

    update: function(e) {
        if (this.collision) {
            this.collision.vx = this.x - this.collision.x;
            this.collision.vy = this.y - this.collision.y;
            this.collision.x = this.x;
            this.collision.y = this.y;
        }
    },

    //フロア当たり判定の追加
    addCollision: function (layer) {
        this.collision = phina.display.RectangleShape({width: this.width, height: this.height})
            .addChildTo(layer)
            .setPosition(this.x, this.y)
            .setVisible(true);
        this.collision.alpha = 0.3;
        this.collision.vx = 0;
        this.collision.vy = 0;
        this.collision.ignore = false;
        this.collision.type = "floor";
        this.collision.friction = 0;
    }
});
