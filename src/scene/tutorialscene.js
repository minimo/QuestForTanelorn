/*
 *  tutorialscene.js
 *  2017/06/01
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.TutorialScene", {
    superClass: "phina.display.DisplayScene",

    //進行
    seq: 0,

    init: function(currentScene) {
        this.superInit({width: SC_W, height: SC_H});
        this.currentScene = currentScene;

        //バックグラウンド
        var param = {
            width: SC_W,
            height: SC_H,
            fill: "rgba(0,0,0,1)",
            stroke: "rgba(0,0,0,1)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.5)

        //イメージ表示用レイヤ
        this.imageLayer = phina.display.DisplayElement().addChildTo(this);

        //フォアグラウンド
        this.fg = phina.display.RectangleShape(param).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.5)
        this.fg.alpha = 0;
    },

    update: function() {
    },
});

