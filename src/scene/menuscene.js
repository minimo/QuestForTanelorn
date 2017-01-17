/*
 *  pausescene.js
 *  2016/08/17
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.MenuScene", {
    superClass: "phina.display.DisplayScene",

    init: function(currentScene) {
        this.superInit();

        this.currentScene = currentScene;
        this.yes = true;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: "rgba(0,0,0,0.7)",
            stroke: "rgba(0,0,0,0.7)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 35,
            fontWeight: ''
        };
        //ポーズ表示
        this.pause1 = phina.display.Label({text: "PAUSE"}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        this.pause2 = phina.display.Label({text: "Press ESC or Space or Tap to exit", fontSize: 15}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.6);

        this.isExit = false;
        this.time = 0;        
    },

    update: function() {
        if (this.time > 30 && !this.isExit) {
            var ct = app.controller;
            if (ct.start || ct.pause) {
                this.pause1.tweener.clear().fadeOut(100);
                this.pause2.tweener.clear().fadeOut(100);
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

