/*
 *  GameOverScene.js
 *  2014/06/04
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("qft.GameOverScene", {
    superClass: "phina.display.DisplayScene",
    
    init: function() {
        this.superInit();
        this.$extend(this._member);

        //バックグラウンド
        var param = {
            width: SC_W,
            height: SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
//            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.tweener.setUpdateType('fps');

        var labelParam = {
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 32,
            fontWeight: ''
        };
        var x = SC_W * 0.5-32*4;
        var n = 0;
        ["G", "A", "M", "E", "O", "V", "E", "R"].forEach(function(e) {
            var lb = phina.display.Label({text: e}.$safe(labelParam))
                .setPosition(x, SC_H*0.5+32)
                .setScale(0, 1)
                .addChildTo(this);
            lb.tweener.clear()
                .set({alpha: 0})
                .wait(n*50)
                .to({scaleX: 1.0, alpha: 1, y: SC_H*0.5}, 1000, "easeOutSine");
            x += 32;
            n++;
        }.bind(this));

        this.mask = phina.display.RectangleShape(param)
//            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.mask.tweener.setUpdateType('fps').fadeOut(30);

        this.time = 0;
    },

    update: function(app) {
        this.time++;
    },

    //タッチorクリック開始処理
    onpointstart: function(e) {
    },

    //タッチorクリック移動処理
    onpointmove: function(e) {
    },

    //タッチorクリック終了処理
    onpointend: function(e) {
    },
});
