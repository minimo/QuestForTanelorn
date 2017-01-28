/*
 *  stagecontroller.js
 *  2017/01/24
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ制御
phina.define("qft.StageController", {
    superClass: "phina.app.Object2D",

    parentScene: null,
    player: null,
    time: 0,

    //経過時間トリガイベント
    seq: [],
    index: 0,

    //マップトリガイベント
    event: [],

    //マップレイヤ
    mapLayer: null,

    //マップイメージレイヤ
    mapImageLayer: null,

    //スクリーン内判定用
    screen: null,

    //地形判定用レイヤー
    collisionLayer: null,

    //バックグラウンドレイヤ
    backgroundLayer: null,

    //オブジェクト管理レイヤ
    objLayer: null,

    //エフェクト管理レイヤ
    effectLayer: null,

    //プレイヤー表示レイヤ
    playerLayer: null,

    //フォアグラウンドレイヤ
    foregroundLayer: null,

    init: function(scene, player) {
        this.superInit();

        this.parentScene = scene;
        this.player = player;
    },

    //時間イベント追加
    add: function(time, value, option) {
        this.index += time;
        this.seq[this.index] = {
            value: value,
            option: option,
        };
    },

    //時間イベント取得
    get: function(time) {
        var data = this.seq[time];
        if (data === undefined) return null;
        return data;
    },

    //マップイベント追加
    addEvent: function(id, value, option) {
        this.event[id] = {
            value: value,
            option: option,
            executed: false,
        };
    },

    //マップイベント取得
    getEvent: function(id) {
        var data = this.event[id];
        if (data === undefined) return null;
        return data;
    },

    //次にイベントが発生する時間を取得
    getNextEventTime: function(time) {
        var data = this.seq[time];
        if (data === undefined) {
            var t = time+1;
            var rt = -1;
            this.seq.some(function(val, index){
                if (index > t) {
                    rt = index;
                    return true;
                }
            },this.seq);
            return rt;
        } else {
            return time;
        }
    },

    clear: function() {
        this.seq = [];
        this.index = 0;
    },
});
