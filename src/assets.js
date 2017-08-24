/*
 *  asset.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Assets", {
    _static: {
        loaded: [],
        isLoaded: function(assetType) {
            return qft.Assets.loaded[assetType]? true: false;
        },
        get: function(options) {
            qft.Assets.loaded[options.assetType] = true;
            switch (options.assetType) {
                case "splash":
                    return {
                        image: {
                            "openingmap":   "assets/image/opening_map.jpg",
                            "openingtower": "assets/image/opening_tower.png",
                            "openingground":"assets/image/opening_ground.png",
                            "openingback":  "assets/image/opening_back.png",
                            "openingback2": "assets/image/opening_bg_jan.jpg",
                            "openinglight": "assets/image/opening_tree_light_yellow.png",
                            "player1":      "assets/image/actor4.png",
                            "background":   "assets/image/back-s03b.png",
                        },
                    };
                case "splash2":
                    return {
                        sound: {
                            "openingbgm":   "assets/sound/DS-070m.mp3",
                        },
                    };
                case "common":
                    return {
                        image: {
                            "actor4":    "assets/image/actor4.png",
                            "actor19":    "assets/image/actor19.png",
                            "actor40":    "assets/image/actor40.png",
                            "actor55":    "assets/image/actor55.png",
                            "actor64":    "assets/image/actor64_a.png",
                            "actor642":    "assets/image/actor64_b.png",
                            "actor108":    "assets/image/actor108.png",
                            "actor111":    "assets/image/actor111.png",
                            "actor112":    "assets/image/actor112.png",
                            "weapons":    "assets/image/weapons.png",
                            "item":       "assets/image/item.png",
                            "itembox":    "assets/image/takarabako.png",
                            "particle":   "assets/image/particle.png",
                            "door":       "assets/image/door.png",
                            "checkicon":  "assets/image/check icon_00.png",
                            "titleback":  "assets/image/titleback.png", 
                            "menuframe":  "assets/image/nc92367.png",

                            "monster01":  "assets/image/monster01.png",
                            "monster02":  "assets/image/char_m_devil01.png",
                            "monster03":  "assets/image/char_m_magi01.png",
                            "monster01x2":  "assets/image/monster01x2.png",
                            "monster02x2":  "assets/image/char_m_devil01x2.png",
                            "bullet":     "assets/image/effect_bullet01.png",
                            "effect":     "assets/image/effect.png",
                            "effect2":    "assets/image/effect01a.png",
                            "gate":       "assets/image/gate.png",
                            "flame02":    "assets/image/object_fire02a.png",
                            "flame03":    "assets/image/object_fire03a.png",
                            "flame05":    "assets/image/object_fire05a.png",
                            "accessory1": "assets/image/map_effect2.png",
                            "block":      "assets/image/block.png",
                            "floor":      "assets/map/TileA4.png",
                            "balloon":    "assets/image/chara09_c1.png",
                            "shadow":     "assets/image/shadow.png",
                        },
                        sound: {
                            "click":      "assets/sound/se_maoudamashii_system44.mp3",
                            "ok":         "assets/sound/se_maoudamashii_system36.mp3",
                            "cancel":     "assets/sound/se_maoudamashii_system43.mp3",
                            "attack":     "assets/sound/sen_ka_katana_sasinuku01.mp3",
                            "hit":        "assets/sound/sen_ka_katana_sasu01.mp3",
                            "hit_blunt":  "assets/sound/sen_blunt.mp3",
                            "damage":     "assets/sound/se_maoudamashii_battle12.mp3",
                            "arrowstick": "assets/sound/sen_ka_ya03.mp3",
                            "stageclear": "assets/sound/DS-030m.mp3",
                            "gameover":   "assets/sound/gameover3.mp3",
                            "getkeyitem": "assets/sound/se_maoudamashii_onepoint23.mp3",
                            "bomb":       "assets/sound/sen_ge_taihou03.mp3",
                            "select":     "assets/sound/se_maoudamashii_system45.mp3",
                            "getitem":    "assets/sound/ata_a49.mp3",
                            "recovery":   "assets/sound/se_maoudamashii_magical01.mp3",
                            "tinkling":   "assets/sound/tinkling.mp3",
                            "holy1":      "assets/sound/holy1.mp3",
                            "bgm1":       "assets/sound/DS-ba01m.mp3",
                        },
                        font: {
                            "UbuntuMono": "assets/font/UbuntuMono-Bold.ttf",
                            "titlefont1": "assets/font/teutonic4.ttf",
                            "titlefont2": "assets/font/GothStencil_Premium.ttf",
                        },
                        tmx: {
                            "stage1": "assets/map/stage1.tmx",
                            "stage999": "assets/map/stage999.tmx",
                        },
                    };
                case "stage2":
                    return {
                        sound: {
                            "bgm2": "assets/sound/DS-035m.mp3",
                        },
                        tmx: {
                            "stage2_1": "assets/map/stage2_1.tmx",
                        },
                    };
                case "stage3":
                    return {
                        sound: {
                            "bgm3": "assets/sound/DS-041m.mp3",
                        },
                        tmx: {
                            "stage3_1": "assets/map/stage3_1.tmx",
                            "stage3_2": "assets/map/stage3_2.tmx",
                            "stage3_3": "assets/map/stage3_3.tmx",
                        },
                    };
                case "stage4":
                    return {
                        sound: {
                            "bgm4": "assets/sound/DS-076m.mp3",
                        },
                        tmx: {
                            "stage4_1": "assets/map/stage4_1.tmx",
                            "stage4_2": "assets/map/stage4_2.tmx",
                        },
                    };
                case "stage5":
                    return {
                        sound: {
                            "bgm5": "assets/sound/DS-089m.mp3",
                        },
                        tmx: {
                            "stage5_1": "assets/map/stage5_1.tmx",
                            "stage5_2": "assets/map/stage5_2.tmx",
                        },
                    };
                case "stage6":
                    return {
                        sound: {
                            "bgm6": "assets/sound/DS-060m.mp3",
                        },
                        tmx: {
                            "stage6_1": "assets/map/stage6_1.tmx",
                            "stage6_2": "assets/map/stage6_2.tmx",
                        },
                    };
                case "stage7":
                    return {
                        sound: {
                            "bgm7": "assets/sound/DS-105m.mp3",
                        },
                        tmx: {
                            "stage7_1": "assets/map/stage7_1.tmx",
                            "stage7_2": "assets/map/stage7_2.tmx",
                            "stage7_3": "assets/map/stage7_3.tmx",
                        },
                    };
                case "stage8":
                    return {
                        sound: {
                            "bgm8": "assets/sound/DS-064m.mp3",
                        },
                        tmx: {
                            "stage8_1": "assets/map/stage8_1.tmx",
                        },
                    };
                case "stage9":
                    return {
                        sound: {
                            "bgm9": "assets/sound/DS-064m.mp3",
                        },
                        tmx: {
                            "stage9_1": "assets/map/stage9_1.tmx",
                        },
                    };
                default:
                    throw "invalid assetType: " + options.assetType;
            }
        },
    },
});

