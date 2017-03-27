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

    //地形無視
    ignoreCollision: true,

    //実行済みフラグ
    already: false,

    //アニメーションフラグ
    isAdvanceAnimation: false,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 36, height: 64});
        this.$safe(options);

        this.id = options.id;
        this.offset = options.properties.offset || 0;

        //スプライト
        this.sprite = null;

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
                        .wait(135)
                        .call(function(){
                            this.already = false;
                            next.already = true;
                            next.leavePlayer();
                        }.bind(this));
                });
                break;
        }

        this.time = 0;
    },

    update: function() {
        //プレイヤーとの当たり判定
        var pl = this.parentScene.player;
        var hit = this.hitTestElement(pl);
        if (hit && !this.already && this.x-3 < pl.x && pl.x < this.x+3) {
            this.already = true;
            this.flare('entergate');
        }

        //パーティクル
        if (this.time % 3 == 0) {
            (2).times(function(i) {
                var sp = phina.display.Sprite("particle", 16, 16)
                    .addChildTo(this)
                    .setFrameIndex(0)
                    .setScale(0)
                    .setPosition(Math.randint(-16, 16), Math.randint(-3, 3));
                sp.alpha = 0.3;
                sp.tweener.clear()
                    .by({y: -32, alpha:  0.7, scaleX:  0.5, scaleY:  0.5}, 500, "easeInSine")
                    .by({y: -32, alpha: -0.7, scaleX: -0.5, scaleY: -0.5}, 500, "easeInSine")
                    .call(function() {
                        this.remove();
                    }.bind(sp));
            }.bind(this));
        }
    },

    //プレイヤーがゲートに入る
    enterPlayer: function() {
        var enterOffset = 0;
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
            .setPosition(this.x, this.y)
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
