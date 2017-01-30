/*
 *  door.js
 *  2017/01/14
 *  @auther minimo  
 *  This Program is MIT license.
 */

qft.MapObject = {};

//大型ドアクラス
phina.define("qft.MapObject.Door", {
    superClass: "qft.Character",

    //重力加速度
    gravity: 0.0,

    //アニメーション間隔
    advanceTime: 3,

    //地形無視
    ignoreCollision: true,

    init: function(parentScene) {
        this.superInit({width: 36, height: 64}, parentScene);

        //スプライト
        this.sprite = phina.display.Sprite("door", 36, 64).addChildTo(this).setFrameIndex(3);
        this.setAnimation("closed");
    },

    update: function(e) {
        if (this.getDistancePlayer() < 64) {
            this.setAnimation("open");
        } else {
            if (this.nowAnimation == "open") {
                this.setAnimation("close");
            }
        }
    },

    setupAnimation: function(options) {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["opend"] = [3, "stop"];
        this.frame["closed"] = [2, "stop"];
        this.frame["open"] = [2, 1, 0, 3, "stop"];
        this.frame["close"] = [3, 0, 1, 2, "stop"];
        this.index = 0;
    },
});

//イベントメッセージ   
phina.define("qft.MapObject.EventMessage", {
    superClass: "phina.display.DisplayElement",

    //オブジェクトID
    id: null,

    //一回のみ表示フラグ
    once: false,

    //表示済みフラグ
    alreadyRead: false,

    init: function(options, parentScene) {
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
