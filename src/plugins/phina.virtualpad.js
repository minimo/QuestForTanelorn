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

    //挿下キー情報
    keyData: {
        up: false,
        down: false,
        left: false,
        right: false,
        a: false,
        b: false,
    },

    defaultOptions: {
        //パッド縦横
        width: 640,
        height: 480,

        //パッド座標
        x: 300,
        y: 200,

        //判定半径
        fingerRadius: 20,
    },

    init: function(options) {
        options = ({} || options).$safe(this.defaultOptions);
        this.superInit();

        var param = {
            width: options.width,
            height: options.height,
            fill: "rgba(0,0,0,0.3)",
            stroke: "rgba(0,0,0,0.3)",
            backgroundColor: 'transparent',
        };
        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(options.x, options.y);

        //十字キー中心点
        var hw = this.width/2;
        var hh = this.height/2;
        var cp = phina.geom.Vector2(options.x - options.width/4, options.y + options.height/2);

        var button = {
            width: 20,
            height: 30,
            fill: "rgba(0,0,0,0.2)",
            stroke: "rgba(0,0,0,0.2)",
            backgroundColor: 'transparent',
        };
        this.up   = phina.display.RectangleShape(button).setPosition(cp.x, cp.y - 30).addChildTo(this);
        this.down = phina.display.RectangleShape(button).setPosition(cp.x, cp.y + 30).addChildTo(this);
    },

    infomationUpdate: function() {
        var p = app.mouse;
        if (p.getPointing()) {
            var ps = app.pointers;
        }
    },
});
