/*
 *  enemy.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//敵キャラクタ基本クラス
phina.define("qft.Enemy", {
    superClass: "qft.Character",

    //ヒットポイント
    hp: 1,

    //防御力
    deffence: 1,

    //攻撃力
    power: 1,

    init: function(options, parentScene) {
        this.superInit(options, parentScene);
        this.setupAnimation();

        this.on('enterframe', function() {
            var pl = this.parentScene.player;
            //プレイヤー攻撃との当たり判定
            if (pl.attack && this.hitTestElement(pl.attackCollision)) {
                this.damage(pl);
            }

            //プレイヤーとの当たり判定
            if (!this.isDead && this.hitTestElement(pl)) {
                pl.damage(this);
            }
        });
    },

    damage: function(target) {
        if (this.mutekiTime > 0) return false;
        var dir = 0;
        if (this.x < target.x) dir = 180;

        var pow = Math.floor(target.power / this.deffence);
        this.knockback(pow, dir);
        this.mutekiTime = 10;
        this.hp -= pow;
        if (this.hp < 0) {
            this.hp = 0;
            this.dead();
        }
        return true;
    },

    dead: function() {
        this.remove();
        return;
    },

    //プレイヤーが見える位置にいるのか判定
    isLookPlayer: function() {
        // TODO
        return false;
    },
});

//スライム
phina.define("qft.Slime", {
    superClass: "qft.Enemy",

    //攻撃力
    power: 1,

    init: function(parentScene) {
        this.superInit({width: 16, height: 16}, parentScene);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster", 25, 32).addChildTo(this).setFrameIndex(0);
        this.advanceTime = 10;

        this.dir = 0;
    },

    update: function() {
        if (this.checkMapCollision2(this.x, this.y+20)) {
            if (this.checkMapCollision2(this.x+5, this.y+20) == null) {
                this.dir = 0;
            } else if (this.checkMapCollision2(this.x-5, this.y+20) == null) {
                this.dir = 90;
            }
            if (this.dir == 0) {
                this.vx = -2;
            } else {
                this.vx = 2;
            }
        }
    },

    setupAnimation: function() {
        this.spcialAction = false;
        this.frame = [];
        this.frame["stand"] = [0, 1, 2, 1];
        this.frame["jump"] = [1, "stop"];
        this.frame["walk"] = [0, 1, 2, 1];
        this.frame["up"] =   [0, 1, 2, 1];
        this.frame["down"] = [0, 1, 2, 1];
        this.frame["attack"] = [0, "stop"];
        this.index = 0;
    },
});
