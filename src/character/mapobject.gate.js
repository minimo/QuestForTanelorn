/*
 *  mapobject.gate.js
 *  2017/03/20
 *  @auther minimo  
 *  This Program is MIT license.
 */

qft.MapObject = qft.MapObject || {};

//ワープゲート
phina.define("qft.MapObject.Gate", {
    superClass: "qft.Character",

    id: null,

    //重力加速度
    gravity: 0.0,

    //アニメーション間隔
    advanceTime: 3,

    //地形無視
    ignoreCollision: true,

    //実行済みフラグ
    already: false,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 36, height: 64});
        this.$safe(options);

        this.id = options.id;
        this.offset = options.properties.offset || 0;

        //スプライト
        this.sprite = phina.display.Sprite("gate", 16, 32)
            .addChildTo(this)
            .setScale(2)
            .setFrameIndex(0);
        this.advanceTime = 6;

        //ゲート機能
        var properties = options.properties;
        switch (options.name) {
            //マップ内移動
            case "warp":
                this.nextID = properties.nextID;
                this.offset = properties.offset || 0;
                this.on('entergate', function() {
                    //行き先の検索
                    var next = this.findGate(this.nextID);
                    if (!next) return;
                    this.enterPlayer();
                    this.parentScene.warp(next.x, next.y+next.offset);
                    this.tweener.clear()
                        .wait(120)
                        .call(function(){
                            this.already = false;
                            next.leavePlayer();
                        }.bind(this));
                });
                break;
        }

        this.time = 0;
    },

    update: function() {
        if (this.time % this.advenceTime == 0) {
//            this.sprite.frameIndex++;
        }

        //プレイヤーとの当たり判定
        var pl = this.parentScene.player;
        var hit = this.hitTestElement(pl);
        if (hit && !this.already && this.x-3 < pl.x && pl.x < this.x+3) {
            this.already = true;
            this.flare('entergate');
        }
        if (this.already && !hit) this.already = false;
    },

    //プレイヤーがゲートに入る
    enterPlayer: function() {
        var enterOffset = this.enterOffset || 0;
        var player = this.parentScene.player;
        player.alpha = 0;
        player.isControl = false;
        player.muteki = true;
        var pl = qft.PlayerDummy("player1")
            .setPosition(player.x, player.y)
            .addChildTo(this.parentScene.mapLayer.playerLayer);
        pl.setAnimation("walk");
        pl.tweener.clear().setUpdateType('fps')
            .call(function() {
                pl.animation = false;
            })
            .fadeOut(15)
            .call(function() {
                pl.remove();
            });
    },

    //プレイヤーがゲートから出る
    leavePlayer: function() {
        var player = this.parentScene.player;
        player.alpha = 0;
        player.isControl = false;
        player.muteki = true;
        var pl = qft.PlayerDummy("player1")
            .setPosition(this.x, this.y+16)
            .addChildTo(this.parentScene.mapLayer.playerLayer);
        pl.alpha = 0;
        pl.setAnimation("walk");
        pl.tweener.clear().setUpdateType('fps')
            .fadeIn(15)
            .moveTo(player.x, player.y, 30)
            .fadeIn(10)
            .call(function() {
                player.alpha = 1;
                player.isControl = true;
                player.muteki = false;
                pl.remove();
            });
    },

    //他のゲートを検索
    findGate: function(id) {
        var result = null;
        this.parentScene.objLayer.children.forEach(function(e) {
            if (e instanceof qft.MapObject.Gate) {
                if (e.id == id) result = e;
            }
        }.bind(this));
        return result;
    },
});
