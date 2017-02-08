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
        this.loadcomplete = false;
        this.exitOk = false;

        //preload asset
        var assets = qft.Assets.get({assetType: "splash"});
        var loader = phina.asset.AssetLoader();
        loader.load(assets);
        loader.on('load', function(e) {
            this.loadcomplete = true;
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
    },

    update: function() {
        if (this.unlock && this.loadcomplete) {
            this.unlock = false;
            this.sprite.tweener.clear()
                .to({alpha:0}, 500, 'easeOutCubic')
                .call(function() {
                    this.exit();
                }, this);
        }
    },

    _static: {
        logo: "assets/image/phinajs_logo.png",
    },
});
