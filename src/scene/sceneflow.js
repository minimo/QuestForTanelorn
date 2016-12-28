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
            startLabel: "load",
            scenes: [{
                label: "load",
                className: "phina.game.LoadingScene",
                arguments: {
                    assets: qft.Assets.get({assetType: "common"})
                },
            },{
                label: "main",
                className: "qft.MainScene",
            }],
        });
    }
});
