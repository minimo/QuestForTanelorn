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
        x: 0,
        y: 0,

        //判定半径
        fingerRadius: 20,
    },

    init: function(options) {
        this.superInit();
        options = (options || {}).$safe(this.defaultOptions);
        this.options = options;

        var param = {
            width: options.width,
            height: options.height,
            fill: "rgba(0,0,0,0.3)",
            stroke: "rgba(0,0,0,0.3)",
            strokeWigth: 0,
            backgroundColor: 'transparent',
        };
        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setOrigin(0, 0)
            .setPosition(options.x, options.y);

        //十字キー中心点
        var hw = this.width/2;
        var hh = this.height/2;
        var cp = phina.geom.Vector2(0, 0);

        var button = {
            width: 20,
            height: 20,
            fill: "rgba(0,0,0,0.2)",
            stroke: "rgba(0,0,0,0.2)",
            backgroundColor: 'transparent',
        };
        this.up    = phina.display.RectangleShape({height: 30}.$safe(button)).setPosition(cp.x, cp.y - 30).addChildTo(this);
        this.down  = phina.display.RectangleShape({height: 30}.$safe(button)).setPosition(cp.x, cp.y + 30).addChildTo(this);
        this.left  = phina.display.RectangleShape({width: 30}.$safe(button)).setPosition(cp.x - 30, cp.y).addChildTo(this);
        this.right = phina.display.RectangleShape({width: 30}.$safe(button)).setPosition(cp.x + 30, cp.y).addChildTo(this);

        var fingerParam = {
            backgroundColor: 'transparent',
            fill: "rgba(0,0,0,0.2)",
            stroke: "rgba(0,0,0,0.2)",
            strokeWidth: 1,
            radius: options.fingerRadius,
        };
        this.finger = [];
        for (var i = 0; i < 5; i++) {
            this.finger[i] = phina.display.CircleShape(fingerParam).addChildTo(this);
            this.finger[i].visible = false;
        }

    },

    update: function() {
    },

    updateInfo: function() {
        var p = app.mouse;
        if (p.getPointing()) {
            var ps = app.pointers;
            for (var i = 0; i < 5; i++) {
                if (i < ps.length) {
                    this.finger[i].visible = true;
                    this.finger[i].setPosition(ps[i].x, ps[i].y);
                } else {
                    this.finger[i].visible = false;
                }
            }
        } else {
            for (var i = 0; i < 5; i++) {
                this.finger[i].visible = false;
            }
        }
    },
});
