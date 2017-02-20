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
        loop: false,
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
        this.options.$extend(qft.EffectData.get(this.options.name));
        this.setup();

        this.on('enterframe', function() {
            if (this.time % this.interval == 0) {
                this.sprite.frameIndex++;
                if (this.sprite.frameIndex > this.maxIndex) {
                    if (this.options.loop) {
                        this.sprite.frameIndex = 0;
                    } else {
                        this.remove();
                    }
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
            .setScale(options.scale.x, options.scale.y)
            .setRotation(options.rotation)
            .addChildTo(this);
        if (options.trimming) {
            var t = options.trimming;
            this.sprite.setFrameTrimming(t.x, t.y, t.width, t.height);
        }
        this.sprite.alpha = options.alpha;
    },
});

phina.define("qft.EffectData", {
    _static: {
        get: function(name) {
            switch (name) {
                case "explode_small":
                    return {
                        width: 16,
                        height: 16,
                        interval: 2,
                        startIndex: 8,
                        maxIndex: 15,
                        trimming: {x: 256, y: 256, width: 128, height: 32},
                    };
                case "explode_small2":
                    return {
                        width: 16,
                        height: 16,
                        interval: 4,
                        startIndex: 0,
                        maxIndex: 7,
                        trimming: {x: 256, y: 256, width: 128, height: 32},
                    };
                case "explode":
                    return {
                        width: 64,
                        height: 64,
                        interval: 1,
                        startIndex: 0,
                        maxIndex: 17,
                        trimming: {x: 0, y: 0, width: 512, height: 128},
                    };
                case "explode_large":
                    return {
                        width: 48,
                        height: 48,
                        interval: 4,
                        startIndex: 0,
                        maxIndex: 7,
                        trimming: {x: 0, y: 0, width: 512, height: 128},
                    };
                case "explode_ground":
                    return {
                        width: 32,
                        height: 48,
                        interval: 4,
                        startIndex: 0,
                        maxIndex: 7,
                        trimming: {x: 256, y: 192, width: 256, height: 48},
                    };
                case "smoke_small":
                    return {
                        width: 16,
                        height: 16,
                        interval: 5,
                        startIndex: 0,
                        maxIndex: 4,
                        trimming: {x: 128, y: 128, width: 64, height: 16},
                    };
                case "smoke":
                    return {
                        width: 24,
                        height: 24,
                        interval: 5,
                        startIndex: 0,
                        maxIndex: 5,
                        trimming: {x: 128, y: 160, width: 120, height: 24},
                    };
                case "smoke_large":
                    return {
                        width: 32,
                        height: 32,
                        interval: 5,
                        startIndex: 0,
                        maxIndex: 8,
                        trimming: {x: 256, y: 128, width: 128, height: 64},
                    };
                default:
                    return {};
            }
        }
    }
});
