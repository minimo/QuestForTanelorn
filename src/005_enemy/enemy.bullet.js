/*
 *  enemy.bullet.js
 *  2017/01/13
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Enemy.Bullet", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 1,

    //寿命
    lifespan: 75,

    //速度
    velocity: 2,

    //加速度
    accel: 1.02,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 1.0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //地形無視
    ignoreCollision: true,

    //得点
    point: 0,

    //爆発フラグ
    explode: false,

    //影表示フラグ
    isShadow: false,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 20, height: 20});
        this.superInit(parentScene, options);

        this.type = options.type;
        this.power = options.power || this.power;
        this.rotation = options.rotation || 0;
        this.velocity = options.velocity || this.velocity;
        this.lifeSpan = options.lifeSpan || this.lifeSpan;

        //表示用スプライト
        switch (options.type) {
            case "explode":
                this.sprite = phina.display.Sprite("effect", 48, 48).addChildTo(this).setFrameTrimming(0, 192, 192, 96);
                this.animationInterval = 3;
                this.explode = false;
                this.ignoreCollision = true;
                this.isMuteki = true;
                this.pattern = "explode";
                break;
            default:
                this.sprite = phina.display.Sprite("bullet", 24, 32).addChildTo(this).setFrameIndex(9);
                this.animationInterval = 3;
                this.explode = options.explode || true;
                this.pattern = options.pattern || "pattern1";
                break;
        }

        this.setAnimation(this.pattern);

        this.on('dead', function() {
            if (this.explode) {
                this.parentScene.spawnEffect(this.x, this.y);
                app.playSE("bomb");
            }
        });
    },

    algorithm: function() {
        var rad = this.rotation.toRadian();
        this.vx = Math.cos(rad) * this.velocity;
        this.vy = Math.sin(rad) * this.velocity;
        this.velocity *= this.accel;
        if (this.vx > 1) this.sprite.scaleX = 1; else this.sprite.scaleX = -1;
        if (this.time > this.lifespan) this.remove();

        if (!this.ignoreCollision) {
            if (this._collision[0].hit ||
                this._collision[1].hit ||
                this._collision[2].hit ||
                this._collision[3].hit) this.flare('dead');
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["pattern1"] = [9, 10, 11, 10];
        this.frame["pattern2"] = [15, 16, 17, 16];
        this.frame["explode"] = [0, 1, 2, 3, 4, 5, 6, 7, "remove"];
        this.index = 0;
    },

    hit: function() {
        if (this.type == "explode") return;

        this.remove();
        this.flare('dead');
    },

    dropDead: function() {
        this.isDead = true;
        this.isDrop = true;
        this.vx = 0;
        this.vy = -10;
        return this;
    },
});
