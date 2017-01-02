/*
 *  MainScene.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.MainScene", {
    superClass: "phina.display.DisplayScene",

    init: function() {
        this.superInit();

        //バックグラウンド
        this.background = phina.display.Sprite("background", 640, 480).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.5);

        //マップレイヤー
        this.mapLayer = phina.display.DisplayElement().addChildTo(this);
        this.mapImageLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //地形判定用レイヤー
        this.collisionLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);
/*
        phina.display.RectangleShape({width: 200, height: 10}).addChildTo(this.collisionLayer).setPosition(SC_W*0.5, 230);
        phina.display.RectangleShape({width: 100, height: 30}).addChildTo(this.collisionLayer).setPosition(SC_W*0.2, 300);
        phina.display.RectangleShape({width: 150, height: 30}).addChildTo(this.collisionLayer).setPosition(SC_W*0.8, 300);
*/
        //オブジェクト管理レイヤ
        this.objLayer = phina.display.DisplayElement().addChildTo(this.mapLayer);

        //プレイヤーキャラクタ
        this.player = qft.Player(this).addChildTo(this.objLayer).setPosition(SC_W*0.5, SC_H*0.5);

        //マップ初期化
        this.setupStageMap(1);

        this.time = 0;
    },

    update: function(app) {
        if (this.time % 30 == 0) this.spawnEnemy();
        this.time++;
    },

    spawnEnemy: function() {
        var e = qft.Slime(this).addChildTo(this.objLayer).setPosition(SC_W*0.5, 20);
    },

    setupStageMap: function(stageNumber) {
        stageNumber = stageNumber || 1;
        var tmx = phina.asset.AssetManager.get('tmx', "stage"+stageNumber);
        this.map = phina.display.Sprite(tmx.image).addChildTo(this.mapImageLayer).setOrigin(0, 0);
        var objects = tmx.getObjectGroup("collision").objects;
        objects.forEach(function(e) {
            var c = phina.display.DisplayElement({width: e.width, height: e.height})
                .addChildTo(this.collisionLayer)
                .setPosition(e.x+e.width/2, e.y+e.height/2);
        }.bind(this));
    },
});
