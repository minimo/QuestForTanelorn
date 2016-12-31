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

        this.gamepadManager = phina.input.GamepadManager();
        this.gamepad = this.gamepadManager.get(0);
        this.on('enterframe', function() {
            this.gamepadManager.update();
            this.updateController();
        });
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

            attack: gp.getKey("A") || kb.getKey("Z"),
            jump: gp.getKey("B") || kb.getKey("B"),
            x: gp.getKey("X") || kb.getKey("X"),
            y: gp.getKey("Y") || kb.getKey("C"),

            ok: gp.getKey("A") || kb.getKey("Z") || kb.getKey("space"),
            cancel: gp.getKey("B") || kb.getKey("X"),

            start: gp.getKey("start"),
            select: gp.getKey("select"),

            analog1: gp.getStickDirection(0),
            analog2: gp.getStickDirection(1),
        };
    },
});
