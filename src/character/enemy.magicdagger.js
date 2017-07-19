/*
 *  enemy.magicdgger.js
 *  2017/07/19
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Enemy.MagicDagger", {
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

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        this.sprite = phina.display.Sprite("weapons", 24, 24).addChildTo(this).setFrameIndex(0);
        this.setAnimation("pattern1");

        this.power = options.power || this.power;
        this.parentUnit = options.parent || null;
        this.offsetX = options.offsetX || Math.randint(-16, 16);
        this.offsetY = options.offsetY || Math.randint(-16, 16);

        this.isAttack = false;
        this.isAttack_before = false;
        this.isDamaged = false;

        this.phase = 0;
    },

    algorithm: function() {
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        //待機
        if (this.phase == 0) {
            this.x = this.parentUnit.x + this.offsetX;
            this.y = this.parentUnit.y + this.offsetY;
            this.y += Math.cos(this.time.toRadian() * 6) * 5;
            this.rotation += 3;

            if (this.isAttack) {
                this.phase = 1;
                this.isAttack = false;
            }
        }

        //プレイヤーに向かう
        if (this.phase == 1) {
            this.phase++;
            this.rotation = this.getPlayerAngle() + 135;
            this.tweener.clear()
                .moveTo(pl.x, pl.y, 20)
                .call(() => {
                    this.phase = 10;
                });
        }

        //攻撃終了
        if (this.phase == 10) {
            this.phase++;
            this.tweener.clear()
                .moveTo(this.parentUnit.x + this.offsetX, this.parentUnit.y + this.offsetY, 20)
                .call(() => {
                    this.phase = 0;
                });
        }

        if (this.parentUnit) {
            this.direction = this.parentUnit.direction;
            if (this.parentUnit.hp == 0) this.remove();
        }

        this.isAttack_before = this.isAttack;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["pattern1"] = [0];
        this.index = 0;
    },

    damage: function(target) {
        this.isDamaged = true;

        //効果音
        app.playSE("tinkling");
        this.tweener.clear()
            .by({y: -64, rotation: 700}, 15, "easeOutQuad")
            .call(function() {
                this.phase = 10;
            }.bind(this));
    },
});
