/*
 *  mapobject.npc.js
 *  2017/08/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

//冒険者
phina.define("qft.Mapobject.npc", {
    superClass: "qft.Character",

    //アニメーション間隔
    animationInterval: 6,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 24, height: 20});
        this.superInit(parentScene, options);

        this.sprite = phina.display.Sprite("player1", 32, 32).addChildTo(this);
        this.sprite.scaleX = -1;

        this.setAnimation("walk");
    },

    algorithm: function() {
    },

    //攻撃
    attack: function() {
        this.animationInterval = 2;
        this.setAnimation("attack");
        this.phase = "attacking";

        app.playSE("attack");
        this.weapon.tweener.clear()
            .set({rotation: 200, alpha: 1.0})
            .to({rotation: 360}, 6)
            .fadeOut(1)
            .call(() => {
                this.animationInterval = 6;
                this.setAnimation("walk");
                this.phase = "approach";
            });
    },

    //飛び道具弾き
    guard: function() {
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [13, 14];
        this.frame["jump"] = [36, "stop"];
        this.frame["walk"] = [ 3,  4,  5,  4];
        this.frame["up"] =   [ 9, 10, 11, 10];
        this.frame["down"] = [ 0,  1,  2,  1];
        this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
        this.frame["defense"] = [ 41, 42, 43, 44, "stop"];
        this.frame["damage"] = [ 18, 19, 20];
        this.frame["drop"] = [18, 19, 20];
        this.frame["dead"] = [18, 19, 20, 33, 34, 35, "stop"];
        this.frame["clear"] = [24, 25, 26];
        this.frame["stun"] = [ 18, 19, 20];
        this.index = 0;
        return this;
    },
});
