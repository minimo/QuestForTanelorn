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

//定数
SC_W = 480;
SC_H = 320;

FPS = 30;

//アイテム
ITEM_SHORTSWORD = 0;
ITEM_LONGSWORD = 1;
ITEM_AX = 2;
ITEM_SPEAR = 3;
ITEM_BOW = 4;
ITEM_BOOK = 5;
ITEM_SHIELD = 6;
ITEM_ARMOR = 7;
ITEM_HAT = 8;
ITEM_BOOTS = 9;
ITEM_GROVE = 10;
ITEM_RING = 11;
ITEM_SCROLL = 12;
ITEM_LETTER = 13;
ITEM_CARD = 14;
ITEM_KEY = 15;
ITEM_COIN = 16;

//インスタンス
var app;

window.onload = function() {
    app = qft.Application();
    app.replaceScene(qft.SceneFlow());
    app.run();
    app.enableStats();
};
