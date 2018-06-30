/*
 *  phina.extension.js
 *  2016/11/25
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

//setAlphaを追加
phina.display.DisplayElement.prototype.setAlpha = function(val) {
    this.alpha = val;
    return this;
};

//スプライト機能拡張
phina.display.Sprite.prototype.setFrameTrimming = function(x, y, width, height) {
  this._frameTrimX = x || 0;
  this._frameTrimY = y || 0;
  this._frameTrimWidth = width || this.image.domElement.width - this._frameTrimX;
  this._frameTrimHeight = height || this.image.domElement.height - this._frameTrimY;
  return this;
}

phina.display.Sprite.prototype.setFrameIndex = function(index, width, height) {
  var sx = this._frameTrimX || 0;
  var sy = this._frameTrimY || 0;
  var sw = this._frameTrimWidth  || (this.image.domElement.width-sx);
  var sh = this._frameTrimHeight || (this.image.domElement.height-sy);

  var tw  = width || this.width;      // tw
  var th  = height || this.height;    // th
  var row = ~~(sw / tw);
  var col = ~~(sh / th);
  var maxIndex = row*col;
  index = index%maxIndex;

  var x   = index%row;
  var y   = ~~(index/row);
  this.srcRect.x = sx+x*tw;
  this.srcRect.y = sy+y*th;
  this.srcRect.width  = tw;
  this.srcRect.height = th;

  this._frameIndex = index;

  return this;
}

//エレメント同士の接触判定
phina.display.DisplayElement.prototype.isHitElement = function(elm) {
    //自分とテスト対象をグローバルへ変換
    var p = this.globalToLocal(elm);
    var target = phina.display.DisplayElement({width: elm.width, height: elm.height}).setPosition(p.x, p.y);

    if (this.boundingType == 'rect') {
        if (elm.boundingType == 'rect') {
            return phina.geom.Collision.testRectRect(this, target);
        } else {
            return phina.geom.Collision.testRectCircle(this, target);
        }
    } else {
        if (elm.boundingType == 'rect') {
            return phina.geom.Collision.testCiecleRect(this, target);
        } else {
            return phina.geom.Collision.testCircleCircle(this, target);
        }
    }
}

//子要素全て切り離し
phina.app.Element.prototype.removeChildren = function(beginIndex) {
    beginIndex = beginIndex || 0;
    var tempChildren = this.children.slice();
    var len = len = tempChildren.length;
    for (var i = beginIndex; i < len; ++i) {
        tempChildren[i].remove();
    }
    this.children = [];
}

/**
 * @method testLineLine
 * @static
 * 2つの線分が重なっているかどうかを判定します
 * 参考：http://www5d.biglobe.ne.jp/~tomoya03/shtml/algorithm/Intersection.htm
 *
 * ### Example
 *     p1 = phina.geom.Vector2(100, 100);
 *     p2 = phina.geom.Vector2(200, 200);
 *     p3 = phina.geom.Vector2(150, 240);
 *     p4 = phina.geom.Vector2(200, 100);
 * phina.geom.Collision.testLineLine(p1, p2, p3, p4); // => true
 *
 * @param {phina.geom.Vector2} p1 線分1の端の座標
 * @param {phina.geom.Vector2} p2 線分1の端の座標
 * @param {phina.geom.Vector2} p3 線分2の端の座標
 * @param {phina.geom.Vector2} p4 線分2の端の座標
 * @return {Boolean} 線分1と線分2が重なっているかどうか
 */
phina.geom.Collision.testLineLine = function(p1, p2, p3, p4) {
  //同一ＸＹ軸上に乗ってる場合の誤判定回避
  if (p1.x == p2.x && p1.x == p3.x && p1.x == p4.x) {
    var min = Math.min(p1.y, p2.y);
    var max = Math.max(p1.y, p2.y);
    if (min <= p3.y && p3.y <= max || min <= p4.y && p4.y <= max) return true;
    return false;
  }
  if (p1.y == p2.y && p1.y == p3.y && p1.y == p4.y) {
    var min = Math.min(p1.x, p2.x);
    var max = Math.max(p1.x, p2.x);
    if (min <= p3.x && p3.x <= max || min <= p4.x && p4.x <= max) return true;
    return false;
  }
  var a = (p1.x - p2.x) * (p3.y - p1.y) + (p1.y - p2.y) * (p1.x - p3.x);
  var b = (p1.x - p2.x) * (p4.y - p1.y) + (p1.y - p2.y) * (p1.x - p4.x);
  var c = (p3.x - p4.x) * (p1.y - p3.y) + (p3.y - p4.y) * (p3.x - p1.x);
  var d = (p3.x - p4.x) * (p2.y - p3.y) + (p3.y - p4.y) * (p3.x - p2.x);
  return a * b <= 0 && c * d <= 0;
}

/**
 * @method testRectLine
 * @static
 * 矩形と線分が重なっているかどうかを判定します
 *
 * ### Example
 *     rect = phina.geom.Rect(120, 130, 40, 50);
 *     p1 = phina.geom.Vector2(100, 100);
 *     p2 = phina.geom.Vector2(200, 200);
 * phina.geom.Collision.testRectLine(rect, p1, p2); // => true
 *
 * @param {phina.geom.Rect} rect 矩形領域オブジェクト
 * @param {phina.geom.Vector2} p1 線分の端の座標
 * @param {phina.geom.Vector2} p2 線分の端の座標
 * @return {Boolean} 矩形と線分が重なっているかどうか
 */
phina.geom.Collision.testRectLine = function(rect, p1, p2) {
    //包含判定(p1が含まれてれば良いのでp2の判定はしない）
    if (rect.left <= p1.x && p1.x <= rect.right && rect.top <= p1.y && p1.y <= rect.bottom ) return true;

    //矩形の４点
    var r1 = phina.geom.Vector2(rect.left, rect.top);     //左上
    var r2 = phina.geom.Vector2(rect.right, rect.top);    //右上
    var r3 = phina.geom.Vector2(rect.right, rect.bottom); //右下
    var r4 = phina.geom.Vector2(rect.left, rect.bottom);  //左下

    //矩形の４辺をなす線分との接触判定
    if (phina.geom.Collision.testLineLine(p1, p2, r1, r2)) return true;
    if (phina.geom.Collision.testLineLine(p1, p2, r2, r3)) return true;
    if (phina.geom.Collision.testLineLine(p1, p2, r3, r4)) return true;
    if (phina.geom.Collision.testLineLine(p1, p2, r1, r4)) return true;
    return false;
}


//円弧の描画
phina.define('phina.display.ArcShape', {
  superClass: 'phina.display.Shape',

  init: function(options) {
    options = ({}).$safe(options, {
      backgroundColor: 'transparent',
      fill: 'red',
      stroke: '#aaa',
      strokeWidth: 4,
      radius: 32,
      startAngle: 0,
      endAngle: 270,

      anticlockwise: false,
    });
    this.superInit(options);

    this.radius = options.radius;
    this.startAngle = options.startAngle;
    this.endAngle = options.endAngle;
    this.anticlockwise = options.anticlockwise;

    this.setBoundingType('circle');
  },

  prerender: function(canvas) {
    canvas.fillPie(0, 0, this.radius, this.startAngle, this.endAngle);
  },
});
