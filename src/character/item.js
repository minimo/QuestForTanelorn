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

phina.define("qft.itemInfo", {
    _static: {
        get: function(kind) {
            switch (kind) {
                case ITEM_SHORTSWORD:
                    return {
                        name: "SHORT SWORD",
                        type: "sword",
                        weapon: true,
                        pow: 10,
                        width: 14,
                        height: 30
                    };
                case ITEM_LONGSWORD:
                    return {
                        name: "LONG SWORD",
                        type: "sword",
                        weapon: true,
                        pow: 15,
                        width: 24,
                        height: 25
                    };
                case ITEM_AX:
                    return {
                        name: "AX",
                        type: "ax",
                        weapon: true,
                        pow: 20,
                        width: 14,
                        height: 26
                    };
                case ITEM_SPEAR:
                    return {
                        name: "SPEAR",
                        type: "spear",
                        weapon: true,
                        pow: 10,
                        width: 39,
                        height: 10
                    };
                    break;
                case ITEM_BOW:
                    return {
                        name: "BOW",
                        type: "bow",
                        weapon: true,
                        pow: 5,
                        width: 20,
                        height: 10
                    };
                    break;
                case ITEM_ROD:
                    return {
                        name: "MAGIC ROD",
                        type: "rod",
                        weapon: true,
                        pow: 5,
                        width: 20,
                        height: 10
                    };
                    break;
                case ITEM_BOOK:
                    break;
                case ITEM_SHIELD:
                    break;
                case ITEM_ARMOR:
                    break;
                case ITEM_HAT:
                    break;
                case ITEM_BOOTS:
                    break;
                case ITEM_GROVE:
                    break;
                case ITEM_RING:
                    break;
                case ITEM_SCROLL:
                    break;
                case ITEM_LETTER:
                    break;
                case ITEM_CARD:
                    break;
                case ITEM_KEY:
                    break;
                case ITEM_COIN:
                    break;
            }
        },
    },
});

