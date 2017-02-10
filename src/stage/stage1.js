/*
 *  stage1.js
 *  2017/01/24
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ１
phina.define("qft.Stage1", {
    superClass: "qft.StageController",

    //タイムリミット
    timeLimit: FPS*60*5,

    init: function(parentScene, tmx) {
        this.superInit(parentScene, tmx);

        //初期処理
        this.add(1, function() {
            //ＢＧＭ再生
            app.playBGM("bgm1");

            //ステージ開始メッセージ投入
            this.spawnMessage("STAGE 1", 24);

            //マップ表示設定
            this.limitWidth = false;
            this.limitHeight = true;
        });

        this.add(60, function() {
        });
    },

    //ステージクリア条件判定
    checkStageClearCondtion: function() {
        var keys = this.player.keys;
        if (keys.length != 0) return true;
        return false;
    },

    //ステージクリア処理
    stageClear: function() {
        var pl = qft.PlayerDummy("player1").addChildTo(this.parentScene.mapLayer.playerLayer).setVisible(false);
        pl.setAnimation("clear");
        pl.tweener.clear()
            .by()
        this.player.tweener.clear()
            .wait(30)
            .set({alpha: 0})
            .call(function() {
                pl.setPosition(this.player.x, this.player.y).setVisible(true);
            }.bind(this))
            .wait(60)
            .call(function() {
                pl.setAnimation("up");
                pl.tweener.clear().moveBy(10, -32, 1000)
                    .call(function() {
                        pl.animation = false;
                    })
                    .fadeOut(500);
            }.bind(this));
    },
});
