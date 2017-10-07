/*
 *  stage10.js
 *  2017/09/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

//エンディングシーン
phina.define("qft.Stage10", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 10,

    //タイムリミット
    timeLimit: FPS*60*5,

    //BGMアセット名
    bgm: "ending",

    //特殊ステージフラグ
    isEnding: true,

    init: function(parentScene, tmx) {
        this.superInit(parentScene, tmx);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage10");
        this.mapLayer[0] = this.createMap(tmx);

        //初期処理
        this.add(1, function() {
            //開始メッセージ投入
            this.spawnEventMessage(1, "You reached Tanelorn...");

            //マップ表示設定
            this.limitWidth = true;
            this.limitHeight = true;

            this.player.speed = 2;
            this.player.isAuto = true;
            this.player.autoKey.right = true;
        });

        //石碑まで
        this.add(255, function() {
            this.player.autoKey.right = false;
            this.player.setAnimation("up");
        });
        this.add(120, function() {
            this.player.autoKey.right = true;
        });

        //入り口まで
        this.add(360, function() {
            this.player.autoKey.right =　false;
        });

        this.add(60, function() {
            this.player.autoKey.right = true;
        });
        this.add(30, function() {
            this.player.autoKey.right = false;
        });
        this.add(30, function() {
            this.player.autoKey.right = true;
        });
        this.add(20, function() {
            this.player.autoKey.right = false;
        });

        this.add(60, function() {
            this.player.tweener.clear().set({alpha: 0}).moveBy(0, -600, 600);
            this.player.gravity = 0;

            var pl = qft.PlayerDummy("player1").addChildTo(this.mapLayer.playerLayer);
            pl.setPosition(this.player.x, this.player.y);
            pl.setAnimation("up");
            pl.tweener.setUpdateType('fps').clear()
                .moveBy(0, -600, 600)
                .call(() => {
                    pl.setAnimation("down");
                })
                .wait(10)
                .call(() => {
                    pl.setAnimation("clear");
                })
                .wait(30)
                .call(() => {
                    pl.setAnimation("up");
                })
                .wait(30)
                .call(() => {
                    this.fgWhite.tweener.clear()
                        .wait(120)
                        .fadeIn(120)
                        .call(() => {
                            this.flare("ending");
                        });
                    this.fg.tweener.clear()
                        .wait(150)
                        .fadeIn(60);

                })
                .moveBy(0, -600, 600);
        });
    },

    //ステージクリア条件判定
    checkStageClearCondition: function() {
        return true;
    },

    //ステージクリア処理
    stageClear: function() {
    },
});
