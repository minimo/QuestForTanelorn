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
        options = options || {};
        startLabel = options.startLabel || "start";
        this.superInit({
            startLabel: startLabel,
            scenes: [{
                label: "start",
                className: "qft.ConfigScene_Practice",
            },{
                label: "stage1",
                className: "qft.MainScene",
                arguments: {
                    startStage: 1,
                    isPractice: true,
                },
                nextLabel: "start",
            },{
                label: "stage2",
                className: "qft.LoadingScene",
                arguments: {
                    assetType: "stage2",
                },
                nextLabel: "stage2_main",
            },{
                label: "stage2_main",
                className: "qft.MainScene",
                arguments: {
                    startStage: 2,
                    isPractice: true,
                },
                nextLabel: "start",
            },{
                label: "stage3",
                className: "qft.LoadingScene",
                arguments: {
                    assetType: "stage3",
                },
                nextLabel: "stage3_main",
            },{
                label: "stage3_main",
                className: "qft.MainScene",
                arguments: {
                    startStage: 3,
                    isPractice: true,
                },
                nextLabel: "start",
            },{
                label: "stage4",
                className: "qft.LoadingScene",
                arguments: {
                    assetType: "stage4",
                },
                nextLabel: "stage4_main",
            },{
                label: "stage4_main",
                className: "qft.MainScene",
                arguments: {
                    startStage: 4,
                    isPractice: true,
                },
                nextLabel: "start",
            }],
        });
    }
});
