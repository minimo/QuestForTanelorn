/*
 *  phina.assetloaderex.js
 *  2016/11/25
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

//バーチャルパッド
phina.define("phina.extension.VirtualPad", {
    superClass: "phina.display.DisplayElement",

    active: true,

    init: function(options) {
        this.superInit({width: SC_W, height: SC_H});

        var param = {
            width:SC_W,
            height:SC_H,
            fill: "rgba(0,0,0,0.5)",
            stroke: "rgba(0,0,0,0.5)",
            backgroundColor: 'transparent',
        };
        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.mask.alpha = 0;
    },

    update: function() {
        var p = app.mouse;
        if (p.getPointing()) {
            var p = app.pointers;
        }
    },    

    onpointstart: function(e) {
        var p = app.pointers;
    },
    onpointmove: function(e) {
        var p = app.pointers;
    },
    onpointend: function(e) {
        var p = app.pointers;
    },
});
