/*
 *  SceneFlow.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("qft.SceneFlow", {
    superClass: "phina.game.ManagerScene",

    init: function() {
        this.superInit({
            startLabel: "splash",
            scenes: [{
                label: "splash",
                className: "qft.SplashScene",
                next: "opening",
            },{
                label: "opening",
                className: "qft.OpeningScene",
                next: "main",
            },{
                label: "main",
                className: "qft.MainScene",
            },{
                label: "gameover",
                className: "qft.GameOverScene",
                next: "main",
            },{
                label: "ending",
                className: "qft.EndingScene",
                next: "main",
            }],
        });
    }
});
