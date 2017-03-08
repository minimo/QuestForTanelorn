/*
 *  door.js
 *  2017/01/14
 *  @auther minimo  
 *  This Program is MIT license.
 */

qft.MapObject = {};

//大型ドアクラス
phina.define("qft.MapObject.Door", {
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

    //ロックされているか
    isLock: false,

    init: function(parentScene, options) {
        var width = options.width || 36;
        var height = options.height || 64;
        this.superInit(parentScene, {width: width, height: height});

        //スプライト
        this.sprite = phina.display.Sprite("door", 36, 64).addChildTo(this).setFrameIndex(3);
        this.setAnimation("closed");

        this.id = options.id;
        this.isLock = options.properties.lock || false;
        this.name = options.name;
        this.enterOffset = options.properties.enteroffset || 0;

        //ドア機能
        var properties = options.properties;
        switch (options.name) {
            //クリア
            case "clear":
                this.isLock = true;
                this.on('enterdoor', function() {
                    this.parentScene.flare('stageclear');
                });
                break;
            //マップ切り替え
            case "mapswitch":
                this.on('enterdoor', function() {
                });
                break;
            //マップ内移動
            case "warp":
                this.nextID = properties.nextID;
                this.offset = properties.offset || 0;
                this.on('enterdoor', function() {
                    //行き先の検索
                    var next = this.findDoor(this.nextID);
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
    },

    update: function(e) {
        //近くに来たら自動的に開ける
        if (this.getDistancePlayer() < 64) {
            if (!this.isLock) this.open();
        } else {
            if (this.nowAnimation == "open") {
                this.close();
            }
        }

        //プレイヤーとの当たり判定
        var pl = this.parentScene.player;
        var hit = this.hitTestElement(pl);
        if (hit && !this.isLock && !this.already) {
            if (this.name == "clear") {
                //ステージクリアの扉は無条件で入る
                this.flare('enterdoor');
                this.already = true;
            }
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

    open: function() {
        this.setAnimation("open");
    },

    close: function() {
        this.setAnimation("close");
    },

    //プレイヤーが扉に入る
    enterPlayer: function() {
        var enterOffset = this.enterOffset;
        var player = this.parentScene.player;
        player.alpha = 0;
        player.isControl = false;
        var pl = qft.PlayerDummy("player1")
            .setPosition(player.x, player.y)
            .addChildTo(this.parentScene.mapLayer.playerLayer);
        pl.setAnimation("up");
        pl.tweener.clear().setUpdateType('fps')
            .moveTo(this.x, this.y+this.height/2-16+enterOffset, 15)
            .call(function() {
                pl.animation = false;
            })
            .fadeOut(15)
            .call(function() {
                pl.remove();
            });
    },

    //プレイヤーが扉から出る
    leavePlayer: function() {
        var player = this.parentScene.player;
        player.alpha = 0;
        player.isControl = false;
        var pl = qft.PlayerDummy("player1")
            .setPosition(this.x, this.y+16)
            .addChildTo(this.parentScene.mapLayer.playerLayer);
        pl.alpha = 0;
        pl.setAnimation("down");
        pl.tweener.clear().setUpdateType('fps')
            .fadeIn(15)
            .moveTo(player.x, player.y, 30)
            .fadeIn(10)
            .call(function() {
                player.alpha = 1;
                player.isControl = true;
                pl.remove();
            });
    },

    //他の扉を検索
    findDoor: function(id) {
        var result = null;
        this.parentScene.objLayer.children.forEach(function(e) {
            if (e instanceof qft.MapObject.Door) {
                if (e.id == id) result = e;
            }
        }.bind(this));
        return result;
    },
});

//チェックアイコン
phina.define("qft.MapObject.CheckIcon", {
    superClass: "qft.Character",

    //重力加速度
    gravity: 0.0,

    //アニメーション間隔
    advanceTime: 3,

    //地形無視
    ignoreCollision: true,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 36, height: 64});
        this.$safe(options);

        //スプライト
        this.sprite = phina.display.Sprite("checkicon", 32, 32).addChildTo(this);
        this.setAnimation("up");
        this.advanceTime = 10;
    },

    update: function(e) {
    },

    setupAnimation: function(options) {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["in"] = [2, 1, 0];
        this.frame["up"] = [5, 4, 3];
        this.frame["down"] = [8, 7, 6];
        this.frame["out"] = [11, 10, 9];
        this.index = 0;
    },
});

//メッセージ表示
phina.define("qft.MapObject.Message", {
    superClass: "phina.display.DisplayElement",

    //オブジェクトID
    id: null,

    //一回のみ表示フラグ
    once: false,

    //表示済みフラグ
    alreadyRead: false,

    init: function(parentScene, options) {
        this.superInit(options);
        this.parentScene = parentScene;
        this.id = options.id;
        this.once = options.properties.once || false;
        this.text = options.properties.text || "TEST";
    },

    update: function(e) {
        //プレイヤーとの当たり判定
        var pl = this.parentScene.player;
        var hit = this.hitTestElement(pl);
        if (hit && !this.alreadyRead) {
            this.parentScene.spawnEventMessage(this.id, this.text);
            this.alreadyRead = true;

            //一回のみの場合はリムーブ
            if (this.once) this.remove();
        }

        //判定を外れたら表示済みフラグを外す
        if (!hit && this.alreadyRead) this.alreadyRead = false;
    },
});

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

    //ロックされているか
    isLock: false,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 36, height: 64});
        this.$safe(options);

        //スプライト
        this.sprite = phina.display.Sprite("gate", 32, 32).addChildTo(this);
        this.setAnimation("up");
        this.advanceTime = 10;
    },
});

//イベント  
phina.define("qft.MapObject.Event", {
    superClass: "phina.display.DisplayElement",

    //オブジェクトID
    id: null,

    //一回のみ表示フラグ
    once: false,

    //実行済みフラグ
    already: false,

    init: function(parentScene, options) {
        this.superInit(options);
        this.parentScene = parentScene;
        this.id = options.id;
        this.once = options.properties.once || false;
        this.properties = options.properties;
    },

    update: function(e) {
        //プレイヤーとの当たり判定
        var pl = this.parentScene.player;
        var hit = this.hitTestElement(pl);
        if (hit && !this.alreadyRead) {
            this.parentScene.spawnEventMessage(this.id, this.text);
            this.already = true;

            //一回のみの場合はリムーブ
            if (this.once) this.remove();
        }

        //判定を外れたら実行済みフラグを外す
        if (!hit && this.already) this.alreadyRead = false;
    },
});
