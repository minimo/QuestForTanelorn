/*
 *  stagecontroller.js
 *  2017/01/24
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ制御
phina.define("qft.StageController", {
    superClass: "phina.app.Object2D",

    //ステージ番号
    stageNumber: 0,

    //タイムリミット
    timeLimit: FPS*60*5,

    //BGMアセット名
    bgm: "bgm1",

    //マップ表示設定
    limitWidth: false,
    limitHeight: true,

    parentScene: null,
    mapLayer: null,
    player: null,
    time: 0,

    //経過時間トリガイベント
    seq: null,
    index: 0,

    //マップトリガイベント
    event: null,

    //バックグラウンド設定
    isBackgroundMove: true,
    backgroundX: -320,

    //特殊ステージフラグ
    isOpening: false,
    isTutorial: false,
    isEnding: false,

    init: function(parentScene) {
        this.superInit();

        this.parentScene = parentScene;
        this.mapLayer = [];
        this.player = parentScene.player;

        this.seq = [];
        this.event = [];
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

    //イベント発火
    fireEvent: function(eventName) {
        var event = this.event[eventName];
        if (event) {
            event.value.call();
            return true;
        }
        return false;
    },

    clear: function() {
        this.seq = [];
        this.index = 0;
    },

    checkStageClearCondition: function() {
        return false;
    },

    stageClear: function() {
    },

    //ステージＢＧＭ再生
    playBGM: function() {
        app.playBGM(this.bgm);
    },

    //IDからオブジェクト検索
    findObject: function(id, layerNumber, layerName) {
        layerNumber = layerNumber || 0;
        layerName = layerName || "object";
        var result = null;
        switch (layerName) {
            case "object":
                this.mapLayer[layerNumber].objLayer.children.forEach(function(e) {
                    if (e.id == id) result = e;
                }.bind(this));
                break;
            case "enemy":
                this.mapLayer[layerNumber].enemyLayer.children.forEach(function(e) {
                    if (e.id == id) result = e;
                }.bind(this));
                break;
        }
        return result;
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

        //影表示レイヤ
        mapLayer.shadowLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //敵キャラクタ管理レイヤ
        mapLayer.enemyLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //プレイヤー表示レイヤ
        mapLayer.playerLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //エフェクト管理レイヤ
        mapLayer.effectLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //フォアグラウンドレイヤ
        mapLayer.foregroundLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //マップ画像取得
        var mapImage = tmx.getImage("map", "background", "background2", "background3");
        mapLayer.map = phina.display.Sprite(mapImage).addChildTo(mapLayer.mapImageLayer).setOrigin(0, 0);

        //フォアグラウンド画像
        var foreground = tmx.getImage("foreground", "foreground2", "foreground3");
        phina.display.Sprite(foreground).addChildTo(mapLayer.foregroundLayer).setOrigin(0, 0);

        //マップ当たり判定取得
        var objects = tmx.getObjectGroup("collision").objects;
        objects.forEach(function(e) {
            var width = e.width || 16;
            var height = e.height || 16;
            var c = phina.display.RectangleShape({width: width, height: height})
                .addChildTo(mapLayer.collisionLayer)
                .setPosition(e.x+width/2, e.y+height/2)
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
            c.friction = e.properties.friction == undefined? 0.5: e.properties.friction;
            if (e.name) c.name = e.name;
            if (e.type) c.type = e.type;
            c.$extend(e.properties);

            //常時実行スクリプト
            if (c.script) {
                var sc = "(function(app) {"+c.script+"})";
                var f = eval(sc);
                c.on('enterframe', f);
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
            var x = e.x + (e.width || 16) / 2;
            var y = e.y + (e.height || 16) / 2;
            switch (e.type) {
                case "player":
                    if (e.name == "start") {
                        mapLayer.startPosition = {x: x, y: y};
                        this.player.x = x;
                        this.player.y = y;
                        this.player.scaleX = 1;
                        if (e.properties.direction == 180) this.player.scaleX = -1;
                    }
                    break;
                case "enemy":
                    if (qft.Enemy[e.name]) {
                        var enemy = qft.Enemy[e.name](this.parentScene, e.properties).addChildTo(mapLayer.enemyLayer).setPosition(x, y);
                        if (e.properties.dead) {
                            var sc = "(function(app) {"+e.properties.dead+"})";
                            var f = eval(sc);
                            enemy.on('dead', f);
                        }
                        //移動パス設定
                        if (e.properties.path) {
                            var path = null;
                            var id = e.properties.path;
                            for (var i = 0; i < events.length; i++) {
                                if (events[i].id == id) {
                                    path = events[i];
                                    break;
                                }
                            }
                            if (path) enemy.setPath(path, e.properties.loop || false);
                        }
                    } else {
                        console.warn("unknown enemy: "+e.name);
                    }
                    break;
                case "item":
                    qft.Item(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    break;
                case "itembox":
                    qft.ItemBox(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    break;
                case "door":
                    var door = qft.MapObject.Door(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    if (e.name == "clear") mapLayer.clearGate = door;
                    if (e.properties.script) {
                        var sc = "(function(app) {"+e.properties.script+"})";
                        var f = eval(sc);
                        door.on('enterframe', f);
                        door.stageController = this;
                        door.player = this.parentScene.player;
                        door.parentScene = this.parentScene;
                    }
                    break;
                case "block":
                    var block = qft.MapObject.Block(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    block.addCollision(mapLayer.collisionLayer);
                    break;
                case "floor":
                    var floor = qft.MapObject.Floor(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    floor.addCollision(mapLayer.collisionLayer);
                    if (e.properties.script) {
                        var sc = "(function(app) {"+e.properties.script+"})";
                        var f = eval(sc);
                        floor.on('enterframe', f);
                        floor.stageController = this;
                        floor.player = this.parentScene.player;
                        floor.parentScene = this.parentScene;
                    }
                    //移動パス設定
                    var path = null;
                    if (e.properties.moveType == 'path' && e.properties.path) {
                        var id = e.properties.path;
                        for (var i = 0; i < events.length; i++) {
                            if (events[i].id == id) {
                                path = events[i];
                                break;
                            }
                        }
                        if (path) {
                            floor.setPath(path.x, path.y, path.polyline, e.properties.loop);
                        }
                    }
                    break;
                case "check":
                    qft.MapObject.CheckIcon(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y).setAnimation(e.name);
                    break;
                case "message":
                    qft.MapObject.Message(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    break;
                case "event":
                    qft.MapObject.Event(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    break;
                case "gate":
                    var gate = qft.MapObject.Gate(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    if (e.properties.script) {
                        var sc = "(function(app) {"+e.properties.script+"})";
                        var f = eval(sc);
                        gate.on('enterframe', f);
                        gate.stageController = this;
                        gate.player = this.parentScene.player;
                        gate.parentScene = this.parentScene;
                    }
                    break;
                case "accessory":
                    var layer = e.properties.foreground? mapLayer.foregroundLayer: mapLayer.backgroundLayer;
                    switch (e.name) {
                        case "lamp":
                            qft.MapObject.Lamp(this.parentScene, e).addChildTo(layer).setPosition(x, y);
                            break;
                        case "bonfire":
                            qft.MapObject.Bonfire(this.parentScene, e).addChildTo(layer).setPosition(x, y);
                            break;
                        case "flame":
                            qft.MapObject.Flame(this.parentScene, e).addChildTo(layer).setPosition(x, y);
                            break;
                        case "candle":
                            qft.MapObject.Candle(this.parentScene, e).addChildTo(layer).setPosition(x, y);
                            break;
                        case "lanthanum":
                            qft.MapObject.Lanthanum(this.parentScene, e).addChildTo(layer).setPosition(x, y);
                            break;
                        case "candlelamp":
                            qft.MapObject.CandleLamp(this.parentScene, e).addChildTo(layer).setPosition(x, y);
                            break;
                        default:
                            console.warn("unknown map accessory: "+e.name);
                    }
                    break;
                case "npc":
                    qft.MapObject.npc(this.parentScene, e).addChildTo(mapLayer.enemyLayer).setPosition(x, y);
                    break;
                case "path":
                    break;
                default:
                    console.warn("unknown map object id:[" + e.id + "] type:[" + e.type + "] name:[" + e.name + "]");
            }
        }.bind(this));
        return mapLayer;
    },
});
