/*
 *  itembox.js
 *  2017/01/04
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アイテムボックスクラス
phina.define("qft.ItemBox", {
    superClass: "qft.Character",

    //識別フラグ
    isItemBox: true,

    //耐久力
    hp: 10,

    //アイテム種別
    kind: 0,

    //アニメーション間隔
    advanceTime: 3,

    //反発係数
    rebound: 0.3,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 26, height: 26});

        //アイテムボックススプライト
        this.sprite = phina.display.Sprite("itembox", 32, 32)
            .addChildTo(this)
            .setScale(0.8)
            .setFrameIndex(0);
        this.sprite.tweener.setUpdateType('fps');

        this.setAnimation("close");
        this.kind = options.kind || 0;
    },

    update: function() {
        //プレイヤー攻撃との当たり判定
        var pl = this.parentScene.player;
        if (this.hp > 0 && this.mutekiTime == 0 && pl.attack && this.hitTestElement(pl.attackCollision)) {
            this.hp -= pl.power;
            this.mutekiTime = 10;
            if (this.hp <= 0) {
                this.open(pl);
            }
            if (this.x < pl.x) {
                this.sprite.tweener.clear().moveBy(-5, 0, 2).moveBy(5, 0, 2);
            } else {
                this.sprite.tweener.clear().moveBy(5, 0, 2).moveBy(-5, 0, 2);
            }
        }
        this.visible = true;
    },

    open: function(target) {
        this.isAdvanceAnimation = true;
        this.setAnimation("open");
        if (this.empty) {
        } else {
            this.tweener.clear()
                .wait(10)
                .call(function() {
                    var i = this.parentScene.spawnItem(this.x, this.y, {kind: this.kind});
                    i.vy = -5;
                }.bind(this))
        }
    },

    setupAnimation: function(options) {
        this.spcialAnimation = false;
        this.frame = [];
        if (options.color == "gold") {
            this.frame["close"] = [0];
            this.frame["open"] = [0, 6, 12, 18, "stop"];
        } else if (options.color == "red") {
            this.frame["close"] = [1];
            this.frame["open"] = [1, 7, 13, 19, "stop"];
        } else if (options.color == "blue") {
            this.frame["close"] = [2];
            this.frame["open"] = [2, 8, 14, 20, "stop"];
        } else {
            this.frame["close"] = [0];
            this.frame["open"] = [0, 3, 6, "stop"];
        }
        this.index = 0;
    },
});
