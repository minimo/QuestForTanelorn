/*
 *  splashscene.js
 *  2017/02/08
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define('qft.SplashScene', {
    superClass: 'phina.display.DisplayScene',

    init: function() {
        this.superInit({width: SC_W, height: SC_H});

        this.unlock = false;
        this.loadcomplete1 = false;
        this.loadcomplete2 = false;
        this.progress1 = 0;
        this.progress2 = 0;

        //preload asset
        var assets = qft.Assets.get({assetType: "splash"});
        this.loader = phina.asset.AssetLoader();
        this.loader.load(assets);
        this.loader.on('load', function(e) {
            this.loadcomplete1 = true;
        }.bind(this));
        this.loader.on('progress', function(e) {
            this.progress1 = Math.floor(e.progress*100);
        }.bind(this));

        //preload asset2
        var assets = qft.Assets.get({assetType: "splash2"});
        this.loader2 = phina.asset.AssetLoader();
        this.loader2.load(assets);
        this.loader2.on('load', function(e) {
            this.loadcomplete2 = true;
        }.bind(this));
        this.loader2.on('progress', function(e) {
            this.progress2 = Math.floor(e.progress*100);
        }.bind(this));

        //logo
        var texture = phina.asset.Texture();
        texture.load(qft.SplashScene.logo).then(function() {
            this._init();
        }.bind(this));
        this.texture = texture;
    },

    _init: function() {
        this.sprite = phina.display.Sprite(this.texture)
            .addChildTo(this)
            .setPosition(this.gridX.center(), this.gridY.center())
            .setScale(0.3);
        this.sprite.alpha = 0;

        this.sprite.tweener.clear()
            .to({alpha:1}, 500, 'easeOutCubic')
            .wait(500)
            .call(function() {
                this.unlock = true;
            }, this);

        var that = this;
        //進捗ゲージ
        var options = {
            width:  SC_W*0.1,
            height: 3,
            backgroundColor: 'transparent',
            fill: 'red',
            stroke: 'white',
            strokeWidth: 1,
            gaugeColor: 'lime',
            cornerRadius: 3,
            value: 0,
            maxValue: 100,
        };
        this.progressGauge = phina.ui.Gauge(options).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.8);
        this.progressGauge.beforeValue = 0;
        this.progressGauge.update = function() {
            if (that.progress1 == this.beforeValue) {
                this.value++;
            } else {
                this.value = that.progress1;
            }
            this.beforeValue = this.value;
        };
    },

    update: function() {
        if (this.unlock && this.loadcomplete1 && this.loadcomplete2) {
            this.unlock = false;
            this.sprite.tweener.clear()
                .to({alpha:0}, 500, 'easeOutCubic')
                .call(function() {
                    this.exit();
                }, this);
            this.progressGauge.tweener.clear().to({alpha:0}, 200, 'easeOutCubic')
        }
    },

    _static: {
        logo: "assets/image/phinajs_logo.png",
    },
});
