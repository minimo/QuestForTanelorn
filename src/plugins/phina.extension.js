/*
 *  phina.extension.js
 *  2016/11/25
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

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
 * @return {Boolean} 線分と線分が重なっているかどうか
 */
phina.geom.Collision.testLineLine = function(p1, p2, p3, p4) {
  var a = (p1.x - p2.x) * (p3.y - p1.y) + (p1.y - p2.y) * (p1.x - p3.x);
  var b = (p1.x - p2.x) * (p4.y - p1.y) + (p1.y - p2.y) * (p1.x - p4.x);
  var c = (p3.x - p4.x) * (p1.y - p3.y) + (p3.y - p4.y) * (p3.x - p1.x);
  var d = (p3.x - p4.x) * (p2.y - p3.y) + (p3.y - p4.y) * (p3.x - p2.x);
  return a * b <= 0 && c * d <= 0;
}

//線分abと矩形の交差判定
/**
 * @method testLineRect
 * @static
 * 線分と矩形が重なっているかどうかを判定します
 *
 * ### Example
 *     p1 = phina.geom.Vector2(100, 100, 30);
 *     p2 = phina.geom.Vector2(200, 200, 30);
 *     rect = phina.geom.Rect(150, 150, 30, 40);
 * phina.geom.Collision.testLineRect(p1, p2, rect); // => true
 *
 * @param {phina.geom.Vector2} p1 線分1の端の座標
 * @param {phina.geom.Vector2} p2 線分1の端の座標
 * @param {phina.geom.Rect} rect 矩形領域オブジェクト
 * @return {Boolean} 線分と矩形が重なっているかどうか
 */
phina.geom.Collision.testLineRect = function(p1, p2, rect) {
    //包含判定
    if (rect.left <= p1.x && p1.x <= rect.right && rect.top <= p1.y && p1.y <= rect.bottom ) return true;
    if (rect.left <= p2.x && p2.x <= rect.right && rect.top <= p2.y && p2.y <= rect.bottom ) return true;

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
