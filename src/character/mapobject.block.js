/*
 *  mapobject.block.js
 *  2017/03/13
 *  @auther minimo  
 *  This Program is MIT license.
 */

qft.MapObject = qft.MapObject || {};

//ブロッククラス
phina.define("qft.MapObject.Block", {
    superClass: "qft.Character",

    id: null,

    //耐久力
    hp: 5,

    //識別フラグ
    isBlock: true,

    //重力加速度
    gravity: 0.0,

    //アニメーション間隔
    advanceTime: 3,

    //地形無視
    ignoreCollision: true,

    init: function(parentScene, options) {
        var width = options.width || 36;
        var height = options.height || 64;
        this.superInit(parentScene, {width: width, height: height});

        //スプライト
        this.sprite = phina.display.Sprite("block", 32, 32).addChildTo(this).setFrameIndex(3);
        this.id = options.id;

        this.on('dead', function() {
            this.remove();
        });
    },

    update: function(e) {
        if (!this.isDead) {
            //プレイヤー攻撃（固定）との当たり判定
            var pl = this.parentScene.player;
            if (pl.attack && this.hitTestElement(pl.attackCollision)) {
                this.damage(pl);
            }
            //プレイヤー攻撃判定との当たり判定
            this.parentScene.playerLayer.children.forEach(function(e) {
                if (e instanceof qft.PlayerAttack && e.isCollision && this.hitTestElement(e)) {
                    e.remove();
                    this.damage(e);
                }
            }.bind(this));
        }
        this.visible = true;    //点滅キャンセル
    },

    damage: function(target) {
        if (this.isDead) return;
        this.hp -= target.power;
        this.mutekiTime = 30;
        if (this.hp <= 0) {
            this.isDead = true;
            this.flare('dead');
        }
        if (this.x < target.x) {
            this.sprite.tweener.clear().moveBy(-2, 0, 2).moveBy(2, 0, 2);
        } else {
            this.sprite.tweener.clear().moveBy(2, 0, 2).moveBy(-2, 0, 2);
        }
    },

    setupAnimation: function(options) {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["opend"] = [3, "stop"];
        this.frame["closed"] = [2, "stop"];
        this.frame["open"] = [2, 1, 0, 3, "stop"];
        this.frame["close"] = [3, 0, 1, 2, "stop"];
        this.index = 0;
    },
});
