/*
 *  titlescene.js
 *  2017/02/09
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("qft.TitleScene", {
    superClass: "phina.display.DisplayScene",
    
    init: function() {
        this.superInit();

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.tweener.setUpdateType('fps');

        var labelParam = {
            fill: "white",
            stroke: "blue",
            strokeWidth: 1,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 30,
        };
        var num = 0;
        this.textLabel = phina.display.Label({text: "The Quest for Tanelorn"}.$safe(labelParam))
            .addChildTo(this).setPosition(SC_W*0.5, SC_H*0.3);
        this.textLabel = phina.display.Label({text: "Push button to START", fontSize: 15}.$safe(labelParam))
            .addChildTo(this).setPosition(SC_W*0.5, SC_H*0.7);

        this.fg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.fg.tweener.setUpdateType('fps');
        this.fg.tweener.clear().fadeOut(30);

        this.time = 0;
    },
    
    update: function(app) {
        if (this.time > 30) {
            var ct = app.controller;
            if (ct.ok || ct.cancel) this.exit();
        }
        this.time++;
    },


});
