/*
 *  asset.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Assets", {
    _static: {
        loadedAssets: [],
        get: function(options) {
            qft.Assets.loadedAssets.push(options.assetType);
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
                            "player2":    "assets/image/actor19.png",
                            "item":       "assets/image/item.png",
                            "itembox":    "assets/image/takarabako.png",
                            "particle":   "assets/image/particle.png",
                            "door":       "assets/image/door.png",
                            "checkicon":  "assets/image/check icon_00.png",
                            "titleback":  "assets/image/titleback.png", 

                            "monster01":  "assets/image/monster01.png",
                            "bullet":     "assets/image/effect_bullet01.png",
                            "effect":     "assets/image/effect.png",
                        },
                        sound: {
                            "click":      "assets/sound/se_maoudamashii_system44.mp3",
                            "attack":     "assets/sound/sen_ka_katana_sasinuku01.mp3",
                            "hit":        "assets/sound/sen_ka_katana_sasu01.mp3",
                            "damage":     "assets/sound/se_maoudamashii_battle12.mp3",
                            "arrowstick": "assets/sound/sen_ka_ya03.mp3",
                            "stageclear": "assets/sound/DS-030m.mp3",
                            "gameover":   "assets/sound/gameover3.mp3",
                            "getkeyitem": "assets/sound/se_maoudamashii_onepoint23.mp3",
                            "bomb":       "assets/sound/sen_ge_taihou03.mp3",
                            "select":     "assets/sound/se_maoudamashii_system45.mp3",
                            "getitem":    "assets/sound/ata_a49.mp3", 
                            "recovery":   "assets/sound/se_maoudamashii_magical01.mp3",
                            "bgm1":       "assets/sound/DS-ba01m.mp3",
                        },
                        font: {
                            "UbuntuMono": "assets/font/UbuntuMono-Bold.ttf",
                            "titlefont1": "assets/font/teutonic4.ttf",
                            "titlefont2": "assets/font/GothStencil_Premium.ttf",
                        },
                        tmx: {
                            "stage1": "assets/map/stage1.tmx",
                        },
                    };
                case "stage2":
                    return {
                        sound: {
                            "bgm2": "assets/sound/DS-035m.mp3",
                        },
                        tmx: {
                            "stage2": "assets/map/stage2.tmx",
                        },
                    };
                case "stage3":
                    return {
                        sound: {
                            "bgm3": "assets/sound/DS-076m.mp3",
                        },
                        tmx: {
                            "stage3": "assets/map/stage3.tmx",
                        },
                    };
                default:
                    throw "invalid assetType: " + options.assetType;
            }
        },
    },
});

