/*
 *  effect.js
 *  2017/01/12
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Effect", {
    superClass: "phina.display.DisplayElement",

    //アニメーション進行可能フラグ   
    isAdvanceAnimation: true,

    //アニメーション間隔
    advanceTime: 6,

    //経過フレーム
    time: 0,

    init: function(parentScene, options) {
        this.superInit();
        this.setupAnimation(options);

        this.sprite = phina.display.Sprite("effect").addChildTo(this);

        this.frame = [0, 1, 2, 3];
        this.index = 0;

        this.on('enterframe', function() {
            //アニメーション
            if (this.isAdvanceAnimation && this.time % this.advanceTime == 0) {
                this.index = (this.index+1) % this.frame.length;
                if (this.frame[this.index] == "stop") this.index--;
                this.sprite.frameIndex = this.frame[this.index];
            }
            this.time++;
        });
    },

    setAnimation: function(options) {
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
                        trimming: {x: 256, y: 256, width: 128, height: 32}
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
