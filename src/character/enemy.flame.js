/*
 *  enemy.slime.js
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
    muteki: true,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 16, height: 20});

        //表示用スプライト
        this.sprite = phina.display.Sprite("flame", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(72, 0, 24, 128);

        this.setAnimation("normal");
        this.advanceTime = 3;

        this.direction = 0;
    },

    update: function() {
        if (this.time > 120) {
            this.remove();
        } else if (this.time > 90) {
            if (this.time % 2 == 0) this.visible = !this.visible;
        } else if (this.time > 60) {
            if (this.time % 5 == 0) this.visible = !this.visible;
        } else if (this.time > 30) {
            if (this.time % 10 == 0) this.visible = !this.visible;
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["normal"] = [0, 1, 2, 3];
        this.index = 0;
    },
});
