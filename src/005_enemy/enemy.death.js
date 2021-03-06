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
    viewAngle: 180,

    //地形無視
    ignoreCollision: true,

    //ノックバックキャンセル
    isSuperArmor: true,

    //得点
    point: 500,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_STONE,

    //レアドロップ率（％）
    rareDropRate: 5,
    rareDropItem: ITEM_STONE,

    //属性ダメージ倍率
    damageFire: 2.0,
    damageIce: 0.8,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster02", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 128, 72, 128);

        this.hp += this.level * 5;
        this.power += this.level * 1;
        this.point += this.level * 100;

        this.setAnimation("move");
        this.animationInterval = 10;
        this.setupLifeGauge();

        this.direction = 0;
        this.isAttack = false;

        this.phase = 0;
        this.speed = 1;

        //行動パターン
        this.pattern = options.pattern || "linear";
        this.moveLength = options.length || 48;
        this.degree = 0;
        this.isVertical = false;

        //被ダメージ時処理
        this.on('damaged', e => {
            this.phase = 0;
        });

        this.tweener2 = phina.accessory.Tweener().attachTo(this);
    },

    algorithm: function() {
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        var rad = this.degree.toRadian();
        if (this.pattern == "linear") {
            if (this.isVertical) {
                this.vy = Math.cos(rad) * 2;
            } else {
                this.vx = Math.cos(rad) * 2;
            }
        }
        this.degree += 2;

        //徘徊モードの場合は適当に攻撃
        if (this.time % 90 == 0) this.isAttack = true;

        //攻撃
        if (this.isAttack) {
            this.isAttack = false;
            var b = this.parentScene.spawnEnemy(this.x, this.y, "DeathFlame", {pattern: 0});
            b.vy = -2;
            b.vx = 2 * this.scaleX;
            this.actionWait = 120;
        }
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
    gravity: 0.1,

    //横移動減衰率
    friction: 0.98,

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

    //影表示フラグ
    isShadow: false,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 20});
        this.superInit(parentScene, options);

        this.pattern = options.pattern || 0;
        this.lifeSpan = options.lifeSpan || 120;
        this.power += this.level * 5;

        this.setupAnimation(this.pattern);

        //表示用スプライト
        this.sprite = phina.display.Sprite("flame03", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 0, 144, 128).setFrameIndex(15 + this.pattern);

        this.setAnimation("appear");
        this.animationInterval = 3;

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
        this.frame["appear"] = [15+index, 9+index,  3+index, 21+index, "normal"];
        this.frame["normal"] = [ 0+index, 6+index, 12+index, 18+index];
        this.index = 0;
    },

    dropDead: function() {
        this.isDead = true;
        this.isDrop = true;
        return this;
    },
});
