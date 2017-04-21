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
                    isPractice: false,
                },
                nextLabel: "title",
            },{
                label: "continue",
                className: "qft.MainScene",
                arguments: {
                    isContinue: true,
                },
                nextLabel: "title",
            },{
                label: "ending",
                className: "qft.EndingScene",
                nextLabel: "main",
            },{
                label: "config",
                className: "qft.ConfigScene",
                nextLabel: "title",
            },{
                label: "practice",
                className: "qft.ConfigScene_Practice",
                nextLabel: "config",
            }],
        });
    }
});

phina.define("qft.SceneFlow_Practice", {
    superClass: "phina.game.ManagerScene",

    init: function(options) {
        options = (options || {}).$safe({stageNumber: 2});
        var startLabel = "start";
        var assets = qft.Assets.get({assetType: "stage"+options.stageNumber});
        this.superInit({
            startLabel: startLabel,
            scenes: [{
                label: "start",
                className: "qft.LoadingScene",
                arguments: {
                    assets: assets,
                },
                nextLabel: "main",
            },{
                label: "main",
                className: "qft.MainScene",
                arguments: {
                    startStage: options.stageNumber,
                    isPractice: true,
                },
            }],
        });
    },
    onfinish: function() {
        this.exit();
    }
});
