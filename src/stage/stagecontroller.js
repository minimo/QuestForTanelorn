/*
 *  stagecontroller.js
 *  2017/01/24
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ制御
phina.define("qft.StageController", {
    superClass: "phina.diaplay.DisplayElement",

    parentScene: null,
    player: null,
    time: 0,

    //経過時間トリガイベント
    seq: [],
    index: 0,

    //マップトリガイベント
    event: [],

    //マップレイヤ
    mapLayer: null,

    //マップイメージレイヤ
    mapImageLayer: null,

    //スクリーン内判定用
    screen: null,

    //地形判定用レイヤー
    collisionLayer: null,

    //バックグラウンドレイヤ
    backgroundLayer: null,

    //オブジェクト管理レイヤ
    objLayer: null,

    //エフェクト管理レイヤ
    effectLayer: null,

    //プレイヤー表示レイヤ
    playerLayer: null,

    //フォアグラウンドレイヤ
    foregroundLayer: null,

    init: function(scene, player, tmx) {
        this.superInit();

        this.parentScene = scene;
        this.player = player;
        this.tmx = tmx;

        this.setup(tmx);
    },

    setup: function(tmx) {
        //レイヤー作成
        this.mapLayer = phina.display.DisplayElement().addChildTo(this);
        this.mapImageLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);
        this.collisionLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);
        this.backgroundLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);
        this.objLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);
        this.effectLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);
        this.playerLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);
        this.foregroundLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //スクリーン内判定用
        this.screen = phina.display.DisplayElement({width: SC_W + 64, height: SC_H + 64});

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
            c.on('enterframe', function() {
                this.x += this.vx;
                this.y += this.vy;
            });
            c.vx = 0;
            c.vy = 0;
            if (e.name) c.name = e.name;
            if (e.type) c.type = e.type;
            c.$extend(e.properties);

            //個別スクリプトの実行
            if (c.script) {
                var sc = "(function(app) {"+c.script+"})";
                c.update = eval(sc);
            }
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
    },

    //時間イベント追加
    add: function(time, value, option) {
        this.index += time;
        this.seq[this.index] = {
            value: value,
            option: option,
        };
    },

    //時間イベント取得
    get: function(time) {
        var data = this.seq[time];
        if (data === undefined) return null;
        return data;
    },

    //マップイベント追加
    addEvent: function(id, value, option) {
        this.event[id] = {
            value: value,
            option: option,
            executed: false,
        };
    },

    //マップイベント取得
    getEvent: function(id) {
        var data = this.event[id];
        if (data === undefined) return null;
        return data;
    },

    //次にイベントが発生する時間を取得
    getNextEventTime: function(time) {
        var data = this.seq[time];
        if (data === undefined) {
            var t = time+1;
            var rt = -1;
            this.seq.some(function(val, index){
                if (index > t) {
                    rt = index;
                    return true;
                }
            },this.seq);
            return rt;
        } else {
            return time;
        }
    },

    clear: function() {
        this.seq = [];
        this.index = 0;
    },
});
