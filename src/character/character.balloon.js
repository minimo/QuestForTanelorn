/*
 *  character.balloon.js
 *  2017/04/26
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Character.balloon", {
    superClass: "phina.display.Sprite",

    //寿命フレーム
    lifeSpan: 30,

    //アニメーション間隔
    animationInterval: 6,


    init: function(options) {
        this.superInit("balloon", 24, 32);
        this.setAnimation(options.pattern);

        this.lifeSpan = options.lifeSpan || 60;
        this.animationInterval = options.animationInterval || 6;
        this.time = 0;
    },

    update : function() {
        if (this.time % this.animationInterval == 0) this.frameIndex++;

        this.time++;
        if (this.time > this.lifeSpan) this.remove();
    },

    setAnimation: function(pattern) {
        switch (pattern) {
            case "...":
                this.setFrameTrimming(0, 0, 24, 128);
                break;
            case "?":
                this.setFrameTrimming(96, 32, 24, 32);
                break;
            case "!":
                this.setFrameTrimming(72, 64, 72, 32);
                break;
            case "zzz":
                this.setFrameTrimming(0, 0, 24, 32);
                break;
            case "piyo":
                this.setFrameTrimming(144, 32, 48, 32);
                break;
            case "light":
                this.setFrameTrimming(144, 64, 48, 32);
                break;
        }
    },
});
