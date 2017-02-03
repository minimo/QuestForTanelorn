/*
 *  effect.js
 *  2017/01/12
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Effect", {
    superClass: "phina.display.DisplayElement",

    //加速度
    vx: 0,
    vy: 0,

    //重力加速度
    gravity: 0.0,

    //横移動減衰率
    friction: 1.0,

    //アニメーション進行可能フラグ   
    isAdvanceAnimation: true,

    //アニメーション間隔
    advanceTime: 6,

    //経過フレーム
    time: 0,

    init: function(parentScene, options) {
        this.superInit(options);
        this.parentScene = parentScene;
        this.boundingType = "rect";
        this.tweener.setUpdateType('fps');

        this.setupAnimation(options);

        this.on('enterframe', function() {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= this.friction;
            this.vy += this.gravity;
            if (Math.abs(this.vx) < 0.01) this.vx = 0;
            if (Math.abs(this.vy) < 0.01) this.vy = 0;

            //アニメーション
            if (this.isAdvanceAnimation && this.time % this.advanceTime == 0) {
                this.index = (this.index+1) % this.frame[this.nowAnimation].length;
                if (this.frame[this.nowAnimation][this.index] == "stop") this.index--;
                this.sprite.frameIndex = this.frame[this.nowAnimation][this.index];
            }
        });
    },

    setupAnimation: function(options) {
        this.spcialAnimation = false;
        this.frame = [0, 1, 2, 3];
        this.index = 0;
    },
});
