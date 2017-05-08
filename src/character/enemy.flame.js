/*
 *  enemy.flame.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//炎
phina.define("qft.Enemy.Flame", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 10,

    //攻撃力
    power: 10,

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

        //表示用スプライト
        this.sprite = phina.display.Sprite("flame02", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(Math.min(this.pattern, 2) * 24 + 72, 0, 24, 128);

        this.setAnimation("normal");
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

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["normal"] = [0, 1, 2, 3];
        this.index = 0;
    },

    dropDead: function() {
        this.isDead = true;
        this.isDrop = true;
        return this;
    },
});
