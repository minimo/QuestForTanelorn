/*
 *  stage4.js
 *  2017/03/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ１
phina.define("qft.Stage4", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 4,

    //タイムリミット
    timeLimit: FPS*60*5,

    //BGMアセット名
    bgm: "bgm4",

    init: function(parentScene, tmx) {
        this.superInit(parentScene, tmx);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage4_1");
        this.mapLayer[0] = this.createMap(tmx);
        var tmx = phina.asset.AssetManager.get('tmx', "stage4_2");
        this.mapLayer[1] = this.createMap(tmx);

        //初期処理
        this.add(1, function() {
            //ステージ開始メッセージ投入
            this.spawnMessage("STAGE 4", 24);

            //マップ表示設定
            this.limitWidth = true;
            this.limitHeight = true;
        });

        this.add(60, function() {
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
                pl.tweener.clear().moveTo(2903, 176, 1000)
                    .call(function() {
                        pl.animation = false;
                    })
                    .fadeOut(500);
            }.bind(this));
    },
});
