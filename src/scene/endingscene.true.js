/*
 *  endingcene.true.js
 *  2017/05/01
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

//トゥルーエンディング
phina.define("qft.EndingScene.true", {
    superClass: "phina.display.DisplayScene",
    
    init: function(parentScene) {
        this.superInit({width: SC_W, height: SC_H});
        this.parentScene = parentScene;

        this.text = [
            "数多の苦難を乗り越え",
            "あなたは遂に楽園への入り口へと到達した",
            "扉の向こうには階段があり",
            "その階段は遥か天上へと続いている",
            "階段を昇りますか？",
            "",
        ];

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: "rgba(0,0,0,1)",
            stroke: "rgba(0,0,0,1)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.bg.tweener.clear()
            .set({alpha: 0})
            .to({alpha: 0.5}, 1000);

        //イメージ表示用レイヤ
        this.imageLayer = phina.display.DisplayElement().addChildTo(this);

        //上下黒帯
        param.height = SC_H * 0.15;
        this.bar1 = phina.display.RectangleShape(param).addChildTo(this).setOrigin(0, 0).setPosition(0, -SC_H*0.15)
        this.bar2 = phina.display.RectangleShape(param).addChildTo(this).setOrigin(0, 0).setPosition(0, SC_H)

        this.time = 0;

        this.one('enterframe', () => {
            //ＢＧＭ再生
            app.playBGM("endingbgm");
        });
    },

    update: function(app) {
        var ct = app.controller;
        if (this.time > 120) {
            if (ct.ok || ct.cancel) {
                this.parentScene.flare('exitgame');
                this.exit();
            }
        }
        this.time++;
    },
});
