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
                            "background": "assets/image/pipo-bg001.jpg",

                            "monster":    "assets/image/chara08_a3.png",
                        },
                    };
                default:
                    throw "invalid assetType: " + options.assetType;
            }
        },
    },
});

