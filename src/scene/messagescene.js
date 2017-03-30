/*
 *  menuscene.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.MenuScene", {
    superClass: "phina.display.DisplayScene",

    init: function(currentScene) {
        this.superInit({width: SC_W, height: SC_H});
        this.currentScene = currentScene;

        //メッセージウィンドウ
        var param = {
            width:SC_W*0.8,
            height:SC_H*0.4,
            fill: "rgba(0,0,0,0.8)",
            stroke: "white",
            sttokeWidth: 5,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.25)
            .setScale(1, 0);
        this.bg.tweener.clear().to({scaleY: 1}, 500, "easeOutCube");

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 16,
            fontWeight: ''
        };
        this.textLabel = phina.display.Label({text: options.message || "no message", fontSize: 20}.$safe(labelParam))
            .addChildTo(this).setPosition(SC_W*0.5, SC_H*0.25);

        this.player = this.currentScene.player;
        this.limitFrame = 30;
        this.isExit = false;

        this.time = 0;        
    },

    update: function() {
        var ct = app.controller;
        if (this.time > 10 && !this.isExit) {
            if (ct.start || ct.pause || ct.menu) {
                this.isExit = true;
                this.tweener.clear()
                    .wait(100)
                    .call(function() {
                        app.popScene();
                    });
            }
        }
        this.limitFrame--;
        this.time++;
    },
});

