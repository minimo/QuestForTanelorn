/*
 *  SceneFlow.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

//メインシーンフロー
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
                className: "qft.SceneFlow.Resume",
                arguments: {
                    isPractice: false,
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

//復帰用
phina.define("qft.SceneFlow.Resume", {
    superClass: "phina.game.ManagerScene",

    init: function(options) {
        options = (options || {}).$safe({stageNumber: 2, isPractice: false, isContinue: false});
        if (options.isContinue) {
            var data = localStorage.getItem("stage");
            if (data) {
                var d = JSON.parse(data).$safe({
                    stageNumber: 1,
                    result: [],
                    playerStatus: {},
                });
                options.stageNumber = d.stageNumber;
            } else {
                options.stageNumber = 1;
            }
        }
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
                    isPractice: options.isPractice,
                    isContinue: options.isContinue,
                },
            }],
        });
    },
    onfinish: function() {
        this.exit();
    }
});
