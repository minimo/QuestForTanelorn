/*
 *  enemy.wisp.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ウィスプ
phina.define("qft.Enemy.Death", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 30,

    //重力加速度
    gravity: 0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 20,

    //視力
    eyesight: 256,

    //視野角
    viewAngle: 360,

    //地形無視
    ignoreCollision: true,

    //得点
    point: 300,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_STONE,

    //レアドロップ率（％）
    rareDropRate: 5,
    rareDropItem: ITEM_STONE,

    //属性ダメージ倍率
    damageFire: 0.8,
    damegeIce: 2,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster02", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 128, 72, 128);

        this.setAnimation("stand");
        this.advanceTime = 10;
        this.setupLifeGauge();

        this.direction = 0;
        this.move = false;
    },

    update: function() {
        //プレイヤーが近くにいたら寄っていく
        if (this.isLookPlayer()) {
            var player = this.parentScene.player;
            var p1 = phina.geom.Vector2(this.x, this.y);
            var p2 = phina.geom.Vector2(player.x, player.y);
            var p = p2.sub(p1);
            p.normalize();
            this.vx = p.x;
            this.vy = p.y;
        } else {
            this.vx = 0;
            this.vy = 0;
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [3, 4, 5, 4];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [0, 1, 0, 2];
        this.frame["down"] = [6, 7, 6, 8];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },
});
