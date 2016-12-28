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
    if (this.boundingType == 'rect') {
        if (elm.boundingType == 'rect') {
            return phina.collision.testRectRect(this, elm);
        } else {
            return phina.collision.testRectCircle(this, elm);
        }
    } else {
        if (elm.boundingType == 'rect') {
            return phina.collision.testCiecleRect(this, elm);
        } else {
            return phina.collision.testCircleCircle(this, elm);
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
