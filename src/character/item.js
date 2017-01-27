/*
 *  item.js
 *  2017/01/04
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アイテムクラス
phina.define("qft.Item", {
    superClass: "qft.Character",

    //識別フラグ
    isItem: true,

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
        this.superInit({width: 10, height: 10}, parentScene);

        //アイテムスプライト
        this.sprite = phina.display.Sprite("item", 20, 20)
            .addChildTo(this)
            .setFrameIndex(0);

        this.setItemKind(options.kind);
    },

    update: function() {
        //プレイヤーとの当たり判定
        var pl = this.parentScene.player;
        if (this.time > 10 && this.hitTestElement(pl)) {
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
