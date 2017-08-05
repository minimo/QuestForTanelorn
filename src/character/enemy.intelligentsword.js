/*
 *  enemy.intelligentsword.js
 *  2017/07/19
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Enemy.IntelligentSword", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 20,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 1.0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 20,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 360,

    //得点
    point: 2000,

    //アニメーションフラグ
    isAnimation: false,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_LONGSWORD,

    //レアドロップ率（％）
    rareDropRate: 1,
    rareDropItem: ITEM_LONGSWORD,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 24});
        this.superInit(parentScene, options);

        this.type = options.type;
        this.power = options.power || this.power;
        this.rotation = options.rotation || 0;
        this.velocity = options.velocity || this.velocity;

        this.sprite = phina.display.Sprite("weapons", 24, 24)
            .addChildTo(this)
            .setFrameIndex(10 + Math.min(9, this.level))
            .setRotation(215);
        this.sprite.tweener.clear()
            .to({y: -2}, 1000, "easeInOutSine")
            .to({y: 4}, 1000, "easeInOutSine")
            .setLoop(true);
    },

    algorithm: function() {
        //プレイヤーとの距離
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        if (look && dis < 64) {
            if (this.x < pl.x) {
                this.scaleX = 1;
            } else {
                this.scaleX = -1;
            }
            var ang = this.getAngle(pl);
            this.sprite.rotation = ang;
        }

        if (look) {
            this.flare('balloon', {pattern: "!", lifeSpan: 15, y: 0});
        } else {
            this.flare('balloonerace');
        }
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
