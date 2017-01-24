/*
 *  asset.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Assets", {
    _static: {
        get: function(options) {
            switch (options.assetType) {
                case "common":
                    return {
                        image: {
                            "player1":    "assets/image/actor4.png",
                            "player2":    "assets/image/actor19.png",
                            "item":       "assets/image/item.png",
                            "itembox":    "assets/image/takarabako.png",
//                            "background": "assets/image/pipo-bg001.jpg",
                            "background": "assets/image/back-s03b.png",
                            "particle":   "assets/image/particle.png",
                            "door":       "assets/image/door.png",

                            "monster07_a1":    "assets/image/chara07_a1.png",
                            "monster08_a1":    "assets/image/chara08_a1.png",
                            "monster08_a3":    "assets/image/chara08_a3.png",
                        },
                        sound: {
                            "attack":   "assets/sound/sen_ka_katana_sasinuku01.mp3",
                            "hit":      "assets/sound/sen_ka_katana_sasu01.mp3",
                            "damage":   "assets/sound/se_maoudamashii_battle07.mp3",
                            "bgm1":     "assets/sound/DS-ba01m.mp3",
                            "gameover": "assets/sound/gameover3.mp3",
                        },
                        font: {
                            "UbuntuMono": "assets/font/UbuntuMono-Bold.ttf",
                        },
                        tmx: {
                            "stage1": "assets/map/stage1.tmx",
                            "stage2": "assets/map/stage2.tmx",
                        },
                    };
                default:
                    throw "invalid assetType: " + options.assetType;
            }
        },
    },
});

