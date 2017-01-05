/*
 *  enemy.slime.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ウィスプ
phina.define("qft.Wisp", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 1,

    //重力加速度
    gravity: 0,

    //防御力
    deffence: 1,

    //攻撃力
    power: 1,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 90,

    //地形無視
    ignoreCollision: true,

    init: function(options, parentScene) {
        this.superInit({width: 16, height: 16}, parentScene);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster08_a1", 24, 32).addChildTo(this).setFrameIndex(0);
        this.advanceTime = 10;

        this.setAnimation("stand");

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
        this.frame["stand"] = [48, 49, 50];
        this.frame["jump"] = [49, "stop"];
        this.frame["walk"] = [60, 61, 62];
        this.frame["up"] =   [48, 49, 50];
        this.frame["down"] = [48, 49, 50];
        this.frame["attack"] = [48, 49, 50];
        this.index = 0;
    },
});
