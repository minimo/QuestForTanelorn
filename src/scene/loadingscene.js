/*
 *  LoadingScene.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アセットロード用シーン
phina.define("qft.LoadingScene", {
    superClass: "phina.display.DisplayScene",

    init: function(options) {
        options = (options||{}).$safe({
            asset: options.assets,
            width: SC_W,
            height: SC_H,
            lie: false,
            exitType: "auto",
        });
        this.superInit(options);

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.tweener.setUpdateType('fps');

        //ロードする物が無い場合スキップ
        this.forceExit = false;
        var asset = options.asset;
        if (!asset.$has("sound") && !asset.$has("image") && !asset.$has("font") && !asset.$has("spritesheet") && !asset.$has("script")) {
            this.forceExit = true;
            return;
        }

        var labelParam = {
            text: "Loading",
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 30
        };
        phina.display.Label(labelParam)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        this.fromJSON({
            children: {
                gauge: {
                    className: 'phina.ui.Gauge',
                    arguments: {
                        value: 0,
                        width: this.width*0.5,
                        height: 5,
                        color: 'black',
                        stroke: false,
                        gaugeColor: 'blue',
                        padding: 0,
                    },
                    x: this.gridX.center(),
                    y: SC_H*0.5+20,
                    originY: 0,
                }
            }
        });
        this.gauge.update = function(e) {
            this.gaugeColor = 'hsla({0}, 100%, 50%, 0.8)'.format(e.ticker.frame*3);
        }

        var loader = phina.asset.AssetLoader();
        if (options.lie) {
            this.gauge.animationTime = 10*1000;
            this.gauge.value = 90;
            loader.onload = function() {
                this.gauge.animationTime = 1*1000;
                this.gauge.value = 100;
            }.bind(this);
        } else {
            loader.onprogress = function(e) {
                this.gauge.value = e.progress*100;
            }.bind(this);
        }
        this.gauge.onfull = function() {
            if (options.exitType === 'auto') {
                if (this.app._onLoadAssets) this.app._onLoadAssets();
                this.exit();
            }
        }.bind(this);

        loader.load(options.asset);
    },
    update: function() {
        if (this.forceExit) this.exit();
    },    
});
