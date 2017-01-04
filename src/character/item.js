/*
 *  item.js
 *  2017/01/04
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アイテムクラス
phina.define("qft.Item", {
    superClass: "qft.Character",

    //反発係数
    rebound: 0.3,

    //アニメーション進行可能フラグ   
    isAdvanceAnimation: false,

    init: function(parentScene) {
        this.superInit({width: 20, height: 20}, parentScene);

        //アイテムスプライト
        this.sprite = phina.display.Sprite("item", 20, 20)
            .addChildTo(this)
            .setFrameIndex(0);
    },

    update: function() {
        //プレイヤーとの当たり判定
        var pl = this.parentScene.player;
        if (!this.isDead && this.hitTestElement(pl)) {
            this.remove();
        }
    },
});
