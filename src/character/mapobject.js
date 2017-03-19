/*
 *  mapobject.js
 *  2017/01/14
 *  @auther minimo  
 *  This Program is MIT license.
 */

qft.MapObject = qft.MapObject || {};

//チェックアイコン
phina.define("qft.MapObject.CheckIcon", {
    superClass: "qft.Character",

    //重力加速度
    gravity: 0.0,

    //アニメーション間隔
    advanceTime: 3,

    //地形無視
    ignoreCollision: true,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 36, height: 64});
        this.$safe(options);

        //スプライト
        this.sprite = phina.display.Sprite("checkicon", 32, 32).addChildTo(this);
        this.setAnimation("up");
        this.advanceTime = 10;
    },

    update: function(e) {
    },

    setupAnimation: function(options) {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["in"] = [2, 1, 0];
        this.frame["up"] = [5, 4, 3];
        this.frame["down"] = [8, 7, 6];
        this.frame["out"] = [11, 10, 9];
        this.index = 0;
    },
});

//メッセージ表示
phina.define("qft.MapObject.Message", {
    superClass: "phina.display.DisplayElement",

    //オブジェクトID
    id: null,

    //一回のみ表示フラグ
    once: false,

    //表示済みフラグ
    alreadyRead: false,

    init: function(parentScene, options) {
        this.superInit(options);
        this.parentScene = parentScene;
        this.id = options.id;
        this.once = options.properties.once || false;
        this.text = options.properties.text || "TEST";
    },

    update: function(e) {
        //プレイヤーとの当たり判定
        var pl = this.parentScene.player;
        var hit = this.hitTestElement(pl);
        if (hit && !this.alreadyRead) {
            this.parentScene.spawnEventMessage(this.id, this.text);
            this.alreadyRead = true;

            //一回のみの場合はリムーブ
            if (this.once) this.remove();
        }

        //判定を外れたら表示済みフラグを外す
        if (!hit && this.alreadyRead) this.alreadyRead = false;
    },
});

//ワープゲート
phina.define("qft.MapObject.Gate", {
    superClass: "qft.Character",

    id: null,

    //重力加速度
    gravity: 0.0,

    //アニメーション間隔
    advanceTime: 3,

    //地形無視
    ignoreCollision: true,

    //実行済みフラグ
    already: false,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 36, height: 64});
        this.$safe(options);

        //スプライト
        this.sprite = phina.display.Sprite("gate", 16, 32)
            .addChildTo(this)
            .setScale(2)
            .setFrameIndex(0);
        this.advanceTime = 6;

        this.time = 0;
    },

    update: function() {
        if (this.time % this.advenceTime == 0) {
            this.sprite.frameIndex++;
        }
    },
});

//イベント  
phina.define("qft.MapObject.Event", {
    superClass: "phina.display.DisplayElement",

    //オブジェクトID
    id: null,

    //一回のみ表示フラグ
    once: false,

    //実行済みフラグ
    already: false,

    init: function(parentScene, options) {
        this.superInit(options);
        this.parentScene = parentScene;
        this.id = options.id;
        this.once = options.properties.once || false;
        this.properties = options.properties;
    },

    update: function(e) {
        //プレイヤーとの当たり判定
        var pl = this.parentScene.player;
        var hit = this.hitTestElement(pl);
        if (hit && !this.alreadyRead) {
            this.parentScene.spawnEventMessage(this.id, this.text);
            this.already = true;

            //一回のみの場合はリムーブ
            if (this.once) this.remove();
        }

        //判定を外れたら実行済みフラグを外す
        if (!hit && this.already) this.alreadyRead = false;
    },
});
