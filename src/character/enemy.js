/*
 *  enemy.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//敵キャラクタ基本クラス
phina.define("qft.Enemy", {
    superClass: "qft.Character",

    init: function(options, parentScene) {
        this.superInit(options, parentScene);
        this.setupAnimation();
    },

    //プレイヤーが見える位置にいるのか判定
    isLookPlayer: function() {
        return false;
    },
});

//スライム
phina.define("qft.Slime", {
    superClass: "qft.Enemy",
    init: function(parentScene) {
        this.superInit({width: 32, height: 32}, parentScene);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster", 25, 32).addChildTo(this).setFrameIndex(0);
        this.advanceTime = 10;
    },

    update: function() {
        this.x -= 2;
    },

    setupAnimation: function() {
        this.spcialAction = false;
        this.frame = [];
        this.frame["stand"] = [0, 1, 2, 1];
        this.frame["jump"] = [1, "stop"];
        this.frame["walk"] = [0, 1, 2, 1];
        this.frame["up"] =   [0, 1, 2, 1];
        this.frame["down"] = [0, 1, 2, 1];
        this.frame["attack"] = [0, "stop"];
        this.index = 0;
    },
});
