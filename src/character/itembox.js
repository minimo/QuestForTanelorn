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
    hp: 1,

    //開いたフラグ
    opened: false,

    //アイテム種別
    kind: 0,

    //アニメーション間隔
    advanceTime: 3,

    //反発係数
    rebound: 0.3,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 26, height: 26}.$safe(options));

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
        //プレイヤー攻撃（固定）との当たり判定
        var pl = this.parentScene.player;
        if (pl.attack && this.hitTestElement(pl.attackCollision)) {
            this.damage(pl);
        }
        //プレイヤー攻撃判定との当たり判定
        if (!this.opened) {
            this.parentScene.playerLayer.children.forEach(function(e) {
                if (e instanceof qft.PlayerAttack && e.isCollision && this.hitTestElement(e)) {
                    e.remove();
                    this.damage(e);
                }
            }.bind(this));
        }
        this.visible = true;
    },

    damage: function(target) {
        if (this.opened) return;
        this.hp -= target.power;
        this.mutekiTime = 10;
        if (this.hp <= 0) {
            this.open();
        }
        if (this.x < target.x) {
            this.sprite.tweener.clear().moveBy(-5, 0, 2).moveBy(5, 0, 2);
        } else {
            this.sprite.tweener.clear().moveBy(5, 0, 2).moveBy(-5, 0, 2);
        }
    },

    open: function() {
        this.isAdvanceAnimation = true;
        this.opened = true;
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
            this.frame["close"] = [2];
            this.frame["open"] = [2, 6, 8, "stop"];
        } else if (options.color == "red") {
            this.frame["close"] = [1];
            this.frame["open"] = [1, 4, 7, "stop"];
        } else if (options.color == "blue") {
            this.frame["close"] = [0];
            this.frame["open"] = [0, 3, 6, "stop"];
        } else {
            this.frame["close"] = [1];
            this.frame["open"] = [1, 4, 7, "stop"];
        }
        this.index = 0;
    },
});
