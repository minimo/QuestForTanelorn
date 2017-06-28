/*
 *  stage5.js
 *  2017/05/14
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ１
phina.define("qft.Stage5", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 5,

    //タイムリミット
    timeLimit: FPS*60*8,

    //BGMアセット名
    bgm: "bgm5",

    init: function(parentScene, tmx) {
        this.superInit(parentScene, tmx);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage5_1");
        this.mapLayer[0] = this.createMap(tmx);
        var tmx = phina.asset.AssetManager.get('tmx', "stage5_2");
        this.mapLayer[1] = this.createMap(tmx);

        //初期処理
        this.add(1, function() {
            //ステージ開始メッセージ投入
            this.spawnMessage("STAGE 5", 24);

            //マップ表示設定
            this.limitWidth = true;
            this.limitHeight = true;
        });

        //鍵出現
        this.addEvent("key", () => {
            var kx = 1196;
            var ky = 688;
            var key = qft.Item(this.parentScene, {properties: {kind: "key"}})
                .addChildTo(this.parentScene.mapLayer.objLayer)
                .setPosition(kx, ky);
            key.vy = -5;
            this.parentScene.pauseScene = true;
            this.parentScene.centerPlayer = false;
            this.parentScene.camera.setPosition(this.parentScene.player.x, this.parentScene.player.y);
            this.parentScene.camera.tweener.clear()
                .call(function() {
                    app.playSE("holy1");
                })
                .moveTo(kx, ky, 30, "easeInOutSine")
                .wait(30)
                .call(function() {
                    this.parentScene.pauseScene = false;
                    this.moveFrom.x = kx;
                    this.moveFrom.y = ky;
                    this.moveRaio = 0;
                    this.moveLerp = true;
                    this.moveToPlayer = true;
                }.bind(this.parentScene.camera))
                .to({moveRatio: 1}, 30, "easeInOutSine")
                .call(function() {
                    this.parentScene.centerPlayer = true;
                    this.moveLerp = false;
                }.bind(this.parentScene.camera));
        });
    },

    //ステージクリア条件判定
    checkStageClearCondition: function() {
        var keys = this.player.keys;
        if (keys.length < 1) return false;
        return true;
    },

    //ステージクリア処理
    stageClear: function() {
        var pl = qft.PlayerDummy("player1").addChildTo(this.parentScene.mapLayer.playerLayer).setVisible(false);
        pl.setAnimation("clear");
        this.player.tweener.clear()
            .wait(30)
            .set({alpha: 0})
            .call(function() {
                pl.setPosition(this.player.x, this.player.y).setVisible(true);
            }.bind(this))
            .wait(60)
            .call(function() {
                pl.setAnimation("up");
                pl.tweener.clear().moveTo(3493+18, 80+80, 1000)
                    .call(function() {
                        pl.animation = false;
                    })
                    .fadeOut(500);
            }.bind(this));
    },
});
