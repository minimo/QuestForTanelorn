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

    defaultOptions: {
        speed: 2,
        direction: 0,
        returnTime: 120,
    },

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 16, height: 18});
        this.options = (options || {}).$safe(this.defaultOptions);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(288, 0, 72, 128);

        this.setAnimation("walk");
        this.advanceTime = 6;
        this.setupLifeGauge();

        this.direction = this.options.direction;
        this.speed = this.options.speed;

        this.returnTime = this.options.returnTime;

        this.on('dead', function() {
            this.parentScene.spawnEffect(this.x, this.y);
            app.playSE("bomb");
        });
    },

    update: function() {
        if (this.isDead) return;

        //方向決定
        if (this.direction == 0) this.vx = this.speed;
        if (this.direction == 180) this.vx = -this.speed;

        //壁に当たったら折り返し
        if (this.checkMapCollision2(this.x-12, this.y, 5, 5)) {
            this.direction = 0;
            this.returnTime = this.options.returnTime;
        } else if (this.checkMapCollision2(this.x+12, this.y, 5, 5)) {
            this.direction = 180;
            this.returnTime = this.options.returnTime;
        }

        //プレイヤーをみつけたら攻撃
        if (this.isLookPlayer() && this.getDistancePlayer() < 128) {
            if (this.time % 30 == 0) {
                var b = this.parentScene.spawnEnemy(this.x, this.y+6, "Bullet", {pattern: "pattern2", explode: true, velocity: 3});
                b.rotation = this.getPlayerAngle();
            }
            this.speed = 0;
        } else {
            this.speed = this.options.speed;
            this.returnTime -= 1;
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
