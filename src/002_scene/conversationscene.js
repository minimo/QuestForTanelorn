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

        //テキスト処理
        if (text === undefined) text = "TEST MESSAGE";
        if (text instanceof Array) {
            this.text = "";
            text.forEach((t) => {
                this.text += (t + "\n");
            });
        } else {
            this.text = text;
        }

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 5,

            fontFamily: "Orbitron",
            fontSize: 70,

            verticalAlign: 'top',
            align:'start',
            baseline:'top',
            width: SC_W * 0.9,
            height: SC_H * 0.3,
            scrollX: 0,
            scrollY: 0,
        };
        this.textLabel = phina.ui.LabelArea({text: "", fontSize: 20}.$safe(labelParam)).addChildTo(this.bg);

        this.isExit = false;
        this.isFinish = false;
        this.waitTime = 0;
        this.col = 0;
        this.time = 0;
    },

    update: function() {
        if (this.waitTime == 0) {
            this.textLabel.text = this.text.substring(0, this.col);
            if (this.text.substring(this.col, this.col+1) == "\n") this.waitTime = 10;
            this.col++;
            if (this.col > this.text.length) this.isFinish = true;
        }
        if (this.waitTime > 0) this.waitTime--;

        var ct = app.controller;
        if (this.isFinish) {
            if (!this.isExit && this.time > 10 && ct.before.attack && !ct.attack) {
                this.isExit = true;
                this.tweener.clear()
                    .wait(100)
                    .call(function() {
                        app.popScene();
                    });
            }
        } else {
            if (ct.attack) {
                this.col = this.text.length;
                this.isFinish = true;
                this.time = 0;
            }
        }
        this.time++;
    },
});

