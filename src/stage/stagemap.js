/*
 *  stagemap.js
 *  2017/01/24
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージマップ制御
phina.define("qft.StageMap", {
    superClass: "phina.isplay.DisplayElement",

    parentScene: null,
    player: null,
    tmx: null,
    time: 0,


    //マップレイヤー
    mapImageLayer: null,

    //地形判定用レイヤー
    collisionLayer: null,

    //バックグラウンドレイヤ
    backgroundLayer: null,

    //オブジェクト管理レイヤ
    objLayer: null,

    //敵キャラクタ管理レイヤ
    enemyLayer: null,

    //プレイヤー表示レイヤ
    playerLayer: null,

    //エフェクト管理レイヤ
    effectLayer: null,

    //フォアグラウンドレイヤ
    foregroundLayer: null,

    init: function(parentScene, tmx) {
        this.superInit();

        this.parentScene = parentScene;
        this.player = parentScene.player;
        this.tmx = tmx || null;

        //レイヤー作成
        this.mapImageLayer = phina.display.DisplayElement().addChildTo(this);
        this.collisionLayer = phina.display.DisplayElement().addChildTo(this);
        this.backgroundLayer = phina.display.DisplayElement().addChildTo(this);
        this.objLayer = phina.display.DisplayElement().addChildTo(this);
        this.enemyLayer = phina.display.DisplayElement().addChildTo(this);
        this.playerLayer = phina.display.DisplayElement().addChildTo(this);
        this.effectLayer = phina.display.DisplayElement().addChildTo(this);
        this.foregroundLayer = phina.display.DisplayElement().addChildTo(this);

        this.build();
    },

    update: function() {
        //スクリーン表示位置をプレイヤー中心になる様に調整
        this.x = SC_W*0.5-this.player.x;
        this.y = SC_H*0.5-this.player.y;
        if (this.y < -(this.height-SC_H)) this.y = -(this.height-SC_H);
        this.screen.x = this.mapLayer.x;
        this.screen.y = this.mapLayer.y;
    },

    //tmx情報に基づいてマップ構築
    build: function(tmx) {
        var tmx = this.tmx;

        //マップ画像取得
        var foreground = tmx.getImage("foreground");
        var mapImage = tmx.getImage("map");
        var background = tmx.getImage("background");

        phina.display.Sprite(tmx.getImage("map")).addChildTo(this.mapImageLayer).setOrigin(0, 0);
        phina.display.Sprite(tmx.getImage("background")).addChildTo(this.backgroundLayer).setOrigin(0, 0);
        phina.display.Sprite(tmx.getImage("foreground")).addChildTo(this.foregroundLayer).setOrigin(0, 0);

        //マップの縦横サイズ
        this.width = tmx.width * tmx.tileWidth;
        this.height = tmx.height * tmx.tileHeight;

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
    clear: function() {
        //当たり判定、オブジェクトの全消去
        this.backgroundLayer.removeChildren();
        this.foregroundLayer.removeChildren();
        this.collisionLayer.removeChildren();
        this.objLayer.removeChildren();
        this.mapImageLayer.removeChildren();
        this.effectLayer.removeChildren();
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
});
