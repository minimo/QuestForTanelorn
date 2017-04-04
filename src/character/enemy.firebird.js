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
    viewAngle: 60,

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
        options = (options || {}).$extend({width: 16, height: 16});
        options = options.$safe(this.defaultOptions);
        this.superInit(parentScene, options);


        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(288, 0, 72, 128);

        this.setAnimation("walk");
        this.advanceTime = 6;
        this.setupLifeGauge();

        this.direction = this.options.direction || 0;
        this.speed = this.options.speed || 2;
        this.vertical = this.options.vertical || false;
        this.returnTime = this.options.returnTime || 120;
        this.bombInterval = this.options.bombInterval || 60;

        this.on('dead', function() {
            this.parentScene.spawnEffect(this.x, this.y);
            app.playSE("bomb");
        });

        this.stopTime = 0;
        this.attackCount = 0;
    },

    update: function() {
        var px, py;
        if (this.vertical) {
            //方向決定
            if (this.direction == 0) this.vy = this.speed;
            if (this.direction == 180) this.vy = -this.speed;
            px = 0;
            py = 12;
            if (this.getDistancePlayer() < 256) {
                if (this.x < this.parentScene.player.x) this.sprite.scaleX = 1; else this.sprite.scaleX = -1;
            }
        } else {
            //方向決定
            if (this.direction == 0) this.vx = this.speed;
            if (this.direction == 180) this.vx = -this.speed;
            px = 12;
            py = 0;
        }

        //壁に当たったら折り返し
        if (this.checkMapCollision2(this.x-px, this.y-py, 5, 5)) {
            this.direction = 0;
            this.returnTime = this.options.returnTime;
        } else if (this.checkMapCollision2(this.x+px, this.y+py, 5, 5)) {
            this.direction = 180;
            this.returnTime = this.options.returnTime;
        }

        //プレイヤーをみつけたら攻撃
        if (this.isLookPlayer() && this.getDistancePlayer() < 128 && this.stopTime == 0) {
            if (this.time % 15 == 0) {
                var b = this.parentScene.spawnEnemy(this.x, this.y+6, "Bullet", {pattern: "pattern2", explode: true, velocity: 3});
                b.rotation = this.getPlayerAngle();
            }
            this.speed = 0;
            this.stopTime = 60;
        } else {
            this.speed = this.options.speed;
            this.returnTime -= 1;
            //落し物
            if (this.getDistancePlayer() < 512 && this.time % 90 == this.bombInterval) {
                this.parentScene.spawnEnemy(this.x, this.y, "FireBirdBomb", {});
            }
        }

        //一定時間過ぎたら折り返し
        if (this.returnTime < 0) {
            (this.direction == 0)? this.direction = 180: this.direction = 0;
            this.returnTime = this.options.returnTime;
        }

        //向きの指定
        if (this.vx != 0) {
            if (this.vx > 0) {
                this.scaleX = 1;
            } else {
                this.scaleX = -1;
            }
        }
        this.stopTime--;
        if (this.stopTime < 0) {
            this.stopTime = 0;
        }
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
        this.advanceTime = 6;
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
