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

    //アイテムレベル
    level: 0,

    //捨てアイテム
    throwAway: false,

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
        this.superInit(parentScene, {width: 16, height: 16});

        //アイテムレベル
        this.level = options.properties? options.properties.level: 0;

        //アイテム種別
        switch (options.name) {
            case "shortsword":
                this.kind = ITEM_SHORTSWORD;
                break;
            case "longsword":
                this.kind = ITEM_LONGSWORD;
                break;
            case "ax":
                this.kind = ITEM_AX;
                break;
            case "spear":
                this.kind = ITEM_SPEAR;
                break;
            case "bow":
                this.kind = ITEM_BOW;
                break;
            case "rod":
                this.kind = ITEM_ROD;
                break;
            case "key":
                this.kind = ITEM_KEY;
                break;
            case "food":
                this.kind = ITEM_MEAT + this.level;
                break;
            default:
                this.kind = 0;
                if (options.properties) this.kind = options.properties.kind || 0;
                break;
        }

        //アイテムステータス取得
        this.$extend(qft.ItemInfo.get(this.kind));

        //アイテムスプライト
        this.sprite = phina.display.Sprite("item", 24, 24).addChildTo(this).setFrameIndex(this.kind);
    },

    update: function() {
        //プレイヤーとの当たり判定
        var pl = this.parentScene.player;
        if (this.hitTestElement(pl)) {
            if (this.time > 10 && !this.throwAway) {
                pl.getItem(this);
                this.remove();
            }
        } else {
            if (this.throwAway) this.throwAway = false;
        }
    },
});

phina.define("qft.ItemInfo", {
    _static: {
        get: function(kind) {
            switch (kind) {
                case ITEM_SHORTSWORD:
                    return {
                        name: "SHORT SWORD",
                        type: "sword",
                        weapon: true,
                        power: 10,
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
                        power: 15,
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
                        power: 20,
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
                        power: 10,
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
                        power: 5,
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
                        power: 5,
                        collision: {
                            width: 20,
                            height: 10
                        }
                    };
                case ITEM_BOOK:
                    return {
                        name: "BOOK",
                        type: "book",
                        weapon: true,
                        power: 10,
                        collision: {
                            width: 20,
                            height: 20
                        }
                    };
                case ITEM_SHIELD:
                    return {
                        name: "SHIELD",
                        type: "equip",
                        equip: true,
                    };
                case ITEM_ARMOR:
                    return {
                        name: "ARMOR",
                        type: "equip",
                        equip: true,
                    };
                case ITEM_HAT:
                    return {
                        name: "HAT",
                        type: "equip",
                        equip: true,
                    };
                case ITEM_BOOTS:
                    return {
                        name: "BOOTS",
                        type: "equip",
                        equip: true,
                    };
                case ITEM_GROVE:
                    return {
                        name: "GROVE",
                        type: "equip",
                        equip: true,
                    };
                case ITEM_RING:
                    return {
                        name: "RING",
                        type: "equip",
                        equip: true,
                    };
                case ITEM_SCROLL:
                    return {
                        name: "SCROLL",
                        type: "item",
                        item: true,
                    };
                case ITEM_LETTER:
                    return {
                        name: "LETTER",
                        type: "item",
                        item: true,
                    };
                case ITEM_CARD:
                    return {
                        name: "CARD",
                        type: "item",
                        item: true,
                    };
                case ITEM_KEY:
                    return {
                        name: "KEY",
                        type: "key",
                        key: true,
                    };
                case ITEM_COIN:
                    return {
                        name: "COIN",
                        type: "item",
                        item: true,
                        point: 2000,
                    };
                case ITEM_BAG:
                    return {
                        name: "BAG",
                        type: "item",
                        item: true,
                        point: 5000,
                    };
                case ITEM_ORB:
                    return {
                        name: "ORB",
                        type: "item",
                        item: true,
                        point: 5000,
                    };
                case ITEM_STONE:
                    return {
                        name: "STONE",
                        type: "item",
                        item: true,
                        point: 5000,
                    };
                case ITEM_JEWEL:
                case ITEM_JEWELBOX:
                case ITEM_MEAT:
                    return {
                        name: "MEAT",
                        type: "food",
                        food: true,
                        power: 30,
                    };
                case ITEM_APPLE:
                    return {
                        name: "MEAT",
                        type: "food",
                        food: true,
                        power: 20,
                    };
                case ITEM_HARB:
                    return {
                        name: "MEAT",
                        type: "food",
                        food: true,
                        power: 50,
                    };
                case ITEM_POTION:
                    return {
                        name: "MEAT",
                        type: "food",
                        food: true,
                        power: 100,
                    };
                default:
                    return {};
            }
        },
    },
});

