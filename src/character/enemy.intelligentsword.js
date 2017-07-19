/*
 *  enemy.intelligentsword.js
 *  2017/07/19
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Enemy.IntelligentSword", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 50,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 1.0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //地形無視
    ignoreCollision: true,

    //得点
    point: 0,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        this.type = options.type;
        this.power = options.power || this.power;
        this.rotation = options.rotation || 0;
        this.velocity = options.velocity || this.velocity;

        var index = 10 + Math.min(this.level, this.maxIndex);
        this.sprite = phina.display.Sprite("weapons", 24, 24).addChildTo(this).setFrameIndex(index);
        this.setAnimation("pattern1");

        this.on('dead', function() {
        });
    },

    algorithm: function() {
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["pattern1"] = [0];
        this.index = 0;
    },

    snap: function(target) {
        //効果音
        app.playSE("tinkling");
        this.tweener.clear()
            .by({y: -64, rotation: 700}, 15, "easeOutQuad")
            .call(function() {
                this.phase = 10;
            }.bind(this));
    },
});
