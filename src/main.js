/*
 *  main.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

//phina.globalize();

//デバッグフラグ
DEBUG = false;
DEBUG_COLLISION = false;
DEBUG_EYESIGHT = false;
DEBUG_MOBILE = false;

//定数
SC_W = 576;
SC_H = 324;
// SC_W = 480;
// SC_H = 320;

FPS = 30;

//アイテムＩＤ
ITEM_SHORTSWORD = 0;
ITEM_LONGSWORD = 1;
ITEM_AX = 2;
ITEM_SPEAR = 3;
ITEM_BOW = 4;
ITEM_ROD = 5;
ITEM_BOOK = 6;
ITEM_SHIELD = 7;
ITEM_ARMOR = 8;
ITEM_HAT = 9;
ITEM_BOOTS = 10;
ITEM_GROVE = 11;
ITEM_RING = 12;
ITEM_SCROLL = 13;
ITEM_LETTER = 14;
ITEM_CARD = 15;
ITEM_KEY = 16;
ITEM_COIN = 17;
ITEM_BAG = 18;
ITEM_ORB = 19;
ITEM_STONE = 20;
ITEM_JEWEL = 21;
ITEM_JEWELBOX = 22;
ITEM_APPLE = 24;
ITEM_HARB = 25;
ITEM_MEAT = 26;
ITEM_POTION = 27;

//インスタンス
var app;

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

    app.run();
//    app.enableStats();
};
