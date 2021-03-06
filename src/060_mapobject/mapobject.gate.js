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

    //ロックされているか
    isLock: false,

    //アニメーションフラグ
    isAdvanceAnimation: false,

    init: function(parentScene, options) {
        var width = options.width || 36;
        var height = options.height || 64;
        this.superInit(parentScene, {width: width, height: height});
        this.width_half = width / 2;
        this.height_half = height / 2;

        this.id = options.id;
        this.isLock = options.properties.lock || false;
        this.name = options.name;
        this.enterOffset = options.properties.enterOffset || 0;

        //スプライト
        this.sprite = null;

        //ゲート機能
        var properties = options.properties;
        switch (options.name) {
            //マップ内移動
            case "warp":
                this.nextID = properties.nextID;
                this.offset = properties.offset || 0;
                this.on('enterdoor', function() {
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
            //マップ切り替え
            case "mapswitch":
                this.nextID = properties.nextID;
                this.offset = properties.offset || 0;
                this.toLayerNumber = properties.toLayerNumber;
                this.on('enterdoor', function() {
                    var layer = this.parentScene.stageController.mapLayer[this.toLayerNumber];
                    var next = this.parentScene.stageController.findObject(this.nextID, this.toLayerNumber);
                    if (!next) return;
                    this.enterPlayer();
                    this.tweener.clear()
                        .wait(60)
                        .call(function(){
                            this.parentScene.switchMap(layer);
                            this.parentScene.player.setPosition(next.x, next.y + next.offset);
                            this.already = false;
                            next.leavePlayer();
                        }.bind(this));
                    this.parentScene.fg.tweener.clear().wait(30).fadeIn(30).fadeOut(30);
                });
                break;
        }

        this.time = 0;
    },

    update: function() {
        //パーティクル
        if (!this.isLock && this.time % 6 == 0) {
            (2).times(function(i) {
                var sp = phina.display.Sprite("particle", 16, 16)
                    .addChildTo(this)
                    .setFrameIndex(0)
                    .setScale(0)
                    .setPosition(Math.randint(-this.width_half, this.width_half), this.height_half + Math.randint(-4, 4));
                sp.alpha = 0.3;
                sp.tweener.clear()
                    .by({y: -48, alpha:  0.9, scaleX:  0.3, scaleY:  0.3}, 1000, "easeInSine")
                    .by({y: -48, alpha: -0.9, scaleX: -0.3, scaleY: -0.3}, 1000, "easeOutSine")
                    .call(function() {
                        this.remove();
                    }.bind(sp));
            }.bind(this));
        }
    },

    //プレイヤーがゲートに入る
    enterPlayer: function() {
        var enterOffset = this.enterOffset;
        var player = this.parentScene.player;
        player.alpha = 0;
        player.isControl = false;
        player.isMuteki = true;
        var pl = qft.PlayerDummy("player1").setPosition(player.x, player.y).addChildTo(this.parentScene.mapLayer.playerLayer);
        pl.setAnimation("walk");
        pl.tweener.clear().setUpdateType('fps')
            .moveTo(this.x, this.y+enterOffset, 15)
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
        player.isMuteki = true;
        var pl = qft.PlayerDummy("player1").setPosition(this.x, this.y).addChildTo(this.parentScene.mapLayer.playerLayer);
        pl.alpha = 0;
        pl.setAnimation("walk");
        pl.animation = false;
        pl.tweener.clear().setUpdateType('fps')
            .fadeIn(15)
            .moveTo(player.x, player.y, 30)
            .fadeIn(10)
            .call(function() {
                player.alpha = 1;
                player.isControl = true;
                player.isMuteki = false;
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
