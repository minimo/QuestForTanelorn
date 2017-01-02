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

        //オブジェクト管理レイヤ
        this.objLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //プレイヤーキャラクタ
        this.player = qft.Player(this).addChildTo(this.objLayer).setPosition(SC_W*0.5, SC_H*0.5);

        //マップ初期化
        this.setupStageMap(1);

        this.time = 0;
    },

    update: function(app) {
        if (this.time == 0) this.spawnEnemy();
        this.mapLayer.x = SC_W*0.5-this.player.x;
//        if (this.mapLayer.x > 0) this.mapLayer.x = 0;
        this.time++;
    },

    spawnEnemy: function() {
        var e = qft.Slime(this).addChildTo(this.objLayer).setPosition(SC_W*0.5, 20);
    },

    setupStageMap: function(stageNumber) {
        stageNumber = stageNumber || 1;

        //登録済みマップの消去
        this.clearMap();

        //マップ情報取得
        var tmx = phina.asset.AssetManager.get('tmx', "stage"+stageNumber);

        //マップ画像取得
        this.map = phina.display.Sprite(tmx.image).addChildTo(this.mapImageLayer).setOrigin(0, 0);

        //マップ当たり判定取得
        var objects = tmx.getObjectGroup("collision").objects;
        objects.forEach(function(e) {
            var c = phina.display.DisplayElement({width: e.width, height: e.height})
                .addChildTo(this.collisionLayer)
                .setPosition(e.x+e.width/2, e.y+e.height/2);
/*
            phina.display.RectangleShape({width: e.width, height: e.height})
                .addChildTo(this.collisionLayer)
                .setPosition(e.x+e.width/2, e.y+e.height/2);
*/
        }.bind(this));
    },

    //マップ情報の消去
    clearMap: function() {
        //マップ画像の消去
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        //当たり判定、オブジェクトの全消去
        this.collisionLayer.removeChildren();
        this.objLayer.removeChildren();

        //プレイヤーの再追加
        this.player.addChildTo(this.objLayer);
    },
});
