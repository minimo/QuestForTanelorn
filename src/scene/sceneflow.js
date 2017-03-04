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
                next: "title",
            },{
                label: "title",
                className: "qft.TitleScene",
                next: "opening",
            },{
                label: "main",
                className: "qft.MainScene",
                next: "title",
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

phina.define("qft.PracticeMode", {
    superClass: "phina.game.ManagerScene",

    init: function(stageNumber) {
        var stage = "stage"+stageNumber;
        this.superInit({
            startLabel: "loading",
            scenes: [{
                label: "loading",
                className: "qft.LoadingScene",
                arguments: {
                    assets: qft.Assets.get({assetType: "stage"+stageNumber}),
                },
                nextLabel: "practicemain",
            },{
                label: "practicemain",
                className: "qft.MainScene",
                arguments: {
                    startStage: stageNumber,
                    practice: true,
                },
            }],
        });
    }
});
