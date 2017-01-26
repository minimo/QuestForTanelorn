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
        this.on('enterframe', function() {
            this.gamepadManager.update();
            this.updateController();
        });

        //サウンドセット
        this.soundset = phina.extension.SoundSet();
    },

    updateController: function() {
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

            jump: gp.getKey("up") || kb.getKey("up"),
            attack: gp.getKey("A") || kb.getKey("Z"),
            menu: gp.getKey("start") || kb.getKey("escape") || kb.getKey("X"),

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
        };
    },

    _onLoadAssets: function() {
        this.soundset.readAsset();
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
