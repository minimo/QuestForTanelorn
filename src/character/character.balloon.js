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

        this.pattern = options.pattern || "!";
        this.setAnimation(this.pattern);

        this.lifeSpan = options.lifeSpan || 60;
        this.animationInterval = options.animationInterval || 6;
        this.time = 0;

        //特殊パターン
        if (this.pattern == "anger2") {
            this.tweener.setUpdateType('fps').clear().by({y: -16, alpha: -1}, this.animationInterval, "easeInSine");
        }
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
            case "stun":
                this.setFrameTrimming(144, 32, 48, 32);
                break;
            case "light":
                this.setFrameTrimming(144, 64, 48, 32);
                break;
            case "newtype":
                this.setFrameTrimming(144, 96, 72, 32);
                break;
            case "anger":
            case "anger1":
                this.setFrameTrimming(72, 96, 72, 32);
                break;
            case "anger2":
                this.setFrameTrimming(144, 128, 72, 32);
                break;
        }
    },
});
