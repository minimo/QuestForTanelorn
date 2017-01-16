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

    //残り時間
    timeLimit: FPS*60*5,

    init: function() {
        this.superInit();

        //バックグラウンド
        this.background = phina.display.Sprite("background", 640, 480).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.5);

        //マップレイヤー
        this.mapLayer = phina.display.DisplayElement().addChildTo(this);
        this.mapImageLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //地形判定用レイヤー
        this.collisionLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //バックグラウンドレイヤ
        this.backgroundLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //オブジェクト管理レイヤ
        this.objLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //エフェクト管理レイヤ
        this.effectLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //プレイヤー表示レイヤ
        this.playerLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //フォアグラウンドレイヤ
        this.foregroundLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //プレイヤーキャラクタ
        this.player = qft.Player(this).addChildTo(this.playerLayer).setPosition(SC_W*0.5, SC_H*0.5);

        //スクリーン初期化
        this.setupScreen();

        //マップ初期化
        this.setupStageMap(1);

        app.volumeBGM = 0.5;
        app.volumeSE = 0.2;

        //ゲームオーバー
        this.on('gameover', function(e) {
            app.pushScene(qft.GameOverScene());
        });

        this.time = 0;
    },

    update: function(app) {
        this.mapLayer.x = SC_W*0.5-this.player.x;
        this.mapLayer.y = SC_H*0.5-this.player.y;
        if (this.mapLayer.y < -(this.map.height-SC_H)) this.mapLayer.y = -(this.map.height-SC_H);
        this.time++;
        this.timeLimit--;
    },

    //敵キャラクタ投入
    spawnEnemy: function(x, y, name, options) {
        return qft.Enemy[name](options, this).addChildTo(this.objLayer).setPosition(x, y);
    },

    //アイテム投入
    spawnItem: function(x, y, options) {
        return qft.Item(options, this).addChildTo(this.objLayer).setPosition(x, y);
    },

    //アイテムボックス投入
    spawnItemBox: function(x, y, options) {
        return qft.ItemBox(options, this).addChildTo(this.objLayer).setPosition(x, y);
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
        phina.display.Label({text: "LIFE"}.$safe(labelParam)).addChildTo(this).setPosition(0, 10);

        //体力ゲージ
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

        var tl = phina.display.Label({text: "TIME:", align: "right"}.$safe(labelParam)).addChildTo(this).setPosition(SC_W, 10);
        tl.update = function() {
            this.text = "TIME:"+Math.floor(that.timeLimit/30);
        }
    },

    //マップ情報の初期化
    setupStageMap: function(stageNumber) {
        stageNumber = stageNumber || 1;

        //ステージ開始メッセージ投入
        this.spawnMessage("STAGE "+stageNumber, 24);

        //登録済みマップの消去
        this.clearMap();

        //マップ情報取得
        var tmx = phina.asset.AssetManager.get('tmx', "stage"+stageNumber);

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
                .setVisible(false);
            c.vx = 0;
            c.vy = 0;
            if (e.name) c.name = e.name;
            if (e.type) c.type = e.type;
            c.$extend(e.properties);
        }.bind(this));

        //イベント取得
        var events = tmx.getObjectGroup("event").objects;
        events.forEach(function(e) {
            switch (e.type) {
                case "player":
                    if (e.name == "start") {
                        this.player.x = e.x + e.width / 2;
                        this.player.y = e.y + e.height / 2;
                        if (e.properties.direction == 0) {
                            this.player.sprite.scaleX = -1;
                        } else {
                            this.player.sprite.scaleX = 1;
                        }
                    }
                    break;
                case "enemy":
                    var x = e.x + e.width / 2;
                    var y = e.y + e.height / 2;
                    this.spawnEnemy(x, y, e.name, e.properties);
                    break;
                case "item":
                    var x = e.x + e.width / 2;
                    var y = e.y + e.height / 2;
                    this.spawnItem(x, y, e.properties);
                    break;
                case "itembox":
                    var x = e.x + e.width / 2;
                    var y = e.y + e.height / 2;
                    this.spawnItemBox(x, y, e.properties);
                    break;
                case "door":
                    var x = e.x + e.width / 2;
                    var y = e.y + e.height / 2;
                    qft.MapObject.Door(this).addChildTo(this.objLayer).setPosition(x, y);
                    break;
            }
        }.bind(this));

        //ＢＧＭ再生
        app.playBGM("bgm"+stageNumber);
    },

    //マップ情報の消去
    clearMap: function() {
        //当たり判定、オブジェクトの全消去
        this.backgroundLayer.removeChildren();
        this.foregroundLayer.removeChildren();
        this.collisionLayer.removeChildren();
        this.objLayer.removeChildren();
        this.mapImageLayer.removeChildren();
        this.effectLayer.removeChildren();
    },
});
