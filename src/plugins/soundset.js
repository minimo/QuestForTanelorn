/*
 *  SoundSet.js
 *  2014/11/28
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

//サウンド管理
phina.define("phina.extension.SoundSet", {

    //サウンドが格納される配列
    elements: null,

    //再生中ＢＧＭ
    bgm: null,
    bgmIsPlay: false,

    //マスターボリューム
    volumeBGM: 0.5,
    volumeSE: 0.5,

    init: function() {
        this.elements = [];
    },

    //登録済みアセット読み込み
    readAsset: function() {
        for (var key in phina.asset.AssetManager.assets.sound) {
            var obj = phina.asset.AssetManager.get("sound", key);
            if (obj instanceof phina.asset.Sound) this.add(key);
        }
    },

    //サウンド追加
    add: function(name, url) {
        if (name === undefined) return null;
        url = url || null;
        if (this.find(name)) return true;

        var e = phina.extension.SoundElement(name);
        if (!e.media) return false;
        this.elements.push(e);
        return true;
    },

    //サウンド検索
    find: function(name) {
        if (!this.elements) return null;
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].name == name) return this.elements[i];
        }
        return null;
    },

    //サウンドをＢＧＭとして再生
    playBGM: function(name, loop, callback) {
        if (loop === undefined) loop = true;
        if (this.bgm) {
            this.bgm.stop();
            this.bgmIsPlay = false;
        }
        var media = this.find(name);
        if (media) {
            var vol = this.volumeBGM * media.volume;
            media.setVolume(vol);
            media.play(loop, callback);
            this.bgm = media;
            this.bgmIsPlay = true;
        } else {
            if (this.add(name)) this.playBGM(name);
        }
        return this;
    },

    //ＢＧＭ停止
    stopBGM: function() {
        if (this.bgm) {
            if (this.bgmIsPlay) {
                this.bgm.stop();
                this.bgmIsPlay = false;
            }
            this.bgm = null;
        }
        return this;
    },

    //ＢＧＭ一時停止
    pauseBGM: function() {
        if (this.bgm) {
            if (this.bgmIsPlay) {
                this.bgm.pause();
                this.bgmIsPlay = false;
            }
        }
        return this;
    },

    //ＢＧＭ再開
    resumeBGM: function() {
        if (this.bgm) {
            if (!this.bgmIsPlay) {
                this.bgm.volume = this.volumeBGM;
                this.bgm.resume();
                this.bgmIsPlay = true;
            }
        }
        return this;
    },

    //ＢＧＭマスターボリューム設定
    setVolumeBGM: function(vol) {
        this.volumeBGM = vol;
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.setVolume(this.volumeBGM);
            this.bgm.resume();
        }
        return this;
    },

    //サウンドをサウンドエフェクトとして再生
    playSE: function(name, loop, callback) {
        var media = this.find(name);
        if (media) {
            var vol = this.volumeSE;
            media.setVolume(vol);
            media.play(loop, callback);
        } else {
            if (this.add(name)) this.playSE(name);
        }
        return this;
    },

    //ループ再生しているSEを停止
    stopSE: function(name) {
        var media = this.find(name);
        if (media) {
            media.stop();
        }
        return this;
    },

    //ＢＧＭ一時停止
    pauseBGM: function() {
        if (this.bgm) {
            if (this.bgmIsPlay) {
                this.bgm.pause();
                this.bgmIsPlay = false;
            }
        }
        return this;
    },

    //ＳＥマスターボリューム設定
    setVolumeSE: function(vol) {
        this.volumeSE = vol;
        return this;
    },
});

//SoundElement Basic
phina.define("phina.extension.SoundElement", {
    //サウンド名
    name: null,

    //ＵＲＬ
    url: null,

    //サウンド本体
    media: null,

    //ボリューム
    _volume: 1,

    //再生終了時のコールバック関数
    callback: null,

    //再生中フラグ
    playing: false,

    init: function(name) {
        this.name = name;
        this.media = phina.asset.AssetManager.get("sound", name);
        if (this.media) {
            this.media.volume = 1;
            this.media.on('ended', function() {
                if (this.media.loop) this.playing = false;
                if (this.callback) this.callback();
            }.bind(this))
        } else {
            console.warn("asset not found. "+name);
        }
    },

    //サウンドの再生
    play: function(loop, callback) {
        if (loop === undefined) loop = false
        if (!this.media) return this;

        //ループ再生の場合多重再生を禁止
        if (loop && this.playing) return;

        this.media.loop = loop;
        this.media.play();
        this.callback = callback;
        this.playing = true;
        return this;
    },

    //サウンド再生再開
    resume: function() {
        if (!this.media) return this;
        this.media.resume();
        this.playing = true;
        return this;
    },

    //サウンド一時停止
    pause: function () {
        if (!this.media) return this;
        this.media.pause();
        this.playing = false;
    },

    //サウンド停止
    stop: function() {
        if (!this.media) return this;
        this.media.stop();
        this.playing = false;
        return this;
    },

    //ボリューム設定
    setVolume: function(vol) {
        if (!this.media) return this;
        if (vol === undefined) vol = 0;
        this._volume = vol;
        this.media.volume = this._volume;
        return this;
    },

    _accessor: {
        volume: {
            "get": function() { return this._volume; },
            "set": function(vol) { this.setVolume(vol); }
        },
        loop: {
            "get": function() { return this.media.loop; },
            "set": function(f) { this.media.loop = f; }
        },
    }
});
