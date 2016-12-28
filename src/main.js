/*
 *  main.js
 *  2016/02/26
 *  @auther minimo  
 *  This Program is MIT license.
 */

//phina.globalize();

//定数
SC_W = 480;
SC_H = 320;

FPS = 30;

//インスタンス
var app;

window.onload = function() {
    app = qft.Application();
    app.replaceScene(qft.SceneFlow());
    app.run();
    app.enableStats();
};
