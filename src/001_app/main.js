/*
 *  main.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

//phina.globalize();

//デバッグフラグ
const DEBUG = false;
const DEBUG_COLLISION = false;
const DEBUG_EYESIGHT = false;
const DEBUG_MOBILE = false;

//定数
const SC_W = 576;
const SC_H = 324;
// SC_W = 480;
// SC_H = 320;

const FPS = 30;

//アイテムＩＤ
const ITEM_SHORTSWORD = 0;
const ITEM_LONGSWORD = 1;
const ITEM_AX = 2;
const ITEM_SPEAR = 3;
const ITEM_BOW = 4;
const ITEM_ROD = 5;
const ITEM_BOOK = 6;
const ITEM_SHIELD = 7;
const ITEM_ARMOR = 8;
const ITEM_HAT = 9;
const ITEM_BOOTS = 10;
const ITEM_GROVE = 11;
const ITEM_RING = 12;
const ITEM_SCROLL = 13;
const ITEM_LETTER = 14;
const ITEM_CARD = 15;
const ITEM_KEY = 16;
const ITEM_COIN = 17;
const ITEM_BAG = 18;
const ITEM_ORB = 19;
const ITEM_STONE = 20;
const ITEM_JEWEL = 21;
const ITEM_JEWELBOX = 22;
const ITEM_APPLE = 24;
const ITEM_HARB = 25;
const ITEM_MEAT = 26;
const ITEM_POTION = 27;

//インスタンス
let app;

window.onload = function() {
    app = qft.Application();
    app.replaceScene(qft.SceneFlow());

    //モバイル対応
    if (phina.isMobile()) {
        app.domElement.addEventListener('touchend', function dummy() {
            var s = phina.asset.Sound();
            s.loadFromBuffer();
            s.play().stop();
            app.domElement.removeEventListener('touchend', dummy);
        });
    }
    app.domElement.addEventListener('click', function dummy() {
        var context = phina.asset.Sound.getAudioContext();
        context.resume();
    });

    app.run();
//    app.enableStats();
};
