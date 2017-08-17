/*
 *  conversationscene.js
 *  2017/08/17
 *  @auther minimo  
 *  This Program is MIT license.
 */

//会話表示シーン 
phina.define("qft.ConversationScene", {
    superClass: "phina.display.DisplayScene",

    init: function(currentScene, text) {
        this.superInit({width: SC_W, height: SC_H});
        this.currentScene = currentScene;

        //プレイヤーの画面上位置によりフレームの縦位置を変更
        var frameY = SC_H * 0.25;
        var pl = this.currentScene.player;

        //会話表示フレーム
        var param = {
            width:SC_W * 0.95,
            height:SC_H * 0.4,
            fill: "rgba(0, 0, 0, 0.5)",
            stroke: "rgba(1, 1, 1, 0.5)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W * 0.5, frameY)

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 5,

            fontFamily: "Orbitron",
            fontSize: 70,

            verticalAlign: 'top',
            align: 'left',
            baseline: 'top',
            width: SC_W * 0.9,
            height: SC_H * 0.25,
            scrollX: 0,
            scrollY: 0,
        };
        this.textLabel1 = phina.ui.LabelArea({text: "TEST MESSAGE", fontSize: 20}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W * 0.5, SC_H * 0.4)
            .setOrigin(0.5, 0);

        this.isExit = false;
        this.time = 0;        
    },

    update: function() {
        var ct = app.controller;
        if (this.time > 10 && !this.isExit) {
            if (ct.attack) {
                this.isExit = true;
                this.tweener.clear()
                    .wait(100)
                    .call(function() {
                        app.popScene();
                    });
            }
        }
        this.time++;
    },
});

