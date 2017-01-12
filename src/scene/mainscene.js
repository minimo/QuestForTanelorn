/*
 *  MainScene.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.MainScene", {
    superClass: "phina.display.DisplayScene",

    //マップ情報
    stageNumber: 1,

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
    },

    //敵キャラクタ投入
    spawnEnemy: function(options) {
        return qft.Enemy[options.name](options.properties, this).addChildTo(this.objLayer).setPosition(options.x, options.y);
    },

    //アイテム投入
    spawnItem: function(options) {
        return qft.Item(options.properties, this).addChildTo(this.objLayer).setPosition(options.x, options.y);
    },

    //アイテムボックス投入
    spawnItemBox: function(options) {
        return qft.ItemBox(options.properties, this).addChildTo(this.objLayer).setPosition(options.x, options.y);
    },

    //マップ情報の初期化
    setupStageMap: function(stageNumber) {
        stageNumber = stageNumber || 1;

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
                        this.player.x = e.x;
                        this.player.y = e.y;
                        if (e.properties.direction == 0) {
                            this.player.sprite.scaleX = -1;
                        } else {
                            this.player.sprite.scaleX = 1;
                        }
                    }
                    break;
                case "enemy":
                    this.spawnEnemy(e);
                    break;
                case "item":
                    this.spawnItem(e);
                    break;
                case "itembox":
                    this.spawnItemBox(e);
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
