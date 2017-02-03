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
    key: false,

    //アイテム情報
    status: null,


    //反発係数
    rebound: 0.3,

    //アニメーション進行可能フラグ   
    isAdvanceAnimation: false,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 10, height: 10});

        //アイテム種別
        this.kind = options.kind;

        //アイテムステータス取得
        this.$extend(qft.itemInfo.get(this.kind));

        //アイテムスプライト
        this.sprite = phina.display.Sprite("item", 20, 20).addChildTo(this).setFrameIndex(this.kind);
    },

    update: function() {
        //プレイヤーとの当たり判定
        var pl = this.parentScene.player;
        if (this.time > 10 && this.hitTestElement(pl)) {
            pl.getItem(this);
            this.remove();
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
                        collision: {
                            width: 14,
                            height: 30
                        }
                    };
                case ITEM_LONGSWORD:
                    return {
                        name: "LONG SWORD",
                        type: "sword",
                        weapon: true,
                        pow: 15,
                        collision: {
                            width: 24,
                            height: 25
                        }
                    };
                case ITEM_AX:
                    return {
                        name: "AX",
                        type: "ax",
                        weapon: true,
                        pow: 20,
                        collision: {
                            width: 14,
                            height: 26
                        }
                    };
                case ITEM_SPEAR:
                    return {
                        name: "SPEAR",
                        type: "spear",
                        weapon: true,
                        pow: 10,
                        collision: {
                            width: 39,
                            height: 10
                        }
                    };
                case ITEM_BOW:
                    return {
                        name: "BOW",
                        type: "bow",
                        weapon: true,
                        pow: 5,
                        collision: {
                            width: 20,
                            height: 10
                        }
                    };
                case ITEM_ROD:
                    return {
                        name: "MAGIC ROD",
                        type: "rod",
                        weapon: true,
                        pow: 5,
                        collision: {
                            width: 20,
                            height: 10
                        }
                    };
                case ITEM_BOOK:
                    return {};
                case ITEM_SHIELD:
                    return {};
                case ITEM_ARMOR:
                    return {};
                case ITEM_HAT:
                    return {};
                case ITEM_BOOTS:
                    return {};
                case ITEM_GROVE:
                    return {};
                case ITEM_RING:
                    return {};
                case ITEM_SCROLL:
                    return {};
                case ITEM_LETTER:
                    return {};
                case ITEM_CARD:
                    return {};
                case ITEM_KEY:
                    return {
                        name: "KEY",
                        type: "key",
                        key: true,
                    };
                case ITEM_COIN:
                    return {};
                default:
                    return {};
            }
        },
    },
});

