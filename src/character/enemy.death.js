/*
 *  enemy.death.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//死神
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
    eyesight: 512,

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

        this.setAnimation("move");
        this.advanceTime = 10;
        this.setupLifeGauge();

        this.direction = 0;
        this.isAttack = false;
        this.actionWait = 0;
    },

    update: function() {
        if (this.isLookPlayer()) {
            if (this.getDistancePlayer() < 256 && this.actionWait == 0) {
                //一定距離内に入ったら攻撃する
                for (var i = 0; i < this.level+4; i++) {
                    var b = this.parentScene.spawnEnemy(this.x, this.y, "DeathFlame", {pattern: 1});
                    b.vy = -10;
                    b.vx = (i*2) * this.scaleX;
                }
                this.actionWait = 180;
            } else {
                //プレイヤーが見える位置にいたら寄っていく
                var player = this.parentScene.player;
                var p1 = phina.geom.Vector2(this.x, this.y);
                var p2 = phina.geom.Vector2(player.x, player.y);
                var p = p2.sub(p1);
                p.normalize();
                this.vx = p.x;
                this.vy = p.y;
                this.setAnimation("move");
            }
        } else {
            this.vx = 0;
            this.vy = 0;
        }

        if (this.actionWait > 0) this.actionWait--;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["move"] = [3, 4, 5, 4];
        this.frame["up"] =   [0, 1, 0, 2];
        this.frame["down"] = [6, 7, 6, 8];
        this.frame["attack"] = [6, 7, 6, 8];
        this.index = 0;
    },
});

//炎
phina.define("qft.Enemy.DeathFlame", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 10,

    //攻撃力
    power: 10,

    //地形無視
    ignoreCollision: true,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 20});
        this.superInit(parentScene, options);

        this.pattern = options.pattern || 0;
        this.lifeSpan = options.lifeSpan || 120;
        this.power += this.level * 5;

        //表示用スプライト
        this.sprite = phina.display.Sprite("flame03", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 0, 144, 128);

        this.setAnimation("appear");
        this.advanceTime = 3;

        this.direction = 0;
    },

    update: function() {
    },

    setupAnimation: function(index) {
        index = index || 0;
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["appear"] = [15+index, 9+index, 3+index, 21+index, "normal"];
        this.frame["normal"] = [ 0+index, 6+index,12+index, 18+index];
        this.index = 0;
    },
});
