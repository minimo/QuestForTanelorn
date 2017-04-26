/*
 *  mapobject.accessory.js
 *  2017/01/14
 *  @auther minimo  
 *  This Program is MIT license.
 */

qft.MapObject = qft.MapObject || {};

//マップ装飾アクセサリ
phina.define("qft.MapObject.Accessory", {
    superClass: "qft.Character",

    id: null,

    //識別フラグ
    isAccessory: true,

    //重力加速度
    gravity: 0.0,

    //アニメーション間隔
    advanceTime: 2,

    isAdvanceAnimation: true,

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
        this.level = options.properties.level || 0;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["normal"] = [2, 1, 0, 3];
        this.frame["normal2"] = [1, 0, 3, 2];
        this.index = 0;
    },
});

//ランプ
phina.define("qft.MapObject.Lamp", {
    superClass: "qft.MapObject.Accessory",

    init: function(parentScene, options) {
        this.superInit(parentScene, options);

        //スプライト
        this.sprite = phina.display.Sprite("flame02", 24, 32).addChildTo(this).setFrameIndex(0);
        this.sprite.setFrameTrimming(this.level * 24, 0, 24, 128);

        //アニメーション設定
        if (this.id % 2) {
            this.setAnimation("normal");
        } else {
            this.setAnimation("normal2");
        }
        this.advanceTime = 8;
    },
});

//たき火
phina.define("qft.MapObject.Bonfire", {
    superClass: "qft.MapObject.Accessory",

    init: function(parentScene, options) {
        this.superInit(parentScene, options);

        //スプライト
        this.sprite = phina.display.Sprite("flame02", 24, 32).addChildTo(this).setFrameIndex(0);
        this.sprite.setFrameTrimming(this.level * 24, 128, 24, 128);

        //アニメーション設定
        this.setAnimation("normal");
        this.advanceTime = 3;
    },
});

//炎
phina.define("qft.MapObject.Flame", {
    superClass: "qft.MapObject.Accessory",

    init: function(parentScene, options) {
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("flame02", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(this.level * 24 + 72, 0, 24, 128);

        //アニメーション設定
        this.setAnimation("normal");
        this.advanceTime = 3;
    },
});

//火
phina.define("qft.MapObject.Fire", {
    superClass: "qft.MapObject.Accessory",

    init: function(parentScene, options) {
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("flame05", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(this.level * 24 + 72, 0, 24, 128);

        //アニメーション設定
        this.setAnimation("normal");
        this.advanceTime = 3;
    },
});

//燭台
phina.define("qft.MapObject.Candle", {
    superClass: "qft.MapObject.Accessory",

    init: function(parentScene, options) {
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("flame05", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(this.level * 24 + 72, 128, 24, 128);

        //アニメーション設定
        this.setAnimation("normal");
        this.advanceTime = 3;
    },
});

//ランタン
phina.define("qft.MapObject.Lanthanum", {
    superClass: "qft.MapObject.Accessory",

    init: function(parentScene, options) {
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("accessory1", 16, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 96, 72, 32);

        //アニメーション設定
        this.setAnimation("normal");
        this.advanceTime = 3;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["normal"] = [0, 1, 2, 1];
        this.index = 0;
    },
});

//ランプ
phina.define("qft.MapObject.Lamp", {
    superClass: "qft.MapObject.Accessory",

    init: function(parentScene, options) {
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("accessory1", 16, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 32, 72, 32);

        //アニメーション設定
        this.setAnimation("normal");
        this.advanceTime = 3;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["normal"] = [0, 1, 2, 1];
        this.index = 0;
    },
});
