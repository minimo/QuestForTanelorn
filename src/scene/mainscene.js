/*
 *  MainScene.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.MainScene", {
    superClass: "phina.display.DisplayScene",

    //現在ステージ番号
    stageNumber: 1,

    //残り時間（フレーム単位）
    timeLimit: 120,

    //メニュー選択中アイテム番号
    menuSelect: 0,

    //メッセージスタック
    messageStack: [],

    init: function() {
        this.superInit();

        //背景
        this.backgroundImage = phina.display.Sprite("background").addChildTo(this).setPosition(SC_W*0.5, SC_H*0.5);

        //管理用基準レイヤ
        this.baseLayer = phina.display.DisplayElement().addChildTo(this);

        //プレイヤーキャラクタ
        this.player = qft.Player(this);

        //ステージ情報初期化
        this.setupStage();

        //スクリーン初期化
        this.setupScreen();

        app.volumeBGM = 0.5;
        app.volumeSE = 0.2;

        //メニューを開く
        this.on('openmenu', function(e) {
            app.pushScene(qft.MenuScene(this));
        });

        //ステージクリア
        this.on('stageclear', function(e) {
            this.stageClear();
        });

        //ゲームオーバー
        this.on('gameover', function(e) {
            app.pushScene(qft.GameOverScene(this));
        });

        //コンティニュー
        this.on('continue', function(e) {
            this.restart();
        });

        //メッセージ表示
        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 16,
            fontWeight: ''
        };
        var that = this;
        this.eventMessage = phina.display.Label({text: ""}.$safe(labelParam))
            .setPosition(SC_W*0.5, SC_H*0.2)
            .addChildTo(this);
        this.eventMessage.alpha = 0;
        this.eventMessage.tweener.clear().setUpdateType('fps');
        this.eventMessage.nextOk = true;
        this.eventMessage.update = function() {
            if (this.nextOk && that.messageStack.length > 0) {
                this.nextOk = false;
                var msg = that.messageStack[0];
                this.tweener.clear()
                    .call(function(){
                        this.text = msg.text;
                    }.bind(this))
                    .fadeIn(15).wait(90).fadeOut(15)
                    .call(function(){
                        this.nextOk = true;
                        that.messageStack.splice(0, 1);
                    }.bind(this))
            }
        }

        this.time = 0;
    },

    update: function(app) {
        var ct = app.controller;
        //メニューシーンへ移行
        if (ct.pause || ct.menu) {
            this.flare('openmenu');
        }

        //ステージ進行
        var event = this.stageController.get(this.time);
        if (event) {
            if (typeof(event.value) === 'function') {
                event.value.call(this, event.option);
            } else {
                this.enterEnemyUnit(event.value);
            }
        }

        //ステージクリア条件チェック
        if (this.mapLayer.clearGate) {
            if (this.stageController.checkStageClearCondtion()) {
                this.mapLayer.clearGate.isLock = false;
            }
        }


        //スクリーン表示位置をプレイヤー中心になる様に調整
        this.mapLayer.x = SC_W*0.5-this.player.x;
        this.mapLayer.y = SC_H*0.5-this.player.y;
        if (this.mapLayer.y < -(this.map.height-SC_H)) this.mapLayer.y = -(this.map.height-SC_H);

        this.time++;
        this.timeLimit--;
        if (this.timeLimit < 0) {
            this.timeLimit = 0;
        }
        if (this.timeLimit == 0 && !this.player.isDead) {
            this.player.dead();
        }
    },

    //敵キャラクタ投入
    spawnEnemy: function(x, y, name, options) {
        return qft.Enemy[name](this, options).addChildTo(this.enemyLayer).setPosition(x, y);
    },

    //アイテム投入
    spawnItem: function(x, y, options) {
        return qft.Item(this, options).addChildTo(this.objLayer).setPosition(x, y);
    },

    //アイテムボックス投入
    spawnItemBox: function(x, y, options) {
        return qft.ItemBox(this, options).addChildTo(this.objLayer).setPosition(x, y);
    },

    //メッセージ投入
    spawnMessage: function(text, between, waitFrame) {
        between = between || 32;
        waitFrame = waitFrame || 30;
        var arrayText = text.split("");
        var labelParam = {
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 32,
            fontWeight: ''
        };
        var n = 0;
        var x = SC_W * 0.5 - (arrayText.length * between * 0.5);
        arrayText.forEach(function(e) {
            if (e == " ") {
                x += between;
                return;
            }
            var lb = phina.display.Label({text: e}.$safe(labelParam)).setPosition(x, SC_H*0.5+32).setScale(0, 1).addChildTo(this);
            lb.tweener.clear().setUpdateType('fps')
                .set({alpha: 0})
                .wait(n)
                .to({scaleX: 1.0, alpha: 1, y: SC_H*0.5}, 15, "easeOutSine")
                .wait(waitFrame)
                .to({scaleX: 0.0, y: SC_H*0.5-32}, 10, "easeOutSine")
                .call(function(){this.remove()}.bind(lb));
            x += between;
            n += 5;
        }.bind(this));
    },

    //イベントメッセージ投入
    spawnEventMessage: function(id, text) {
        if (!id || !text) return;
        //メッセージスタック内に同一ＩＤがある場合は投入しない
        for (var i = 0; i < this.messageStack.length; i++) {
            if (this.messageStack[i].id == id) return;
        }
        if (text instanceof Array) {
            text.forEach(function(str) {
                this.messageStack.push({id: id, text: str});
            }.bind(this));
        } else {
            this.messageStack.push({id: id, text: text});
        }
    },

    //スクリーン初期化
    setupScreen: function() {
        var that = this;
        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "UbuntuMono",
            align: "left",
            baseline: "middle",
            fontSize: 20,
            fontWeight: ''
        };

        //体力ゲージ
        phina.display.Label({text: "LIFE"}.$safe(labelParam)).addChildTo(this).setPosition(0, 10);
        var options = {
            width:  256,
            height: 5,
            backgroundColor: 'transparent',
            fill: 'red',
            stroke: 'white',
            strokeWidth: 2,
            gaugeColor: 'lime',
            cornerRadius: 0,
            value: this.player.hp,
            maxValue: this.player.hp,
        };
        this.lifeGauge = phina.ui.Gauge(options).addChildTo(this).setOrigin(0, 0.5).setPosition(40, 10);
        this.lifeGauge.update = function() {
            this.value = that.player.hp;
        };

        //制限時間表示
        var tl = phina.display.Label({text: "TIME:", align: "right"}.$safe(labelParam)).addChildTo(this).setPosition(SC_W, 10);
        tl.update = function() {
            this.text = "TIME:"+Math.floor(that.timeLimit/30);
        }
    },

    //マップ情報の初期化
    setupStage: function() {

        //経過時間初期化
        this.time = 0;

        //登録済みマップの消去
        this.clearMap();

        //ステージ設定読み込み
        switch (this.stageNumber) {
            case 1:
                this.stageController = qft.Stage1(this);
                var tmx = phina.asset.AssetManager.get('tmx', "stage1");
                var mapLayer = this.createMap(tmx);
                this.switchMap(mapLayer);
                break;
            case 2:
                this.stageController = qft.Stage2(this);
                var tmx = phina.asset.AssetManager.get('tmx', "stage2");
                var mapLayer = this.createMap(tmx);
                this.switchMap(mapLayer);
                break;
        };
        //タイムリミット設定
        this.timeLimit = this.stageController.timeLimit;
    },

    //tmxからマップレイヤを作成する
    createMap: function(tmx) {
        //マップレイヤ
        var mapLayer = phina.display.DisplayElement();

        //マップ画像用レイヤ
        mapLayer.mapImageLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //地形判定用レイヤ
        mapLayer.collisionLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //バックグラウンドレイヤ
        mapLayer.backgroundLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //オブジェクト管理レイヤ
        mapLayer.objLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //敵キャラクタ管理レイヤ
        mapLayer.enemyLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //プレイヤー表示レイヤ
        mapLayer.playerLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //エフェクト管理レイヤ
        mapLayer.effectLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //フォアグラウンドレイヤ
        mapLayer.foregroundLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //マップ画像取得
        var foreground = tmx.getImage("foreground");
        var mapImage = tmx.getImage("map");
        var background = tmx.getImage("background");
        this.map = phina.display.Sprite(mapImage).addChildTo(mapLayer.mapImageLayer).setOrigin(0, 0);
        phina.display.Sprite(background).addChildTo(mapLayer.backgroundLayer).setOrigin(0, 0);
        phina.display.Sprite(foreground).addChildTo(mapLayer.foregroundLayer).setOrigin(0, 0);

        //マップ当たり判定取得
        var objects = tmx.getObjectGroup("collision").objects;
        objects.forEach(function(e) {
            var c = phina.display.RectangleShape({width: e.width, height: e.height})
                .addChildTo(mapLayer.collisionLayer)
                .setPosition(e.x+e.width/2, e.y+e.height/2)
                .setVisible(DEBUG_COLLISION);
            c.on('enterframe', function() {
                this.x += this.vx;
                this.y += this.vy;
            });
            c.id = e.id;
            c.vx = 0;
            c.vy = 0;
            c.alpha = 0.3;
            c.ignore = false;
            if (e.name) c.name = e.name;
            if (e.type) c.type = e.type;
            c.$extend(e.properties);

            //常時実行スクリプト
            if (c.script) {
                var sc = "(function(app) {"+c.script+"})";
                c.update = eval(sc);
            }
            //当たり判定時実行スクリプト
            if (c.collision) {
                var sc = "(function(e, dir) {"+c.collision+"})";
                c.collisionScript = eval(sc);
            }
        }.bind(this));

        //イベント取得
        var events = tmx.getObjectGroup("event").objects;
        events.forEach(function(e) {
            var that = this;
            var x = e.x + e.width / 2;
            var y = e.y + e.height / 2;
            switch (e.type) {
                case "player":
                    if (e.name == "start") {
                        this.player.x = x;
                        this.player.y = y;
                        if (e.properties.direction == 0) {
                            this.player.sprite.scaleX = -1;
                        } else {
                            this.player.sprite.scaleX = 1;
                        }
                    }
                    break;
                case "enemy":
                    qft.Enemy[e.name](this, e.properties).addChildTo(mapLayer.enemyLayer).setPosition(x, y);
                    break;
                case "item":
                    qft.Item(this, e.properties).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    break;
                case "itembox":
                    qft.ItemBox(this, e.properties).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    break;
                case "door":
                    var door = qft.MapObject.Door(this, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    if (e.name == "clear") {
                        mapLayer.clearGate = door;
                        door.isLock = true;
                        door.on('enterdoor', function() {
                            that.flare('stageclear');
                        });
                    }
                    break;
                case "check":
                    qft.MapObject.CheckIcon(this, e).addChildTo(mapLayer.objLayer).setPosition(x, y).setAnimation(e.name);
                    break;
                case "message":
                    qft.MapObject.Message(this, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    break;
                case "event":
                    qft.MapObject.Event(this, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    break;
            }
        }.bind(this));
        return mapLayer;
    },

    //マップ情報の消去
    clearMap: function() {
        //当たり判定、オブジェクトの全消去
        if (this.backgroundLayer) this.backgroundLayer.removeChildren();
        if (this.foregroundLayer) this.foregroundLayer.removeChildren();
        if (this.collisionLaye) this.collisionLayer.removeChildren();
        if (this.enemyLayer) this.enemyLayer.removeChildren();
        if (this.objLayer) this.objLayer.removeChildren();
        if (this.mapImageLayer) this.mapImageLayer.removeChildren();
        if (this.effectLayer) this.effectLayer.removeChildren();
    },

    //マップレイヤの切替
    switchMap: function(layer, x, y) {
        if (this.mapLayer) this.mapLayer.remove();
        this.mapLayer = layer;
        this.mapLayer.addChildTo(this.baseLayer);

        this.backgroundLayer = layer.backgroundLayer;
        this.foregroundLayer = layer.foregroundLayer;
        this.collisionLayer = layer.collisionLayer;
        this.enemyLayer = layer.enemyLayer;
        this.playerLayer = layer.playerLayer;
        this.objLayer = layer.objLayer;
        this.mapImageLayer = layer.mapImageLayer;
        this.effectLayer = layer.effectLayer;

        this.player.remove();
        this.player.addChildTo(layer.playerLayer);
        if (x) {
            this.player.setPosition(x, y);
        }
    },

    //リスタート
    restart: function() {
        this.player.reset();
        this.setupStage();
        this.menuSelect = 0;
    },

    //ステージクリア
    stageClear: function() {
        //クリアメッセージ投入
        this.spawnMessage("STAGE "+this.stageNumber+" CLEAR!", 24);
        this.stageNumber++;
        app.playBGM("stageclear", false);
    },
});
