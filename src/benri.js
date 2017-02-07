/*
 *  Benri.js
 *  2014/12/18
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
var toRad = 3.14159/180;    //弧度法toラジアン変換
var toDeg = 180/3.14159;    //ラジアンto弧度法変換

//距離計算
var distance = function(from, to) {
    var x = from.x-to.x;
    var y = from.y-to.y;
    return Math.sqrt(x*x+y*y);
}

//距離計算（ルート無し版）
var distanceSq = function(from, to) {
    var x = from.x - to.x;
    var y = from.y - to.y;
    return x*x+y*y;
}

//数値の制限
var clamp = function(x, min, max) {
    return (x<min)?min:((x>max)?max:x);
};

//乱数生成
var prand = phina.util.Random();
var rand = function(min, max) {
    return prand.randint(min, max);
}

//タイトル無しダイアログ
var AdvanceAlert = function(str) {
    var tmpFrame = document.createElement('iframe');
    tmpFrame.setAttribute('src', 'data:text/plain,');
    document.documentElement.appendChild(tmpFrame);

    window.frames[0].window.alert(str);
    tmpFrame.parentNode.removeChild(tmpFrame);
};
var AdvanceConfirm = function(str) {
    var tmpFrame = document.createElement('iframe');
    tmpFrame.setAttribute('src', 'data:text/plain,');
    document.documentElement.appendChild(tmpFrame);

    var result = window.frames[0].window.confirm(str);
    tmpFrame.parentNode.removeChild(tmpFrame);

    return result;
};

//数値をカンマ編集して文字列として出力
Number.prototype.$method("comma",  function() {
    var str = this+'';
    var len = str.length;
    var out = '';
    for (var i = len-1; i > -1; i--) {
        out = str[i]+out;
        if (i != 0 && (len-i)%3 == 0) out = ','+out;
    }
    return out;
});
