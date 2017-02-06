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

    //ステージクリアオブジェクト
    clearGate: null,

    init: function() {
        this.superInit();

        //背景
        this.backgroundImage = phina.display.Sprite("background").addChildTo(this).setPosition(SC_W*0.5, SC_H*0.5);

        //管理用基準レイヤ
        this.baseLayer = phina.display.DisplayElement().addChildTo(this);

        //マップレイヤ
        this.mapLayer = phina.display.DisplayElement().addChildTo(this.baseLayer);

        //マップ画像用レイヤ
        this.mapImageLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //地形判定用レイヤ
        this.collisionLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //バックグラウンドレイヤ
        this.backgroundLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //オブジェクト管理レイヤ
        this.objLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //敵キャラクタ管理レイヤ
        this.enemyLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //プレイヤー表示レイヤ
        this.playerLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //エフェクト管理レイヤ
        this.effectLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //フォアグラウンドレイヤ
        this.foregroundLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //プレイヤーキャラクタ
        this.player = qft.Player(this).addChildTo(this.playerLayer).setPosition(SC_W*0.5, SC_H*0.5);

        //スクリーン初期化
        this.setupScreen();

        //マップ初期化
        this.setupStageMap();

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
        if (this.clearGate) {
            var res = this.stageController.checkStageClearCondtion();
            if (res) {
                this.on('stageclear');
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
    setupStageMap: function() {

        //経過時間初期化
        this.time = 0;

        //登録済みマップの消去
        this.clearMap();

        //ステージコントローラー
        switch (this.stageNumber) {
            case 1:
                this.stageController = qft.Stage1(this, tmx);
                break;
            case 2:
                this.stageController = qft.Stage2(this, tmx);
                break;
        };

        //タイムリミット設定
        this.timeLimit = this.stageController.timeLimit;

        //マップ情報取得
        var tmx = phina.asset.AssetManager.get('tmx', "stage"+this.stageNumber);

        //マップ画像取得
        var foreground = tmx.getImage("foreground");
        var mapImage = tmx.getImage("map");
        var background = tmx.getImage("background");
        this.map = phina.display.Sprite(mapImage).addChildTo(this.mapImageLayer).setOrigin(0, 0);
        phina.display.Sprite(background).addChildTo(this.backgroundLayer).setOrigin(0, 0);
        phina.display.Sprite(foreground).addChildTo(this.foregroundLayer).setOrigin(0, 0);

        //マップ当たり判定取得
        var objects = tmx.getObjectGroup("collision").objects;
        objects.forEach(function(e) {
            var c = phina.display.RectangleShape({width: e.width, height: e.height})
                .addChildTo(this.collisionLayer)
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
                    this.spawnEnemy(x, y, e.name, e.properties);
                    break;
                case "item":
                    this.spawnItem(x, y, e.properties);
                    break;
                case "itembox":
                    this.spawnItemBox(x, y, e.properties);
                    break;
                case "door":
                    var door = qft.MapObject.Door(this, e).addChildTo(this.objLayer).setPosition(x, y);
                    if (e.name == "clear") {
                        this.clearGate = door;
                        door.isLock = true;
                        door.on('enterdoor', function() {
                            that.flare('stageclear');
                        });
                    }
                    break;
                case "check":
                    qft.MapObject.CheckIcon(this, e).addChildTo(this.objLayer).setPosition(x, y).setAnimation(e.name);
                    break;
                case "message":
                    qft.MapObject.Message(this, e).addChildTo(this.objLayer).setPosition(x, y);
                    break;
                case "event":
                    qft.MapObject.Event(this, e).addChildTo(this.objLayer).setPosition(x, y);
                    break;
            }
        }.bind(this));
    },

    //マップ情報の消去
    clearMap: function() {
        //当たり判定、オブジェクトの全消去
        this.backgroundLayer.removeChildren();
        this.foregroundLayer.removeChildren();
        this.collisionLayer.removeChildren();
        this.enemyLayer.removeChildren();
        this.objLayer.removeChildren();
        this.mapImageLayer.removeChildren();
        this.effectLayer.removeChildren();
    },

    //リスタート
    restart: function() {
        this.setupStageMap();
        this.player.reset().addChildTo(this.playerLayer);
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
