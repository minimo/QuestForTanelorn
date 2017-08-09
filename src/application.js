/*
 *  application.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

//namespaace Quest For the Tanelorn
var qft = {};

phina.define("qft.Application", {
    superClass: "phina.display.CanvasApp",

    init: function() {
        this.superInit({
            query: '#world',
            width: SC_W,
            height: SC_H,
            backgroundColor: 'rgba(0, 0, 0, 1)',
        });
        this.fps = FPS;

        //ゲームパッド管理
        this.gamepadManager = phina.input.GamepadManager();
        this.gamepad = this.gamepadManager.get(0);

        //バーチャルパッド
        this.virtualPad = phina.extension.VirtualPad({width: SC_W, height: SC_H}).setPosition(0, 0);

        //パッド情報を更新
        this.on('enterframe', function() {
            this.gamepadManager.update();
            this.virtualPad.updateInfo();
            this.updateController();
        });
        this.controller = {};

        //サウンドセット
        this.soundset = phina.extension.SoundSet();

        //Labelデフォルト設定
        phina.display.Label.defaults.$extend({
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 32,
            fontWeight: ''
        });
    },

    updateController: function() {
        var before = this.controller;
        before.before = null;

        var gp = this.gamepad;
        var kb = this.keyboard;
        var angle1 = gp.getKeyAngle();
        var angle2 = kb.getKeyAngle();
        this.controller = {
            angle: angle1 !== null? angle1: angle2,

            up: gp.getKey("up") || kb.getKey("up"),
            down: gp.getKey("down") || kb.getKey("down"),
            left: gp.getKey("left") || kb.getKey("left"),
            right: gp.getKey("right") || kb.getKey("right"),

            attack: gp.getKey("X") || kb.getKey("Z"),
            jump:   gp.getKey("up") || gp.getKey("A") || kb.getKey("up") || kb.getKey("X"),
            change: gp.getKey("B") || kb.getKey("C"),
            menu:   gp.getKey("start") || kb.getKey("escape"),

            a: gp.getKey("A") || kb.getKey("Z"),
            b: gp.getKey("B") || kb.getKey("X"),
            x: gp.getKey("X") || kb.getKey("C"),
            y: gp.getKey("Y") || kb.getKey("V"),

            ok: gp.getKey("A") || kb.getKey("Z") || kb.getKey("space") || kb.getKey("return"),
            cancel: gp.getKey("B") || kb.getKey("X") || kb.getKey("escape"),

            start: gp.getKey("start") || kb.getKey("return"),
            select: gp.getKey("select"),

            pause: gp.getKey("start") || kb.getKey("escape"),

            analog1: gp.getStickDirection(0),
            analog2: gp.getStickDirection(1),

            //前フレーム情報
            before: before,
        };
    },

    _onLoadAssets: function() {
        this.soundset.readAsset();

        //特殊効果用ビットマップ作成
        [
            "player1",
            "player2",
        ].forEach(function(name) {
            if (!phina.asset.AssetManager.get("image", name)) return;

            //ダメージ用
            if (!phina.asset.AssetManager.get("image", name+"White")) {
                var tex = phina.asset.AssetManager.get("image", name).clone();
                tex.filter( function(pixel, index, x, y, bitmap) {
                    var data = bitmap.data;
                    data[index+0] = (pixel[0] == 0? 0: 128); //r
                    data[index+1] = (pixel[1] == 0? 0: 128); //g
                    data[index+2] = (pixel[2] == 0? 0: 128); //b
                });
                phina.asset.AssetManager.set("image", name+"White", tex);
            }
            //瀕死用
            if (!phina.asset.AssetManager.get("image", name+"Red")) {
                var tex = phina.asset.AssetManager.get("image", name).clone();
                tex.filter( function(pixel, index, x, y, bitmap) {
                    var data = bitmap.data;
                    data[index+0] = pixel[0];
                    data[index+1] = 0;
                    data[index+2] = 0;
                });
                phina.asset.AssetManager.set("image", name+"Red", tex);
            }
            //影用
            if (!phina.asset.AssetManager.get("image", name+"Black")) {
                var tex = phina.asset.AssetManager.get("image", name).clone();
                tex.filter( function(pixel, index, x, y, bitmap) {
                    var data = bitmap.data;
                    data[index+0] = 0;
                    data[index+1] = 0;
                    data[index+2] = 0;
                });
                phina.asset.AssetManager.set("image", name+"Black", tex);
            }
        });
    },

    playBGM: function(asset, loop, callback) {
        if (loop === undefined) loop = true;
        this.soundset.playBGM(asset, loop, callback);
    },

    stopBGM: function(asset) {
        this.soundset.stopBGM();
    },

    setVolumeBGM: function(vol) {
        if (vol > 1) vol = 1;
        if (vol < 0) vol = 0;
        this.soundset.setVolumeBGM(vol);
    },

    playSE: function(asset, loop) {
        if (loop === undefined) loop = false;
        this.soundset.playSE(asset, loop);
    },

    setVolumeSE: function(vol) {
        if (vol > 1) vol = 1;
        if (vol < 0) vol = 0;
        this.soundset.setVolumeSE(vol);
    },

    setVolume: function(asset, vol) {
        this.soundset.setVolume(asset, vol);
    },

    _accessor: {
        volumeBGM: {
            "get": function() { return this.sounds.volumeBGM; },
            "set": function(vol) { this.setVolumeBGM(vol); }
        },
        volumeSE: {
            "get": function() { return this.sounds.volumeSE; },
            "set": function(vol) { this.setVolumeSE(vol); }
        }
    }
});
