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
                            "player":   "assets/chara01.png",
                        },
                    };
                default:
                    throw "invalid assetType: " + options.assetType;
            }
        },
    },
});

