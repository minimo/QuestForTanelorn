/*
 *  enemy.firebird.js
 *  2016/03/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

//鳥
phina.define("qft.Enemy.FireBird", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 50,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 256,

    //視野角
    viewAngle: 90,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 0,

    //得点
    point: 200,

    //属性ダメージ倍率
    damageArrow: 5,
    damageFire: 0.5,
    damegeIce: 2,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_COIN,

    //レアドロップ率（％）
    rareDropRate: 3,
    rareDropItem: ITEM_BAG,

    defaultOptions: {
        speed: 2,
        direction: 0,
        returnTime: 120,
    },

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16, offsetCollisionX: -6});
        options = options.$safe(this.defaultOptions);
        this.superInit(parentScene, options);


        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(288, 0, 72, 128);

        this.setAnimation("walk");
        this.animationInterval = 6;
        this.setupLifeGauge();

        this.isVertical = this.options.vertical || false;
        this.direction = this.options.direction || this.isVertical? 90: 0;
        this.speed = this.options.speed || 2;
        this.returnTime = this.options.returnTime || 120;
        this.bombInterval = this.options.bombInterval || 90;
        this.attackInterval = 0;
        this.attackCount = 99;
        this.isAttack = false;

        this.on('damaged', e => {
            if (this.isVertical) return;
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
        this.on('dead', function() {
            this.parentScene.spawnEffect(this.x, this.y);
            app.playSE("bomb");
        });
    },

    algorithm: function() {
        //チェックする壁決定
        var chk = 1;
        if (this.isVertical) chk = 0;

        //壁に当たるか一定時間経過で折り返し
        if (this._collision[chk].hit || this._collision[chk+2].hit || this.returnTime < 0) {
            this.direction = (this.direction + 180) % 360;
            this.returnTime = this.options.returnTime;
        }
        //移動
        var rad = this.direction.toRadian();
        this.vx = Math.cos(rad) * this.speed;
        this.vy = Math.sin(rad) * this.speed;
        this.returnTime--;
 
        //プレイヤーを見つけたら攻撃
        var lookPlayer = this.isLookPlayer();
        if (lookPlayer) {
            if (this.attackInterval == 0) {
                var b = this.parentScene.spawnEnemy(this.x, this.y+6, "Bullet", {pattern: "pattern2", explode: true, velocity: 3});
                b.rotation = this.getPlayerAngle();
                this.attackInterval = 90;
            }
        } else {
                this.attackInterval = 60;
        }

        //落し物
        if (this.onScreen && this.time % this.bombInterval == 0) {
            this.parentScene.spawnEnemy(this.x, this.y, "FireBirdBomb", {});
        }

        //向きの指定
        if (this.vx != 0) {
            if (this.vx > 0) {
                this.scaleX = 1;
            } else {
                this.scaleX = -1;
            }
        }
        if (this.isVertical && this.getDistancePlayer() < 256) {
            if (this.x < this.parentScene.player.x) this.scaleX = 1; else this.scaleX = -1;
        }

        if (this.attackInterval > 0) this.attackInterval--;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["walk"] = [3, 4, 5, 4];
        this.index = 0;
    },

    attack: function() {
    },
});

//鳥の落し物
phina.define("qft.Enemy.FireBirdBomb", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 1,

    //防御力
    deffence: 10,

    //攻撃力
    power: 5,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 5, height: 5});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("bullet", 24, 32).addChildTo(this).setFrameIndex(72);

        this.setAnimation("normal");
        this.animationInterval = 6;
    },

    update: function() {
        if (this.onFloor) {
            this.parentScene.spawnEffect(this.x, this.y, {name: "explode_ground"});
            if (this.onScreen) app.playSE("bomb");
            this.remove();
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["normal"] = [72, 73, 74, 73];
        this.index = 0;
    },

    dropDead: function() {
        this.isDead = true;
        this.isDrop = true;
        return this;
    },
});
