/*
 *  SceneFlow.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("qft.SceneFlow", {
    superClass: "phina.game.ManagerScene",

    init: function(options) {
        options = options || {};
        startLabel = options.startLabel || "splash";
        this.superInit({
            startLabel: startLabel,
            scenes: [{
                label: "splash",
                className: "qft.SplashScene",
            },{
                label: "opening",
                className: "qft.OpeningScene",
            },{
                label: "title",
                className: "qft.TitleScene",
                nextLabel: "opening",
            },{
                label: "main",
                className: "qft.MainScene",
                arguments: {
                    startStage: 1,
                    practice: false,
                },
                nextLabel: "title",
            },{
                label: "ending",
                className: "qft.EndingScene",
                nextLabel: "main",
            },            {
                label: "practice",
                className: "qft.ConfigScene_Practice",
            }],
        });
    }
});
