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
    isWeapon: false,
    isEquip: false,
    isFood: false,
    isItem: false,
    isKey: false,

    //敵ドロップアイテムフラグ
    isEnemyDrop: false,

    //アイテム情報
    status: null,

    //反発係数
    rebound: 0.3,

    //アニメーション進行可能フラグ   
    isAdvanceAnimation: false,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 16, height: 16});

        //アイテムレベル
        this.level = 0;
        this.kind = null;
        if (options.properties) {
            this.level = options.properties.level || 0;
            this.kind = options.properties.kind;
        }
        if (options.kind !== undefined) this.kind = options.kind;

        //アイテム種別
        if (this.kind == null) {
            //アイテム名から判定
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
                case "book":
                    this.kind = ITEM_BOOK;
                    break;
                case "key":
                    this.kind = ITEM_KEY;
                    break;
                case "food":
                    this.kind = ITEM_MEAT + this.level;
                    break;
                default:
                    this.kind = 0;
                    break;
            }
        }

        //アイテムステータス取得
        this.$extend(qft.ItemInfo.get(this.kind));

        //アイテムスプライト
        if (this.isWeapon) {
            //武器の場合
            var index = this.kind * 10 + Math.min(this.level, 9);
            this.sprite = phina.display.Sprite("weapons", 24, 24).addChildTo(this).setFrameIndex(index);

            if (this.level > 0) {
                //強化レベル表示
                var labelParam = {
                    fill: "white",
                    stroke: "black",
                    strokeWidth: 2,

                    fontFamily: "Orbitron",
                    align: "center",
                    baseline: "middle",
                    fontSize: 10,
                    fontWeight: ''
                };
                phina.display.Label({text: "+"+this.level}.$safe(labelParam)).setPosition(6, 6).addChildTo(this);
            }
        } else {
            this.sprite = phina.display.Sprite("item", 24, 24).addChildTo(this).setFrameIndex(this.kind);
        }

        //寿命
        this.lifeSpan = 150;
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

        if (this.isEnemyDrop) {
            if (this.lifeSpan == 0) this.remove();
            if (this.lifeSpan < 30) {
                if (this.time % 2 == 0) this.visible = !this.visible;
            } else if (this.lifeSpan < 60){
                if (this.time % 5 == 0) this.visible = !this.visible;
            } else if (this.lifeSpan < 90) {
                if (this.time % 10 == 0) this.visible = !this.visible;
            }
            this.lifeSpan--;
        }
    },
});

