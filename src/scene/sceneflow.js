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


phina.define("qft.PracticePlatform", {
    superClass: "phina.display.DisplayScene",

    init: function(options) {
        this.superInit();
        this.options = (options || {}).$safe({
            assetType: "stage2",
            startStage: 2,
        })
        this.count = 0;
    },

    onenter: function() {
        app.pushScene(qft.LoadingScene({
            assets: qft.Assets.get(this.options),
        }));
    },

    onresume: function() {
        this.count++;
        if (this.count == 1) {
            app.pushScene(qft.MainScene({startStage: this.options.startStage, isPractice: true}));
        }
        if (this.count == 2){
            this.exit();
        }
    }
});

phina.define("qft.ContinuePlatform", {
    superClass: "phina.display.DisplayScene",

    init: function(options) {
        this.superInit();
        this.options = (options || {}).$safe({
            assetType: "stage2",
            startStage: 2,
        })
        this.count = 0;
    },

    onenter: function() {
        app.pushScene(qft.LoadingScene({
            assets: qft.Assets.get(this.options),
        }));
    },

    onresume: function() {
        this.count++;
        if (this.count == 1) {
            scene.loadGame(qft.MainScene({startStage: this.options.startStage, isContinue: true}));
            app.pushScene(scene);
        }
        if (this.count == 2){
            this.exit();
        }
    }
});


