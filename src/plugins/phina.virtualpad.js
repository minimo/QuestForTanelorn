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
//            .addChildTo(this)
            .setOrigin(0, 0)
            .setPosition(options.x, options.y);

        this.cross = phina.extension.VirtualPad.CrossKey()
            .addChildTo(this)
            .setPosition(100, 300);

        //タップ位置表示
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

//バーチャルパッド十字キー
phina.define("phina.extension.VirtualPad.CrossKey", {
    superClass: "phina.display.DisplayElement",

    active: true,

    //挿下キー情報
    keyData: {
        up: false,
        down: false,
        left: false,
        right: false,
    },

    init: function(options) {
        this.superInit();
        options = (options || {}).$safe(this.defaultOptions);
        this.options = options;

        //十字キー中心点
        var hw = 0;
        var hh = 0;
        var cp = phina.geom.Vector2(0, 0);

        var button = {
            width: 20,
            height: 20,
            fill: "rgba(0,0,0,0.2)",
            stroke: "rgba(0,0,0,0.2)",
            backgroundColor: 'transparent',
        };
        //0:上 1:右 2:下 3:左
        this.btn = [];
        this.up    = this.btn[0] = phina.display.RectangleShape({width: 20, height: 50}.$safe(button)).setPosition(cp.x, cp.y - 30).addChildTo(this).setInteractive(true);
        this.right = this.btn[1] = phina.display.RectangleShape({width: 50, height: 20}.$safe(button)).setPosition(cp.x + 30, cp.y).addChildTo(this).setInteractive(true);
        this.down  = this.btn[2] = phina.display.RectangleShape({width: 20, height: 50}.$safe(button)).setPosition(cp.x, cp.y + 30).addChildTo(this).setInteractive(true);
        this.left  = this.btn[3] = phina.display.RectangleShape({width: 50, height: 20}.$safe(button)).setPosition(cp.x - 30, cp.y).addChildTo(this).setInteractive(true);

        for (var i = 0; i < 4; i++) {
            this.btn[i].isOn = false;
            this.btn[i].on('pointover', () => {
                this.isOn = true;
            });
            this.btn[i].on('pointout', () => {
                this.isOn = false;
            });
        }
    },

    update: function() {
    },

    updateInfo: function() {
    },
});
