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

    //気絶確率
    stunPower: 30,

    //視力
    eyesight: 128,

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
    damageFire: 2.0,
    damegeIce: 0.8,

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

        this.phase = 0;
        this.speed = 1;

        this.isHide = false;
    },

    algorithm: function() {
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        if (look) {
            //プレイヤーが見てない時のみ移動
            var move = false;
            if (this.x > pl.x) {
                if (pl.scaleX == -1) move = true;
            } else {
                if (pl.scaleX == 1) move = true;
            }
            if (move) {
                if (this.isHide) {
                    this.isHide = false;
                    this.tweener.clear()
                        .wait(15)
                        .to({alpha: 1.0, speed: 0.5}, 60, "easeInOutSine");
                }
            } else {
                if (!this.isHide) {
                    this.isHide = true;
                    this.isEnableAttackCollision = false;
                    this.tweener.clear()
                        .wait(15)
                        .to({alpha: 0.4, speed: 0}, 20, "easeInOutSine");
                }
            }
            var p1 = phina.geom.Vector2(this.x, this.y);
            var p2 = phina.geom.Vector2(pl.x, pl.y);
            var p = p2.sub(p1);
            p.normalize();
            this.vx = p.x * this.speed;
            this.vy = p.y * this.speed;

            this.flare('balloon', {pattern: "!"});
        } else {
            //プレイヤーを発見してない場合は近距離をうろうろする
            if (this.phase == 0) {
                this.flare('balloon', {pattern: "..."});
                this.vx = 0;
                this.vy = 0;
                this.phase = 1;
                this.tweener.clear()
                    .to({alpha: 1.0}, 30, "easeInOutSine")
                    .set({scaleX: 1})
                    .by({x: 96}, 120,"easeInOutSine")
                    .set({scaleX: -1})
                    .by({x: -96}, 120,"easeInOutSine")
                    .setLoop(true);
            }
        }

        //半透明時は無敵だけど攻撃判定も無い
        if (this.alpha == 0.4) {
            this.isMuteki = true;
            this.isAttackCollision = false;
        } else {
            this.isMuteki = false;
            this.isAttackCollision = true;
        }

        //一定距離内に入ったら攻撃する
        if (!this.isHide && dis < 128 && this.actionWait == 0) this.isAttack = true;

        //攻撃
        if (this.isAttack) {
            this.isAttack = false;
            var b = this.parentScene.spawnEnemy(this.x, this.y, "DeathFlame", {pattern: 1});
            b.vy = -2;
            b.vx = 16 * this.scaleX;
            this.actionWait = 120;
        }

        if (this.actionWait > 0) this.actionWait--;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["move"] = [3, 4, 5, 4];
        this.frame["up"] = [6, 7, 6, 8];
        this.frame["down"] =   [0, 1, 0, 2];
        this.frame["attack"] = [3, 4, 5, 4];
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

    //重力加速度
    gravity: 0.3,

    //横移動減衰率
    friction: 0.1,

    //気絶確率
    stunPower: 20,

    //地形無視
    ignoreCollision: false,

    //無敵フラグ
    isMuteki: true,

    //攻撃当たり判定有効フラグ
    isAttackCollision: true,

    //寿命
    lifeSpan: 120,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 20});
        this.superInit(parentScene, options);

        this.pattern = options.pattern || 0;
        this.lifeSpan = options.lifeSpan || 120;
        this.power += this.level * 5;

        this.setupAnimation(this.pattern);

        //表示用スプライト
        this.sprite = phina.display.Sprite("flame03", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 0, 144, 128);

        this.setAnimation("appear");
        this.advanceTime = 3;

        this.direction = 0;
    },

    algorithm: function() {
        if (this.lifeSpan == 0) this.remove();
        if (this.lifeSpan < 30) {
            if (this.time % 2 == 0) this.visible = !this.visible;
        } else if (this.lifeSpan < 60){
            if (this.time % 5 == 0) this.visible = !this.visible;
        } else if (this.lifeSpan < 90) {
            if (this.time % 10 == 0) this.visible = !this.visible;
        }
        this.lifeSpan--;
    },

    setupAnimation: function(index) {
        index = index || 0;
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["appear"] = [15+index, 9+index, 3+index, 21+index, "normal"];
        this.frame["normal"] = [ 0+index, 6+index,12+index, 18+index];
        this.index = 0;
    },

    dropDead: function() {
        this.isDead = true;
        this.isDrop = true;
        return this;
    },
});
