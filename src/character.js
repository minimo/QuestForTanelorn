/*
 *  character.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Character", {
    superClass: "phina.display.DisplayElement",

    init: function(options, parentScene) {
        this.superInit(options);
        this.parentScene = parentScene;

        //地形当り判定用（0:上 1:右 2:下 3:左）
        this._collision = [];
        this._collision[0] = phina.display.DisplayElement({width: 26, height: 3}).addChildTo(this).setPosition(0, -16);
        this._collision[1] = phina.display.DisplayElement({width: 3, height: 26}).addChildTo(this).setPosition( 16, 0);
        this._collision[2] = phina.display.DisplayElement({width: 26, height: 3}).addChildTo(this).setPosition(0,  16);
        this._collision[3] = phina.display.DisplayElement({width: 3, height: 26}).addChildTo(this).setPosition(-16, 0);
    },

    getCollision: function() {
        var layer = this.parentScene.collisionLayer;
        for (var i = 0; i < 4; i++) {
            var c = this._collision[i];
            layer.children.forEach(function(e) {
                if (e.hitTest(c)) {
                    this.y -= 16;
                }
            }.bind(this));
        }
    },
});
