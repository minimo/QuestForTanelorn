/*
 *  phina.assetloaderex.js
 *  2016/11/25
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

//バックグラウンドでアセット読み込み
phina.define("phina.extension.AssetLoaderEx", {

    //進捗
    loadprogress: 0,

    //読み込み終了フラグ
    loadcomplete: false,

    init: function() {
    },

    load: function(assets, callback) {
        this._onLoadAssets = callback || function(){};
        var loader = phina.asset.AssetLoader();
        loader.load(assets);
        loader.on('load', function(e) {
            this.loadcomplete = true;
            this._onLoadAssets();
        }.bind(this));
        loader.onprogress = function(e) {
            this.loadprogress = e.progress;
        }.bind(this);
        return this;
    },
});
