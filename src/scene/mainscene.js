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

    //最大ステージ番号
    stageNumberMax: 8,

    //残り時間（フレーム単位）
    timeLimit: 120,

    //メッセージスタック
    messageStack: [],

    //ステージクリアフラグ
    isStageClear: false,

    //エンディング進行中フラグ
    isEnding: false,

    //真エンディングフラグ
    isTrueEnding: false,

    //スコア
    totalScore: 0,

    //敵討伐数
    totalKill: 0,

    //コンティニュー回数
    continueCount: 0,

    //ステージクリア時情報
    clearResult: [],

    //スクリーンのマップ外への移動制限フラグ
    limitWidth: false,
    limitHeight: true,

    //スクリーン中心座標
    screenCenterPosition: null,

    //プレイヤースクリーン中央固定フラグ
    centerPlayer: true,

    //シーン内全オブジェクト強制停止
    pauseScene: false,

    init: function(options) {
        this.superInit({width: SC_W, height: SC_H});
        options = (options || {}).$safe({
            startStage: 1,
            isPractice: false,
            isContinue: false,
        })
        this.stageNumber = options.startStage || 1;
        this.isPractice = options.isPractice;
        this.isContinue = options.isContinue;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.bg.tweener.setUpdateType('fps');

        //背景
        this.backgroundImage = phina.display.Sprite("background")
            .addChildTo(this).setPosition(0, SC_H*0.5)
            .setOrigin(0, 0.5)
            .setScale(1.0, 1.1);

        //管理用基準レイヤ
        this.baseLayer = phina.display.DisplayElement().addChildTo(this);

        //プレイヤーキャラクタ
        this.player = qft.Player(this);

        //スクリーン初期化
        this.setupScreen();

        //スクリーン中心座標管理用
        var that = this;
        this.camera = phina.app.Object2D().addChildTo(this);
        this.camera.parentScene = this;
        this.camera.tweener.setUpdateType('fps');
        this.camera.moveFrom = phina.geom.Vector2(0, 0);
        this.camera.moveTo = phina.geom.Vector2(0, 0);
        this.camera.moveRatio = 0;
        this.camera.moveLerp = false;
        this.camera.moveToPlayer = false;
        this.camera.update = function() {
            if (that.centerPlayer) {
                this.x = that.player.x;
                this.y = that.player.y;
            } else {
                if (this.moveLerp) {
                    if (this.moveToPlayer) {
                        this.moveTo.x = that.player.x;
                        this.moveTo.y = that.player.y;
                    }
                    var p = phina.geom.Vector2.lerp(this.moveFrom, this.moveTo, this.moveRatio);
                    this.setPosition(p.x, p.y);
                }
            }
        };

        //ステージクリア時情報
        this.clearResult = [];
        this.totalScore = 0;
        this.totalKill = 0;

        //コンティニュー時状態ロード
        if (this.isContinue) this.loadGame();

        //ステージ開始位置
        this.mapstart = phina.geom.Vector2(0, 0);

        //ステージ情報初期化
        this.setupStage();

        this.fgWhite = phina.display.RectangleShape(param.$extend({fill: 'white'}))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.fgWhite.alpha = 0;
        this.fgWhite.tweener.setUpdateType('fps').clear();

        this.fg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.fg.tweener.setUpdateType('fps').clear().fadeOut(30);

        //バーチャルパッドの可視化
        if (phina.isMobile() || DEBUG_MOBILE) {
            app.virtualPad.addChildTo(this).setPosition(0, 0);
        }

        app.volumeBGM = 0.5;
        app.volumeSE = 0.2;

        //メニューを開く
        this.on('openmenu', function(e) {
            app.pushScene(qft.MenuScene(this));
        });

        //キー取得
        this.on('getkey', function(e) {
            var x = this.mapLayer.x + this.player.x;
            var y = this.mapLayer.y + this.player.y;
            var key = phina.display.DisplayElement()
                .setPosition(x, y)
                .addChildTo(this.baseLayer);
            key.tweener.clear().moveTo(15+(this.player.keys.length-1)*24, 36, 500);
            var sp = phina.display.Sprite("item", 24, 24)
                .setFrameIndex(ITEM_KEY)
                .addChildTo(key);
        });

        //ステージクリア
        this.on('stageclear', this.stageClear);

        //次ステージへ移行
        this.on('nextstage', function(e) {
            if (!this.allClear) {
                this.stageNumber++;
                this.setupStage();
                this.player.saveStatus();
            } else {
                //エンディング分岐
                if (this.isTrueEnding) {
                    this.stageNumber = 10;
                    this.setupStage();
                } else {
                    //仮エンディング
                    app.pushScene(qft.EndingScene(this));
                }
            }
        });

        //エンディングへ移行
        this.on('ending', function(e) {
            app.pushScene(qft.EndingScene(this));
        });

        //ゲームオーバー
        this.on('gameover', function(e) {
            app.pushScene(qft.GameOverScene(this));
        });

        //コンティニュー
        this.on('continue', function(e) {
            this.restart();
        });

        //ゲーム終了
        this._exitGame = false;
        this.on('exitgame', function(e) {
            this._exitGame = true;
            if (!this.isPractice) this.saveGame();
        });
        this.on('exitgame_nosave', function(e) {
            this._exitGame = true;
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
        this.messageStack = [];
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
        if (this.time == 15) this.player.isControl = true;

        //ゲーム終了
        if (this._exitGame) {
            this.exitGame();
        }

        var ct = app.controller;
        if (!this.isStageClear) {
            //通常時処理
            //メニューシーンへ移行
            if (this.time > 15) {
                if (ct.pause || ct.menu) {
                    this.flare('openmenu');
                }
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
                if (this.stageController.checkStageClearCondition()) {
                    this.mapLayer.clearGate.isLock = false;
                }
            }

            if (!this.pauseScene) this.timeLimit--;
            if (this.timeLimit < 0) {
                this.timeLimit = 0;
            }
            if (this.timeLimit == 0 && !this.player.isDead) {
//                this.player.dead();
            }
        } else {
            //ステージクリア時処理
            //残りタイムをスコア加算
            if (this.timeLimit >= 60) {
                this.timeLimit -= 60;
                this.totalScore += 20;
                if (this.timeLimit < 60) this.timeLimit = 0;
            }

            //ショートカット
            var ct = app.controller;
            if (ct.ok) {
                if (this.timeLimit >= 60) {
                    this.totalScore += Math.floor(this.timeLimit / 60) * 20;
                }
            }
        }

        //スクリーン表示位置
        var map = this.mapLayer.map;
        this.mapLayer.x = SC_W * 0.5 - this.camera.x;
        this.mapLayer.y = SC_H * 0.5 - this.camera.y;
        if (this.limitHeight) {
            if (this.mapLayer.y > 0) this.mapLayer.y = 0;
            if (this.mapLayer.y < -(map.height-SC_H)) this.mapLayer.y = -(map.height-SC_H);
        }
        if (this.limitWidth) {
            if (this.mapLayer.x > 0) this.mapLayer.x = 0;
            if (this.mapLayer.x < -(map.width-SC_W)) this.mapLayer.x = -(map.width-SC_W);
        }

        //スクリーン座標
        this.screenX = -this.mapLayer.x;
        this.screenY = -this.mapLayer.y;

        if (this.stageController.isBackgroundMove) {
            //バックグラウンドのX座標を全体の割合から計算
            this.backgroundImage.x = -Math.floor(this.backgroundImage.width * (this.player.x / map.width)*0.05);
        } else {
            this.backgroundImage.x = this.stageController.backgroundX;
        }

        this.time++;
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

    //エフェクト投入
    spawnEffect: function(x, y, options) {
        return qft.Effect(this, options).addChildTo(this.objLayer).setPosition(x, y);
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
        this.lifeGaugeLabel = phina.display.Label({text: "LIFE"}.$safe(labelParam)).addChildTo(this).setPosition(0, 10);
        var options = {
            width:  200,
            height: 5,
            backgroundColor: 'transparent',
            fill: 'red',
            stroke: 'white',
            strokeWidth: 2,
            gaugeColor: 'lime',
            cornerRadius: 0,
            value: this.player.hp,
            maxValue: this.player.hpMax,
        };
        this.lifeGauge = phina.ui.Gauge(options).addChildTo(this).setOrigin(0, 0.5).setPosition(40, 10);
        this.lifeGauge.update = function() {
            this.value = that.player.hp;
            this.width = that.player.hpMax * 2;
            this.maxValue = that.player.hpMax;
        };

        //スコア表示
        this.scoreLabel = phina.display.Label({text:"SCORE:", align: "right"}.$safe(labelParam)).addChildTo(this).setPosition(SC_W, 10);
        this.scoreLabel.score = 0;
        this.scoreLabel.s = 0;
        this.scoreLabel.update = function(e) {
            if (e.ticker.frame % 10 == 0) {
                this.s = ~~((that.totalScore-this.score)/7);
                if (this.s < 3) this.s = 3;
                if (this.s > 7777) this.s = 7777;
            }
            this.score += this.s;
            if (this.score > that.totalScore) this.score = that.totalScore;

            this.text = "SCORE "+this.score.comma();
        }

        //制限時間表示
        this.timeLabel = phina.display.Label({text: "TIME:", align: "right"}.$safe(labelParam)).addChildTo(this).setPosition(SC_W, 30);
        this.timeLabel.update = function() {
            this.text = "TIME:"+Math.floor(that.timeLimit/30);
            if (that.timeLimit == 0) {
                this.fill = 'red';
            } else {
                this.fill = 'white';
            }
        }

        //プレイヤー装備武器表示
        this.playerWeapon = qft.PlayerWeapon(this.player).addChildTo(this).setPosition(SC_W-30, SC_H-30);
        var sw = phina.display.RectangleShape({width: 60, height: 60})
            .addChildTo(this)
            .setPosition(SC_W-30, SC_H-30)
            .setInteractive(true)
            .setAlpha(0.0);
        sw.on('pointstart', e => {
            var pl = that.player;
            if (!pl.before.change && pl.equip.switchOk) pl.switchWeapon();
        });
    },

    //マップ情報の初期化
    setupStage: function() {

        this.baseLayer.removeChildren();

        //登録済みマップの消去
        this.clearMap();

        //ステージ設定読み込み
        switch (this.stageNumber) {
            case 1:
                this.stageController = qft.Stage1(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 2:
                this.stageController = qft.Stage2(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 3:
                this.stageController = qft.Stage3(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 4:
                this.stageController = qft.Stage4(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 5:
                this.stageController = qft.Stage5(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 6:
                this.stageController = qft.Stage6(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 7:
                this.stageController = qft.Stage7(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 8:
                this.stageController = qft.Stage8(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 9:
                this.stageController = qft.Stage9(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 10:
                this.stageController = qft.Stage10(this);
                this.switchMap(this.stageController.mapLayer[0]);
                this.isEnding = true;
                //システム表示のＯＦＦ
                this.lifeGaugeLabel.visible = false;
                this.lifeGauge.visible = false;
                this.scoreLabel.visible = false;
                this.timeLabel.visible = false;
                this.playerWeapon.visible = false;
                break;
            case 999:
                this.stageController = qft.Stage999(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
        };

        //ステージクリアフラグクリア
        this.isStageClear = false;

        //経過時間初期化
        this.time = 0;

        //タイムリミット設定
        this.timeLimit = this.stageController.timeLimit;

        //プレイヤー設定
        this.player.isControl = true;
        this.player.isMuteki = false;
        this.player.alpha = 1.0;

        this.mapstart = phina.geom.Vector2(this.player.x, this.player.y);

        this.stageController.playBGM();
    },

    //ステージイベント発火
    fireStageEvent: function(eventName) {
        return this.stageController.fireEvent(eventName);
    },

    warp: function(x, y, frame) {
        frame = frame || 60;
        this.player.isControl = false;
        this.player.gravity = 0;
        this.player.vx = 0;
        this.player.isMuteki = true;
        this.player.tweener.clear()
            .wait(45)
            .call(function(){
                this.ignoreCollision = true;
            }.bind(this.player))
            .moveTo(x, y, frame, "easeInOutSine")
            .call(function(){
                this.ignoreCollision = false;
                this.gravity = 0.9;
            }.bind(this.player))
            .wait(90)
            .call(function(){
                this.isControl = true;
                this.isMuteki = false;
            }.bind(this.player));
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
        if (this.shadowLayer) this.shadowLayer.removeChildren();
    },

    //マップレイヤの切替
    switchMap: function(layer, x, y) {
        if (this.mapLayer) this.mapLayer.remove();
        this.mapLayer = layer;
        this.mapLayer.addChildTo(this.baseLayer);
        this.map = layer.map;

        this.backgroundLayer = layer.backgroundLayer;
        this.foregroundLayer = layer.foregroundLayer;
        this.collisionLayer = layer.collisionLayer;
        this.enemyLayer = layer.enemyLayer;
        this.playerLayer = layer.playerLayer;
        this.objLayer = layer.objLayer;
        this.mapImageLayer = layer.mapImageLayer;
        this.effectLayer = layer.effectLayer;
        this.shadowLayer = layer.shadowLayer;

        this.player.remove();
        this.player.addChildTo(layer.playerLayer);
        if (x) {
            this.player.setPosition(x, y);
        }
    },

    //リスタート
    restart: function() {
        this.player.continueReset();
        this.player.mutekiTime = 90;
        this.player.addChildTo(this.mapLayer.playerLayer);

        //プレイヤー座標を最後に床にいた場所にする
        this.player.x = this.player.lastOnFloorX;
        this.player.y = this.player.lastOnFloorY;

        //復帰位置安全性確認
        var x = this.player.x;
        var y = this.player.y;
        var c1 = this.player.checkMapCollision2(x, y + 5, 4, 32);   //真下
        var c2 = this.player.checkMapCollision2(x+32, y + 5, 4, 32);//右下
        var c3 = this.player.checkMapCollision2(x-32, y + 5, 4, 32);//左下
        //真下に足場が無い場合は安全な場所にずらす
        if (!c1) {
            if (c2) {
                this.player.x += 32;
            } else if (c3){
                this.player.x -= 32;
            } else {
                //安全に復帰出来ないので直近のスタート地点へ
                this.player.x = this.mapstart.x;
                this.player.y = this.mapstart.y;
            }
        }

        this.totalScore = 0;
        this.totalKill = 0;
        this.continueCount++;

        this.stageController.playBGM();
    },

    //ステージクリア
    stageClear: function() {
        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 2,

            fontFamily: "UbuntuMono",
            baseline: "middle",
            fontSize: 20,
            fontWeight: ''
        };

        //オールクリア判定
        this.allClear = false;
        if (!this.isPractice && this.stageNumber >= this.stageNumberMax) this.allClear = true;

        //クリアメッセージ投入
        var text = "STAGE " + this.stageNumber + " CLEAR!";
        if (this.allClear) text = "STAGE ALL CLEAR!";
        this.spawnMessage(text, 24);
        this.player.isControl = false;
        this.stageController.stageClear();
        this.isStageClear = true;

        //プレイヤー所持キークリア
        this.player.keys = [];
        this.player.isMuteki = true;

        //クリアBGM
        var bgmFinish = false;
        app.playBGM("stageclear", false, function() {
            bgmFinish = true;
        });

        var ar = {loadcomplete: true};
        if (!this.isPractice) {
            //クリア時点情報保存
            var data = {
                stage: this.stageNumber,
                score: this.totalScore,
                kill: this.totalKill,
                time: this.stageController.timeLimit - this.timeLimit,
            };
            this.clearResult[this.stageNumber] = data;

            //次ステージのアセット読み込み
            if (this.stageNumber < this.stageNumberMax) {
                var assets = qft.Assets.get({assetType: "stage"+(this.stageNumber+1)});
                var ar = phina.extension.AssetLoaderEx().load(assets, function(){app.soundset.readAsset();});
            } else {
                //オールクリア時はエンディング用ステージへ
                if (this.allClear) {
                    var assets = qft.Assets.get({assetType: "stage10"});
                    var ar = phina.extension.AssetLoaderEx().load(assets, function(){app.soundset.readAsset();});
                }
            }
        }

        //ロード進捗表示
        var that = this;
        var param = {text: "Loading... ", align: "right", fontSize: 20}.$safe(labelParam);
        var progress = phina.display.Label(param).addChildTo(this).setPosition(SC_W, SC_H*0.95);
        progress.time = 0;
        progress.update = function() {
            //ロードが終わったらキー入力で次ステージへ
            if (ar.loadprogress) this.text = "Loading... "+Math.floor(ar.loadprogress * 100)+"%";
            if (bgmFinish && that.timeLimit == 0 && ar.loadcomplete) {
                this.text = "Push button to next stage.";
                if (that.allClear) this.text = "Push button to next...";
                var ct = app.controller;
                if (ct.ok || ct.cancel) {
                    if (that.isPractice) {
                        that._exitGame = true;
                    } else {
                        that.flare('nextstage');
                    }
                    this.remove();
                }
            }
            if (this.time % 30 == 0) this.visible = !this.visible;
            this.time++;
        }
    },

    exitGame: function() {
        app.playBGM("openingbgm");
        if (this.isPractice || this.isContinue) {
            this.exit();
        } else {
            this.exit("title");
        }
    },

    //現在のステータスをローカルストレージへ保存
    saveGame: function() {
        var saveObj = {
            stageNumber: this.stageNumber,
            score: this.totalScore,
            kill: this.totalKill,
            result: this.clearResult,
            playerStatus: this.player.startStatus,
        };
        localStorage.setItem("stage", JSON.stringify(saveObj));
        return saveObj;
    },

    //ローカルストレージから直前の保存状態を読み込み
    loadGame: function() {
        var data = localStorage.getItem("stage");
        if (data) {
            var d = JSON.parse(data).$safe({
                stageNumber: 1,
                result: [],
                playerStatus: {},
            });
            this.stageNumber = d.stageNumber;
            this.totalScore = 0;
            this.totalKill = 0;
            this.clearResult = d.result;

            //プレイヤー情報復元
            this.player.startStatus = d.playerStatus;
            this.player.restoreStatus();
            this.playerWeapon.rotation = 0;
        }
        return d;
    },
});
