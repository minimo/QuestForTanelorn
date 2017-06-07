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
            .setPosition(options.height * 0.2, options.height * 0.8);

        this.btn = [];
        this.btn[0] = phina.extension.VirtualPad.Button().addChildTo(this).setPosition(options.width * 0.7, options.height * 0.9);
        this.btn[1] = phina.extension.VirtualPad.Button().addChildTo(this).setPosition(options.width * 0.7 + 80, options.height * 0.9);

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
            //タップ位置表示
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

    getKey: function(code) {
        var cr = this.cross.keydata;
        switch (code) {
            case "up":
                return cr.up;
            case "down":
                return cr.down;
            case "right":
                return cr.right;
            case "left":
                return cr.left;
            case "z":
            case "Z":
                return this.btn[0].isOn;
            case "x":
            case "X":
                return this.btn[1].isOn;
            default:
                return false;
        }
    },
});

//バーチャルパッド十字キー
phina.define("phina.extension.VirtualPad.CrossKey", {
    superClass: "phina.display.DisplayElement",

    active: true,

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
        //0:上 1:右上 2:右 3:右下 4:下 5:左下 6:左 7:左上
        this.btn = [];
        this.btn[0] = phina.display.RectangleShape({width: 60, height: 50}.$safe(button)).setPosition(cp.x     , cp.y - 40).addChildTo(this).setInteractive(true);
        this.btn[2] = phina.display.RectangleShape({width: 50, height: 60}.$safe(button)).setPosition(cp.x + 40, cp.y     ).addChildTo(this).setInteractive(true);
        this.btn[4] = phina.display.RectangleShape({width: 60, height: 50}.$safe(button)).setPosition(cp.x     , cp.y + 40).addChildTo(this).setInteractive(true);
        this.btn[6] = phina.display.RectangleShape({width: 50, height: 60}.$safe(button)).setPosition(cp.x - 40, cp.y     ).addChildTo(this).setInteractive(true);

        this.btn[1] = phina.display.RectangleShape({width: 30, height: 30}.$safe(button)).setPosition(cp.x + 40, cp.y - 40).addChildTo(this).setInteractive(true);
        this.btn[3] = phina.display.RectangleShape({width: 30, height: 30}.$safe(button)).setPosition(cp.x + 40, cp.y + 40).addChildTo(this).setInteractive(true);
        this.btn[5] = phina.display.RectangleShape({width: 30, height: 30}.$safe(button)).setPosition(cp.x - 40, cp.y + 40).addChildTo(this).setInteractive(true);
        this.btn[7] = phina.display.RectangleShape({width: 30, height: 30}.$safe(button)).setPosition(cp.x - 40, cp.y - 40).addChildTo(this).setInteractive(true);

        for (var i = 0; i < this.btn.length; i++) {
            this.btn[i].isOn = false;
            this.btn[i].on('pointover', function() {
                this.isOn = true;
            });
            this.btn[i].on('pointout', function() {
                this.isOn = false;
            });
        }

        //挿下キー情報
        this.keydata = {
            up: false,
            down: false,
            left: false,
            right: false,
        };
    },

    update: function() {
        this.keydata = {
            up: this.btn[0].isOn || this.btn[1].isOn || this.btn[7].isOn,
            right: this.btn[2].isOn || this.btn[1].isOn || this.btn[3].isOn,
            down: this.btn[4].isOn || this.btn[3].isOn || this.btn[5].isOn,
            left: this.btn[6].isOn || this.btn[5].isOn || this.btn[7].isOn,
        };
    },
});

//バーチャルパッドボタン
phina.define("phina.extension.VirtualPad.Button", {
    superClass: "phina.display.DisplayElement",

    active: true,

    init: function(options) {
        this.superInit();
        options = (options || {}).$safe(this.defaultOptions);
        this.options = options;

        var param = {
            radius: options.radius || 30,
            fill: "rgba(0,0,0,0.2)",
            stroke: "rgba(0,0,0,0.2)",
            backgroundColor: 'transparent',
        };
        this.btn = phina.display.CircleShape(param)
            .addChildTo(this)
            .setInteractive(true);
        this.btn.on('pointover', e => {
            this.isOn = true;
        });
        this.btn.on('pointout', e => {
            this.isOn = false;
        });
    },
});

