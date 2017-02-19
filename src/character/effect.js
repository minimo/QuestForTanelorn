/*
 *  effect.js
 *  2017/01/12
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Effect", {
    superClass: "phina.display.DisplayElement",

    //インデックス更新間隔
    interval: 2,

    //開始インデックス
    startIndex: 0,

    //最大インデックス
    maxIndex: 8,

    //現在インデックス
    index: 0,

    //アニメーション進行可能フラグ   
    isAdvanceAnimation: true,

    //経過フレーム
    time: 0,

    defaultOptions: {
        name: "explode",
        assetName: "effect",
        width: 64,
        height: 64,
        interval: 2,
        startIndex: 0,
        maxIndex: 17,
        loop: false,
        trimming: null,
        position: {x: 0, y: 0},
        origin: {x: 0.5, y: 0.5},
        rotation: 0,
        alpha: 1.0,
        scale: {x: 1.0, y: 1.0},
        blendMode: "source-over",
    },

    init: function(parentScene, options) {
        this.superInit();

        this.options = (options || {}).$safe(this.defaultOptions);
        this.setup();

        this.on('enterframe', function() {
            if (this.time % this.interval == 0) {
                this.sprite.frameIndex++;
                if (this.sprite.frameIndex > this.maxIndex) {
                    this.remove();
                }
            }
            this.time++;
        });
    },

    setup: function() {
        var options = this.options;
        this.sprite = phina.display.Sprite(options.assetName, options.width, options.height)
            .setPosition(options.position.x, options.position.y)
            .setOrigin(options.origin.x, options.origin.y)
            .addChildTo(this);
        if (options.trimming) {
            var t = options.trimming;
            this.setFrameTrimming(t.x, t.y, t.width, t.height);
        }
    },
});

phina.define("qft.EffectData", {
    _static: {
        get: function(name) {
            switch (name) {
                case "explode_small":
                    return {
                        trimming: {x: 256, y: 256, width: 128, height: 32}
                    };
                case "explode":
                    return {
                        start: 0,
                        end: 18,
                        trimming: {x: 0, y: 0, width: 512, height: 128}
                    };
                case "explode_ground":
                    return {
                        trimming: {x: 256, y: 192, width: 256, height: 48}
                    };
                default:
                    return {};
            }
        }
    }
});
