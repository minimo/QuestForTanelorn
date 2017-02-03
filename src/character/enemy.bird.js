/*
 *  enemy.slime.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//鳥
phina.define("qft.Enemy.Bird", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 30,

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

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 16, height: 18});

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 0, 72, 128);

        this.setAnimation("walk");
        this.advanceTime = 6;
        this.setupLifeGauge();

        this.direction = 0;
        this.speed = 2;

        this.returnTime = 120;
    },

    update: function() {
        if (this.isDead) return;

        if (this.isLookPlayer()) {
            this.speed = 4;
            this.returnTime = 60;
        } else {
            this.speed = 2;
        }

        //方向決定
        if (this.direction == 0) this.vx = this.speed;
        if (this.direction == 180) this.vx = -this.speed;

        //壁に当たったら折り返し
        if (this.checkMapCollision2(this.x-12, this.y, 5, 5)) {
            this.direction = 0;
            this.returnTime = 120;
        } else if (this.checkMapCollision2(this.x+12, this.y, 5, 5)) {
            this.direction = 180;
            this.returnTime = 120;
        }

        //一定時間過ぎたら折り返し
        if (this.returnTime < 0) {
            (this.direction == 0)? this.direction = 180: this.direction = 0;
            this.returnTime = Math.randint(100, 140);
        }
        this.returnTime--;

        //落し物
        if (this.time % 30 == 0) {
            this.parentScene.spawnEnemy(this.x, this.y, "BirdBomb", {});
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
});

//鳥の落し物
phina.define("qft.Enemy.BirdBomb", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 1,

    //防御力
    deffence: 10,

    //攻撃力
    power: 5,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 5, height: 5});

        //表示用スプライト
        this.sprite = phina.display.Sprite("bullet", 24, 32).addChildTo(this).setFrameIndex(72);

        this.setAnimation("normal");
        this.advanceTime = 6;
    },

    update: function() {
        if (this.onFloor) this.remove();
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["normal"] = [72, 73, 74, 73];
        this.index = 0;
    },
});