phina.define("qft.ItemInfo", {
    _static: {
        get: function(kind) {
            switch (kind) {
                case "shortsword":
                case ITEM_SHORTSWORD:
                    return {
                        name: "SHORT SWORD",
                        type: "sword",
                        isWeapon: true,
                        isSlash: true,
                        power: 10,
                        collision: {
                            width: 14,
                            height: 30
                        }
                    };
                case "longsword":
                case ITEM_LONGSWORD:
                    return {
                        name: "LONG SWORD",
                        type: "sword",
                        isWeapon: true,
                        isSlash: true,
                        power: 15,
                        stunPower: 5,
                        collision: {
                            width: 24,
                            height: 25
                        }
                    };
                case "ax":
                case ITEM_AX:
                    return {
                        name: "AX",
                        type: "ax",
                        isWeapon: true,
                        isSlash: true,
                        isBrow: true,
                        power: 20,
                        stunPower: 20,
                        collision: {
                            width: 14,
                            height: 26
                        }
                    };
                case "spear":
                case ITEM_SPEAR:
                    return {
                        name: "SPEAR",
                        type: "spear",
                        isWeapon: true,
                        isSting: true,
                        power: 10,
                        collision: {
                            width: 39,
                            height: 10
                        }
                    };
                case "bow":
                case ITEM_BOW:
                    return {
                        name: "BOW",
                        type: "bow",
                        isWeapon: true,
                        isBrow: true,
                        power: 5,
                        stunPower: 5,
                        collision: {
                            width: 20,
                            height: 10
                        }
                    };
                case "rod":
                case ITEM_ROD:
                    return {
                        name: "MAGIC ROD",
                        type: "rod",
                        isWeapon: true,
                        isBrow: true,
                        isFire: true,
                        power: 5,
                        stunPower: 10,
                        collision: {
                            width: 20,
                            height: 10
                        }
                    };
                case "book":
                case ITEM_BOOK:
                    return {
                        name: "BOOK",
                        type: "book",
                        isWeapon: true,
                        isBrow: true,
                        isHoly: true,
                        power: 10,
                        stunPower: 40,
                        collision: {
                            width: 20,
                            height: 20
                        }
                    };
                case "shield":
                case ITEM_SHIELD:
                    return {
                        name: "SHIELD",
                        type: "equip",
                        isEquip: true,
                    };
                case "armor":
                case ITEM_ARMOR:
                    return {
                        name: "ARMOR",
                        type: "equip",
                        isEquip: true,
                    };
                case "hat":
                case ITEM_HAT:
                    return {
                        name: "HAT",
                        type: "equip",
                        isEquip: true,
                    };
                case "boots":
                case ITEM_BOOTS:
                    return {
                        name: "BOOTS",
                        type: "equip",
                        isEquip: true,
                    };
                case "grove":
                case ITEM_GROVE:
                    return {
                        name: "GROVE",
                        type: "equip",
                        isEquip: true,
                    };
                case "ring":
                case ITEM_RING:
                    return {
                        name: "RING",
                        type: "equip",
                        isEquip: true,
                    };
                case "scroll":
                case ITEM_SCROLL:
                    return {
                        name: "SCROLL",
                        type: "item",
                        isItem: true,
                        point: 1000,
                    };
                case "letter":
                case ITEM_LETTER:
                    return {
                        name: "LETTER",
                        type: "item",
                        isItem: true,
                        point: 100,
                    };
                case "card":
                case ITEM_CARD:
                    return {
                        name: "CARD",
                        type: "item",
                        isItem: true,
                        point: 1000,
                    };
                case "key":
                case ITEM_KEY:
                    return {
                        name: "KEY",
                        type: "key",
                        isKey: true,
                        point: 2000,
                    };
                case "coin":
                case ITEM_COIN:
                    return {
                        name: "COIN",
                        type: "item",
                        isItem: true,
                        point: 500,
                    };
                case "bag":
                case ITEM_BAG:
                    return {
                        name: "BAG",
                        type: "item",
                        isItem: true,
                        point: 1000,
                    };
                case "orb":
                case ITEM_ORB:
                    return {
                        name: "ORB",
                        type: "item",
                        isItem: true,
                        point: 5000,
                    };
                case "stone":
                case ITEM_STONE:
                    return {
                        name: "STONE",
                        type: "item",
                        isItem: true,
                        point: 2000,
                    };
                case "jewel":
                case ITEM_JEWEL:
                    return {
                        name: "JEWEL",
                        type: "item",
                        isItem: true,
                        point: 5000,
                    };
                case "jewelbox":
                case ITEM_JEWELBOX:
                    return {
                        name: "JEWELBOX",
                        type: "item",
                        isItem: true,
                        point: 10000,
                    };
                case "meat":
                case ITEM_MEAT:
                    return {
                        name: "MEAT",
                        type: "food",
                        isFood: true,
                        power: 30,
                    };
                case "apple":
                case ITEM_APPLE:
                    return {
                        name: "APPLE",
                        type: "food",
                        isFood: true,
                        power: 20,
                    };
                case "harb":
                case ITEM_HARB:
                    return {
                        name: "HARB",
                        type: "food",
                        isFood: true,
                        power: 50,
                    };
                case "potion":
                case ITEM_POTION:
                    return {
                        name: "POTION",
                        type: "food",
                        isFood: true,
                        power: 100,
                    };
                default:
                    return {};
            }
        },
    },
});

