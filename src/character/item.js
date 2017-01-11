/*
 *  item.js
 *  2017/01/04
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アイテムクラス
phina.define("qft.Item", {
    superClass: "qft.Character",

    //アイテム種別
    kind: 0,

    //大まかな種別フラグ
    weapon: false,
    equip: false,
    food: false,
    item: false,

    //反発係数
    rebound: 0.3,

    //アニメーション進行可能フラグ   
    isAdvanceAnimation: false,

    init: function(options, parentScene) {
        this.superInit({width: 20, height: 20}, parentScene);

        //アイテムスプライト
        this.sprite = phina.display.Sprite("item", 20, 20)
            .addChildTo(this)
            .setFrameIndex(0);

        this.setItemKind(options.kind);
    },

    update: function() {
        //プレイヤーとの当たり判定
        var pl = this.parentScene.player;
        if (!this.isDead && this.hitTestElement(pl)) {
            pl.getItem(this);
            this.remove();
        }
        this.sprite.frameIndex = this.kind;
    },

    setItemKind: function(kind) {
        this.kind = kind || 0;
        if (kind < 6) {
            this.weapon = true;
        } else if (kind < 12) {
            this.equip = true;
        }
    },
});

//アイテムボックスクラス
phina.define("qft.ItemBox", {
    superClass: "qft.Character",

    //アイテム種別
    kind: 0,

    //アニメーション間隔
    advanceTime: 3,

    init: function(options, parentScene) {
        this.superInit({width: 20, height: 20}, parentScene);

        //アイテムボックススプライト
        this.sprite = phina.display.Sprite("itembox", 16, 32)
            .addChildTo(this)
            .setFrameIndex(0);

        this.setAnimation("close");
        this.kind = options.kind || 0;
    },

    update: function() {
        //プレイヤー攻撃との当たり判定
        var pl = this.parentScene.player;
        if (pl.attack && this.hitTestElement(pl.attackCollision)) {
            this.open(pl);
        }
    },

    open: function(target) {
        this.isAdvanceAnimation = true;
        this.setAnimation("open");
        this.tweener.clear()
            .wait(10)
            .call(function() {
                var i = this.parentScene.spawnItem(this);
                i.vy = -5;
            }.bind(this))
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["close"] = [0];
        this.frame["open"] = [0, 6, 12, 18, "stop"];
        this.index = 0;
    },
});
