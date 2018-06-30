/*
 *  phina.assetloaderex.js
 *  2016/11/25
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

//バックグラウンドでアセット読み込み
phina.define("phina.extension.AssetLoaderEx", {

    //進捗
    loadprogress: 0,

    //読み込み終了フラグ
    loadcomplete: false,

    init: function() {
    },

    load: function(assets, callback) {
        this._onLoadAssets = callback || function(){};
        var loader = phina.asset.AssetLoader();
        loader.load(assets);
        loader.on('load', function(e) {
            this.loadcomplete = true;
            this._onLoadAssets();
        }.bind(this));
        loader.onprogress = function(e) {
            this.loadprogress = e.progress;
        }.bind(this);
        return this;
    },
});

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

/*
 *  phina.tiledmap.js
 *  2016/09/10
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

/**
 * @class phina.asset.TiledMap
 * @extends phina.asset.Asset
 * # TiledMapEditorで作成したtmxファイルを読み込みクラス
 */
phina.define("phina.asset.TiledMap", {
    superClass: "phina.asset.Asset",

    /**
     * @property image
     * 作成されたマップ画像
     */
    image: null,

    /**
     * @property tilesets
     * タイルセット情報
     */
    tilesets: null,

    /**
     * @property layers
     * レイヤー情報が格納されている配列
     */
    layers: null,

    init: function() {
        this.superInit();
    },

    _load: function(resolve) {
        //パス抜き出し
        this.path = "";
        var last = this.src.lastIndexOf("/");
        if (last > 0) {
            this.path = this.src.substring(0, last+1);
        }

        //終了関数保存
        this._resolve = resolve;

        // load
        var self = this;
        var xml = new XMLHttpRequest();
        xml.open('GET', this.src);
        xml.onreadystatechange = function() {
            if (xml.readyState === 4) {
                if ([200, 201, 0].indexOf(xml.status) !== -1) {
                    var data = xml.responseText;
                    data = (new DOMParser()).parseFromString(data, "text/xml");
                    self.dataType = "xml";
                    self.data = data;
                    self._parse(data);
//                    resolve(self);
                }
            }
        };
        xml.send(null);
    },

    /**
     * @method getMapData
     * 指定したマップレイヤーを配列として取得します。
     *
     * @param {String} layerName 対象レイヤー名
     */
    getMapData: function(layerName) {
        //レイヤー検索
        var data = null;
        for(var i = 0; i < this.layers.length; i++) {
            if (this.layers[i].name == layerName) {
                //コピーを返す
                return this.layers[i].data.concat();
            }
        }
        return null;
    },

    /**
     * @method getObjectGroup
     * オブジェクトグループを取得します
     *
     * グループ指定が無い場合、全レイヤーを配列にして返します。
     *
     * @param {String} grounpName 対象オブジェクトグループ名
     */
    getObjectGroup: function(groupName) {
        groupName = groupName || null;
        var ls = [];
        var len = this.layers.length;
        for (var i = 0; i < len; i++) {
            if (this.layers[i].type == "objectgroup") {
                if (groupName == null || groupName == this.layers[i].name) {
                    //レイヤー情報をクローンする
                    var obj = this._cloneObjectLayer(this.layers[i]);
                    if (groupName !== null) return obj;
                }
                ls.push(obj);
            }
        }
        return ls;
    },

    /**
     * @method getMapImage
     * マップイメージの作成
     *
     * 複数のマップレイヤーを指定出来ます。
     * 描画順序はTiledMapEditor側での指定順では無く、引数の順序となります（第一引数が一番下となる）
     *
     * @param {String}  対象レイヤー名
     */
    getImage: function(...args) {
        var numLayer = 0;
        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i].type == "layer" || this.layers[i].type == "imagelayer") numLayer++;
        }
        if (numLayer == 0) return null;

        var generated = false;
        var width = this.width * this.tilewidth;
        var height = this.height * this.tileheight;
        var canvas = phina.graphics.Canvas().setSize(width, height);

        for (var i = 0; i < this.layers.length; i++) {
            var find = args.indexOf(this.layers[i].name);
            if (args.length == 0 || find >= 0) {
                //マップレイヤー
                if (this.layers[i].type == "layer" && this.layers[i].visible != "0") {
                    var layer = this.layers[i];
                    var mapdata = layer.data;
                    var width = layer.width;
                    var height = layer.height;
                    var opacity = layer.opacity || 1.0;
                    var count = 0;
                    for (var y = 0; y < height; y++) {
                        for (var x = 0; x < width; x++) {
                            var index = mapdata[count];
                                if (index !== -1) {
                                //マップチップを配置
                                this._setMapChip(canvas, index, x * this.tilewidth, y * this.tileheight, opacity);
                            }
                            count++;
                        }
                    }
                    generated = true;
                }
                //オブジェクトグループ
                if (this.layers[i].type == "objectgroup" && this.layers[i].visible != "0") {
                    var layer = this.layers[i];
                    var opacity = layer.opacity || 1.0;
                    layer.objects.forEach(function(e) {
                        if (e.gid) {
                            this._setMapChip(canvas, e.gid, e.x, e.y, opacity);
                        }
                    }.bind(this));
                    generated = true;
                }
                //イメージレイヤー
                if (this.layers[i].type == "imagelayer" && this.layers[i].visible != "0") {
                    var len = this.layers[i];
                    var image = phina.asset.AssetManager.get('image', this.layers[i].image.source);
                    canvas.context.drawImage(image.domElement, this.layers[i].x, this.layers[i].y);
                    generated = true;
                }
            }
        }

        if (!generated) return null;

        var texture = phina.asset.Texture();
        texture.domElement = canvas.domElement;
        return texture;
    },

    /**
     * @method _cloneObjectLayer
     * 引数として渡されたオブジェクトレイヤーをクローンして返します。
     *
     * 内部で使用している関数です。
     * @private
     */
    _cloneObjectLayer: function(srcLayer) {
        var result = {}.$safe(srcLayer);
        result.objects = [];
        //レイヤー内オブジェクトのコピー
        srcLayer.objects.forEach(function(obj){
            var resObj = {
                properties: {}.$safe(obj.properties),
            }.$extend(obj);
            if (obj.ellipse) resObj.ellipse = obj.ellipse;
            if (obj.gid) resObj.gid = obj.gid;
            if (obj.polygon) resObj.polygon = obj.polygon.clone();
            if (obj.polyline) resObj.polyline = obj.polyline.clone();
            result.objects.push(resObj);
        });
        return result;
    },

    /**
     * @method _parse
     * 取得したTiledMapEditのデータをパースします。
     *
     * 内部で使用している関数です。
     * @private
     */
    _parse: function(data) {
        //タイル属性情報取得
        var map = data.getElementsByTagName('map')[0];
        var attr = this._attrToJSON(map);
        this.$extend(attr);
        this.properties = this._propertiesToJSON(map);

        //タイルセット取得
        this.tilesets = this._parseTilesets(data);

        //タイルセット情報補完
        var defaultAttr = {
            tilewidth: 32,
            tileheight: 32,
            spacing: 0,
            margin: 0,
        };
        this.tilesets.chips = [];
        for (var i = 0; i < this.tilesets.length; i++) {
            //タイルセット属性情報取得
            var attr = this._attrToJSON(data.getElementsByTagName('tileset')[i]);
            attr.$safe(defaultAttr);
            attr.firstgid--;
            this.tilesets[i].$extend(attr);

            //マップチップリスト作成
            var t = this.tilesets[i];
            this.tilesets[i].mapChip = [];
            for (var r = attr.firstgid; r < attr.firstgid+attr.tilecount; r++) {
                var chip = {
                    image: t.image,
                    x: ((r - attr.firstgid) % t.columns) * (t.tilewidth + t.spacing) + t.margin,
                    y: Math.floor((r - attr.firstgid) / t.columns) * (t.tileheight + t.spacing) + t.margin,
                }.$safe(attr);
                this.tilesets.chips[r] = chip;
            }
        }

        //レイヤー取得
        this.layers = this._parseLayers(data);

        //イメージデータ読み込み
        this._checkImage();
    },

    /**
     * @method _checkImage
     * アセットに無いイメージデータをチェックして読み込みを行います。
     *
     * 内部で使用している関数です。
     * @private
     */
    _checkImage: function() {
        var that = this;
        var imageSource = [];
        var loadImage = [];

        //一覧作成
        for (var i = 0; i < this.tilesets.length; i++) {
            var obj = {
                image: this.tilesets[i].image,
                transR: this.tilesets[i].transR,
                transG: this.tilesets[i].transG,
                transB: this.tilesets[i].transB,
            };
            imageSource.push(obj);
        }
        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i].image) {
                var obj = {
                    image: this.layers[i].image.source
                };
                imageSource.push(obj);
            }
        }

        //アセットにあるか確認
        for (var i = 0; i < imageSource.length; i++) {
            var image = phina.asset.AssetManager.get('image', imageSource[i].image);
            if (image) {
                //アセットにある
            } else {
                //なかったのでロードリストに追加
                loadImage.push(imageSource[i]);
            }
        }

        //一括ロード
        //ロードリスト作成
        var assets = {
            image: []
        };
        for (var i = 0; i < loadImage.length; i++) {
            //イメージのパスをマップと同じにする
            assets.image[loadImage[i].image] = this.path+loadImage[i].image;
        }
        if (loadImage.length) {
            var loader = phina.asset.AssetLoader();
            loader.load(assets);
            loader.on('load', function(e) {
                //透過色設定反映
                loadImage.forEach(function(elm) {
                    var image = phina.asset.AssetManager.get('image', elm.image);
                    if (elm.transR !== undefined) {
                        var r = elm.transR, g = elm.transG, b = elm.transB;
                        image.filter(function(pixel, index, x, y, bitmap) {
                            var data = bitmap.data;
                            if (pixel[0] == r && pixel[1] == g && pixel[2] == b) {
                                data[index+3] = 0;
                            }
                        });
                    }
                });
                //読み込み終了
                that._resolve(that);
            }.bind(this));
        } else {
            //読み込み終了
            this._resolve(that);
        }
    },

    /**
     * @method _setMapChip
     * キャンバスの指定した座標にマップチップのイメージをコピーします。
     *
     * 内部で使用している関数です。
     * @private
     */
    _setMapChip: function(canvas, index, x, y, opacity) {
        //タイルセットからマップチップを取得
        var chip = this.tilesets.chips[index];
        if (!chip) {
            return;
        }
        var image = phina.asset.AssetManager.get('image', chip.image);
        if (!image) {
            console.log(chip.image);
        }
        canvas.context.drawImage(
            image.domElement,
            chip.x + chip.margin, chip.y + chip.margin,
            chip.tilewidth, chip.tileheight,
            x, y,
            chip.tilewidth, chip.tileheight);
    },

    /**
     * @method _propertiesToJSON
     * XMLプロパティをJSONに変換します。
     *
     * 内部で使用している関数です。
     * @private
     */
    _propertiesToJSON: function(elm) {
        var properties = elm.getElementsByTagName("properties")[0];
        var obj = {};
        if (properties === undefined) {
            return obj;
        }
        for (var k = 0; k < properties.childNodes.length; k++) {
            var p = properties.childNodes[k];
            if (p.tagName === "property") {
                //propertyにtype指定があったら変換
                var type = p.getAttribute('type');
                var value = p.getAttribute('value');
                if (!value) value = p.textContent;
                if (type == "int") {
                    obj[p.getAttribute('name')] = parseInt(value, 10);
                } else if (type == "float") {
                    obj[p.getAttribute('name')] = parseFloat(value);
                } else if (type == "bool" ) {
                    if (value == "true") obj[p.getAttribute('name')] = true;
                    else obj[p.getAttribute('name')] = false;
                } else {
                    obj[p.getAttribute('name')] = value;
                }
            }
        }
        return obj;
    },

    /**
     * @method _propertiesToJSON
     * XML属性情報をJSONに変換します。
     *
     * 内部で使用している関数です。
     * @private
     */
    _attrToJSON: function(source) {
        var obj = {};
        for (var i = 0; i < source.attributes.length; i++) {
            var val = source.attributes[i].value;
            val = isNaN(parseFloat(val))? val: parseFloat(val);
            obj[source.attributes[i].name] = val;
        }
        return obj;
    },

    /**
     * @method _propertiesToJSON_str
     * XMLプロパティをJSONに変換し、文字列で返します。
     *
     * 内部で使用している関数です。
     * @private
     */
    _attrToJSON_str: function(source) {
        var obj = {};
        for (var i = 0; i < source.attributes.length; i++) {
            var val = source.attributes[i].value;
            obj[source.attributes[i].name] = val;
        }
        return obj;
    },

    /**
     * @method _parseTilesets
     * タイルセットのパースを行います。
     *
     * 内部で使用している関数です。
     * @private
     */
    _parseTilesets: function(xml) {
        var each = Array.prototype.forEach;
        var self = this;
        var data = [];
        var tilesets = xml.getElementsByTagName('tileset');
        each.call(tilesets, function(tileset) {
            var t = {};
            var props = self._propertiesToJSON(tileset);
            if (props.src) {
                t.image = props.src;
            } else {
                t.image = tileset.getElementsByTagName('image')[0].getAttribute('source');
            }
            //透過色設定取得
            t.trans = tileset.getElementsByTagName('image')[0].getAttribute('trans');
            if (t.trans) {
                t.transR = parseInt(t.trans.substring(0, 2), 16);
                t.transG = parseInt(t.trans.substring(2, 4), 16);
                t.transB = parseInt(t.trans.substring(4, 6), 16);
            }

            data.push(t);
        });
        return data;
    },

    /**
     * @method _parseLayers
     * レイヤー情報のパースを行います。
     *
     * 内部で使用している関数です。
     * @private
     */
    _parseLayers: function(xml) {
        var each = Array.prototype.forEach;
        var data = [];

        var map = xml.getElementsByTagName("map")[0];
        var layers = [];
        each.call(map.childNodes, function(elm) {
            if (elm.tagName == "layer" || elm.tagName == "objectgroup" || elm.tagName == "imagelayer") {
                layers.push(elm);
            }
        });

        layers.each(function(layer) {
            switch (layer.tagName) {
                case "layer":
                    //通常レイヤー
                    var d = layer.getElementsByTagName('data')[0];
                    var encoding = d.getAttribute("encoding");
                    var l = {
                        type: "layer",
                        name: layer.getAttribute("name"),
                    };

                    if (encoding == "csv") {
                        l.data = this._parseCSV(d.textContent);
                    } else if (encoding == "base64") {
                        l.data = this._parseBase64(d.textContent);
                    }

                    var attr = this._attrToJSON(layer);
                    l.$extend(attr);
                    l.properties = this._propertiesToJSON(layer);

                    data.push(l);
                    break;

                //オブジェクトレイヤー
                case "objectgroup":
                    var l = {
                        type: "objectgroup",
                        objects: [],
                        name: layer.getAttribute("name"),
                        x: parseFloat(layer.getAttribute("offsetx")) || 0,
                        y: parseFloat(layer.getAttribute("offsety")) || 0,
                        alpha: layer.getAttribute("opacity") || 1,
                        color: layer.getAttribute("color") || null,
                        draworder: layer.getAttribute("draworder") || null,
                    };
                    l.properties = this._propertiesToJSON(layer);

                    //レイヤー内解析
                    each.call(layer.childNodes, function(elm) {
                        if (elm.nodeType == 3) return;
                        var d = this._attrToJSON(elm);
                        if (d.id === undefined) return;
                        d.properties = this._propertiesToJSON(elm);
                        //子要素の解析
                        if (elm.childNodes.length) {
                            elm.childNodes.forEach(function(e) {
                                if (e.nodeType == 3) return;
                                //楕円
                                if (e.nodeName == 'ellipse') {
                                    d.ellipse = true;
                                }
                                //多角形
                                if (e.nodeName == 'polygon') {
                                    d.polygon = [];
                                    var attr = this._attrToJSON_str(e);
                                    var pl = attr.points.split(" ");
                                    pl.forEach(function(str) {
                                        var pts = str.split(",");
                                        d.polygon.push({x: parseFloat(pts[0]), y: parseFloat(pts[1])});
                                    });
                                }
                                //線分
                                if (e.nodeName == 'polyline') {
                                    d.polyline = [];
                                    var attr = this._attrToJSON_str(e);
                                    var pl = attr.points.split(" ");
                                    pl.forEach(function(str) {
                                        var pts = str.split(",");
                                        d.polyline.push({x: parseFloat(pts[0]), y: parseFloat(pts[1])});
                                    });
                                }
                            }.bind(this));
                        }
                        l.objects.push(d);
                    }.bind(this));

                    data.push(l);
                    break;

                //イメージレイヤー
                case "imagelayer":
                    var l = {
                        type: "imagelayer",
                        name: layer.getAttribute("name"),
                        x: parseFloat(layer.getAttribute("offsetx")) || 0,
                        y: parseFloat(layer.getAttribute("offsety")) || 0,
                        alpha: layer.getAttribute("opacity") || 1,
                        visible: (layer.getAttribute("visible") === undefined || layer.getAttribute("visible") != 0),
                    };
                    var imageElm = layer.getElementsByTagName("image")[0];
                    l.image = {source: imageElm.getAttribute("source")};

                    data.push(l);
                    break;
            }
        }.bind(this));
        return data;
    },

    /**
     * @method _perseCSV
     * CSVのパースを行います。
     *
     * 内部で使用している関数です。
     * @private
     */
    _parseCSV: function(data) {
        var dataList = data.split(',');
        var layer = [];

        dataList.each(function(elm, i) {
            var num = parseInt(elm, 10) - 1;
            layer.push(num);
        });

        return layer;
    },

    /**
     * @method _perseCSV
     * BASE64のパースを行います。
     *
     * 内部で使用している関数です。
     * http://thekannon-server.appspot.com/herpity-derpity.appspot.com/pastebin.com/75Kks0WH
     * @private
     */
    _parseBase64: function(data) {
        var dataList = atob(data.trim());
        var rst = [];

        dataList = dataList.split('').map(function(e) {
            return e.charCodeAt(0);
        });

        for (var i=0,len=dataList.length/4; i<len; ++i) {
            var n = dataList[i*4];
            rst[i] = parseInt(n, 10) - 1;
        }

        return rst;
    },
});

//ローダーに追加
phina.asset.AssetLoader.assetLoadFunctions.tmx = function(key, path) {
    var tmx = phina.asset.TiledMap();
    return tmx.load(path);
};

/*
 *  phina.virtualpad.js
 *  2017/06/13
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

//バーチャルパッド
phina.define("phina.extension.VirtualPad", {
    superClass: "phina.display.DisplayElement",

    active: true,

    //挿下キー情報
    keyData: {
        up: false,
        down: false,
        left: false,
        right: false,
        a: false,
        b: false,
    },

    defaultOptions: {
        //パッド縦横
        width: 640,
        height: 480,

        //パッド座標
        x: 0,
        y: 0,

        //判定半径
        fingerRadius: 20,
    },

    init: function(options) {
        this.superInit();
        options = (options || {}).$safe(this.defaultOptions);
        this.options = options;

        var param = {
            width: options.width,
            height: options.height,
            fill: "rgba(0,0,0,0.3)",
            stroke: "rgba(0,0,0,0.3)",
            strokeWigth: 0,
            backgroundColor: 'transparent',
        };
        this.mask = phina.display.RectangleShape(param)
//            .addChildTo(this)
            .setOrigin(0, 0)
            .setPosition(options.x, options.y);

        this.analog = phina.extension.VirtualPad.AnalogStick()
            .addChildTo(this)
            .setPosition(82, options.height - 82);

        this.btn = [];
        this.btn[0] = phina.extension.VirtualPad.Button().addChildTo(this).setPosition(options.width * 0.7, options.height * 0.9);
        this.btn[1] = phina.extension.VirtualPad.Button().addChildTo(this).setPosition(options.width * 0.7 + 80, options.height * 0.9);

        //タップ位置表示
        var fingerParam = {
            backgroundColor: 'transparent',
            fill: "rgba(0,0,0,0.2)",
            stroke: "rgba(0,0,0,0.2)",
            strokeWidth: 1,
            radius: options.fingerRadius,
        };
        this.finger = [];
        for (var i = 0; i < 5; i++) {
            this.finger[i] = phina.display.CircleShape(fingerParam).addChildTo(this);
            this.finger[i].visible = false;
        }
    },

    update: function() {
    },

    updateInfo: function() {
        var p = app.mouse;
        if (p.getPointing()) {
            //タップ位置表示
            var ps = app.pointers;
            for (var i = 0; i < 5; i++) {
                if (i < ps.length) {
                    this.finger[i].visible = true;
                    this.finger[i].setPosition(ps[i].x, ps[i].y);
                } else {
                    this.finger[i].visible = false;
                }
            }
        } else {
            for (var i = 0; i < 5; i++) {
                this.finger[i].visible = false;
            }
        }
    },

    getKey: function(code) {
        var ov = 10;
        var angle = this.analog.angle;
        switch (code) {
            case "right":
                return angle && (angle >= 315 - ov || angle <= 45 + ov);
            case "down":
                return angle && (angle >= 45 - ov && angle <= 135 + ov);
            case "left":
                return angle && (angle >= 135 - ov && angle <= 215 + ov);
            case "up":
                return angle && (angle >= 215 - ov && angle <= 315 + ov);
            case "z":
            case "Z":
                return this.btn[0].isOn;
            case "x":
            case "X":
                return this.btn[1].isOn;
            default:
                return false;
        }
    },
});

//バーチャルパッド十字キー
phina.define("phina.extension.VirtualPad.CrossKey", {
    superClass: "phina.display.DisplayElement",

    active: true,

    init: function(options) {
        this.superInit();
        options = (options || {}).$safe(this.defaultOptions);
        this.options = options;

        //十字キー中心点
        var hw = 0;
        var hh = 0;
        var cp = phina.geom.Vector2(0, 0);

        var button = {
            width: 20,
            height: 20,
            fill: "rgba(0,0,0,0.2)",
            stroke: "rgba(0,0,0,0.2)",
            backgroundColor: 'transparent',
        };
        //0:上 1:右上 2:右 3:右下 4:下 5:左下 6:左 7:左上
        this.btn = [];
        this.btn[0] = phina.display.RectangleShape({width: 60, height: 50}.$safe(button)).setPosition(cp.x     , cp.y - 40).addChildTo(this).setInteractive(true);
        this.btn[2] = phina.display.RectangleShape({width: 50, height: 60}.$safe(button)).setPosition(cp.x + 40, cp.y     ).addChildTo(this).setInteractive(true);
        this.btn[4] = phina.display.RectangleShape({width: 60, height: 50}.$safe(button)).setPosition(cp.x     , cp.y + 40).addChildTo(this).setInteractive(true);
        this.btn[6] = phina.display.RectangleShape({width: 50, height: 60}.$safe(button)).setPosition(cp.x - 40, cp.y     ).addChildTo(this).setInteractive(true);

        this.btn[1] = phina.display.RectangleShape({width: 30, height: 30}.$safe(button)).setPosition(cp.x + 40, cp.y - 40).addChildTo(this).setInteractive(true);
        this.btn[3] = phina.display.RectangleShape({width: 30, height: 30}.$safe(button)).setPosition(cp.x + 40, cp.y + 40).addChildTo(this).setInteractive(true);
        this.btn[5] = phina.display.RectangleShape({width: 30, height: 30}.$safe(button)).setPosition(cp.x - 40, cp.y + 40).addChildTo(this).setInteractive(true);
        this.btn[7] = phina.display.RectangleShape({width: 30, height: 30}.$safe(button)).setPosition(cp.x - 40, cp.y - 40).addChildTo(this).setInteractive(true);

        for (var i = 0; i < this.btn.length; i++) {
            this.btn[i].isOn = false;
            this.btn[i].on('pointover', function() {
                this.isOn = true;
            });
            this.btn[i].on('pointout', function() {
                this.isOn = false;
            });
        }

        //挿下キー情報
        this.keydata = {
            up: false,
            down: false,
            left: false,
            right: false,
        };
    },

    update: function() {
        this.keydata = {
            up: this.btn[0].isOn || this.btn[1].isOn || this.btn[7].isOn,
            right: this.btn[2].isOn || this.btn[1].isOn || this.btn[3].isOn,
            down: this.btn[4].isOn || this.btn[3].isOn || this.btn[5].isOn,
            left: this.btn[6].isOn || this.btn[5].isOn || this.btn[7].isOn,
        };
    },
});

//バーチャルパッドボタン
phina.define("phina.extension.VirtualPad.Button", {
    superClass: "phina.display.DisplayElement",

    active: true,

    init: function(options) {
        this.superInit();
        options = (options || {}).$safe(this.defaultOptions);
        this.options = options;

        var param = {
            radius: options.radius || 30,
            fill: "rgba(0,0,0,0.3)",
            stroke: "rgba(255, 255, 255, 0.3)",
            backgroundColor: 'transparent',
        };
        this.btn = phina.display.CircleShape(param)
            .addChildTo(this)
            .setInteractive(true);
        this.btn.on('pointover', e => {
            this.isOn = true;
        });
        this.btn.on('pointout', e => {
            this.isOn = false;
        });
    },
});

//バーチャルパッドアナログスティック
phina.define("phina.extension.VirtualPad.AnalogStick", {
    superClass: "phina.display.CircleShape",

    active: true,

    init: function(options) {
        this.superInit({
            radius: 80,
            fill: null,
            stroke: "rgba(255, 255, 255, 0.3)",
            backgroundColor: 'transparent',
        });

        //中心点
        var hw = 0;
        var hh = 0;
        var cp = phina.geom.Vector2(0, 0);

        var param = {
            radius: 20,
            fill: "rgba(0,0,0,0.3)",
            stroke: "rgba(0,0,0,0.3)",
            backgroundColor: 'transparent',
        };
        this.inner = phina.display.CircleShape(param)
            .addChildTo(this)
            .setInteractive(true);
        this.vector = phina.geom.Vector2(0, 0);
        this.pt = null;
    },

    update: function() {
        if (!app.pointer.getPointing()) {
            this.vector.set(0, 0);
        }
        var pointers = app.pointers;
        pointers.forEach(pointer => {
            if (pointer.getPointingStart() && this.hitTest(pointer.x, pointer.y)) {
                this.pt = pointer;
            }
        });
        if (this.pt) {
            if (this.pt.getPointing()) {
                this.vector.set(this.pt.x - this.x, this.pt.y - this.y).normalize();
            } else if (this.pt.getPointingEnd()) {
                this.vector.set(0, 0);
            }
        }
        this.inner.x = this.vector.x * this.radius * 0.6;
        this.inner.y = this.vector.y * this.radius * 0.6;

        //角度
        if (this.vector.x == 0 && this.vector.y == 0) {
            this.angle = null;
        } else {
            this.angle = Math.floor(Math.atan2(this.vector.y, this.vector.x).toDegree());
            if (this.angle < 0) this.angle += 360;
        }
    },
});

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
        var element = this.find(name);
        if (element) {
            var vol = this.volumeBGM * element._volume;
            element.media.volume = vol;
            element.play(loop, callback);
            this.bgm = element;
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
            this.bgm.setVolume(this.volumeBGM * this.bgm._volume);
            this.bgm.resume();
        }
        return this;
    },

    //アセットを指定してボリュームを設定
    setVolume: function(name, vol) {
        var media = this.find(name);
        if (media) {
            media.setVolume(vol);
        }
        return this;
    },

    //サウンドをサウンドエフェクトとして再生
    playSE: function(name, loop, callback) {
        var element = this.find(name);
        if (element) {
            var vol = this.volumeSE * element._volume;
            element.media.volume = vol;
            element.play(loop, callback);
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
        if (vol === undefined) vol = 0.5;
        this._volume = vol;
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

/*
 *  application.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

//namespaace Quest For the Tanelorn
var qft = {};

phina.define("qft.Application", {
    superClass: "phina.display.CanvasApp",

    init: function() {
        this.superInit({
            query: '#world',
            width: SC_W,
            height: SC_H,
            backgroundColor: 'rgba(0, 0, 0, 1)',
        });
        this.fps = FPS;

        //ゲームパッド管理
        this.gamepadManager = phina.input.GamepadManager();
        this.gamepad = this.gamepadManager.get(0);

        //バーチャルパッド
        this.virtualPad = phina.extension.VirtualPad({width: SC_W, height: SC_H}).setPosition(0, 0);

        //パッド情報を更新
        this.on('enterframe', function() {
            this.gamepadManager.update();
            this.virtualPad.updateInfo();
            this.updateController();
        });
        this.controller = {};

        //サウンドセット
        this.soundset = phina.extension.SoundSet();

        //Labelデフォルト設定
        phina.display.Label.defaults.$extend({
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 32,
            fontWeight: ''
        });
    },

    updateController: function() {
        var before = this.controller;
        before.before = null;

        var gp = this.gamepad;
        var kb = this.keyboard;
        var angle1 = gp.getKeyAngle();
        var angle2 = kb.getKeyAngle();
        this.controller = {
            angle: angle1 !== null? angle1: angle2,

            up: gp.getKey("up") || kb.getKey("up"),
            down: gp.getKey("down") || kb.getKey("down"),
            left: gp.getKey("left") || kb.getKey("left"),
            right: gp.getKey("right") || kb.getKey("right"),

            attack: gp.getKey("X") || kb.getKey("Z"),
            jump:   gp.getKey("up") || gp.getKey("A") || kb.getKey("up") || kb.getKey("X"),
            change: gp.getKey("B") || kb.getKey("C"),
            menu:   gp.getKey("start") || kb.getKey("escape"),

            a: gp.getKey("A") || kb.getKey("Z"),
            b: gp.getKey("B") || kb.getKey("X"),
            x: gp.getKey("X") || kb.getKey("C"),
            y: gp.getKey("Y") || kb.getKey("V"),

            ok: gp.getKey("A") || kb.getKey("Z") || kb.getKey("space") || kb.getKey("return"),
            cancel: gp.getKey("B") || kb.getKey("X") || kb.getKey("escape"),

            start: gp.getKey("start") || kb.getKey("return"),
            select: gp.getKey("select"),

            pause: gp.getKey("start") || kb.getKey("escape"),

            analog1: gp.getStickDirection(0),
            analog2: gp.getStickDirection(1),

            //前フレーム情報
            before: before,
        };
    },

    _onLoadAssets: function() {
        this.soundset.readAsset();

        //特殊効果用ビットマップ作成
        [
            "player1",
            "player2",
        ].forEach(function(name) {
            if (!phina.asset.AssetManager.get("image", name)) return;

            //ダメージ用
            if (!phina.asset.AssetManager.get("image", name+"White")) {
                var tex = phina.asset.AssetManager.get("image", name).clone();
                tex.filter( function(pixel, index, x, y, bitmap) {
                    var data = bitmap.data;
                    data[index+0] = (pixel[0] == 0? 0: 128); //r
                    data[index+1] = (pixel[1] == 0? 0: 128); //g
                    data[index+2] = (pixel[2] == 0? 0: 128); //b
                });
                phina.asset.AssetManager.set("image", name+"White", tex);
            }
            //瀕死用
            if (!phina.asset.AssetManager.get("image", name+"Red")) {
                var tex = phina.asset.AssetManager.get("image", name).clone();
                tex.filter( function(pixel, index, x, y, bitmap) {
                    var data = bitmap.data;
                    data[index+0] = pixel[0];
                    data[index+1] = 0;
                    data[index+2] = 0;
                });
                phina.asset.AssetManager.set("image", name+"Red", tex);
            }
            //影用
            if (!phina.asset.AssetManager.get("image", name+"Black")) {
                var tex = phina.asset.AssetManager.get("image", name).clone();
                tex.filter( function(pixel, index, x, y, bitmap) {
                    var data = bitmap.data;
                    data[index+0] = 0;
                    data[index+1] = 0;
                    data[index+2] = 0;
                });
                phina.asset.AssetManager.set("image", name+"Black", tex);
            }
        });
    },

    playBGM: function(asset, loop, callback) {
        if (loop === undefined) loop = true;
        this.soundset.playBGM(asset, loop, callback);
    },

    stopBGM: function(asset) {
        this.soundset.stopBGM();
    },

    setVolumeBGM: function(vol) {
        if (vol > 1) vol = 1;
        if (vol < 0) vol = 0;
        this.soundset.setVolumeBGM(vol);
    },

    playSE: function(asset, loop) {
        if (loop === undefined) loop = false;
        this.soundset.playSE(asset, loop);
    },

    setVolumeSE: function(vol) {
        if (vol > 1) vol = 1;
        if (vol < 0) vol = 0;
        this.soundset.setVolumeSE(vol);
    },

    setVolume: function(asset, vol) {
        this.soundset.setVolume(asset, vol);
    },

    _accessor: {
        volumeBGM: {
            "get": function() { return this.sounds.volumeBGM; },
            "set": function(vol) { this.setVolumeBGM(vol); }
        },
        volumeSE: {
            "get": function() { return this.sounds.volumeSE; },
            "set": function(vol) { this.setVolumeSE(vol); }
        }
    }
});

/*
 *  asset.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Assets", {
    _static: {
        loaded: [],
        isLoaded: function(assetType) {
            return qft.Assets.loaded[assetType]? true: false;
        },
        get: function(options) {
            qft.Assets.loaded[options.assetType] = true;
            switch (options.assetType) {
                case "splash":
                    return {
                        image: {
                            "openingmap":   "assets/image/opening_map.jpg",
                            "openingtower": "assets/image/opening_tower.png",
                            "openingground":"assets/image/opening_ground.png",
                            "openingback":  "assets/image/opening_back.png",
                            "openingback2": "assets/image/opening_bg_jan.jpg",
                            "openinglight": "assets/image/opening_tree_light_yellow.png",
                            "player1":      "assets/image/actor4.png",
                            "background":   "assets/image/back-s03b.png",
                        },
                    };
                case "splash2":
                    return {
                        sound: {
                            "openingbgm":   "assets/sound/DS-070m.mp3",
                        },
                    };
                case "common":
                    return {
                        image: {
                            "actor4":    "assets/image/actor4.png",
                            "actor19":    "assets/image/actor19.png",
                            "actor40":    "assets/image/actor40.png",
                            "actor55":    "assets/image/actor55.png",
                            "actor64":    "assets/image/actor64_a.png",
                            "actor642":    "assets/image/actor64_b.png",
                            "actor108":    "assets/image/actor108.png",
                            "actor111":    "assets/image/actor111.png",
                            "actor112":    "assets/image/actor112.png",
                            "weapons":    "assets/image/weapons.png",
                            "item":       "assets/image/item.png",
                            "itembox":    "assets/image/takarabako.png",
                            "particle":   "assets/image/particle.png",
                            "door":       "assets/image/door.png",
                            "checkicon":  "assets/image/check icon_00.png",
                            "titleback":  "assets/image/titleback.png", 
                            "menuframe":  "assets/image/nc92367.png",

                            "monster01":  "assets/image/monster01.png",
                            "monster02":  "assets/image/char_m_devil01.png",
                            "monster03":  "assets/image/char_m_magi01.png",
                            "monster01x2":  "assets/image/monster01x2.png",
                            "monster02x2":  "assets/image/char_m_devil01x2.png",
                            "bullet":     "assets/image/effect_bullet01.png",
                            "effect":     "assets/image/effect.png",
                            "effect2":    "assets/image/effect01a.png",
                            "gate":       "assets/image/gate.png",
                            "flame02":    "assets/image/object_fire02a.png",
                            "flame03":    "assets/image/object_fire03a.png",
                            "flame05":    "assets/image/object_fire05a.png",
                            "accessory1": "assets/image/map_effect2.png",
                            "block":      "assets/image/block.png",
                            "floor":      "assets/map/TileA4.png",
                            "balloon":    "assets/image/chara09_c1.png",
                            "shadow":     "assets/image/shadow.png",
                        },
                        sound: {
                            "click":      "assets/sound/se_maoudamashii_system44.mp3",
                            "ok":         "assets/sound/se_maoudamashii_system36.mp3",
                            "cancel":     "assets/sound/se_maoudamashii_system43.mp3",
                            "attack":     "assets/sound/sen_ka_katana_sasinuku01.mp3",
                            "hit":        "assets/sound/sen_ka_katana_sasu01.mp3",
                            "hit_blunt":  "assets/sound/sen_blunt.mp3",
                            "damage":     "assets/sound/se_maoudamashii_battle12.mp3",
                            "arrowstick": "assets/sound/sen_ka_ya03.mp3",
                            "stageclear": "assets/sound/DS-030m.mp3",
                            "gameover":   "assets/sound/gameover3.mp3",
                            "getkeyitem": "assets/sound/se_maoudamashii_onepoint23.mp3",
                            "bomb":       "assets/sound/sen_ge_taihou03.mp3",
                            "select":     "assets/sound/se_maoudamashii_system45.mp3",
                            "getitem":    "assets/sound/ata_a49.mp3",
                            "recovery":   "assets/sound/se_maoudamashii_magical01.mp3",
                            "tinkling":   "assets/sound/tinkling.mp3",
                            "holy1":      "assets/sound/holy1.mp3",
                            "bgm1":       "assets/sound/DS-ba01m.mp3",
                        },
                        font: {
                            "UbuntuMono": "assets/font/UbuntuMono-Bold.ttf",
                            "titlefont1": "assets/font/teutonic4.ttf",
                            "titlefont2": "assets/font/GothStencil_Premium.ttf",
                        },
                        tmx: {
                            "stage1": "assets/map/stage1.tmx",
                            "stage999": "assets/map/stage999.tmx",
                        },
                    };
                case "stage2":
                    return {
                        sound: {
                            "bgm2": "assets/sound/DS-035m.mp3",
                        },
                        tmx: {
                            "stage2_1": "assets/map/stage2_1.tmx",
                        },
                    };
                case "stage3":
                    return {
                        sound: {
                            "bgm3": "assets/sound/DS-041m.mp3",
                        },
                        tmx: {
                            "stage3_1": "assets/map/stage3_1.tmx",
                            "stage3_2": "assets/map/stage3_2.tmx",
                            "stage3_3": "assets/map/stage3_3.tmx",
                        },
                    };
                case "stage4":
                    return {
                        sound: {
                            "bgm4": "assets/sound/DS-076m.mp3",
                        },
                        tmx: {
                            "stage4_1": "assets/map/stage4_1.tmx",
                            "stage4_2": "assets/map/stage4_2.tmx",
                        },
                    };
                case "stage5":
                    return {
                        sound: {
                            "bgm5": "assets/sound/DS-089m.mp3",
                        },
                        tmx: {
                            "stage5_1": "assets/map/stage5_1.tmx",
                            "stage5_2": "assets/map/stage5_2.tmx",
                        },
                    };
                case "stage6":
                    return {
                        sound: {
                            "bgm6": "assets/sound/DS-060m.mp3",
                        },
                        tmx: {
                            "stage6_1": "assets/map/stage6_1.tmx",
                            "stage6_2": "assets/map/stage6_2.tmx",
                        },
                    };
                case "stage7":
                    return {
                        sound: {
                            "bgm7": "assets/sound/DS-105m.mp3",
                        },
                        tmx: {
                            "stage7_1": "assets/map/stage7_1.tmx",
                            "stage7_2": "assets/map/stage7_2.tmx",
                            "stage7_3": "assets/map/stage7_3.tmx",
                        },
                    };
                case "stage8":
                    return {
                        sound: {
                            "bgm8": "assets/sound/DS-064m.mp3",
                        },
                        tmx: {
                            "stage8_1": "assets/map/stage8_1.tmx",
                            "stage8_2": "assets/map/stage8_2.tmx",
                        },
                    };
                case "stage9":
                    return {
                        sound: {
                            "bgm9": "assets/sound/DS-064m.mp3",
                        },
                        tmx: {
                            "stage9_1": "assets/map/stage9_1.tmx",
                        },
                    };
                case "stage10":
                    return {
                        sound: {
                            "ending": "assets/sound/DS-071m.mp3",
                        },
                        tmx: {
                            "stage10": "assets/map/stage10.tmx",
                        },
                    };
                default:
                    throw "invalid assetType: " + options.assetType;
            }
        },
    },
});


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

/*
 *  configscene.js
 *  2017/03/02
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.ConfigScene", {
    superClass: "phina.display.DisplayScene",

    init: function() {
        this.superInit({width: SC_W, height: SC_H});

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: "rgba(0,0,0,0.5)",
            stroke: "rgba(0,0,0,0.5)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.bg.alpha = 0;
        this.bg.tweener.clear().fadeIn(500);

        this.scroll = phina.display.Sprite("menuframe")
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
            .setScale(0.85, 1.1);
        this.scroll.alpha = 0;
        this.scroll.tweener.clear().fadeIn(500);

        this.menuBase = phina.display.DisplayElement().addChildTo(this.scroll);

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 5,

            fontFamily: "titlefont1",
            align: "center",
            baseline: "middle",
            fontSize: 70,
        };
        this.textLabel = phina.display.Label({text: "Menu", fontSize: 20}.$safe(labelParam))
            .addChildTo(this.menuBase)
            .setPosition(0, -SC_H*0.3);

        //メニューテキスト表示
        var that = this;
        this.menu = ["System", "Practice", "Exit"];
        this.menuText = [];
        for (var i = 0; i < this.menu.length; i++) {
            this.menuText[i] = phina.display.Label({text: this.menu[i], fontSize: 40}.$safe(labelParam))
                .addChildTo(this.menuBase)
                .setPosition(0, -SC_H*0.15+SC_H*0.15*i)
                .setScale(0.7);

            //タッチ判定用
            var param2 = {
                width: SC_W*0.3,
                height: SC_H*0.10,
                fill: "rgba(0,100,200,0.5)",
                stroke: "rgba(0,100,200,0.5)",
                backgroundColor: 'transparent',
            };
            var c = phina.display.RectangleShape(param2)
                .addChildTo(this.menuBase)
                .setPosition(0, -SC_H*0.15+SC_H*0.15*i)
                .setInteractive(true);
            c.alpha = 0;
            c.select = i;
            c.onpointstart = function() {
                if (that.isSelected || that.time < 10) return;
                if (this.select == that.select) {
                    that.ok = true;
                } else {
                    that.menuText[that.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                    that.select = this.select;
                    that.menuText[that.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
                    app.playSE("select");
                }
            }
        }
        this.isSelected = false;
        this.select = 0;
        this.selectMax = 3;
        this.menuText[0].setScale(1);
        this.ok = false;
        this.cansel = false;

        this.time = 0;

        this.on('resume', function() {
            this.menuBase.tweener.clear().fadeIn(500);
            this.time = 0;
            this.isSelected = false;
            this.ok = false;
            this.cansel = false;
        });
    },

    update: function() {
        var ct = app.controller;
        if (ct.down && !ct.before.down && this.select < this.selectMax-1) {
            this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
            this.select++;
            this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
            this.time = 10;
            app.playSE("select");
        }
        if (ct.up && !ct.before.up && this.select > 0) {
            this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
            this.select--;
            this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
            this.time = 10;
            app.playSE("select");
        }

        if (this.time > 15) {
            //決定
            if (ct.ok || this.ok) {
                if (this.select == 0) {
                }
                if (this.select == 1) {
                    app.playSE("ok");
                    this.menuBase.tweener.clear()
                        .fadeOut(500)
                        .call(function() {
                            app.pushScene(qft.ConfigScene_Practice());
                        });
                }
                if (this.select == 2) {
                    app.playSE("cancel");
                    this.exitMenu();
                }
                this.time = 0;
            }

            //キャンセル        
            if (ct.cancel) {
                app.playSE("cancel");
                this.exitMenu();
                this.time = 0;
            }
        }
        this.time++;
    },

    exitMenu: function() {
        this.bg.tweener.clear().fadeOut(500);
        this.scroll.tweener.clear()
            .fadeOut(500)
            .call(function() {
                this.exit();
            }.bind(this));
    }
});

/*
 *  conversationscene.js
 *  2017/08/17
 *  @auther minimo  
 *  This Program is MIT license.
 */

//会話表示シーン 
phina.define("qft.ConversationScene", {
    superClass: "phina.display.DisplayScene",

    init: function(currentScene, text) {
        this.superInit({width: SC_W, height: SC_H});
        this.currentScene = currentScene;

        //プレイヤーの画面上位置によりフレームの縦位置を変更
        var frameY = SC_H * 0.25;
        var pl = this.currentScene.player;

        //会話表示フレーム
        var param = {
            width:SC_W * 0.95,
            height:SC_H * 0.4,
            fill: "rgba(0, 0, 0, 0.5)",
            stroke: "rgba(1, 1, 1, 0.5)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W * 0.5, frameY)

        //テキスト処理
        if (text === undefined) text = "TEST MESSAGE";
        if (text instanceof Array) {
            this.text = "";
            text.forEach((t) => {
                this.text += (t + "\n");
            });
        } else {
            this.text = text;
        }

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 5,

            fontFamily: "Orbitron",
            fontSize: 70,

            verticalAlign: 'top',
            align:'start',
            baseline:'top',
            width: SC_W * 0.9,
            height: SC_H * 0.3,
            scrollX: 0,
            scrollY: 0,
        };
        this.textLabel = phina.ui.LabelArea({text: "", fontSize: 20}.$safe(labelParam)).addChildTo(this.bg);

        this.isExit = false;
        this.isFinish = false;
        this.waitTime = 0;
        this.col = 0;
        this.time = 0;
    },

    update: function() {
        if (this.waitTime == 0) {
            this.textLabel.text = this.text.substring(0, this.col);
            if (this.text.substring(this.col, this.col+1) == "\n") this.waitTime = 10;
            this.col++;
            if (this.col > this.text.length) this.isFinish = true;
        }
        if (this.waitTime > 0) this.waitTime--;

        var ct = app.controller;
        if (this.isFinish) {
            if (!this.isExit && this.time > 10 && ct.before.attack && !ct.attack) {
                this.isExit = true;
                this.tweener.clear()
                    .wait(100)
                    .call(function() {
                        app.popScene();
                    });
            }
        } else {
            if (ct.attack) {
                this.col = this.text.length;
                this.isFinish = true;
                this.time = 0;
            }
        }
        this.time++;
    },
});


/*
 *  creditscene.js
 *  2017/12/24
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("qft.CreditScene", {
    superClass: "phina.display.DisplayScene",
    
    init: function(parentScene) {
        this.superInit({width: SC_W, height: SC_H});
        this.parentScene = parentScene;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: "rgba(0,0,0,1)",
            stroke: "rgba(0,0,0,1)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.bg.tweener.clear()
            .set({alpha: 0})
            .to({alpha: 0.5}, 1000);

        var labelParam = {
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 26,
            fontWeight: ''
        };
        phina.display.Label({text: "Congraturations!!"}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.2);

        phina.display.Label({text: "Thank you for playing."}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.4);

        phina.display.Label({text: "This game is a test version."}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        phina.display.Label({text: "Push button to title.", fontSize: 20}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.8);

        app.playBGM("gameover", false);

        this.time = 0;
    },

    update: function(app) {
        var ct = app.controller;
        if (this.time > 120) {
            if (ct.ok || ct.cancel) {
                app.playBGM("openingbgm");
                this.parentScene.flare('exitgame');
                this.exit();
            }
        }
        this.time++;
    },
});

/*
 *  endingcene.js
 *  2017/02/07
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("qft.EndingScene", {
    superClass: "phina.display.DisplayScene",
    
    init: function(parentScene) {
        this.superInit({width: SC_W, height: SC_H});
        this.parentScene = parentScene;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: "rgba(0,0,0,1)",
            stroke: "rgba(0,0,0,1)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.bg.tweener.clear()
            .set({alpha: 0})
            .to({alpha: 0.5}, 1000);

        var labelParam = {
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 26,
            fontWeight: ''
        };
        phina.display.Label({text: "Thank you for playing."}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.4);

        phina.display.Label({text: "This game is over"}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        phina.display.Label({text: "Push button to title.", fontSize: 20}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.8);

        app.playBGM("gameover", false);

        this.time = 0;
    },

    update: function(app) {
        var ct = app.controller;
        if (this.time > 120) {
            if (ct.ok || ct.cancel) {
                app.playBGM("openingbgm");
                this.parentScene.flare('exitgame');
                this.exit();
            }
        }
        this.time++;
    },
});

/*
 *  endingcene.trueending.js
 *  2017/05/01
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

//トゥルーエンディング
phina.define("qft.EndingScene.TrueEnding", {
    superClass: "phina.display.DisplayScene",
    
    init: function(parentScene) {
        this.superInit({width: SC_W, height: SC_H});
        this.parentScene = parentScene;

        this.text = [
            "数多の苦難を乗り越え",
            "あなたは遂に楽園「永遠の都」への入り口へと到達した",
            "扉の向こうには階段があり",
            "その階段は遥か天上へと続いている",
            "階段を昇りますか？",
        ];

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: "rgba(0,0,0,1)",
            stroke: "rgba(0,0,0,1)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.bg.tweener.clear()
            .set({alpha: 0})
            .to({alpha: 0.5}, 1000);

        //イメージ表示用レイヤ
        this.imageLayer = phina.display.DisplayElement().addChildTo(this);

        //上下黒帯
        param.height = SC_H * 0.15;
        this.bar1 = phina.display.RectangleShape(param).addChildTo(this).setOrigin(0, 1).setPosition(0, -1);
        this.bar2 = phina.display.RectangleShape(param).addChildTo(this).setOrigin(0, 0).setPosition(0, SC_H + 1);
        this.bar1.tweener.clear().setUpdateType('fps').moveBy(0, SC_H * 0.15, 30, "easeOutSine");
        this.bar2.tweener.clear().setUpdateType('fps').moveBy(0, -SC_H * 0.15, 30, "easeOutSine");

        this.time = 0;

        this.one('enterframe', () => {
            //ＢＧＭ再生
            app.playBGM("endingbgm");
        });
    },

    update: function(app) {
        var ct = app.controller;
        if (this.time > 120) {
            if (ct.ok || ct.cancel) {
                app.playBGM("openingbgm");
                this.parentScene.flare('exitgame');
                this.exit();
            }
        }
        this.time++;
    },
});

/*
 *  GameOverScene.js
 *  2014/06/04
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("qft.GameOverScene", {
    superClass: "phina.display.DisplayScene",
    
    init: function(parentScene) {
        this.superInit({width: SC_W, height: SC_H});
        this.parentScene = parentScene;

        //バックグラウンド
        var param = {
            width: SC_W,
            height: SC_H,
            fill: "rgba(0,0,0,1)",
            stroke: "rgba(0,0,0,1)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.alpha = 0;

        var labelParam = {
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 32,
            fontWeight: ''
        };
        var x = SC_W * 0.5-32*4;
        var n = 0;
        ["G", "A", "M", "E", "O", "V", "E", "R"].forEach(function(e) {
            var lb = phina.display.Label({text: e}.$safe(labelParam))
                .setPosition(x, SC_H*0.5+32)
                .setScale(0, 1)
                .addChildTo(this);
            lb.tweener.clear()
                .set({alpha: 0})
                .wait(n*50)
                .to({scaleX: 1.0, alpha: 1, y: SC_H*0.5}, 1000, "easeOutSine")
                .wait(1000-n*50)
                .set({alpha: 0})
                .to({scaleX: 0.0, alpha: 0, y: SC_H*0.5-32}, 1000, "easeOutSine")
            var pt = phina.display.Sprite("particle", 16, 16)
                .setFrameIndex(48)
                .setPosition(x, SC_H*0.5)
                .setScale(3, 3)
                .addChildTo(this);
            pt.alpha = 0;
            pt.tweener.clear()
                .wait(n*50+1000)
                .to({alpha: 1}, 1000-n*50, "easeOutSine")
                .to({scaleX: 0.0, alpha: 0, y: SC_H*0.5-32}, 1000, "easeOutSine")
            x += 32;
            n++;
        }.bind(this));

        app.playBGM("gameover", false);

        this.select = 0; //0:YES 1:NO
        this.pushyes = false;
        this.pushno = false;
        this.ok = false;

        this.time = 0;
    },

    update: function(app) {
        var ct = app.controller;
        if (this.time == 90) {
            this.dispContinue();
        }
        if (this.time > 105) {
            if ((ct.left || this.pushyes) && this.select == 1) {
                this.select = 0;
                this.pushyes = false;
                this.yes.tweener.clear().to({scaleX: 1, scaleY: 1}, 500, "easeOutBounce");
                this.no.tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                app.playSE("select");
                this.text3.text = "ゲームオーバー地点からコンティニューします（スコアはリセットされます）";
            } else if ((ct.right || this.pushno) && this.select == 0) {
                this.select = 1;
                this.pushno = false;
                this.yes.tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                this.no.tweener.clear().to({scaleX: 1, scaleY: 1}, 500, "easeOutBounce");
                app.playSE("select");
                this.text3.text = "タイトルに戻ります";
            }
            if (ct.ok || ct.cancel || this.ok) {
                if (this.select == 0) {
                    this.parentScene.flare('continue');
                    this.exit();
                } else {
                    this.parentScene.flare('exitgame');
                    this.exit();
                }
            }
        }
        this.time++;
    },

    dispContinue: function() {
        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 36,
            fontWeight: ''
        };
        this.text1 = phina.display.Label({text: "CONTINUE?"}.$safe(labelParam))
            .setPosition(SC_W*0.5, SC_H*0.4+10)
            .addChildTo(this);
        this.text1.alpha = 0;
        this.text1.tweener.clear().to({y: SC_H*0.4, alpha: 1}, 500, "easeInSine");

        this.yes = phina.display.Label({text: "YES", fontSize: 30}.$safe(labelParam))
            .setScale(1)
            .setPosition(SC_W*0.4, SC_H*0.6+10)
            .addChildTo(this);
        this.yes.alpha = 0;
        this.yes.tweener.clear().to({y: SC_H*0.6, alpha: 1}, 500, "easeInSine");

        this.no = phina.display.Label({text: "NO", fontSize: 30}.$safe(labelParam))
            .setScale(0.7)
            .setPosition(SC_W*0.6, SC_H*0.6+10)
            .addChildTo(this);
        this.no.alpha = 0;
        this.no.tweener.clear().to({y: SC_H*0.6, alpha: 1}, 500, "easeInSine");

        //タッチ判定用
        var that = this;
        var param2 = {
            width: 80,
            height: SC_H*0.08,
            fill: "rgba(0,100,200,0.5)",
            stroke: "rgba(0,100,200,0.5)",
            backgroundColor: 'transparent',
        };
        var yes = phina.display.RectangleShape(param2)
            .addChildTo(this)
            .setPosition(SC_W*0.4, SC_H*0.6)
            .setInteractive(true);
        yes.alpha = 0;
        yes.onpointstart = function() {
            if (that.select == 0) {
                that.ok = true;
            } else {
                that.pushyes = true;
            }
        }
        var no = phina.display.RectangleShape(param2)
            .addChildTo(this)
            .setPosition(SC_W*0.6, SC_H*0.6)
            .setInteractive(true);
        no.alpha = 0;
        no.onpointstart = function() {
            if (that.select == 1) {
                that.ok = true;
            } else {
                that.pushno = true;
            }
        }

        this.text3 = phina.display.Label({text: "ゲームオーバー地点からコンティニューします（スコアはリセットされます）", fontSize: 10}.$safe(labelParam))
            .setPosition(SC_W*0.5, SC_H*0.75+10)
            .addChildTo(this);
        this.text3.alpha = 0;
        this.text3.tweener.clear().to({y: SC_H*0.75, alpha: 1}, 500, "easeInSine");

        this.bg.tweener.clear().to({alpha:0.3}, 500, "easeInSine");
    },
});

/*
 *  LoadingScene.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アセットロード用シーン
phina.define("qft.LoadingScene", {
    superClass: "phina.display.DisplayScene",

    init: function(options) {
        options = (options || {}).$safe({
            assets: null,
            width: SC_W,
            height: SC_H,
            lie: false,
            exitType: "auto",
        });
        this.superInit(options);

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.tweener.setUpdateType('fps');

        //ロードする物が無い場合スキップ
        this.forceExit = false;
        var assets = options.assets;
        if (!assets.$has("sound") &&
            !assets.$has("image") &&
            !assets.$has("font") &&
            !assets.$has("spritesheet") &&
            !assets.$has("script") &&
            !assets.$has("tmx")) {

            this.forceExit = true;
            return;
        }

        var labelParam = {
            text: "Loading",
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 30
        };
        phina.display.Label(labelParam)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        this.fromJSON({
            children: {
                gauge: {
                    className: 'phina.ui.Gauge',
                    arguments: {
                        value: 0,
                        width: this.width*0.5,
                        height: 5,
                        color: 'black',
                        stroke: false,
                        gaugeColor: 'blue',
                        padding: 0,
                    },
                    x: this.gridX.center(),
                    y: SC_H*0.5+20,
                    originY: 0,
                }
            }
        });
        this.gauge.update = function(e) {
            this.gaugeColor = 'hsla({0}, 100%, 50%, 0.8)'.format(e.ticker.frame*3);
        }

        var loader = phina.asset.AssetLoader();
        if (options.lie) {
            this.gauge.animationTime = 10*1000;
            this.gauge.value = 90;
            loader.onload = function() {
                this.gauge.animationTime = 1*1000;
                this.gauge.value = 100;
            }.bind(this);
        } else {
            loader.onprogress = function(e) {
                this.gauge.value = e.progress*100;
            }.bind(this);
        }
        this.gauge.onfull = function() {
            if (options.exitType === 'auto') {
                if (this.app._onLoadAssets) this.app._onLoadAssets();
                this.exit();
            }
        }.bind(this);

        loader.load(options.assets);
    },
    update: function() {
        if (this.forceExit) this.exit();
    },    
});

/*
 *  MainScene.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.MainScene", {
    superClass: "phina.display.DisplayScene",

    //現在ステージ番号
    stageNumber: 1,

    //最大ステージ番号
    stageNumberMax: 8,

    //残り時間（フレーム単位）
    timeLimit: 120,

    //メッセージスタック
    messageStack: [],

    //ステージクリアフラグ
    isStageClear: false,

    //エンディング進行中フラグ
    isEnding: false,

    //真エンディングフラグ
    isTrueEnding: true,

    //スコア
    totalScore: 0,

    //敵討伐数
    totalKill: 0,

    //コンティニュー回数
    continueCount: 0,

    //ステージクリア時情報
    clearResult: [],

    //スクリーンのマップ外への移動制限フラグ
    limitWidth: false,
    limitHeight: true,

    //スクリーン中心座標
    screenCenterPosition: null,

    //プレイヤースクリーン中央固定フラグ
    centerPlayer: true,

    //シーン内全オブジェクト強制停止
    pauseScene: false,

    init: function(options) {
        this.superInit({width: SC_W, height: SC_H});
        options = (options || {}).$safe({
            startStage: 1,
            isPractice: false,
            isContinue: false,
        })
        this.stageNumber = options.startStage || 1;
        this.isPractice = options.isPractice;
        this.isContinue = options.isContinue;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.bg.tweener.setUpdateType('fps');

        //背景
        this.backgroundImage = phina.display.Sprite("background")
            .addChildTo(this).setPosition(0, SC_H*0.5)
            .setOrigin(0, 0.5)
            .setScale(1.0, 1.1);

        //管理用基準レイヤ
        this.baseLayer = phina.display.DisplayElement().addChildTo(this);

        //プレイヤーキャラクタ
        this.player = qft.Player(this);

        //スクリーン初期化
        this.setupScreen();

        //スクリーン中心座標管理用
        var that = this;
        this.camera = phina.app.Object2D().addChildTo(this);
        this.camera.parentScene = this;
        this.camera.tweener.setUpdateType('fps');
        this.camera.moveFrom = phina.geom.Vector2(0, 0);
        this.camera.moveTo = phina.geom.Vector2(0, 0);
        this.camera.moveRatio = 0;
        this.camera.moveLerp = false;
        this.camera.moveToPlayer = false;
        this.camera.update = function() {
            if (that.centerPlayer) {
                this.x = that.player.x;
                this.y = that.player.y;
            } else {
                if (this.moveLerp) {
                    if (this.moveToPlayer) {
                        this.moveTo.x = that.player.x;
                        this.moveTo.y = that.player.y;
                    }
                    var p = phina.geom.Vector2.lerp(this.moveFrom, this.moveTo, this.moveRatio);
                    this.setPosition(p.x, p.y);
                }
            }
        };

        //ステージクリア時情報
        this.clearResult = [];
        this.totalScore = 0;
        this.totalKill = 0;

        //コンティニュー時状態ロード
        if (this.isContinue) this.loadGame();

        //ステージ開始位置
        this.mapstart = phina.geom.Vector2(0, 0);

        //ステージ情報初期化
        this.setupStage();

        this.fgWhite = phina.display.RectangleShape(param.$extend({fill: 'white'}))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.fgWhite.alpha = 0;
        this.fgWhite.tweener.setUpdateType('fps').clear();

        this.fg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.fg.tweener.setUpdateType('fps').clear().fadeOut(30);

        //バーチャルパッドの可視化
        if (phina.isMobile() || DEBUG_MOBILE) {
            app.virtualPad.addChildTo(this).setPosition(0, 0);
        }

        app.volumeBGM = 0.5;
        app.volumeSE = 0.2;

        //メニューを開く
        this.on('openmenu', function(e) {
            app.pushScene(qft.MenuScene(this));
        });

        //キー取得
        this.on('getkey', function(e) {
            var x = this.mapLayer.x + this.player.x;
            var y = this.mapLayer.y + this.player.y;
            var key = phina.display.DisplayElement()
                .setPosition(x, y)
                .addChildTo(this.baseLayer);
            key.tweener.clear().moveTo(15+(this.player.keys.length-1)*24, 36, 500);
            var sp = phina.display.Sprite("item", 24, 24)
                .setFrameIndex(ITEM_KEY)
                .addChildTo(key);
        });

        //ステージクリア
        this.on('stageclear', this.stageClear);

        //次ステージへ移行
        this.on('nextstage', function(e) {
            if (!this.allClear) {
                this.stageNumber++;
                this.setupStage();
                this.player.saveStatus();
            } else {
                //エンディング分岐
                if (this.isTrueEnding) {
                    this.stageNumber = 10;
                    this.setupStage();
                } else {
                    //仮エンディング
                    app.pushScene(qft.EndingScene(this));
                }
            }
        });

        //エンディングへ移行
        this.on('ending', function(e) {
            app.pushScene(qft.EndingScene(this));
        });

        //ゲームオーバー
        this.on('gameover', function(e) {
            app.pushScene(qft.GameOverScene(this));
        });

        //コンティニュー
        this.on('continue', function(e) {
            this.restart();
        });

        //ゲーム終了
        this._exitGame = false;
        this.on('exitgame', function(e) {
            this._exitGame = true;
            if (!this.isPractice) this.saveGame();
        });
        this.on('exitgame_nosave', function(e) {
            this._exitGame = true;
        });

        //メッセージ表示
        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 16,
            fontWeight: ''
        };
        var that = this;
        this.messageStack = [];
        this.eventMessage = phina.display.Label({text: ""}.$safe(labelParam))
            .setPosition(SC_W*0.5, SC_H*0.2)
            .addChildTo(this);
        this.eventMessage.alpha = 0;
        this.eventMessage.tweener.clear().setUpdateType('fps');
        this.eventMessage.nextOk = true;
        this.eventMessage.update = function() {
            if (this.nextOk && that.messageStack.length > 0) {
                this.nextOk = false;
                var msg = that.messageStack[0];
                this.tweener.clear()
                    .call(function(){
                        this.text = msg.text;
                    }.bind(this))
                    .fadeIn(15).wait(90).fadeOut(15)
                    .call(function(){
                        this.nextOk = true;
                        that.messageStack.splice(0, 1);
                    }.bind(this))
            }
        }

        this.time = 0;
    },

    update: function(app) {
        if (this.time == 15) this.player.isControl = true;

        //ゲーム終了
        if (this._exitGame) {
            this.exitGame();
        }

        var ct = app.controller;
        if (!this.isStageClear) {
            //通常時処理
            //メニューシーンへ移行
            if (this.time > 15) {
                if (ct.pause || ct.menu) {
                    this.flare('openmenu');
                }
            }

            //ステージ進行
            var event = this.stageController.get(this.time);
            if (event) {
                if (typeof(event.value) === 'function') {
                    event.value.call(this, event.option);
                } else {
                    this.enterEnemyUnit(event.value);
                }
            }
            //ステージクリア条件チェック
            if (this.mapLayer.clearGate) {
                if (this.stageController.checkStageClearCondition()) {
                    this.mapLayer.clearGate.isLock = false;
                }
            }

            if (!this.pauseScene) this.timeLimit--;
            if (this.timeLimit < 0) {
                this.timeLimit = 0;
            }
            if (this.timeLimit == 0 && !this.player.isDead) {
//                this.player.dead();
            }
        } else {
            //ステージクリア時処理
            //残りタイムをスコア加算
            if (this.timeLimit >= 60) {
                this.timeLimit -= 60;
                this.totalScore += 20;
                if (this.timeLimit < 60) this.timeLimit = 0;
            }

            //ショートカット
            var ct = app.controller;
            if (ct.ok) {
                if (this.timeLimit >= 60) {
                    this.totalScore += Math.floor(this.timeLimit / 60) * 20;
                }
            }
        }

        //スクリーン表示位置
        var map = this.mapLayer.map;
        this.mapLayer.x = SC_W * 0.5 - this.camera.x;
        this.mapLayer.y = SC_H * 0.5 - this.camera.y;
        if (this.limitHeight) {
            if (this.mapLayer.y > 0) this.mapLayer.y = 0;
            if (this.mapLayer.y < -(map.height-SC_H)) this.mapLayer.y = -(map.height-SC_H);
        }
        if (this.limitWidth) {
            if (this.mapLayer.x > 0) this.mapLayer.x = 0;
            if (this.mapLayer.x < -(map.width-SC_W)) this.mapLayer.x = -(map.width-SC_W);
        }

        //スクリーン座標
        this.screenX = -this.mapLayer.x;
        this.screenY = -this.mapLayer.y;

        if (this.stageController.isBackgroundMove) {
            //バックグラウンドのX座標を全体の割合から計算
            this.backgroundImage.x = -Math.floor(this.backgroundImage.width * (this.player.x / map.width)*0.05);
        } else {
            this.backgroundImage.x = this.stageController.backgroundX;
        }

        this.time++;
    },

    //敵キャラクタ投入
    spawnEnemy: function(x, y, name, options) {
        return qft.Enemy[name](this, options).addChildTo(this.enemyLayer).setPosition(x, y);
    },

    //アイテム投入
    spawnItem: function(x, y, options) {
        return qft.Item(this, options).addChildTo(this.objLayer).setPosition(x, y);
    },

    //アイテムボックス投入
    spawnItemBox: function(x, y, options) {
        return qft.ItemBox(this, options).addChildTo(this.objLayer).setPosition(x, y);
    },

    //エフェクト投入
    spawnEffect: function(x, y, options) {
        return qft.Effect(this, options).addChildTo(this.objLayer).setPosition(x, y);
    },

    //メッセージ投入
    spawnMessage: function(text, between, waitFrame) {
        between = between || 32;
        waitFrame = waitFrame || 30;
        var arrayText = text.split("");
        var labelParam = {
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 32,
            fontWeight: ''
        };
        var n = 0;
        var x = SC_W * 0.5 - (arrayText.length * between * 0.5);
        arrayText.forEach(function(e) {
            if (e == " ") {
                x += between;
                return;
            }
            var lb = phina.display.Label({text: e}.$safe(labelParam)).setPosition(x, SC_H*0.5+32).setScale(0, 1).addChildTo(this);
            lb.tweener.clear().setUpdateType('fps')
                .set({alpha: 0})
                .wait(n)
                .to({scaleX: 1.0, alpha: 1, y: SC_H*0.5}, 15, "easeOutSine")
                .wait(waitFrame)
                .to({scaleX: 0.0, y: SC_H*0.5-32}, 10, "easeOutSine")
                .call(function(){this.remove()}.bind(lb));
            x += between;
            n += 5;
        }.bind(this));
    },

    //イベントメッセージ投入
    spawnEventMessage: function(id, text) {
        if (!id || !text) return;
        //メッセージスタック内に同一ＩＤがある場合は投入しない
        for (var i = 0; i < this.messageStack.length; i++) {
            if (this.messageStack[i].id == id) return;
        }
        if (text instanceof Array) {
            text.forEach(function(str) {
                this.messageStack.push({id: id, text: str});
            }.bind(this));
        } else {
            this.messageStack.push({id: id, text: text});
        }
    },

    //スクリーン初期化
    setupScreen: function() {
        var that = this;
        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "UbuntuMono",
            align: "left",
            baseline: "middle",
            fontSize: 20,
            fontWeight: ''
        };

        //体力ゲージ
        this.lifeGaugeLabel = phina.display.Label({text: "LIFE"}.$safe(labelParam)).addChildTo(this).setPosition(0, 10);
        var options = {
            width:  200,
            height: 5,
            backgroundColor: 'transparent',
            fill: 'red',
            stroke: 'white',
            strokeWidth: 2,
            gaugeColor: 'lime',
            cornerRadius: 0,
            value: this.player.hp,
            maxValue: this.player.hpMax,
        };
        this.lifeGauge = phina.ui.Gauge(options).addChildTo(this).setOrigin(0, 0.5).setPosition(40, 10);
        this.lifeGauge.update = function() {
            this.value = that.player.hp;
            this.width = that.player.hpMax * 2;
            this.maxValue = that.player.hpMax;
        };

        //スコア表示
        this.scoreLabel = phina.display.Label({text:"SCORE:", align: "right"}.$safe(labelParam)).addChildTo(this).setPosition(SC_W, 10);
        this.scoreLabel.score = 0;
        this.scoreLabel.s = 0;
        this.scoreLabel.update = function(e) {
            if (e.ticker.frame % 10 == 0) {
                this.s = ~~((that.totalScore-this.score)/7);
                if (this.s < 3) this.s = 3;
                if (this.s > 7777) this.s = 7777;
            }
            this.score += this.s;
            if (this.score > that.totalScore) this.score = that.totalScore;

            this.text = "SCORE "+this.score.comma();
        }

        //制限時間表示
        this.timeLabel = phina.display.Label({text: "TIME:", align: "right"}.$safe(labelParam)).addChildTo(this).setPosition(SC_W, 30);
        this.timeLabel.update = function() {
            this.text = "TIME:"+Math.floor(that.timeLimit/30);
            if (that.timeLimit == 0) {
                this.fill = 'red';
            } else {
                this.fill = 'white';
            }
        }

        //プレイヤー装備武器表示
        this.playerWeapon = qft.PlayerWeapon(this.player).addChildTo(this).setPosition(SC_W-30, SC_H-30);
        var sw = phina.display.RectangleShape({width: 60, height: 60})
            .addChildTo(this)
            .setPosition(SC_W-30, SC_H-30)
            .setInteractive(true)
            .setAlpha(0.0);
        sw.on('pointstart', e => {
            var pl = that.player;
            if (!pl.before.change && pl.equip.switchOk) pl.switchWeapon();
        });
    },

    //マップ情報の初期化
    setupStage: function() {

        this.baseLayer.removeChildren();

        //登録済みマップの消去
        this.clearMap();

        //ステージ設定読み込み
        switch (this.stageNumber) {
            case 1:
                this.stageController = qft.Stage1(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 2:
                this.stageController = qft.Stage2(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 3:
                this.stageController = qft.Stage3(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 4:
                this.stageController = qft.Stage4(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 5:
                this.stageController = qft.Stage5(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 6:
                this.stageController = qft.Stage6(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 7:
                this.stageController = qft.Stage7(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 8:
                this.stageController = qft.Stage8(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 9:
                this.stageController = qft.Stage9(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
            case 10:
                this.stageController = qft.Stage10(this);
                this.switchMap(this.stageController.mapLayer[0]);
                this.isEnding = true;
                //システム表示のＯＦＦ
                this.lifeGaugeLabel.visible = false;
                this.lifeGauge.visible = false;
                this.scoreLabel.visible = false;
                this.timeLabel.visible = false;
                this.playerWeapon.visible = false;
                break;
            case 999:
                this.stageController = qft.Stage999(this);
                this.switchMap(this.stageController.mapLayer[0]);
                break;
        };

        //ステージクリアフラグクリア
        this.isStageClear = false;

        //経過時間初期化
        this.time = 0;

        //タイムリミット設定
        this.timeLimit = this.stageController.timeLimit;

        //プレイヤー設定
        this.player.isControl = true;
        this.player.isMuteki = false;
        this.player.alpha = 1.0;

        this.mapstart = phina.geom.Vector2(this.player.x, this.player.y);

        this.stageController.playBGM();
    },

    //ステージイベント発火
    fireStageEvent: function(eventName) {
        return this.stageController.fireEvent(eventName);
    },

    warp: function(x, y, frame) {
        frame = frame || 60;
        this.player.isControl = false;
        this.player.gravity = 0;
        this.player.vx = 0;
        this.player.isMuteki = true;
        this.player.tweener.clear()
            .wait(45)
            .call(function(){
                this.ignoreCollision = true;
            }.bind(this.player))
            .moveTo(x, y, frame, "easeInOutSine")
            .call(function(){
                this.ignoreCollision = false;
                this.gravity = 0.9;
            }.bind(this.player))
            .wait(90)
            .call(function(){
                this.isControl = true;
                this.isMuteki = false;
            }.bind(this.player));
    },

    //マップ情報の消去
    clearMap: function() {
        //当たり判定、オブジェクトの全消去
        if (this.backgroundLayer) this.backgroundLayer.removeChildren();
        if (this.foregroundLayer) this.foregroundLayer.removeChildren();
        if (this.collisionLaye) this.collisionLayer.removeChildren();
        if (this.enemyLayer) this.enemyLayer.removeChildren();
        if (this.objLayer) this.objLayer.removeChildren();
        if (this.mapImageLayer) this.mapImageLayer.removeChildren();
        if (this.effectLayer) this.effectLayer.removeChildren();
        if (this.shadowLayer) this.shadowLayer.removeChildren();
    },

    //マップレイヤの切替
    switchMap: function(layer, x, y) {
        if (this.mapLayer) this.mapLayer.remove();
        this.mapLayer = layer;
        this.mapLayer.addChildTo(this.baseLayer);
        this.map = layer.map;

        this.backgroundLayer = layer.backgroundLayer;
        this.foregroundLayer = layer.foregroundLayer;
        this.collisionLayer = layer.collisionLayer;
        this.enemyLayer = layer.enemyLayer;
        this.playerLayer = layer.playerLayer;
        this.objLayer = layer.objLayer;
        this.mapImageLayer = layer.mapImageLayer;
        this.effectLayer = layer.effectLayer;
        this.shadowLayer = layer.shadowLayer;

        this.player.remove();
        this.player.addChildTo(layer.playerLayer);
        if (x) {
            this.player.setPosition(x, y);
        }
    },

    //リスタート
    restart: function() {
        this.player.continueReset();
        this.player.mutekiTime = 90;
        this.player.addChildTo(this.mapLayer.playerLayer);

        //プレイヤー座標を最後に床にいた場所にする
        this.player.x = this.player.lastOnFloorX;
        this.player.y = this.player.lastOnFloorY;

        //復帰位置安全性確認
        var x = this.player.x;
        var y = this.player.y;
        var c1 = this.player.checkMapCollision2(x, y + 5, 4, 32);   //真下
        var c2 = this.player.checkMapCollision2(x+32, y + 5, 4, 32);//右下
        var c3 = this.player.checkMapCollision2(x-32, y + 5, 4, 32);//左下
        //真下に足場が無い場合は安全な場所にずらす
        if (!c1) {
            if (c2) {
                this.player.x += 32;
            } else if (c3){
                this.player.x -= 32;
            } else {
                //安全に復帰出来ないので直近のスタート地点へ
                this.player.x = this.mapstart.x;
                this.player.y = this.mapstart.y;
            }
        }

        this.totalScore = 0;
        this.totalKill = 0;
        this.continueCount++;

        this.stageController.playBGM();
    },

    //ステージクリア
    stageClear: function() {
        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 2,

            fontFamily: "UbuntuMono",
            baseline: "middle",
            fontSize: 20,
            fontWeight: ''
        };

        //オールクリア判定
        this.allClear = false;
        if (!this.isPractice && this.stageNumber >= this.stageNumberMax) this.allClear = true;

        //クリアメッセージ投入
        var text = "STAGE " + this.stageNumber + " CLEAR!";
        if (this.allClear) text = "STAGE ALL CLEAR!";
        this.spawnMessage(text, 24);
        this.player.isControl = false;
        this.stageController.stageClear();
        this.isStageClear = true;

        //プレイヤー所持キークリア
        this.player.keys = [];
        this.player.isMuteki = true;

        //クリアBGM
        var bgmFinish = false;
        app.playBGM("stageclear", false, function() {
            bgmFinish = true;
        });

        var ar = {loadcomplete: true};
        if (!this.isPractice) {
            //クリア時点情報保存
            var data = {
                stage: this.stageNumber,
                score: this.totalScore,
                kill: this.totalKill,
                time: this.stageController.timeLimit - this.timeLimit,
            };
            this.clearResult[this.stageNumber] = data;

            //次ステージのアセット読み込み
            if (this.stageNumber < this.stageNumberMax) {
                var assets = qft.Assets.get({assetType: "stage"+(this.stageNumber+1)});
                var ar = phina.extension.AssetLoaderEx().load(assets, function(){app.soundset.readAsset();});
            } else {
                //オールクリア時はエンディング用ステージへ
                if (this.allClear) {
                    var assets = qft.Assets.get({assetType: "stage10"});
                    var ar = phina.extension.AssetLoaderEx().load(assets, function(){app.soundset.readAsset();});
                }
            }
        }

        //ロード進捗表示
        var that = this;
        var param = {text: "Loading... ", align: "right", fontSize: 20}.$safe(labelParam);
        var progress = phina.display.Label(param).addChildTo(this).setPosition(SC_W, SC_H*0.95);
        progress.time = 0;
        progress.update = function() {
            //ロードが終わったらキー入力で次ステージへ
            if (ar.loadprogress) this.text = "Loading... "+Math.floor(ar.loadprogress * 100)+"%";
            if (bgmFinish && that.timeLimit == 0 && ar.loadcomplete) {
                this.text = "Push button to next stage.";
                if (that.allClear) this.text = "Push button to next...";
                var ct = app.controller;
                if (ct.ok || ct.cancel) {
                    if (that.isPractice) {
                        that._exitGame = true;
                    } else {
                        that.flare('nextstage');
                    }
                    this.remove();
                }
            }
            if (this.time % 30 == 0) this.visible = !this.visible;
            this.time++;
        }
    },

    exitGame: function() {
        app.playBGM("openingbgm");
        if (this.isPractice || this.isContinue) {
            this.exit();
        } else {
            this.exit("title");
        }
    },

    //現在のステータスをローカルストレージへ保存
    saveGame: function() {
        var saveObj = {
            stageNumber: this.stageNumber,
            score: this.totalScore,
            kill: this.totalKill,
            result: this.clearResult,
            playerStatus: this.player.startStatus,
        };
        localStorage.setItem("stage", JSON.stringify(saveObj));
        return saveObj;
    },

    //ローカルストレージから直前の保存状態を読み込み
    loadGame: function() {
        var data = localStorage.getItem("stage");
        if (data) {
            var d = JSON.parse(data).$safe({
                stageNumber: 1,
                result: [],
                playerStatus: {},
            });
            this.stageNumber = d.stageNumber;
            this.totalScore = 0;
            this.totalKill = 0;
            this.clearResult = d.result;

            //プレイヤー情報復元
            this.player.startStatus = d.playerStatus;
            this.player.restoreStatus();
            this.playerWeapon.rotation = 0;
        }
        return d;
    },
});

/*
 *  menuscene.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.MenuScene", {
    superClass: "phina.display.DisplayScene",

    init: function(currentScene) {
        this.superInit({width: SC_W, height: SC_H});
        this.currentScene = currentScene;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: "rgba(0,0,0,0.5)",
            stroke: "rgba(0,0,0,0.5)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "Orbitron",
            align: "left",
            baseline: "middle",
            fontSize: 16,
            fontWeight: ''
        };

        this.player = this.currentScene.player;
        this.limitFrame = 30;
        this.isExit = false;

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 5,

            fontFamily: "titlefont2",
            align: "center",
            baseline: "middle",
            fontSize: 70,
        };
        this.textLabel1 = phina.display.Label({text: "PAUSE", fontSize: 20}.$safe(labelParam))
            .addChildTo(this).setPosition(SC_W*0.5, SC_H*0.8);

        this.time = 0;        
    },

    update: function() {
        var ct = app.controller;
        if (this.time > 10 && !this.isExit) {
            if (ct.start || ct.pause || ct.menu) {
                this.isExit = true;
                this.tweener.clear()
                    .wait(100)
                    .call(function() {
                        app.popScene();
                    });
            }
        }
        this.limitFrame--;
        this.time++;
    },
});


/*
 *  menuscene.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.MenuScene", {
    superClass: "phina.display.DisplayScene",

    init: function(currentScene) {
        this.superInit({width: SC_W, height: SC_H});
        this.currentScene = currentScene;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: "rgba(0,0,0,0.5)",
            stroke: "rgba(0,0,0,0.5)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "Orbitron",
            align: "left",
            baseline: "middle",
            fontSize: 16,
            fontWeight: ''
        };

        this.player = this.currentScene.player;
        var x = SC_W*0.3; //this.player.x + this.currentScene.mapLayer.x;
        var y = SC_H*0.5; //this.player.y + this.currentScene.mapLayer.y;

        //ベースエレメント
        this.menuBase = phina.display.DisplayElement().addChildTo(this).setPosition(x, y);
        this.menuBase.tweener.setUpdateType('fps');

        //メニューアイテム初期化
        this.setItems();

        //現在装備表示
        var eq = this.player.equip;
        this.weapon = phina.display.Sprite("item", 24, 24)
            .setPosition(SC_W*0.55, SC_H*0.3)
            .setScale(1.5)
            .setFrameIndex(eq.weapon[0])
            .addChildTo(this);
        this.weaponLabel = phina.display.Label({text: ""}.$safe(labelParam))
            .setPosition(SC_W*0.55+32, SC_H*0.3)
            .addChildTo(this);
        this.weaponLabel.update = function() {
            var item = qft.ItemInfo.get(eq.weapon[0]);
            this.text = item.name;
        };

        this.limitFrame = 30;

        this.isExit = false;
        this.time = 0;        
    },

    update: function() {
        var ct = app.controller;
        if (this.time > 10 && !this.isExit) {
            if (ct.start || ct.pause || ct.menu) {
                this.isExit = true;
                this.close();
                this.tweener.clear()
                    .wait(100)
                    .call(function() {
                        app.popScene();
                    });
            }
            if (ct.right && this.limitFrame < 0) {
                app.playSE("click");
                this.menuBase.tweener.clear()
                    .by({rotation: -this.deg_1}, 4)
                    .call(function(){
                        if (this.rotation < 0) this.rotation += 360;
                    }.bind(this.menuBase));
                this.limitFrame = 5;
                this.currentScene.menuSelect++;
                if (this.currentScene.menuSelect == this.icon.length) this.currentScene.menuSelect = 0;
            }
            if (ct.left && this.limitFrame < 0) {
                app.playSE("click");
                this.menuBase.tweener.clear()
                    .by({rotation: this.deg_1}, 4)
                    .call(function(){
                        if (this.rotation > 360) this.rotation -= 360;
                    }.bind(this.menuBase));
                this.limitFrame = 5;
                this.currentScene.menuSelect--;
                if (this.currentScene.menuSelect < 0) this.currentScene.menuSelect = this.icon.length-1;
            }
        }
        this.limitFrame--;
        this.time++;
    },

    setItems: function() {
        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 24,
            fontWeight: ''
        };

        var that = this;
        this.menuBase.removeChildren();

        //メニューアイテム
        this.icon = [];
        this.menuItems = this.player.items.clone();

        var rad = 0;
        var rad_1 = (Math.PI*2) / this.menuItems.length;
        var id = 0;
        this.menuItems.forEach(function(e) {
            var ic;
            if (typeof e === 'string') {
                ic = phina.display.Label({text: e}.$safe(labelParam)).addChildTo(this.menuBase);
                ic.setScale(0.5);
            } else {
                ic = phina.display.Sprite("item", 24, 24)
                    .addChildTo(this.menuBase)
                    .setFrameIndex(e);
            }
            ic.tweener.setUpdateType('fps');
            ic.rad = rad;
            ic.id = id;
            ic.distance = 0;
            ic.isClose = false;
            ic.update = function() {
                this.rotation = -that.menuBase.rotation;
                this.x =  Math.sin(this.rad)*this.distance;
                this.y = -Math.cos(this.rad)*this.distance;
                if (this.isClose) return;
                if (this.id == that.currentScene.menuSelect) {
                    this.tweener.clear().to({distance: 88, scaleX: 3, scaleY: 3}, 3);
                } else {
                    this.tweener.clear().to({distance: 72, scaleX: 1, scaleY: 1}, 3);
                }
            }
            ic.close = function() {
                this.tweener.clear().to({distance: 0, scaleX: 1, scaleY: 1}, 3);
                this.isClose = true;
            }
            ic.tweener.clear().to({distance: 48}, 500);
            this.icon.push(ic);
            rad += rad_1;
            id++;
        }.bind(this));

        this.deg_1 = 360/ this.menuItems.length;
        this.menuBase.rotation = -(this.currentScene.menuSelect * this.deg_1) - 90;
        this.menuBase.tweener.by({rotation: 90}, 15, "easeOutSine");
    },

    close: function() {
        this.menuBase.tweener.clear().by({rotation: 180}, 15, "easeOutSine");
        this.icon.forEach(function(e) {
            e.close();
        }.bind(this));
    },
});


/*
 *  messagescene.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.MessageScene", {
    superClass: "phina.display.DisplayScene",

    init: function(currentScene) {
        this.superInit({width: SC_W, height: SC_H});
        this.currentScene = currentScene;

        //メッセージウィンドウ
        var param = {
            width:SC_W*0.8,
            height:SC_H*0.4,
            fill: "rgba(0,0,0,0.8)",
            stroke: "white",
            sttokeWidth: 5,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.25)
            .setScale(1, 0);
        this.bg.tweener.clear().to({scaleY: 1}, 500, "easeOutCube");

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 16,
            fontWeight: ''
        };
        this.textLabel = phina.display.Label({text: options.message || "no message", fontSize: 20}.$safe(labelParam))
            .addChildTo(this).setPosition(SC_W*0.5, SC_H*0.25);

        this.player = this.currentScene.player;
        this.limitFrame = 30;
        this.isExit = false;

        this.time = 0;        
    },

    update: function() {
        var ct = app.controller;
        if (this.time > 10 && !this.isExit) {
            if (ct.start || ct.pause || ct.menu) {
                this.isExit = true;
                this.tweener.clear()
                    .wait(100)
                    .call(function() {
                        app.popScene();
                    });
            }
        }
        this.limitFrame--;
        this.time++;
    },
});


/*
 *  openingscene.js
 *  2017/02/08
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.OpeningScene", {
    superClass: "phina.display.DisplayScene",

    //進行
    seq: 0,

    init: function(currentScene) {
        this.superInit({width: SC_W, height: SC_H});
        this.currentScene = currentScene;

        //ＢＧＭ再生
        app.playBGM("openingbgm");

        this.text = [
            "世界の中心にそびえる塔",
            "塔の最上階には",
            "「永遠の都」と呼ばれる楽園があるという",
            "噂を聞いた多くの冒険者が",
            "楽園を求めて塔へと赴き",
            "その謎に挑んでいった",
            "しかし…",
            "彼らが果たして楽園に辿り着いたのか",
            "それとも世界の果てで力尽きたのか",
            "その末路を知る者はいない",
            "そして…",
            "新たな冒険者がまた一人",
            "いまだ見ぬ楽園への道に挑もうとしていた",
        ];

        //バックグラウンド
        var param = {
            width: SC_W,
            height: SC_H,
            fill: "rgba(0,0,0,1)",
            stroke: "rgba(0,0,0,1)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.5)

        //イメージ表示用レイヤ
        this.imageLayer = phina.display.DisplayElement().addChildTo(this);

        //フォアグラウンド
        var that = this;
        this.fg = phina.display.RectangleShape(param).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.5).setInteractive(true);
        this.fg.alpha = 0;
        this.fg.onpointstart = function() {
            if (that.alreadyLoad || that.loader && that.loader.loadcomplete) that.exit();
        }

        //上下黒帯
        param.height = SC_H * 0.15;
        this.bg1 = phina.display.RectangleShape(param).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.07)
        this.bg2 = phina.display.RectangleShape(param).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.93)

        //字幕
        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 14,
        };
        var num = 0;
        this.textLabel = phina.display.Label({text: ""}.$safe(labelParam)).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.9);
        this.textLabel.alpha = 0;
        this.textLabel.tweener.clear()
            .call(function() {
                this.textLabel.text = this.text[num];
                num++;
                if (num == this.text.length) {
                    this.textLabel.tweener.setLoop(false);
                }
            }.bind(this))
            .fadeIn(500)
            .wait(3000)
            .fadeOut(500)
            .wait(1000)
            .setLoop(true);

        //基本アセットをロード
        this.alreadyLoad = false;
        if (qft.Assets.isLoaded("common")) {
            //読込済みなのでスキップ
            this.alreadyLoad = true;
            return;
        }
        var that = this;
        var assets = qft.Assets.get({assetType: "common"});
        this.loader = phina.extension.AssetLoaderEx().load(assets, function(){app.soundset.readAsset();});
        this.loadLabel = phina.display.Label({text: "", align: "right", fontSize: 12}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.99, SC_H*0.1);
        this.loadLabel.time = 1;    
        this.loadLabel.update = function() {
            this.text = "Loading... "+Math.floor(that.loader.loadprogress * 100)+"%";
            if (that.loader.loadcomplete) {
                this.text = "Push button to skip.";
                this.visible = true;
            } else {
                if (this.time % 20 == 0) this.visible = !this.visible;
            }
            this.time++;
        };
    },

    update: function() {
        if (this.alreadyLoad || this.loader && this.loader.loadcomplete) {
            var ct = app.controller;
            if (ct.ok || ct.cancel) this.exit();
        }

        if (this.seq == 0) {
            this.worldmap();
            this.seq++;
        }
        if (this.seq == 2) {
            this.towerimage();
            this.seq++;
        }
        if (this.seq == 4) {
            this.sequence3();
            this.seq++;
        }
        if (this.seq == 6) {
            this.playerimage();
            this.seq++;
        }
        if (this.seq == 8) {
            this.exit();
        }
    },

    //世界地図
    worldmap: function() {
        var sprite1 = phina.display.Sprite("openingmap")
            .addChildTo(this.imageLayer)
            .setPosition(SC_W * 0.5, -SC_H * 0.25)
            .setScale(0.8)
            .setAlpha(0.0);
        sprite1.tweener.clear()
            .by({alpha: 1.0, y: 200}, 7000)
            .by({alpha: -1.0, y: 200}, 7000)
            .call(function(){
                sprite1.remove();
                this.seq++;
            }.bind(this));
    },

    //塔外観
    towerimage: function() {
        var sprite1 = phina.display.Sprite("background").addChildTo(this.imageLayer).setPosition(SC_W * 0.5, SC_H * 0.5);
        sprite1.alpha = 0;
        sprite1.tweener.clear()
            .call(function(){
                sprite1.alpha = 1;
                this.fg.alpha = 1;
                this.fg.tweener.clear().fadeOut(7000).fadeIn(7000);
            }.bind(this))
            .wait(14000)
            .call(function(){
                sprite1.remove();
                this.seq++;
            }.bind(this));

        var sprite2 = phina.display.Sprite("openingtower").addChildTo(this.imageLayer).setPosition(SC_W * 0.5, SC_H * 0.3);
        sprite2.alpha = 0;
        sprite2.tweener.clear()
            .call(function(){
                sprite2.alpha = 1;
            }.bind(this))
            .by({x: -100}, 4000, "easeInOutSine")
            .wait(3000)
            .by({y: 300}, 7000, "easeInSine")
            .call(function(){
                sprite2.remove();
            }.bind(this));
    },

    //三番目表示（暫定）
    sequence3: function() {
        var sprite1 = phina.display.Sprite("openingback2").addChildTo(this.imageLayer).setPosition(SC_W * 0.5, SC_H * 0.3).setScale(1.1);
        sprite1.alpha = 0;
        sprite1.tweener.clear()
            .call(function(){
                sprite1.alpha = 1;
                this.fg.alpha = 1;
                this.fg.tweener.clear().fadeOut(7000).wait(10000).fadeIn(7000);
            }.bind(this))
            .by({y: 150}, 12000, "easeInOutSine")
            .wait(12000)
            .call(function(){
                sprite1.remove();
                this.seq++;
            }.bind(this));

        var sprite2 = phina.display.Sprite("openinglight").addChildTo(this.imageLayer).setPosition(SC_W * 0.5, SC_H * 0.5);
        sprite2.blendMode = 'lighter';
        sprite2.alpha = 0.3;
        sprite2.tweener.clear()
            .wait(12000)
            .by({x: -50}, 12000, "easeInOutSine");
    },

    //プレイヤー表示
    playerimage: function() {
        var sprite1 = phina.display.Sprite("openingback").addChildTo(this.imageLayer).setPosition(SC_W * 0.5, SC_H * 0.35).setScale(1.2);
        sprite1.alpha = 0;
        sprite1.tweener.clear()
            .call(function(){
                sprite1.alpha = 1;
                this.fg.alpha = 1;
                this.fg.tweener.clear().fadeOut(7000).wait(5000).fadeIn(7000);
            }.bind(this))
            .wait(15000)
            .by({y: 150}, 5000, "easeInOutSine")
            .call(function(){
                sprite1.remove();
                this.seq++;
            }.bind(this));

        var sprite2 = phina.display.Sprite("openingground").addChildTo(this.imageLayer).setPosition(SC_W * 0.5, SC_H * 0.9);
        sprite2.tweener.clear()
            .by({y: -50}, 4000, "easeInOutSine")
            .wait(10000)
            .by({y: 200}, 5000, "easeInOutSine")

        var pl = qft.PlayerDummy("player1").addChildTo(sprite2).setPosition(0, 38);
        pl.setAnimation("up");
        pl.tweener.clear()
            .wait(3000)
            .by({y: -76}, 5000, "easeInOutSine")
            .call(function() {
                pl.setAnimation("up_stop");
            })
            .wait(6000)
            .call(function() {
                pl.setAnimation("down");
            })
            .by({y: 76}, 5000, "easeInOutSine");
    },
});


/*
 *  practicescene.js
 *  2017/04/15
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.ConfigScene_Practice", {
    superClass: "phina.display.DisplayScene",

    init: function() {
        this.superInit({width: SC_W, height: SC_H});

        this.menuBase = phina.display.DisplayElement().addChildTo(this);
        this.menuBase.alpha = 0;
        this.menuBase.tweener.clear().fadeIn(500);

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 5,

            fontFamily: "titlefont1",
            align: "center",
            baseline: "middle",
            fontSize: 70,
        };
        this.textLabel1 = phina.display.Label({text: "Practice", fontSize: 20}.$safe(labelParam))
            .addChildTo(this.menuBase)
            .setPosition(SC_W*0.5, SC_H*0.2);
        this.textLabel2 = phina.display.Label({text: "Stage select", fontSize: 20}.$safe(labelParam))
            .addChildTo(this.menuBase)
            .setPosition(SC_W*0.5, SC_H*0.3);

        //メニューテキスト表示
        var that = this;
        this.menu = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "P"];
        this.menuText = [];
        for (var i = 0; i < this.menu.length; i++) {
            this.menuText[i] = phina.display.Label({text: this.menu[i], fontSize: 40}.$safe(labelParam))
                .addChildTo(this.menuBase)
                .setPosition(SC_W*0.5+(SC_W*0.07*i)-(SC_W*0.07*(this.menu.length-1)/2), SC_H*0.5)
                .setScale(0.7);

            //タッチ判定用
            var param2 = {
                width: 30,
                height: SC_H*0.10,
                fill: "rgba(0,100,200,0.5)",
                stroke: "rgba(0,100,200,0.5)",
                backgroundColor: 'transparent',
            };
            var c = phina.display.RectangleShape(param2)
                .addChildTo(this.menuBase)
                .setPosition(SC_W*0.5+(SC_W*0.07*i)-(SC_W*0.07*(this.menu.length-1)/2), SC_H*0.5)
                .setInteractive(true);
            c.alpha = 0;
            c.select = i;
            c.onpointstart = function() {
                if (that.isSelected || that.time < 10) return;
                if (this.select == that.select) {
                    that.ok = true;
                } else {
                    if (that.vselect == 0) {
                        that.menuText[that.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                    } else {
                        that.exitText.tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                    }
                    that.select = this.select;
                    that.menuText[that.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
                    that.vselect = 0;
                    app.playSE("select");
                }
            }
        }

        this.exitText = phina.display.Label({text: "Exit", fontSize: 40}.$safe(labelParam))
            .addChildTo(this.menuBase)
            .setPosition(SC_W*0.5, SC_H*0.7)
            .setScale(0.7);
        //タッチ判定用
        var param2 = {
            width: SC_W*0.3,
            height: SC_H*0.10,
            fill: "rgba(0,100,200,0.5)",
            stroke: "rgba(0,100,200,0.5)",
            backgroundColor: 'transparent',
        };
        var c = phina.display.RectangleShape(param2)
            .addChildTo(this.menuBase)
            .setPosition(SC_W*0.5, SC_H*0.7)
            .setInteractive(true);
        c.alpha = 0;
        c.onpointstart = function() {
            if (that.isSelected || that.time < 10) return;
            if (that.vselect == 1) {
                that.ok = true;
            } else {
                that.menuText[that.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                that.exitText.tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
                that.vselect = 1;
                app.playSE("select");
            }
        }

        this.vselect = 0;
        this.select = 0;
        this.isSelected = false;
        this.selectMax = this.menu.length;
        this.menuText[0].setScale(1);
        this.ok = false;
        this.cancel = false;

        this.time = 0;

        this.on('resume', function() {
            this.time = 0;
            this.isSelected = false;
            this.ok = false;
            this.cansel = false;
        });
    },

    update: function() {
        var ct = app.controller;
        if (ct.right && !ct.before.right && this.select < this.selectMax-1 && this.vselect == 0) {
            this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
            this.select++;
            this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
            app.playSE("select");
            this.time = 10;
        }
        if (ct.left && !ct.before.left && this.select > 0  && this.vselect == 0) {
            this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
            this.select--;
            this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
            app.playSE("select");
            this.time = 10;
        }
        if (ct.down && !ct.before.down && this.vselect == 0) {
            this.vselect++;
            this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
            this.exitText.tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
            app.playSE("select");
            this.time = 10;
        }
        if (ct.up && !ct.before.up && this.vselect == 1) {
            this.vselect--;
            this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
            this.exitText.tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
            app.playSE("select");
            this.time = 10;
        }

        if (this.time > 15) {
            if (ct.ok || this.ok) {
                if (this.vselect == 0) {
                    if (this.select == 0) {
                        app.pushScene(qft.MainScene({startStage: 1, isPractice: true}));
                    } else {
                        if (this.select == 9) {
                            app.pushScene(qft.MainScene({startStage: 999, isPractice: true}));
                        } else if (this.select == 8) {
                            app.pushScene(qft.SceneFlow.Resume({stageNumber: 10, isPractice: false}));
                        } else {
                            app.pushScene(qft.SceneFlow.Resume({stageNumber: this.select+1, isPractice: true}));
                        }
                    }
                    app.stopBGM();
                }
                if (this.vselect == 1) {
                    app.playSE("cancel");
                    this.exitMenu();
                }
                this.time = 0;
            }
            if (ct.cancel || this.cancel) {
                app.playSE("cancel");
                this.exitMenu();
                this.time = 0;
            }
        }
        this.time++;
    },

    exitMenu: function() {
        this.menuBase.tweener.clear()
            .fadeOut(500)
            .call(function() {
                this.exit();
            }.bind(this));
    },
});

phina.define("qft.PracticePlatform", {
    superClass: "phina.display.DisplayScene",

    init: function(options) {
        this.superInit();
        this.options = (options || {}).$safe({
            assetType: "stage2",
            startStage: 2,
        })
        this.count = 0;
    },

    onenter: function() {
        app.pushScene(qft.LoadingScene({
            assets: qft.Assets.get(this.options),
        }));
    },

    onresume: function() {
        this.count++;
        if (this.count == 1) {
            app.pushScene(qft.MainScene({startStage: this.options.startStage, isPractice: true}));
        }
        if (this.count == 2){
            this.exit();
        }
    }
});

/*
 *  SceneFlow.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

//メインシーンフロー
phina.define("qft.SceneFlow", {
    superClass: "phina.game.ManagerScene",

    init: function(options) {
        options = options || {};
        startLabel = options.startLabel || "splash";
        this.superInit({
            startLabel: startLabel,
            scenes: [{
                label: "splash",
                className: "qft.SplashScene",
            },{
                label: "opening",
                className: "qft.OpeningScene",
            },{
                label: "title",
                className: "qft.TitleScene",
                nextLabel: "opening",
            },{
                label: "main",
                className: "qft.MainScene",
                arguments: {
                    startStage: 1,
                    isPractice: false,
                },
                nextLabel: "title",
            },{
                label: "continue",
                className: "qft.SceneFlow.Resume",
                arguments: {
                    isPractice: false,
                    isContinue: true,
                },
                nextLabel: "title",
            },{
                label: "ending",
                className: "qft.EndingScene",
                nextLabel: "main",
            },{
                label: "config",
                className: "qft.ConfigScene",
                nextLabel: "title",
            },{
                label: "practice",
                className: "qft.ConfigScene_Practice",
                nextLabel: "config",
            }],
        });
    }
});

//復帰用
phina.define("qft.SceneFlow.Resume", {
    superClass: "phina.game.ManagerScene",

    init: function(options) {
        options = (options || {}).$safe({stageNumber: 2, isPractice: false, isContinue: false});
        if (options.isContinue) {
            var data = localStorage.getItem("stage");
            if (data) {
                var d = JSON.parse(data).$safe({
                    stageNumber: 1,
                    result: [],
                    playerStatus: {},
                });
                options.stageNumber = d.stageNumber;
            } else {
                options.stageNumber = 1;
            }
        }
        var startLabel = "start";
        var assets = qft.Assets.get({assetType: "stage"+options.stageNumber});
        this.superInit({
            startLabel: startLabel,
            scenes: [{
                label: "start",
                className: "qft.LoadingScene",
                arguments: {
                    assets: assets,
                },
                nextLabel: "main",
            },{
                label: "main",
                className: "qft.MainScene",
                arguments: {
                    startStage: options.stageNumber,
                    isPractice: options.isPractice,
                    isContinue: options.isContinue,
                },
            }],
        });
    },
    onfinish: function() {
        this.exit();
    }
});

/*
 *  splashscene.js
 *  2017/02/08
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define('qft.SplashScene', {
    superClass: 'phina.display.DisplayScene',

    init: function() {
        this.superInit({width: SC_W, height: SC_H});

        this.unlock = false;
        this.loadcomplete1 = false;
        this.loadcomplete2 = false;
        this.progress1 = 0;
        this.progress2 = 0;

        //preload asset
        var assets = qft.Assets.get({assetType: "splash"});
        this.loader = phina.asset.AssetLoader();
        this.loader.load(assets);
        this.loader.on('load', function(e) {
            this.loadcomplete1 = true;
        }.bind(this));
        this.loader.on('progress', function(e) {
            this.progress1 = Math.floor(e.progress*100);
        }.bind(this));

        //preload asset2
        var assets = qft.Assets.get({assetType: "splash2"});
        this.loader2 = phina.asset.AssetLoader();
        this.loader2.load(assets);
        this.loader2.on('load', function(e) {
            this.loadcomplete2 = true;
        }.bind(this));
        this.loader2.on('progress', function(e) {
            this.progress2 = Math.floor(e.progress*100);
        }.bind(this));

        //logo
        var texture = phina.asset.Texture();
        texture.load(qft.SplashScene.logo).then(function() {
            this._init();
        }.bind(this));
        this.texture = texture;
    },

    _init: function() {
        this.sprite = phina.display.Sprite(this.texture)
            .addChildTo(this)
            .setPosition(this.gridX.center(), this.gridY.center())
            .setScale(0.3);
        this.sprite.alpha = 0;

        this.sprite.tweener.clear()
            .to({alpha:1}, 500, 'easeOutCubic')
            .wait(500)
            .call(function() {
                this.unlock = true;
            }, this);

        var that = this;
        //進捗ゲージ
        var options = {
            width:  SC_W*0.1,
            height: 3,
            backgroundColor: 'transparent',
            fill: 'red',
            stroke: 'white',
            strokeWidth: 1,
            gaugeColor: 'lime',
            cornerRadius: 3,
            value: 0,
            maxValue: 100,
        };
        this.progressGauge = phina.ui.Gauge(options).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.8);
        this.progressGauge.beforeValue = 0;
        this.progressGauge.update = function() {
            if (that.progress1 == this.beforeValue) {
                this.value++;
            } else {
                this.value = that.progress1;
            }
            this.beforeValue = this.value;
        };
    },

    update: function() {
        if (this.unlock && this.loadcomplete1 && this.loadcomplete2) {
            this.unlock = false;
            this.sprite.tweener.clear()
                .to({alpha:0}, 500, 'easeOutCubic')
                .call(function() {
                    this.exit();
                }, this);
            this.progressGauge.tweener.clear().to({alpha:0}, 10, 'easeOutCubic')
        }
    },

    _static: {
        logo: "assets/image/phinajs_logo.png",
    },
});

/*
 *  titlescene.js
 *  2017/02/09
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("qft.TitleScene", {
    superClass: "phina.display.DisplayScene",

    init: function() {
        this.superInit({width: SC_W, height: SC_H});

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.bg.tweener.setUpdateType('fps');

        var sprite1 = phina.display.Sprite("titleback").addChildTo(this).setPosition(SC_W * 0.5, SC_H * 0.5);
        sprite1.alpha = 0;
        sprite1.tweener.clear().fadeIn(500);

        //タイトルロゴの表示
        this.dispTitleLogo();

        //メニューアイテム表示
        var that = this;
        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 5,

            fontFamily: "titlefont2",
            align: "center",
            baseline: "middle",
            fontSize: 30,
        };
        this.menu = ["Start", "Continue", "Config"];
        this.menuComment = ["ゲームを開始します", "前回ゲームオーバーになったステージの最初から開始します", "設定メニューを開きます"];
        this.menuText = [];
        for (var i = 0; i < this.menu.length; i++) {
            this.menuText[i] = phina.display.Label({text: this.menu[i]}.$safe(labelParam))
                .addChildTo(this)
                .setPosition(SC_W*0.5, SC_H*0.6+i*30)
                .setScale(0.7);

            //タッチ判定用
            var param2 = {
                width: SC_W*0.3,
                height: SC_H*0.08,
                fill: "rgba(0,100,200,0.5)",
                stroke: "rgba(0,100,200,0.5)",
                backgroundColor: 'transparent',
            };
            var c = phina.display.RectangleShape(param2)
                .addChildTo(this)
                .setPosition(SC_W*0.5, SC_H*0.6+i*30)
                .setInteractive(true);
            c.alpha = 0;
            c.select = i;
            c.onpointstart = function() {
                if (that.isSelected || that.time < 10) return;
                if (this.select == that.select) {
                    that.ok = true;
                } else {
                    that.menuText[that.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
                    that.select = this.select;
                    that.menuText[that.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
                    app.playSE("select");
                }
            }
        }
        this.isSelected = false;
        this.select = 0;
        this.selectMax = 3;
        this.menuText[0].setScale(1);
        this.ok = false;
        this.cansel = false;

        //メニューコメント
        var that = this;
        this.comment = phina.display.Label({text: "", fontSize: 10}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.9);
        this.comment.update = function() {
            this.text = that.menuComment[that.select];
        }

        this.fg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.fg.tweener.setUpdateType('fps');
        this.fg.tweener.clear().fadeOut(15);

        this.on('resume', e => {
            this.fg.tweener.clear().fadeOut(15);
            this.time = 0;
            this.isSelected = false;
            this.ok = false;
            this.cansel = false;
        });

        this.time = 0;
    },

    update: function(app) {
        if (this.isSelected) return;

        var ct = app.controller;
        if (ct.down && !ct.before.down && this.select < this.selectMax-1) {
            this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
            this.select++;
            this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
            this.time = 10;
            app.playSE("select");
        }
        if (ct.up && !ct.before.up && this.select > 0) {
            this.menuText[this.select].tweener.clear().to({scaleX: 0.7, scaleY: 0.7}, 500, "easeOutBounce");
            this.select--;
            this.menuText[this.select].tweener.clear().to({scaleX: 1.0, scaleY: 1.0}, 500, "easeOutBounce");
            this.time = 10;
            app.playSE("select");
        }
        if (this.time > 15) {
            if (ct.ok || this.ok){
                this.isSelected = true;
                this.time = 0;
                switch (this.select) {
                    case 0:
                        //通常開始
                        app.playSE("ok");
                        this.fg.tweener.clear()
                            .fadeIn(3)
                            .call(function() {
                                this.exit("main");
                            }.bind(this));
                        break;
                    case 1:
                        //コンティニュー
                        app.playSE("ok");
                        this.fg.tweener.clear()
                            .fadeIn(3)
                            .call(function() {
                                var data = localStorage.getItem("stage");
                                if (data) {
                                    var d = JSON.parse(data).$safe({stageNumber: 1});
                                    if (d.stageNumber == 1) {
                                        this.exit("main");
                                    } else {
                                        app.pushScene(qft.SceneFlow.Resume({isPractice: false, isContinue: true}));
                                    }
                                } else {
                                    this.exit("main");
                                }
                            }.bind(this));
                        break;
                    case 2:
                        //設定メニュー
                        app.pushScene(qft.ConfigScene(this));
                        break;
                }
            }
            if (ct.cancel || this.cancel) {
                app.pushScene(qft.ConfigScene(this));
                this.isSelected = true;
                this.time = 0;
            }
        }
        if (this.time > 30 * 120) {
            this.exit("opening");
        }
        this.time++;
    },

    //タイトルロゴ表示
    dispTitleLogo: function(x, y) {
        x = x || SC_W * 0.5;
        y = y || SC_H * 0.45;

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 10,

            fontFamily: "titlefont1",
            align: "center",
            baseline: "middle",
            fontSize: 60,
        };
        var num = 0;
        this.textLabel = phina.display.Label({text: "The", fontSize: 30}.$safe(labelParam))
            .addChildTo(this).setPosition(x-182, y-85);
        this.textLabel = phina.display.Label({text: "Quest"}.$safe(labelParam))
            .addChildTo(this).setPosition(x-47, y-85);
        this.textLabel = phina.display.Label({text: "for", fontSize: 40}.$safe(labelParam))
            .addChildTo(this).setPosition(x-17, y-40);
        this.textLabel = phina.display.Label({text: "Tanelorn"}.$safe(labelParam))
            .addChildTo(this).setPosition(x+48, y);
    },
});

/*
 *  tutorialscene.js
 *  2017/06/01
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.TutorialScene", {
    superClass: "phina.display.DisplayScene",

    //スクリーンのマップ外への移動制限フラグ
    limitWidth: false,
    limitHeight: true,

    //プレイヤースクリーン中央固定フラグ
    centerPlayer: true,

    init: function(options) {
        this.superInit({width: SC_W, height: SC_H});

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.bg.tweener.setUpdateType('fps');

        //背景
        this.backgroundImage = phina.display.Sprite("background").addChildTo(this).setPosition(0, SC_H*0.5).setOrigin(0, 0.5);

        //管理用基準レイヤ
        this.baseLayer = phina.display.DisplayElement().addChildTo(this);

        //プレイヤーキャラクタ
        this.player = qft.Player(this);

       //スクリーン初期化
        this.setupScreen();

        //ステージ情報初期化
        this.setupStage();

        this.fg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.fg.tweener.setUpdateType('fps').clear().fadeOut(30);

        //バーチャルパッドの可視化
//        app.virtualPad.addChildTo(this);

        app.volumeBGM = 0.5;
        app.volumeSE = 0.2;

        //メッセージ表示
        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 16,
            fontWeight: ''
        };
        var that = this;
        this.messageStack = [];
        this.eventMessage = phina.display.Label({text: ""}.$safe(labelParam))
            .setPosition(SC_W*0.5, SC_H*0.2)
            .addChildTo(this);
        this.eventMessage.alpha = 0;
        this.eventMessage.tweener.clear().setUpdateType('fps');
        this.eventMessage.nextOk = true;
        this.eventMessage.update = function() {
            if (this.nextOk && that.messageStack.length > 0) {
                this.nextOk = false;
                var msg = that.messageStack[0];
                this.tweener.clear()
                    .call(function(){
                        this.text = msg.text;
                    }.bind(this))
                    .fadeIn(15).wait(90).fadeOut(15)
                    .call(function(){
                        this.nextOk = true;
                        that.messageStack.splice(0, 1);
                    }.bind(this))
            }
        }

        this.time = 0;
    },

    update: function(app) {
        if (this.time == 15) this.player.isControl = true;

        //スクリーン表示位置をプレイヤー中心になる様に調整
        if (this.centerPlayer) {
            var map = this.mapLayer.map;
            this.mapLayer.x = SC_W*0.5-this.player.x;
            this.mapLayer.y = SC_H*0.5-this.player.y;
            if (this.limitHeight) {
                if (this.mapLayer.y > 0) this.mapLayer.y = 0;
                if (this.mapLayer.y < -(map.height-SC_H)) this.mapLayer.y = -(map.height-SC_H);
            }
            if (this.limitWidth) {
                if (this.mapLayer.x > 0) this.mapLayer.x = 0;
                if (this.mapLayer.x < -(map.width-SC_W)) this.mapLayer.x = -(map.width-SC_W);
            }

            //スクリーン座標
            this.screenX = -this.mapLayer.x;
            this.screenY = -this.mapLayer.y;

            //バックグラウンドのX座標を全体の割合から計算
            this.backgroundImage.x = -Math.floor(this.backgroundImage.width * (this.player.x / map.width)*0.01);
        }

        this.time++;
    },

    //敵キャラクタ投入
    spawnEnemy: function(x, y, name, options) {
        return qft.Enemy[name](this, options).addChildTo(this.enemyLayer).setPosition(x, y);
    },

    //アイテム投入
    spawnItem: function(x, y, options) {
        return qft.Item(this, options).addChildTo(this.objLayer).setPosition(x, y);
    },

    //アイテムボックス投入
    spawnItemBox: function(x, y, options) {
        return qft.ItemBox(this, options).addChildTo(this.objLayer).setPosition(x, y);
    },

    //エフェクト投入
    spawnEffect: function(x, y, options) {
        return qft.Effect(this, options).addChildTo(this.objLayer).setPosition(x, y);
    },

    //メッセージ投入
    spawnMessage: function(text, between, waitFrame) {
        between = between || 32;
        waitFrame = waitFrame || 30;
        var arrayText = text.split("");
        var labelParam = {
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 32,
            fontWeight: ''
        };
        var n = 0;
        var x = SC_W * 0.5 - (arrayText.length * between * 0.5);
        arrayText.forEach(function(e) {
            if (e == " ") {
                x += between;
                return;
            }
            var lb = phina.display.Label({text: e}.$safe(labelParam)).setPosition(x, SC_H*0.5+32).setScale(0, 1).addChildTo(this);
            lb.tweener.clear().setUpdateType('fps')
                .set({alpha: 0})
                .wait(n)
                .to({scaleX: 1.0, alpha: 1, y: SC_H*0.5}, 15, "easeOutSine")
                .wait(waitFrame)
                .to({scaleX: 0.0, y: SC_H*0.5-32}, 10, "easeOutSine")
                .call(function(){this.remove()}.bind(lb));
            x += between;
            n += 5;
        }.bind(this));
    },

    //イベントメッセージ投入
    spawnEventMessage: function(id, text) {
        if (!id || !text) return;
        //メッセージスタック内に同一ＩＤがある場合は投入しない
        for (var i = 0; i < this.messageStack.length; i++) {
            if (this.messageStack[i].id == id) return;
        }
        if (text instanceof Array) {
            text.forEach(function(str) {
                this.messageStack.push({id: id, text: str});
            }.bind(this));
        } else {
            this.messageStack.push({id: id, text: text});
        }
    },

    //スクリーン初期化
    setupScreen: function() {
        var that = this;
        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "UbuntuMono",
            align: "left",
            baseline: "middle",
            fontSize: 20,
            fontWeight: ''
        };

        //体力ゲージ
        phina.display.Label({text: "LIFE"}.$safe(labelParam)).addChildTo(this).setPosition(0, 10);
        var options = {
            width:  256,
            height: 5,
            backgroundColor: 'transparent',
            fill: 'red',
            stroke: 'white',
            strokeWidth: 2,
            gaugeColor: 'lime',
            cornerRadius: 0,
            value: this.player.hp,
            maxValue: this.player.hp,
        };
        this.lifeGauge = phina.ui.Gauge(options).addChildTo(this).setOrigin(0, 0.5).setPosition(40, 10);
        this.lifeGauge.update = function() {
            this.value = that.player.hp;
        };

        //スコア表示
        this.scoreLabel = phina.display.Label({text:"SCORE:", align: "right"}.$safe(labelParam)).addChildTo(this).setPosition(SC_W, 10);
        this.scoreLabel.score = 0;
        this.scoreLabel.s = 0;
        this.scoreLabel.update = function(e) {
            if (e.ticker.frame % 10 == 0) {
                this.s = ~~((that.totalScore-this.score)/7);
                if (this.s < 3) this.s = 3;
                if (this.s > 7777) this.s = 7777;
            }
            this.score += this.s;
            if (this.score > that.totalScore) this.score = that.totalScore;

            this.text = "SCORE "+this.score.comma();
        }

        //制限時間表示
        var tl = phina.display.Label({text: "TIME:", align: "right"}.$safe(labelParam)).addChildTo(this).setPosition(SC_W, 30);
        tl.update = function() {
            this.text = "TIME:"+Math.floor(that.timeLimit/30);
            if (that.timeLimit == 0) {
                this.fill = 'red';
            } else {
                this.fill = 'white';
            }
        }

        //プレイヤー装備武器表示
        this.playerWeapon = qft.PlayerWeapon(this.player).addChildTo(this).setPosition(SC_W-30, SC_H-30);
    },

    //マップ情報の初期化
    setupStage: function() {

        this.baseLayer.removeChildren();

        this.stageController = qft.Stage999(this);
        this.switchMap(this.stageController.mapLayer[0]);

        //経過時間初期化
        this.time = 0;

        //タイムリミット設定
        this.timeLimit = this.stageController.timeLimit;

        //プレイヤー設定
        this.player.isControl = false;
        this.player.isMuteki = false;
        this.player.alpha = 1.0;

        this.stageController.playBGM();
    },

    //マップレイヤの切替
    switchMap: function(layer, x, y) {
        if (this.mapLayer) this.mapLayer.remove();
        this.mapLayer = layer;
        this.mapLayer.addChildTo(this.baseLayer);
        this.map = layer.map;

        this.backgroundLayer = layer.backgroundLayer;
        this.foregroundLayer = layer.foregroundLayer;
        this.collisionLayer = layer.collisionLayer;
        this.enemyLayer = layer.enemyLayer;
        this.playerLayer = layer.playerLayer;
        this.objLayer = layer.objLayer;
        this.mapImageLayer = layer.mapImageLayer;
        this.effectLayer = layer.effectLayer;

        this.player.remove();
        this.player.addChildTo(layer.playerLayer);
        if (x) {
            this.player.setPosition(x, y);
        }
    },
});

/*
 *  stage1.js
 *  2017/01/24
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ１
phina.define("qft.Stage1", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 1,

    //タイムリミット
    timeLimit: FPS*60*5,

    //BGMアセット名
    bgm: "bgm1",

    init: function(parentScene) {
        this.superInit(parentScene);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage1");
        this.mapLayer[0] = this.createMap(tmx);

       //初期処理
        this.add(1, function() {
            //ステージ開始メッセージ投入
            this.spawnMessage("STAGE 1", 24);

            //マップ表示設定
            this.limitWidth = false;
            this.limitHeight = true;
        });

        this.add(60, function() {
        });
    },

    //ステージクリア条件判定
    checkStageClearCondition: function() {
        var keys = this.player.keys;
        if (keys.length < 1) return false;
        return true;
    },

    //ステージクリア処理
    stageClear: function() {
        var pl = qft.PlayerDummy("player1").addChildTo(this.parentScene.mapLayer.playerLayer).setVisible(false);
        pl.setAnimation("clear");
        this.player.tweener.clear()
            .wait(30)
            .set({alpha: 0})
            .call(function() {
                pl.setPosition(this.player.x, this.player.y).setVisible(true);
            }.bind(this))
            .wait(60)
            .call(function() {
                pl.setAnimation("up");
                pl.tweener.clear().moveBy(14, -32, 1000)
                    .call(function() {
                        pl.animation = false;
                    })
                    .fadeOut(500);
            }.bind(this));
    },
});

/*
 *  stage10.js
 *  2017/09/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

//エンディングシーン
phina.define("qft.Stage10", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 10,

    //タイムリミット
    timeLimit: FPS*60*5,

    //BGMアセット名
    bgm: "ending",

    //特殊ステージフラグ
    isEnding: true,

    init: function(parentScene, tmx) {
        this.superInit(parentScene, tmx);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage10");
        this.mapLayer[0] = this.createMap(tmx);

        //プレイヤーダミースプライト
        var pl = qft.PlayerDummy("player1")

        //初期処理
        this.add(1, function() {
            //開始メッセージ投入
            this.spawnEventMessage(1, "Congraturations!!");

            //マップ表示設定
            this.limitWidth = true;
            this.limitHeight = true;

            this.player.speed = 2;
            this.player.speedAscend = 2;
            this.player.isAuto = true;
            this.player.autoKey.up = true;
        });

        this.add(224, function() {
            this.player.autoKey.up = false;
        });

        this.add(60, function() {
            this.player.autoKey.right = true;
        });

        //石碑まで
        this.add(255, function() {
            this.player.autoKey.right = false;
            this.player.setAlpha(0);
            pl.addChildTo(this.mapLayer.playerLayer);
            pl.setPosition(this.player.x, this.player.y);
            pl.setAnimation("up_stop");
        });
        this.add(120, function() {
            this.player.autoKey.right = true;
            this.player.setAlpha(1.0);
            pl.remove();
        });

        //入り口まで
        this.add(330, function() {
            this.player.autoKey.right =　false;
        });

        this.add(60, function() {
            this.player.autoKey.right = true;
        });
        this.add(30, function() {
            this.player.autoKey.right = false;
        });
        this.add(30, function() {
            this.player.autoKey.right = true;
        });
        this.add(20, function() {
            this.player.autoKey.right = false;
        });

        this.add(60, function() {
            this.player.tweener.clear().set({alpha: 0}).moveBy(0, -600, 600);
            this.player.gravity = 0;

            pl.addChildTo(this.mapLayer.playerLayer);
            pl.setPosition(this.player.x, this.player.y);
            pl.setAnimation("up");
            pl.tweener.setUpdateType('fps').clear()
                .moveBy(0, -600, 600)
                .call(() => {
                    pl.setAnimation("down");
                })
                .wait(10)
                .call(() => {
                    pl.setAnimation("clear");
                })
                .wait(30)
                .call(() => {
                    pl.setAnimation("up");
                })
                .wait(30)
                .call(() => {
                    this.fgWhite.tweener.clear()
                        .wait(120)
                        .fadeIn(120)
                        .call(() => {
                            this.flare("ending");
                        });
                    this.fg.tweener.clear()
                        .wait(150)
                        .fadeIn(60);

                })
                .moveBy(0, -600, 600);
            var obj = this.stageController.findObject(17, 0, "enemy");
            obj.setAnimation("up");
        });

        this.add(60, function() {
            var obj = this.stageController.findObject(17, 0, "enemy");
            obj.tweener.clear().moveBy(0, -300, 300);
        });
    },

    //ステージクリア条件判定
    checkStageClearCondition: function() {
        return true;
    },

    //ステージクリア処理
    stageClear: function() {
    },
});

/*
 *  stage1.js
 *  2017/01/24
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ１
phina.define("qft.Stage2", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 2,

    //タイムリミット
    timeLimit: FPS*60*7,

    //BGMアセット名
    bgm: "bgm2",

    init: function(parentScene, tmx) {
        this.superInit(parentScene, tmx);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage2_1");
        this.mapLayer[0] = this.createMap(tmx);

        //初期処理
        this.add(1, function() {
            //ステージ開始メッセージ投入
            this.spawnMessage("STAGE 2", 24);

            //マップ表示設定
            this.limitWidth = true;
            this.limitHeight = true;
        });

        this.add(60, function() {
        });
    },

    //ステージクリア条件判定
    checkStageClearCondition: function() {
        var keys = this.player.keys;
        if (keys.length < 2) return false;
        return true;
    },

    //ステージクリア処理
    stageClear: function() {
        var pl = qft.PlayerDummy("player1").addChildTo(this.parentScene.mapLayer.playerLayer).setVisible(false);
        pl.setAnimation("clear");
        this.player.tweener.clear()
            .wait(30)
            .set({alpha: 0})
            .call(function() {
                pl.setPosition(this.player.x, this.player.y).setVisible(true);
            }.bind(this))
            .wait(60)
            .call(function() {
                pl.setAnimation("up");
                pl.tweener.clear().moveTo(487, 271, 1000)
                    .call(function() {
                        pl.animation = false;
                    })
                    .fadeOut(500);
            }.bind(this));
    },
});

/*
 *  stage3.js
 *  2017/03/01
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ１
phina.define("qft.Stage3", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 3,

    //タイムリミット
    timeLimit: FPS*60*10,

    //BGMアセット名
    bgm: "bgm3",

    init: function(parentScene, tmx) {
        this.superInit(parentScene, tmx);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage3_1");
        this.mapLayer[0] = this.createMap(tmx);
        var tmx = phina.asset.AssetManager.get('tmx', "stage3_2");
        this.mapLayer[1] = this.createMap(tmx);
        var tmx = phina.asset.AssetManager.get('tmx', "stage3_3");
        this.mapLayer[2] = this.createMap(tmx);

        //初期処理
        this.add(1, function() {
            //ステージ開始メッセージ投入
            this.spawnMessage("STAGE 3", 24);

            //マップ表示設定
            this.limitWidth = true;
            this.limitHeight = true;
        });

        this.add(60, function() {
        });
    },

    //ステージクリア条件判定
    checkStageClearCondition: function() {
        var keys = this.player.keys;
        if (keys.length < 2) return false;
        return true;
    },

    //ステージクリア処理
    stageClear: function() {
        var pl = qft.PlayerDummy("player1").addChildTo(this.parentScene.mapLayer.playerLayer).setVisible(false);
        pl.setAnimation("clear");
        this.player.tweener.clear()
            .wait(30)
            .set({alpha: 0})
            .call(function() {
                pl.setPosition(this.player.x, this.player.y).setVisible(true);
            }.bind(this))
            .wait(60)
            .call(function() {
                pl.setAnimation("up");
                pl.tweener.clear().moveTo(86, 272, 1000)
                    .call(function() {
                        pl.animation = false;
                    })
                    .fadeOut(500);
            }.bind(this));
    },
});

/*
 *  stage4.js
 *  2017/03/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ１
phina.define("qft.Stage4", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 4,

    //タイムリミット
    timeLimit: FPS*60*7,

    //BGMアセット名
    bgm: "bgm4",

    init: function(parentScene, tmx) {
        this.superInit(parentScene, tmx);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage4_1");
        this.mapLayer[0] = this.createMap(tmx);
        var tmx = phina.asset.AssetManager.get('tmx', "stage4_2");
        this.mapLayer[1] = this.createMap(tmx);

        //初期処理
        this.add(1, function() {
            //ステージ開始メッセージ投入
            this.spawnMessage("STAGE 4", 24);

            //マップ表示設定
            this.limitWidth = true;
            this.limitHeight = true;
        });

        this.add(60, function() {
        });
    },

    //ステージクリア条件判定
    checkStageClearCondition: function() {
        var keys = this.player.keys;
        if (keys.length < 1) return false;
        return true;
    },

    //ステージクリア処理
    stageClear: function() {
        var pl = qft.PlayerDummy("player1").addChildTo(this.parentScene.mapLayer.playerLayer).setVisible(false);
        pl.setAnimation("clear");
        this.player.tweener.clear()
            .wait(30)
            .set({alpha: 0})
            .call(function() {
                pl.setPosition(this.player.x, this.player.y).setVisible(true);
            }.bind(this))
            .wait(60)
            .call(function() {
                pl.setAnimation("up");
                pl.tweener.clear().moveTo(2903, 176, 1000)
                    .call(function() {
                        pl.animation = false;
                    })
                    .fadeOut(500);
            }.bind(this));
    },
});

/*
 *  stage5.js
 *  2017/05/14
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ１
phina.define("qft.Stage5", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 5,

    //タイムリミット
    timeLimit: FPS*60*8,

    //BGMアセット名
    bgm: "bgm5",

    init: function(parentScene, tmx) {
        this.superInit(parentScene, tmx);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage5_1");
        this.mapLayer[0] = this.createMap(tmx);
        var tmx = phina.asset.AssetManager.get('tmx', "stage5_2");
        this.mapLayer[1] = this.createMap(tmx);

        //初期処理
        this.add(1, function() {
            //ステージ開始メッセージ投入
            this.spawnMessage("STAGE 5", 24);

            //マップ表示設定
            this.limitWidth = true;
            this.limitHeight = true;
        });

        //鍵出現
        this.addEvent("key", () => {
            var kx = 1196;
            var ky = 688;
            var key = qft.Item(this.parentScene, {properties: {kind: "key"}})
                .addChildTo(this.parentScene.mapLayer.objLayer)
                .setPosition(kx, ky);
            key.vy = -5;
            this.parentScene.pauseScene = true;
            this.parentScene.centerPlayer = false;
            this.parentScene.camera.setPosition(this.parentScene.player.x, this.parentScene.player.y);
            this.parentScene.camera.tweener.clear()
                .call(function() {
                    app.playSE("holy1");
                })
                .moveTo(kx, ky, 30, "easeInOutSine")
                .wait(30)
                .call(function() {
                    this.parentScene.pauseScene = false;
                    this.moveFrom.x = kx;
                    this.moveFrom.y = ky;
                    this.moveRaio = 0;
                    this.moveLerp = true;
                    this.moveToPlayer = true;
                }.bind(this.parentScene.camera))
                .to({moveRatio: 1}, 30, "easeInOutSine")
                .call(function() {
                    this.parentScene.centerPlayer = true;
                    this.moveLerp = false;
                }.bind(this.parentScene.camera));
        });
    },

    //ステージクリア条件判定
    checkStageClearCondition: function() {
        var keys = this.player.keys;
        if (keys.length < 1) return false;
        return true;
    },

    //ステージクリア処理
    stageClear: function() {
        var pl = qft.PlayerDummy("player1").addChildTo(this.parentScene.mapLayer.playerLayer).setVisible(false);
        pl.setAnimation("clear");
        this.player.tweener.clear()
            .wait(30)
            .set({alpha: 0})
            .call(function() {
                pl.setPosition(this.player.x, this.player.y).setVisible(true);
            }.bind(this))
            .wait(60)
            .call(function() {
                pl.setAnimation("up");
                pl.tweener.clear().moveTo(3493+18, 80+80, 1000)
                    .call(function() {
                        pl.animation = false;
                    })
                    .fadeOut(500);
            }.bind(this));
    },

    //ステージＢＧＭ再生
    playBGM: function() {
        app.setVolume(this.bgm, 0.5);
        app.playBGM(this.bgm);
    },
});

/*
 *  stage6.js
 *  2017/05/14
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ１
phina.define("qft.Stage6", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 6,

    //タイムリミット
    timeLimit: FPS*60*5,

    //BGMアセット名
    bgm: "bgm6",

    init: function(parentScene, tmx) {
        this.superInit(parentScene, tmx);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage6_1");
        this.mapLayer[0] = this.createMap(tmx);

        var tmx = phina.asset.AssetManager.get('tmx', "stage6_2");
        this.mapLayer[1] = this.createMap(tmx);

        //初期処理
        this.add(1, function() {
            //ステージ開始メッセージ投入
            this.spawnMessage("STAGE 6", 24);

            //マップ表示設定
            this.limitWidth = true;
            this.limitHeight = true;
        });

        this.bossdead1 = false;
        this.bossdead2 = false;

        //ボス１討伐
        this.addEvent("bossdead_1", () => {
            this.bossdead1 = true;
            if (this.bossdead2) this.fireEvent("key");
        });
        //ボス２討伐
        this.addEvent("bossdead_2", () => {
            this.bossdead2 = true;
            if (this.bossdead1) this.fireEvent("key");
        });

        //鍵出現
        this.addEvent("key", () => {
            var kx = 384;
            var ky = 944;
            var key = qft.Item(this.parentScene, {properties: {kind: "key"}})
                .addChildTo(this.parentScene.mapLayer.objLayer)
                .setPosition(kx, ky);
            key.vy = -5;
            this.parentScene.pauseScene = true;
            this.parentScene.centerPlayer = false;
            this.parentScene.camera.setPosition(this.parentScene.player.x, this.parentScene.player.y);
            this.parentScene.camera.tweener.clear()
                .call(function() {
                    app.playSE("holy1");
                })
                .moveTo(kx, ky, 30, "easeInOutSine")
                .wait(30)
                .call(function() {
                    this.parentScene.pauseScene = false;
                    this.moveFrom.x = kx;
                    this.moveFrom.y = ky;
                    this.moveRaio = 0;
                    this.moveLerp = true;
                    this.moveToPlayer = true;
                }.bind(this.parentScene.camera))
                .to({moveRatio: 1}, 30, "easeInOutSine")
                .call(function() {
                    this.parentScene.centerPlayer = true;
                    this.moveLerp = false;
                }.bind(this.parentScene.camera));
        });
    },

    //ステージクリア条件判定
    checkStageClearCondition: function() {
        var keys = this.player.keys;
        if (keys.length < 3) return false;
        return true;
    },

    //ステージクリア処理
    stageClear: function() {
        var pl = qft.PlayerDummy("player1").addChildTo(this.parentScene.mapLayer.playerLayer).setVisible(false);
        pl.setAnimation("clear");
        this.player.tweener.clear()
            .wait(30)
            .set({alpha: 0})
            .call(function() {
                pl.setPosition(this.player.x, this.player.y).setVisible(true);
            }.bind(this))
            .wait(60)
            .call(function() {
                pl.setAnimation("up");
                pl.tweener.clear().moveTo(119 + 18　, 448 + 80, 1000)
                    .call(function() {
                        pl.animation = false;
                    })
                    .fadeOut(500);
            }.bind(this));
    },
});

/*
 *  stage7.js
 *  2017/07/26
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ7
phina.define("qft.Stage7", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 6,

    //タイムリミット
    timeLimit: FPS*60*5,

    //BGMアセット名
    bgm: "bgm7",

    init: function(parentScene, tmx) {
        this.superInit(parentScene, tmx);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage7_1");
        this.mapLayer[0] = this.createMap(tmx);

        var tmx = phina.asset.AssetManager.get('tmx', "stage7_2");
        this.mapLayer[1] = this.createMap(tmx);

        var tmx = phina.asset.AssetManager.get('tmx', "stage7_3");
        this.mapLayer[2] = this.createMap(tmx);

        //初期処理
        this.add(1, function() {
            //ステージ開始メッセージ投入
            this.spawnMessage("STAGE 7", 24);

            //マップ表示設定
            this.limitWidth = true;
            this.limitHeight = true;
        });

        this.add(60, function() {
        });
    },

    //ステージクリア条件判定
    checkStageClearCondition: function() {
        var keys = this.player.keys;
        if (keys.length < 1) return false;
        return true;
    },

    //ステージクリア処理
    stageClear: function() {
        var pl = qft.PlayerDummy("player1").addChildTo(this.parentScene.mapLayer.playerLayer).setVisible(false);
        pl.setAnimation("clear");
        this.player.tweener.clear()
            .wait(30)
            .set({alpha: 0})
            .call(function() {
                pl.setPosition(this.player.x, this.player.y).setVisible(true);
            }.bind(this))
            .wait(60)
            .call(function() {
                pl.setAnimation("up");
                pl.tweener.clear().moveTo(182 + 18, 208 + 80, 1000)
                    .call(function() {
                        pl.animation = false;
                    })
                    .fadeOut(500);
            }.bind(this));
    },
});

/*
 *  stage8.js
 *  2017/07/26
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ8
phina.define("qft.Stage8", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 8,

    //タイムリミット
    timeLimit: FPS*60*8,

    //BGMアセット名
    bgm: "bgm8",

    init: function(parentScene, tmx) {
        this.superInit(parentScene, tmx);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage8_1");
        this.mapLayer[0] = this.createMap(tmx);

        var tmx = phina.asset.AssetManager.get('tmx', "stage8_2");
        this.mapLayer[1] = this.createMap(tmx);

        //初期処理
        this.add(1, function() {
            //ステージ開始メッセージ投入
            this.spawnMessage("STAGE 8", 24);

            //マップ表示設定
            this.limitWidth = true;
            this.limitHeight = true;
        });

        //鍵出現
        this.addEvent("key", () => {
            var kx = 670;
            var ky = 853;
            var key = qft.Item(this.parentScene, {properties: {kind: "key"}})
                .addChildTo(this.parentScene.mapLayer.objLayer)
                .setPosition(kx, ky);
            key.vy = -5;
            this.parentScene.pauseScene = true;
            this.parentScene.centerPlayer = false;
            this.parentScene.camera.setPosition(this.parentScene.player.x, this.parentScene.player.y);
            this.parentScene.camera.tweener.clear()
                .call(function() {
                    app.playSE("holy1");
                })
                .moveTo(kx, ky, 30, "easeInOutSine")
                .wait(30)
                .call(function() {
                    this.parentScene.pauseScene = false;
                    this.moveFrom.x = kx;
                    this.moveFrom.y = ky;
                    this.moveRaio = 0;
                    this.moveLerp = true;
                    this.moveToPlayer = true;
                }.bind(this.parentScene.camera))
                .to({moveRatio: 1}, 30, "easeInOutSine")
                .call(function() {
                    this.parentScene.centerPlayer = true;
                    this.moveLerp = false;
                }.bind(this.parentScene.camera));
        });
    },

    //ステージクリア条件判定
    checkStageClearCondition: function() {
        var keys = this.player.keys;
//        if (keys.length < 1) return false;
        return true;
    },

    //ステージクリア処理
    stageClear: function() {
        var pl = qft.PlayerDummy("player1").addChildTo(this.parentScene.mapLayer.playerLayer).setVisible(false);
        pl.setAnimation("clear");
        this.player.tweener.clear()
            .wait(30)
            .set({alpha: 0})
            .call(function() {
                pl.setPosition(this.player.x, this.player.y).setVisible(true);
            }.bind(this))
            .wait(60)
            .call(function() {
                pl.setAnimation("walk");
                pl.tweener.clear()
                    .moveTo(784+16, 304-16, 500)
                    .call(function() {
                        pl.setAnimation("up");
                    })
                    .moveTo(784+16, -32, 5000)
                    .call(function() {
                        pl.animation = false;
                    })
                    .fadeOut(500);
            }.bind(this));
    },
});

/*
 *  stage9.js
 *  2017/07/26
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ9
phina.define("qft.Stage9", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 9,

    //タイムリミット
    timeLimit: FPS*60*5,

    //BGMアセット名
    bgm: "bgm9",

    init: function(parentScene, tmx) {
        this.superInit(parentScene, tmx);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage9_1");
        this.mapLayer[0] = this.createMap(tmx);

        //初期処理
        this.add(1, function() {
            //ステージ開始メッセージ投入
            this.spawnMessage("STAGE 9", 24);

            //マップ表示設定
            this.limitWidth = true;
            this.limitHeight = true;
        });

        this.add(60, function() {
        });
    },

    //ステージクリア条件判定
    checkStageClearCondition: function() {
        var keys = this.player.keys;
        if (keys.length < 1) return false;
        return true;
    },

    //ステージクリア処理
    stageClear: function() {
        var pl = qft.PlayerDummy("player1").addChildTo(this.parentScene.mapLayer.playerLayer).setVisible(false);
        pl.setAnimation("clear");
        this.player.tweener.clear()
            .wait(30)
            .set({alpha: 0})
            .call(function() {
                pl.setPosition(this.player.x, this.player.y).setVisible(true);
            }.bind(this))
            .wait(60)
            .call(function() {
                pl.setAnimation("up");
                pl.tweener.clear().moveTo(487, 271, 1000)
                    .call(function() {
                        pl.animation = false;
                    })
                    .fadeOut(500);
            }.bind(this));
    },
});

/*
 *  stage999.js
 *  2017/05/03
 *  @auther minimo  
 *  This Program is MIT license.
 */

//テストステージ
phina.define("qft.Stage999", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 1,

    //タイムリミット
    timeLimit: FPS*60*5,

    init: function(parentScene) {
        this.superInit(parentScene);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage999");
        this.mapLayer[0] = this.createMap(tmx);

       //初期処理
        this.add(1, function() {
            //ＢＧＭ再生
            app.playBGM("bgm1");

            //ステージ開始メッセージ投入
            this.spawnMessage("STAGE 1", 24);

            //マップ表示設定
            this.limitWidth = false;
            this.limitHeight = true;
        });
    },
});

/*
 *  stagecontroller.js
 *  2017/01/24
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ステージ制御
phina.define("qft.StageController", {
    superClass: "phina.app.Object2D",

    //ステージ番号
    stageNumber: 0,

    //タイムリミット
    timeLimit: FPS*60*5,

    //BGMアセット名
    bgm: "bgm1",

    //マップ表示設定
    limitWidth: false,
    limitHeight: true,

    parentScene: null,
    mapLayer: null,
    player: null,
    time: 0,

    //経過時間トリガイベント
    seq: null,
    index: 0,

    //マップトリガイベント
    event: null,

    //バックグラウンド設定
    isBackgroundMove: true,
    backgroundX: -320,

    //特殊ステージフラグ
    isOpening: false,
    isTutorial: false,
    isEnding: false,

    init: function(parentScene) {
        this.superInit();

        this.parentScene = parentScene;
        this.mapLayer = [];
        this.player = parentScene.player;

        this.seq = [];
        this.event = [];
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

    //イベント発火
    fireEvent: function(eventName) {
        var event = this.event[eventName];
        if (event) {
            event.value.call();
            return true;
        }
        return false;
    },

    clear: function() {
        this.seq = [];
        this.index = 0;
    },

    checkStageClearCondition: function() {
        return false;
    },

    stageClear: function() {
    },

    //ステージＢＧＭ再生
    playBGM: function() {
        app.playBGM(this.bgm);
    },

    //IDからオブジェクト検索
    findObject: function(id, layerNumber, layerName) {
        layerNumber = layerNumber || 0;
        layerName = layerName || "object";
        var result = null;
        switch (layerName) {
            case "object":
                this.mapLayer[layerNumber].objLayer.children.forEach(function(e) {
                    if (e.id == id) result = e;
                }.bind(this));
                break;
            case "enemy":
                this.mapLayer[layerNumber].enemyLayer.children.forEach(function(e) {
                    if (e.id == id) result = e;
                }.bind(this));
                break;
        }
        return result;
    },

    //tmxからマップレイヤを作成する
    createMap: function(tmx) {
        //マップレイヤ
        var mapLayer = phina.display.DisplayElement();

        //マップ画像用レイヤ
        mapLayer.mapImageLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //地形判定用レイヤ
        mapLayer.collisionLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //バックグラウンドレイヤ
        mapLayer.backgroundLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //オブジェクト管理レイヤ
        mapLayer.objLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //影表示レイヤ
        mapLayer.shadowLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //敵キャラクタ管理レイヤ
        mapLayer.enemyLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //プレイヤー表示レイヤ
        mapLayer.playerLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //エフェクト管理レイヤ
        mapLayer.effectLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //フォアグラウンドレイヤ
        mapLayer.foregroundLayer = phina.display.DisplayElement().addChildTo(mapLayer);

        //マップ画像取得
        var mapImage = tmx.getImage("map", "background", "background2", "background3");
        mapLayer.map = phina.display.Sprite(mapImage).addChildTo(mapLayer.mapImageLayer).setOrigin(0, 0);

        //フォアグラウンド画像
        var foreground = tmx.getImage("foreground", "foreground2", "foreground3");
        phina.display.Sprite(foreground).addChildTo(mapLayer.foregroundLayer).setOrigin(0, 0);

        //マップ当たり判定取得
        var objects = tmx.getObjectGroup("collision").objects;
        objects.forEach(function(e) {
            var width = e.width || 16;
            var height = e.height || 16;
            var c = phina.display.RectangleShape({width: width, height: height})
                .addChildTo(mapLayer.collisionLayer)
                .setPosition(e.x+width/2, e.y+height/2)
                .setVisible(DEBUG_COLLISION);
            c.on('enterframe', function() {
                this.x += this.vx;
                this.y += this.vy;
            });
            c.id = e.id;
            c.vx = 0;
            c.vy = 0;
            c.alpha = 0.3;
            c.ignore = false;
            c.friction = e.properties.friction == undefined? 0.5: e.properties.friction;
            if (e.name) c.name = e.name;
            if (e.type) c.type = e.type;
            c.$extend(e.properties);

            //常時実行スクリプト
            if (c.script) {
                var sc = "(function(app) {"+c.script+"})";
                var f = eval(sc);
                c.on('enterframe', f);
            }
            //当たり判定時実行スクリプト
            if (c.collision) {
                var sc = "(function(e, dir) {"+c.collision+"})";
                c.collisionScript = eval(sc);
            }
        }.bind(this));

        //イベント取得
        var events = tmx.getObjectGroup("event").objects;
        events.forEach(function(e) {
            var that = this;
            var x = e.x + (e.width || 16) / 2;
            var y = e.y + (e.height || 16) / 2;
            switch (e.type) {
                case "player":
                    if (e.name == "start") {
                        mapLayer.startPosition = {x: x, y: y};
                        this.player.x = x;
                        this.player.y = y;
                        this.player.scaleX = 1;
                        if (e.properties.direction == 180) this.player.scaleX = -1;
                    }
                    break;
                case "enemy":
                    if (qft.Enemy[e.name]) {
                        var enemy = qft.Enemy[e.name](this.parentScene, e.properties).addChildTo(mapLayer.enemyLayer).setPosition(x, y);
                        if (e.properties.dead) {
                            var sc = "(function(app) {"+e.properties.dead+"})";
                            var f = eval(sc);
                            enemy.on('dead', f);
                        }
                        //移動パス設定
                        if (e.properties.path) {
                            var path = null;
                            var id = e.properties.path;
                            for (var i = 0; i < events.length; i++) {
                                if (events[i].id == id) {
                                    path = events[i];
                                    break;
                                }
                            }
                            if (path) enemy.setPath(path, e.properties.loop || false);
                        }
                    } else {
                        console.warn("unknown enemy: "+e.name);
                    }
                    break;
                case "item":
                    qft.Item(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    break;
                case "itembox":
                    qft.ItemBox(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    break;
                case "door":
                    var door = qft.MapObject.Door(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    if (e.name == "clear") mapLayer.clearGate = door;
                    if (e.properties.script) {
                        var sc = "(function(app) {"+e.properties.script+"})";
                        var f = eval(sc);
                        door.on('enterframe', f);
                        door.stageController = this;
                        door.player = this.parentScene.player;
                        door.parentScene = this.parentScene;
                    }
                    break;
                case "block":
                    var block = qft.MapObject.Block(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    block.addCollision(mapLayer.collisionLayer);
                    break;
                case "floor":
                    var floor = qft.MapObject.Floor(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    floor.addCollision(mapLayer.collisionLayer);
                    if (e.properties.script) {
                        var sc = "(function(app) {"+e.properties.script+"})";
                        var f = eval(sc);
                        floor.on('enterframe', f);
                        floor.stageController = this;
                        floor.player = this.parentScene.player;
                        floor.parentScene = this.parentScene;
                    }
                    //移動パス設定
                    var path = null;
                    if (e.properties.moveType == 'path' && e.properties.path) {
                        var id = e.properties.path;
                        for (var i = 0; i < events.length; i++) {
                            if (events[i].id == id) {
                                path = events[i];
                                break;
                            }
                        }
                        if (path) {
                            floor.setPath(path.x, path.y, path.polyline, e.properties.loop);
                        }
                    }
                    break;
                case "check":
                    qft.MapObject.CheckIcon(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y).setAnimation(e.name);
                    break;
                case "message":
                    qft.MapObject.Message(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    break;
                case "event":
                    qft.MapObject.Event(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    break;
                case "gate":
                    var gate = qft.MapObject.Gate(this.parentScene, e).addChildTo(mapLayer.objLayer).setPosition(x, y);
                    if (e.properties.script) {
                        var sc = "(function(app) {"+e.properties.script+"})";
                        var f = eval(sc);
                        gate.on('enterframe', f);
                        gate.stageController = this;
                        gate.player = this.parentScene.player;
                        gate.parentScene = this.parentScene;
                    }
                    break;
                case "accessory":
                    var layer = e.properties.foreground? mapLayer.foregroundLayer: mapLayer.backgroundLayer;
                    switch (e.name) {
                        case "lamp":
                            qft.MapObject.Lamp(this.parentScene, e).addChildTo(layer).setPosition(x, y);
                            break;
                        case "bonfire":
                            qft.MapObject.Bonfire(this.parentScene, e).addChildTo(layer).setPosition(x, y);
                            break;
                        case "flame":
                            qft.MapObject.Flame(this.parentScene, e).addChildTo(layer).setPosition(x, y);
                            break;
                        case "candle":
                            qft.MapObject.Candle(this.parentScene, e).addChildTo(layer).setPosition(x, y);
                            break;
                        case "lanthanum":
                            qft.MapObject.Lanthanum(this.parentScene, e).addChildTo(layer).setPosition(x, y);
                            break;
                        case "candlelamp":
                            qft.MapObject.CandleLamp(this.parentScene, e).addChildTo(layer).setPosition(x, y);
                            break;
                        default:
                            console.warn("unknown map accessory: "+e.name);
                    }
                    break;
                case "npc":
                    qft.MapObject.npc(this.parentScene, e).addChildTo(mapLayer.enemyLayer).setPosition(x, y);
                    break;
                case "path":
                    break;
                default:
                    console.warn("unknown map object id:[" + e.id + "] type:[" + e.type + "] name:[" + e.name + "]");
            }
        }.bind(this));
        return mapLayer;
    },
});

/*
 *  stage10.js
 *  2017/09/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

//エンディングシーン
phina.define("qft.Stage10", {
    superClass: "qft.StageController",

    //ステージ番号
    stageNumber: 10,

    //タイムリミット
    timeLimit: FPS*60*5,

    //BGMアセット名
    bgm: "ending",

    //特殊ステージフラグ
    isEnding: true,

    init: function(parentScene, tmx) {
        this.superInit(parentScene, tmx);

        //マップ情報読み込み
        var tmx = phina.asset.AssetManager.get('tmx', "stage10");
        this.mapLayer[0] = this.createMap(tmx);

        //初期処理
        this.add(1, function() {
            //マップ表示設定
            this.limitWidth = true;
            this.limitHeight = true;
        });

        this.add(60, function() {
        });
    },
});

/*
 *  character.balloon.js
 *  2017/04/26
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Character.balloon", {
    superClass: "phina.display.Sprite",

    //寿命フレーム
    lifeSpan: 30,

    //アニメーション間隔
    animationInterval: 6,


    init: function(options) {
        this.superInit("balloon", 24, 32);

        this.pattern = options.pattern || "!";
        this.setAnimation(this.pattern);

        this.lifeSpan = options.lifeSpan || 60;
        this.animationInterval = options.animationInterval || 6;
        this.time = 0;

        //特殊パターン
        if (this.pattern == "anger2") {
            this.tweener.setUpdateType('fps').clear().by({y: -16, alpha: -1}, this.animationInterval, "easeInSine");
        }
    },

    update : function() {
        if (this.time % this.animationInterval == 0) this.frameIndex++;

        this.time++;
        if (this.time > this.lifeSpan) this.remove();
    },

    setAnimation: function(pattern) {
        switch (pattern) {
            case "...":
                this.setFrameTrimming(0, 0, 24, 128);
                break;
            case "?":
                this.setFrameTrimming(96, 32, 24, 32);
                break;
            case "!":
                this.setFrameTrimming(72, 64, 72, 32);
                break;
            case "zzz":
                this.setFrameTrimming(0, 0, 24, 32);
                break;
            case "stun":
                this.setFrameTrimming(144, 32, 48, 32);
                break;
            case "light":
                this.setFrameTrimming(144, 64, 48, 32);
                break;
            case "newtype":
                this.setFrameTrimming(144, 96, 72, 32);
                break;
            case "anger":
            case "anger1":
                this.setFrameTrimming(72, 96, 24, 32);
                break;
            case "anger2":
                this.setFrameTrimming(144, 128, 72, 32);
                break;
        }
    },
});

/*
 *  character.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Character", {
    superClass: "phina.display.DisplayElement",

    //マップオブジェクトID
    id: -1,

    //加速度
    vx: 0,
    vy: 0,

    //初期座標
    firstX: 0,
    firstY: 0,

    //重力加速度
    gravity: 0.9,

    //横移動減衰率
    friction: 0.5,

    //床移動減衰率
    floorFriction: 0.5,

    //反発係数
    rebound: 0,

    //ジャンプ中フラグ
    isJump: false,

    //スルーしたフロア
    throughFloor: null,

    //床上フラグ
    isOnFloor: false,

    //乗っているオブジェクト
    floorObject: null,

    //はしご上フラグ
    isOnLadder: false,

    //階段上フラグ
    isOnStairs: false,

    //はしご掴みフラグ
    isCatchLadder: false,

    //死亡フラグ
    isDead: false,

    //落下死亡フラグ
    isDrop: false,

    //気絶フラグ
    isStun: false,

    //操作停止時間
    stopTime: 0,

    //無敵フラグ
    isMuteki: false,

    //無敵時間
    mutekiTime: 0,

    //アニメーションフラグ
    isAnimation: true,

    //現在実行中アクション
    nowAnimation: "stand",

    //前フレーム実行アクション
    beforeAnimation: "",

    //アニメーション進行可能フラグ
    isAdvanceAnimation: true,

    //アニメーション変更検知フラグ
    isChangeAnimation: false,

    //アニメーション間隔
    animationInterval: 6,

    //地形無視
    ignoreCollision: false,

    //スクリーン内フラグ
    onScreen: false,

    //活動フラグ
    isActive: true,

    //影表示
    isShadow: false,
    shadowY: 0,

    //識別フラグ
    isPlayer: false,
    isEnemy: false,
    isItemBox: false,
    isItem: false,
    isBlock: false,
    isMapAccessory: false,

    //経過フレーム
    time: 0,

    init: function(parentScene, options) {
        this.superInit(options);
        this.parentScene = parentScene;
        this.boundingType = "rect";
        this.tweener.setUpdateType('fps');

        this.options = options || {};
        this.setupAnimation();

        this.id = options.id || -1;

        //当たり判定情報初期化
        if (!this.isMapAccessory) this.initCollision(options);

        //吹き出し
        var that = this;
        this.balloon = null;
        this.lastBalloon = "";
        this.balloonTime = 0;
        this.on('balloon', e => {
            if (this.isStun) return;
            if (this.time > this.balloonTime) this.lastBalloon = "";
            if (this.lastBalloonPattern == e.pattern && !e.force) return;
            if (this.balloon) this.balloon.remove();
            e.$safe({x: 0, y: -this.height/2-10});
            this.balloon = qft.Character.balloon({pattern: e.pattern, lifeSpan: e.lifeSpan, animationInterval: e.animationInterval})
                .addChildTo(this)
                .setPosition(e.x, e.y);
            this.balloon.on('removed', e => {
                that.balloon = null;
                that.flare('balloonend');
            });
            this.lastBalloonPattern = e.pattern;
            this.balloonTime = this.time + 120;
        });
        this.on('balloonerace', e => {
            if (this.balloon == null) return;
            this.balloon.remove();
            this.balloon = null;
            this.balloonTime = 0;
        });

        //気絶状態
        this.on('stun', e => {
            this.isStun = true;
            this.stopTime = e.power * 10;
            this.balloon = qft.Character.balloon({pattern: "stun", lifeSpan: this.stopTime})
                .addChildTo(this)
                .setPosition(0, -this.height/2-10);
            this.lastBalloon = e.pattern;
            this.balloonTime = this.time + 120;
        });

        this.on('enterframe', function(e) {
            if (this.parentScene.pauseScene) return;

            //初期座標の記録と初回フレーム処理
            if (this.time == 0) {
                this.firstX = this.x;
                this.firstY = this.y;
                this.firstFrame();
            }

            //画面内判定
            var ps = this.parentScene;
            if (ps.screenX-SC_W < this.x && this.x < ps.screenX + SC_W*2 && 
                ps.screenY-SC_H < this.y && this.y < ps.screenY + SC_H*2) {
                this.onScreen = true;
            } else {
                this.onScreen = false;
            }
            //画面外の場合は動作停止
//            if (!this.onScreen) return;

            //活動フラグ
            if (!this.isActive) return;

            this.x += this.vx;
            if (this.isOnFloor) {
                this.vx *= this.floorFriction;
            } else {
                this.vx *= this.friction;
            }

            if (this.isCatchLadder) {
                this.y += this.vy;
                this.vy = 0;
            } else {
                this.y += this.vy;
                this.vy += this.gravity;
                //落下速度上限
                if (this.vy > 20) this.vy = 20;
            }
            if (Math.abs(this.vx) < 0.01) this.vx = 0;
            if (Math.abs(this.vy) < 0.01) this.vy = 0;

            //当たり判定
            if (!this.isMapAccessory) {
                this.resetCollisionPosition();
                this.checkMapCollision();
            }

            //画面外落ち
            if (!this.isDead && this.y > this.parent.parent.map.height) this.dropDead();

            //アニメーション
            if (this.sprite && this.isAnimation && this.isAdvanceAnimation && this.time % this.animationInterval == 0) {
                this.index = (this.index+1) % this.frame[this.nowAnimation].length;
                //次フレーム番号が特殊指定の場合
                var next = this.frame[this.nowAnimation][this.index];
                if (next == "stop") {
                    //停止
                    this.index--;
                } else if (next == "remove") {
                    //リムーブ
                    this.remove();
                } else if (typeof next === "string") {
                    //指定アニメーションへ変更
                    this.setAnimation(next);
                } else {
                    this.sprite.frameIndex = next;
                }
            }

            //無敵時間処理
            if (this.mutekiTime > 0) {
                if (this.mutekiTime % 2 == 0) this.visible = !this.visible;
                this.mutekiTime--;
            } else {
                this.visible = true;
            }

            //操作停止時間
            this.stopTime--;
            if (this.stopTime < 0) this.stopTime = 0;

            //操作停止時間が終わったら気絶解除
            if (this.isStun && this.stopTime == 0) {
                this.isStun = false;
                this.flare('balloonerace');
            }

            if (this.balloon) this.balloon.scaleX = this.scaleX;

            //乗っている床の取得
            if (this.isOnFloor) {
                this.floorObject = this._collision[2].hit;
            } else {
                this.floorObject = null;
            }

            //影処理
            if (this.shadowSprite) {
                this.shadowSprite.x = this.x;
                this.shadowSprite.y = this.shadowY;
            }

            this.time++;
            this.beforeAnimation = this.nowAnimation;
        });

        this.on('added', () => {
            this.one('enterframe', () => {
                if (this.isShadow && !this.ignoreCollision) this.setupShadow();
            });
        });

        this.on('removed', () => {
            if(this.shadowSprite) this.shadowSprite.remove();
        });
    },

    //一回目のenterframeで一度だけ呼ばれる
    firstFrame: function() {
    },

    //影表示セットアップ
    setupShadow: function() {
        var that = this;
        var sc = this.width / 24;
        if (sc < 1) sc += 0.2;
        this.shadowSprite = phina.display.Sprite("shadow", 24, 8)
            .addChildTo(this.parentScene.shadowLayer)
            .setAlpha(0.5)
            .setScale(sc, 1.0);
        this.shadowSprite.update = function() {
            this.alpha = 0.5;
            if (that.alpha < 0.5) this.alpha = that.alpha;
        }
    },

    //当たり判定情報初期化
    initCollision: function(options) {
        //当り判定用（0:上 1:右 2:下 3:左）
        var w = Math.floor(this.width/4);
        var h = Math.floor(this.height/4);
        this._collision = [];
        this._collision[0] = phina.display.RectangleShape({width: w, height: 2});
        this._collision[1] = phina.display.RectangleShape({width: 2, height: h});
        this._collision[2] = phina.display.RectangleShape({width: w, height: 2});
        this._collision[3] = phina.display.RectangleShape({width: 2, height: h});
        this.collisionResult = null;

        //当たり判定チェック位置オフセット
        this.offsetCollisionX = options.offsetCollisionX || 0;
        this.offsetCollisionY = options.offsetCollisionY || 0;

        //当たり判定情報再設定
        this.setupCollision();

        //当たり判定デバッグ用
        if (DEBUG_COLLISION) {
            this.one('enterframe', e => {
                this._collision[0].addChildTo(this.parentScene.objLayer);
                this._collision[1].addChildTo(this.parentScene.objLayer);
                this._collision[2].addChildTo(this.parentScene.objLayer);
                this._collision[3].addChildTo(this.parentScene.objLayer);
                this._collision[0].alpha = 0.3;
                this._collision[1].alpha = 0.3;
                this._collision[2].alpha = 0.3;
                this._collision[3].alpha = 0.3;
                //ダメージ当たり判定表示
                var c = phina.display.RectangleShape({width: this.width, height: this.height}).addChildTo(this);
                c.alpha = 0.3;
            });
            this.one('removed', e => {
                this._collision[0].remove();
                this._collision[1].remove();
                this._collision[2].remove();
                this._collision[3].remove();
                });
        }
        return this;
    },

    //画面外落ち
    dropDead: function() {
        this.isDead = true;
        this.isDrop = true;
        this.vx = 0;
        this.vy = -10;
        this.tweener.clear()
            .wait(60)
            .call(function(){
                this.flare('dead');
                this.remove();
            }.bind(this));
        return this;
    },

    //ノックバックモーション
    knockback: function(power, direction) {
        power = power || 0;
        if (power == 0) return;
        if (direction === undefined) direction = (this.direction + 180) % 360;

        var back = 32 + Math.floor(power / 10);
        var sx = Math.cos(direction.toRadian());
        var sy = Math.sin(direction.toRadian());

        //ノックバック先に壁が無いかチェック
        var chk = this.checkMapCollision2(this.x + sx * back, this.y + sy * back, 8, 8);
        if (chk) {
            //壁に当たる所までバックする
            var c = chk[0];
            switch (direction) {
                case 0:
                    back = (c.x - c.width / 2) - this.x;
                    back *= 0.8;
                    break;
                case 180:
                    back = this.x - (c.x + c.width / 2);
                    back *= 0.8;
                    break;
                default:
            }
        }

        this.tweener.clear().by({x: sx * back, y: sy * back}, 10, "easeOutElastic");
        this.vx = 0;
        this.vy = 0;
        return this;
    },

    //地形当たり判定
    checkMapCollision: function() {
        if (this.ignoreCollision) return this;

        this._collision[0].hit = null;
        this._collision[1].hit = null;
        this._collision[2].hit = null;
        this._collision[3].hit = null;

        this.isOnLadder = false;
        this.isOnStairs = false;

        if (this.onScreen && this.shadowSprite) {
            this.shadowY = 99999;
            var p1 = phina.geom.Vector2(this.x, this.y);
            var p2 = phina.geom.Vector2(this.x, this.y + 128);
            this.shadowSprite.visible = false;
        }

        //地形接触判定
        this.parentScene.collisionLayer.children.forEach(e => {
            if (this.isDrop) return;
            if (e.ignore || e == this.throughFloor) return;
            if (e.type == "ladder" || e.type == "stairs") return;

            //上側
            if (this.vy < 0  && e.hitTestElement(this._collision[0])) this._collision[0].hit = e;
            //下側
            if (this.vy >= 0 && e.hitTestElement(this._collision[2])) this._collision[2].hit = e;
            //右側
            if (this.vx > 0  && e.hitTestElement(this._collision[1])) this._collision[1].hit = e;
            //左側
            if (this.vx < 0  && e.hitTestElement(this._collision[3])) this._collision[3].hit = e;

            if (this.onScreen && this.shadowSprite) {
                //キャラクターの下方向にレイを飛ばして直下の地面座標を取る
                var x = e.x - e.width / 2;
                var y = e.y - e.height / 2;
                var p3 = phina.geom.Vector2(x, y);
                var p4 = phina.geom.Vector2(x + e.width, y);
                if (y < this.shadowY && phina.geom.Collision.testLineLine(p1, p2, p3, p4)) {
                    this.shadowSprite.setPosition(this.x, y);
                    this.shadowSprite.visible = true;
                    this.shadowY = y;
                }
            }
        });

        if (this.isCatchLadder) this.shadowSprite.visible = false;

        //当たり判定結果反映
        this.collisionProcess();

        //はしごのみ判定
        this.parentScene.collisionLayer.children.forEach(e => {
            //梯子判定
            if (e.type == "ladder" || e.type == "stairs") {
                if (this.ladderCollision && e.hitTestElement(this.ladderCollision)) {
                    this.isOnLadder = true;
                    this.isOnStairs = (e.type == "stairs");
                }
                return;
            }
        });
        return this;
    },

    //当たり判定結果反映処理
    collisionProcess: function() {
        var w = Math.floor(this.width/2)+6;
        var h = Math.floor(this.height/2)+6;
        this.isOnFloor = false;

        //上側接触
        if (this._collision[0].hit && !this.isCatchLadder) {
            var ret = this._collision[0].hit;
            this.y = ret.y+ret.height*(1-ret.originY)+h;
            this.vy = 0;
            this.resetCollisionPosition();
            if (ret.collisionScript) {
                ret.collisionScript(this, 0);
            }
        }
        //下側接触
        if (this._collision[2].hit && !this.isCatchLadder) {
            var ret = this._collision[2].hit;
            this.y = ret.y-ret.height*ret.originY-h;
            this.x += ret.vx || 0;
            if (!this.isPlayer && ret.vy > 0) this.y += ret.vy || 0;

            this.isJump = false;
            this.isOnFloor = true;
            this.floorFriction = ret.friction == undefined? 0.5: ret.friction;

            this.throughFloor = null;
            if (this.rebound > 0) {
                this.isJump = true;
                this.vy = -this.vy * this.rebound;
            } else {
                this.vy = 0;
            }
            this.resetCollisionPosition();
            if (ret.collisionScript) {
                ret.collisionScript(this, 2);
            }
        }
        //右側接触
        if (this._collision[1].hit && !this.isCatchLadder) {
            var ret = this._collision[1].hit;
            this.x = ret.x-ret.width*ret.originX-w;
            this.vx = 0;
            this.resetCollisionPosition();
            if (ret.collisionScript) {
                ret.collisionScript(this, 1);
            }
        }
        //左側接触
        if (this._collision[3].hit && !this.isCatchLadder) {
            var ret = this._collision[3].hit;
            this.x = ret.x+ret.width*(1-ret.originX)+w;
            this.vx = 0;
            this.resetCollisionPosition();
            if (ret.collisionScript) {
                ret.collisionScript(this, 3);
            }
        }
        return this;
    },

    //地形当たり判定（特定地点チェックのみ）衝突したものを配列で返す
    checkMapCollision2: function(x, y, width, height) {
        x = x || this.x;
        y = y || this.y;
        width = width || 1;
        height = height || 1;
        var c = phina.display.DisplayElement({width: width, height: height}).setPosition(x, y);
        var ret = null;
        this.parentScene.collisionLayer.children.forEach(function(e) {
            if (e.type == "ladder" || e.type == "stairs") return;
            if (e.hitTestElement(c)) {
                if (ret == null) ret = [];
                ret.push(e);
            }
        });
        return ret;
    },

    //キャラクタ同士当たり判定（ブロックのみ）
    checkCharacterCollision: function() {
        if (this.ignoreCollision) return;
        if (this.isDrop) return;

        var ret = [];
        var that = this;
        this.parentScene.objLayer.children.forEach(function(e) {
            if (!e.isBlock) return;
            if (e.isDead) return;

            //上側
            if (that.vy < 0 && e.hitTestElement(that._collision[0])) {
                that.y = e.y+e.height*(1-e.originY)+16;
                that.vy = 1;
                ret[0] = e;
                that.resetCollisionPosition();
            }
            //下側
            if (that.vy > 0 && e.hitTestElement(that._collision[2])) {
                that.y = e.y-e.height*e.originY-16;
                that.vx = e.vx;
                that.vy = 0;
                that.isJump = false;
                that.isOnFloor = true;
                that.throughFloor = null;
                ret[2] = e;
                if (that.rebound > 0) {
                    that.isJump = true;
                    that.vy = -that.vy * that.rebound;
                } else {
                    that.vy = 0;
                }
                that.resetCollisionPosition();
            }
            //右側
            if (that.vx > 0 && e.hitTestElement(that._collision[1])) {
                that.x = e.x-e.width*e.originX-10;
                that.vx = 0;
                ret[1] = e;
                that.resetCollisionPosition();
            }
            //左側
            if (that.vx < 0 && e.hitTestElement(that._collision[3])) {
                that.x = e.x+e.width*(1-e.originX)+10;
                that.vx = 0;
                ret[3] = e;
                that.resetCollisionPosition();
            }
        });
        return ret;
    },

    //当たり判定用エレメントの再設定
    setupCollision: function() {
        return this;
    },

    //当たり判定用エレメントの位置再セット
    resetCollisionPosition: function() {
        var w = Math.floor(this.width/2) + 6 + this.offsetCollisionX;
        var h = Math.floor(this.height/2)+ 6 + this.offsetCollisionY;
        this._collision[0].setPosition(this.x, this.y - h);
        this._collision[1].setPosition(this.x + w, this.y);
        this._collision[2].setPosition(this.x, this.y + h);
        this._collision[3].setPosition(this.x - w, this.y);
        return this;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [13, 14];
        this.frame["jump"] = [0, "stop"];
        this.frame["walk"] = [0];
        this.frame["up"] =   [0];
        this.frame["down"] = [0];
        this.frame["attack"] = [0, "stop"];
        this.index = 0;
        return this;
    },

    setAnimation: function(animName) {
        if (!this.frame[animName]) return;
        if (animName == this.nowAnimation) return;
        this.nowAnimation = animName;
        this.index = -1;
        this.isChangeAnimation = true;
        return this;
    },

    //プレイヤーからの直線距離
    getDistancePlayer: function() {
        var x = this.x-this.parentScene.player.x;
        var y = this.y-this.parentScene.player.y;
        return Math.sqrt(x*x+y*y);
    },

    //オブジェクト間の直線距離
    getDistance: function(element) {
        var x = this.x - element.x;
        var y = this.y - element.y;
        return Math.sqrt(x*x+y*y);
    },

    //自分と他エレメントを結ぶ直線の角度（弧度法）
    getAngle: function(element) {
        var p1 = phina.geom.Vector2(this.x, this.y);
        var p2 = phina.geom.Vector2(element.x, element.y);
        var p = p2.sub(p1);
        return p.toDegree();
    },

    //自分と他エレメントを結ぶ直線の角度（ラジアン）
    getAngleRadian: function(element) {
        var p1 = phina.geom.Vector2(this.x, this.y);
        var p2 = phina.geom.Vector2(element.x, element.y);
        var p = p2.sub(p1);
        return p.toAngle();
    },

    //物理現象情報のみオブジェクトで取得
    getPhysics: function() {
        return {
            vx: this.vx,
            vy: this.vy,
            gravity: this.gravity,
            friction: this.friction,
            rebound: this.rebound,
        };
    },

    //移動パスの設定
    setPath: function(path, loop) {
        this.path = [];
        this.loop = loop;

        //パス情報の作成
        var sum = 0;
        var ptb = null;
        for (var i = 0; i < path.polyline.length; i++) {
            var pt = phina.geom.Vector2(path.x + path.polyline[i].x, path.y + path.polyline[i].y);
            if (i > 0) {
                sum += Math.floor(ptb.distance(pt));
            }
            pt.time = sum;
            this.path.push(pt);
            ptb = pt;
        }

        //ループ有り指定の場合、始点の座標を終点に加える
        if (loop) {
            var end = phina.geom.Vector2(path.x + path.polyline[path.polyline.length - 1].x, path.y + path.polyline[path.polyline.length - 1].y);
            var start = phina.geom.Vector2(path.x + path.polyline[0].x, path.y + path.polyline[0].y);
            sum += Math.floor(start.distance(end));
            start.time = sum;
            this.path.push(start);
        }
        this.path.maxTime = sum;

        return this;
    },

    //パス座標の取得
    getPathPosition: function(time) {
        if (!this.path || time < 0) return null;
        time %= this.path.maxTime;

        var len = this.path.length;
        for (var i = 0; i < len; i++) {
            var p = this.path[i];
            if (time == p.time) return p;
            if (time < p.time) {
                var p2 = this.path[i - 1];
                var t = (time - p2.time) / (p.time - p2.time);
                return phina.geom.Vector2.lerp(p2, p, t);
            }
        }
        return null;
    },
});

/*
 *  effect.js
 *  2017/01/12
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Effect", {
    superClass: "phina.display.DisplayElement",

    //インデックス更新間隔
    interval: 2,

    //現在インデックス
    index: 0,

    //開始インデックス
    startIndex: 0,

    //最大インデックス
    maxIndex: 8,

    //アニメーション進行可能フラグ   
    isAdvanceAnimation: true,

    //経過フレーム
    time: 0,

    defaultOptions: {
        name: "explode",
        assetName: "effect",
        loop: false,
        position: {x: 0, y: 0},
        origin: {x: 0.5, y: 0.5},
        rotation: 0,
        alpha: 1.0,
        scale: {x: 1.0, y: 1.0},
        blendMode: "source-over",
    },

    init: function(parentScene, options) {
        this.superInit();

        this.options = (options || {}).$safe(this.defaultOptions);
        this.options.$extend(qft.EffectData.get(this.options.name));
        this.setup();

        this.on('enterframe', function() {
            this.time++;
            if (this.time % this.interval == 0 && this.isAdvanceAnimation) {
                this.sprite.frameIndex++;
                if (this.sprite.frameIndex == 0 || this.sprite.frameIndex == this.maxIndex) {
                    if (this.options.loop) {
                        this.sprite.frameIndex = this.startIndex;
                    } else {
                        this.remove();
                    }
                    this.flare('animationend');
                }
            }
        });
    },

    setup: function() {
        var op = this.options;
        this.sprite = phina.display.Sprite(op.assetName, op.width, op.height)
            .setPosition(op.position.x, op.position.y)
            .setOrigin(op.origin.x, op.origin.y)
            .setScale(op.scale.x, op.scale.y)
            .setRotation(op.rotation)
            .addChildTo(this);
        if (op.trimming) {
            var t = op.trimming;
            this.sprite.setFrameTrimming(t.x, t.y, t.width, t.height);
        }
        this.startIndex = op.startIndex;
        this.maxIndex = op.maxIndex;
        this.sprite.alpha = op.alpha;
        this.sprite.frameIndex = this.startIndex;
    },
});

phina.define("qft.EffectData", {
    _static: {
        get: function(name) {
            switch (name) {
                case "explode_small":
                    return {
                        width: 16,
                        height: 16,
                        interval: 2,
                        startIndex: 8,
                        maxIndex: 15,
                        trimming: {x: 256, y: 256, width: 128, height: 32},
                    };
                case "explode_small2":
                    return {
                        width: 16,
                        height: 16,
                        interval: 4,
                        startIndex: 0,
                        maxIndex: 7,
                        trimming: {x: 256, y: 256, width: 128, height: 32},
                    };
                case "explode":
                    return {
                        width: 64,
                        height: 64,
                        interval: 1,
                        startIndex: 0,
                        maxIndex: 8,
                        trimming: {x: 0, y: 0, width: 512, height: 128},
                    };
                case "explode_large":
                    return {
                        width: 48,
                        height: 48,
                        interval: 4,
                        startIndex: 0,
                        maxIndex: 7,
                        trimming: {x: 0, y: 0, width: 512, height: 128},
                    };
                case "explode_ground":
                    return {
                        width: 32,
                        height: 48,
                        interval: 4,
                        startIndex: 0,
                        maxIndex: 7,
                        trimming: {x: 256, y: 192, width: 256, height: 48},
                    };
                case "smoke_small":
                    return {
                        width: 16,
                        height: 16,
                        interval: 5,
                        startIndex: 0,
                        maxIndex: 4,
                        trimming: {x: 128, y: 128, width: 64, height: 16},
                    };
                case "smoke":
                    return {
                        width: 24,
                        height: 24,
                        interval: 5,
                        startIndex: 0,
                        maxIndex: 5,
                        trimming: {x: 128, y: 160, width: 120, height: 24},
                    };
                case "smoke_large":
                    return {
                        width: 32,
                        height: 32,
                        interval: 5,
                        startIndex: 0,
                        maxIndex: 8,
                        trimming: {x: 256, y: 128, width: 128, height: 64},
                    };
                case "hit":
                    return {
                        assetName: "effect2",
                        width: 72,
                        height: 32,
                        interval: 5,
                        startIndex: 0,
                        maxIndex: 3,
                        trimming: {x: 0, y: 0, width: 72, height: 128},
                    };
                default:
                    return {};
            }
        }
    }
});

/*
 *  enemy.adventurer.js
 *  2017/08/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

//冒険者
phina.define("qft.Enemy.Adventurer", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 100,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 192,

    //視野角
    viewAngle: 360,

    //得点
    point: 10000,

    //アニメーション間隔
    animationInterval: 6,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_JEWEL,

    //レアドロップ率（％）
    rareDropRate: 3,
    rareDropItem: ITEM_JEWELBOX,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 24, height: 20});
        this.superInit(parentScene, options);

        //武器用スプライト
        this.weapon = phina.display.Sprite("weapons", 24, 24)
            .addChildTo(this)
            .setFrameIndex(10 + Math.min(9, this.level))
            .setOrigin(1, 1)
            .setPosition(-3, 3);
        this.weapon.alpha = 0;
        this.weapon.tweener.setUpdateType('fps');
        this.weapon.kind = "sword";
        this.weapon.scaleX = -1;
        this.weapon.scaleY = -1;

        //表示用スプライト
        if (this.black) {
            this.sprite = phina.display.Sprite("player1Black", 32, 32).addChildTo(this);
        } else {
            this.sprite = phina.display.Sprite("player1", 32, 32).addChildTo(this);
        }
        this.sprite.scaleX = -1;

        this.hp += this.level * 5;
        this.power += this.level * 5;
        this.point += this.level * 1000;

        this.setAnimation("walk");
        this.setupLifeGauge();

        this.direction = 0;
        this.isAttack = false;
        this.attackInterval = 30;

        //行動フェーズ
        this.phase = "wander";

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        var player = this.parentScene.player;
        var look = this.isLookPlayer();
        var distance = this.getDistancePlayer();

        //待機状態
        if (this.phase == "wait") {
            this.isAdvanceAnimation = false;
            if (look) {
                this.flare('balloon', {pattern: "!", lifeSpan: 15});
                this.phase = "approach";
            }
        } else {
            this.isAdvanceAnimation = true;
        }

        //徘徊
        if (this.phase == "wander") {
            if (look) {
                this.flare('balloon', {pattern: "!", lifeSpan: 15});
                this.phase = "approach";
            } else {
                this.roundtripAlgorithm_ground(distance, look);
            }
        }

        //プレイヤー発見後接近
        if (this.phase == "approach") {
            if (this.x < player.x) {
                this.vx = 3;
            } else {
                this.vx = -3;
            }
            if (!look) {
                this.phase = "lost";
                this.chaseTime = 150;
            }
            if (distance < 52 && this.attackInterval == 0) this.phase = "attack";
        }

        //プレイヤー見失い
        if (this.phase == "lost") {
            this.chaseTime--;
            if (this.x < player.x) {
                this.vx = 3;
            } else {
                this.vx = -3;
            }
            if (this.chaseTime < 0) {
                this.chaseTime = 0;
                this.flare('balloon', {pattern: "..."});
                this.phase = "wait";
            }
        }

        //攻撃
        if (this.phase == "attack") {
            this.attack();
            this.attackInterval = 30;
        } else if (this.phase != "attacking") {
            if (this.isOnFloor) {
                this.setAnimation("walk");
            } else {
                this.setAnimation("jump");
            }
        }

        this.attackInterval--;
        if (this.attackInterval < 0) this.attackInterval = 0;
    },

    //攻撃
    attack: function() {
        this.animationInterval = 2;
        this.setAnimation("attack");
        this.phase = "attacking";

        //攻撃判定
        var that = this;
        var atk = qft.EnemyAttack(this.parentScene, {width: 24, height: 24, power: 20 + this.level * 5})
            .addChildTo(this.parentScene.enemyLayer)
            .setPosition(this.x + this.scaleX * 18, this.y)
            .setAlpha(0.0);
        if (DEBUG_COLLISION) atk.setAlpha(0.3);
        atk.master = this;
        atk.tweener.setUpdateType('fps');
        atk.update = function() {
            this.x = that.x + that.scaleX * 18;
        }

        app.playSE("attack");
        this.weapon.tweener.clear()
            .set({rotation: 200, alpha: 1.0})
            .to({rotation: 360}, 6)
            .fadeOut(1)
            .call(() => {
                this.animationInterval = 6;
                this.setAnimation("walk");
                this.phase = "approach";
                atk.remove();
            });
    },

    //飛び道具弾き
    guard: function() {
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [13, 14];
        this.frame["jump"] = [36, "stop"];
        this.frame["walk"] = [ 3,  4,  5,  4];
        this.frame["up"] =   [ 9, 10, 11, 10];
        this.frame["down"] = [ 0,  1,  2,  1];
        this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
        this.frame["defense"] = [ 41, 42, 43, 44, "stop"];
        this.frame["damage"] = [ 18, 19, 20];
        this.frame["drop"] = [18, 19, 20];
        this.frame["dead"] = [18, 19, 20, 33, 34, 35, "stop"];
        this.frame["clear"] = [24, 25, 26];
        this.frame["stun"] = [ 18, 19, 20];
        this.index = 0;
        return this;
    },
});

/*
 *  enemy.archdemon.js
 *  2017/05/01
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アークデーモン
phina.define("qft.Enemy.ArchDemon", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 100,

    //防御力
    deffence: 10,

    //攻撃力
    power: 30,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 180,

    //アニメーション間隔
    animationInterval: 15,

    //得点
    point: 5000,

    //飛行モード
    flying: false,
    flyingPhase: 0, //行動フェーズ
    flyingX: 0,     //飛行開始Ｘ座標

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_JEWEL,

    //レアドロップ率（％）
    rareDropRate: 2,
    rareDropItem: ITEM_JEWELBOX,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 35, height: 30});
        if (options.size) {
            var size = options.size || 1;
            options.width = size * 35;
            options.height = size * 30;
        }
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01x2", 24*2, 32*2).addChildTo(this);
        this.sprite.setFrameTrimming(216*2, 640*2, 72*2, 128*2).setPosition(0, -10);
        if (options.size) {
            var size = options.size || 1;
            this.sprite.setScale(size).setPosition(0, size * -12);
        }

        this.hp += this.level * 5;
        this.power += this.level * 5;
        this.point += this.level * 1000;

        this.setAnimation("walk");
        this.setupLifeGauge();

        this.phase = 0;
        this.direction = 0;
        this.isAttack = false;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        //プレイヤー情報
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        //進行方向決定
        if (this.isOnFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 1;
            } else {
                this.vx = -1;
            }
        }

        //プレイヤー発見後一定時間追跡する
        if (look) {
            this.chaseTime = 120;
            this.stopTime = 0;
            this.vx *= 3;
            this.flare('balloon', {pattern: "!"});
        }
        if (this.chaseTime > 0 && !this.isAttack && this.turnTime == 0) {
            if (this.x > pl.x) {
                if (this.direction == 0) this.turnCount++;
                this.direction = 180;
            } else {
                if (this.direction == 180) this.turnCount++;
                this.direction = 0;
            }
            this.turnTime = 15;
            if (look) this.turnCount = 0;
            //プレイヤーを見失った状態で三回振り返った場合は追跡終了
            if (this.turnCount > 3) {
                this.flare('balloon', {pattern: "?"});
                this.stopTime = 30;
                this.chaseTime = 0;
            }
        }
        //一定距離以上離れたら追跡解除
        if (dis > 512) this.chaseTime = 0;

        if (this.isOnFloor) {
            //崖っぷちで折り返す
            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) {
                this.direction = 180;
                this.chaseTime = 0;
            } else if (this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) {
                this.direction = 0;
                this.chaseTime = 0;
            }

            //壁に当たったら折り返す
            if (this._collision[1].hit) {
                this.direction = 180;
                this.chaseTime = 0;
            } else if (this._collision[3].hit) {
                this.direction = 0;
                this.chaseTime = 0;
            }

            //プレイヤーへの攻撃
            if (look && !this.isAttack && !this.isJump) {
                if (dis > 128) {
                    this.firebreath();
                } else {
                    this.exploding();
                }
            }
        }

        if (this.chaseTime == 30) this.flare('balloon', {pattern: "?"});
    },

    //火球を吐く
    fireball: function() {
        this.isAttack = true;
        this.stopTime = 30;
        this.sprite.tweener.clear()
            .wait(10)
            .call(() => {
                this.parentScene.spawnEnemy(this.x, this.y, "Bullet", {explode: true, rotation: this.getPlayerAngle(), power: 30});
            })
            .wait(45)
            .call(() => {
                this.isAttack = false;
            });
    },

    //炎を吐く
    firebreath: function() {
        this.isAttack = true;
        this.stopTime = 60;
        this.sprite.tweener.clear()
            .wait(10)
            .wait(60)
            .call(() => {
                this.isAttack = false;
            });

        var rot = (this.scaleX == 1)? 0: 180;
        var ct = 0;
        var tw = phina.accessory.Tweener().attachTo(this)
            .setUpdateType('fps')
            .call(() => {
                var b = this.parentScene.spawnEnemy(this.x + 24 * this.scaleX, this.y-8, "Bullet", {type: "explode", power: 10, rotation: this.getPlayerAngle(), velocity: 5});
                b.setScale(0.1);
                b.tweener.clear().setUpdateType('fps').to({scaleX: 1, scaleY: 1}, 10);
                ct++;
                if (ct == 6 || this.attackCancel) {
                    tw.remove();
                    this.isAttackCancel = false;
                }
            })
            .wait(5)
            .setLoop(true);
    },

    //爆発
    exploding: function() {
        app.playSE("bomb");
        this.isAttack = true;
        this.stopTime = 60;
        this.sprite.tweener.clear()
            .fadeIn(15)
            .wait(45)
            .call(() => {
                this.isAttack = false;
            });

        var rot = (this.scaleX == 1)? 0: 180;
        var ct = 0;
        var tw = phina.accessory.Tweener().attachTo(this)
            .setUpdateType('fps')
            .call(() => {
                var rad = rot.toRadian();
                var ex = Math.cos(rad) * 16;
                var ey = Math.sin(rad) * 16;
                this.parentScene.spawnEnemy(this.x + ex, this.y + ey, "Bullet", {type: "explode", power: 10, rotation: rot, velocity: 3});
                rot += 22.5;
                ct++;
                if (ct == 16 || this.attackCancel) {
                    tw.remove();
                    this.isAttackCancel = false;
                }
            })
            .wait(1)
            .setLoop(true);
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [3, 4, 5, 4];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },
});

/*
 *  enemy.archknight.js
 *  2017/05/18
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アークナイト
phina.define("qft.Enemy.ArchKnight", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 70,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 192,

    //視野角
    viewAngle: 90,

    //得点
    point: 5000,

    //アニメーション間隔
    animationInterval: 10,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_JEWEL,

    //レアドロップ率（％）
    rareDropRate: 3,
    rareDropItem: ITEM_LONGSWORD,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 25, height: 40});
        this.superInit(parentScene, options);

        //武器スプライト
        this.weapon = phina.display.Sprite("weapons", 24, 24)
            .addChildTo(this)
            .setFrameIndex(10 + Math.min(9, this.level))
            .setOrigin(1, 1)
            .setPosition(-6, 3)
            .setScale(-1.5, 1.5)
            .setRotation(430);
        this.weapon.tweener.setUpdateType('fps');
        this.weapon.kind = "sword";
        if (options.weapon == "ax") {
            this.weapon.setFrameIndex(20 + Math.min(9, this.level));
            this.weapon.kind = "ax";
        }
        if (options.weapon == "spear") {
            this.weapon.setFrameIndex(30 + Math.min(9, this.level));
            this.weapon.kind = "spear";
        }

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster02x2", 24*2, 32*2).addChildTo(this);
        this.sprite.setFrameTrimming(216*2, 128*2, 72*2, 128*2);
        this.sprite.setPosition(0, -5);

        this.hp += this.level * 5;
        this.power += this.level * 5;
        this.point += this.level * 1000;

        this.setAnimation("walk");
        this.setupLifeGauge();

        this.direction = 0;
        this.isAttack = false;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        //プレイヤーとの距離
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        //プレイヤー発見後一定時間追跡する
        if (this.chaseTime > 0 && !this.isAttack && this.turnTime == 0) {
            if (this.x > pl.x) {
                if (this.direction == 0) this.turnCount++;
                this.direction = 180;
            } else {
                if (this.direction == 180) this.turnCount++;
                this.direction = 0;
            }
            this.turnTime = 15;
            if (look) this.turnCount = 0;
            //プレイヤーを見失った状態で三回振り返った場合は追跡終了
            if (this.turnCount > 3) {
                this.flare('balloon', {pattern: "?"});
                this.stopTime = 30;
                this.chaseTime = 0;
            }
        }

        //一定距離以上離れたら追跡解除
        if (dis > 512) this.chaseTime = 0;

        if (this.isOnFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 0.5;
            } else {
                this.vx = -0.5;
            }
            if (this.isJump) this.vx *= 2;
        }

        if (look) {
            this.chaseTime = 120;
            this.stopTime = 0;
            this.flare('balloon', {pattern: "!"});
        } else {
            if (this.chaseTime == 0) this.flare('balloonerace');
        }
        if (this.chaseTime > 0) this.vx *= 3;

        if (this.isOnFloor) {
            //これ以上進めない場合は折り返す
            var isReturnWall = false;
            var isReturnCliff = false;
            if (this.vx > 0) {
                if (this._collision[1].hit) isReturnWall = true;
                if (this.checkMapCollision2(this.x+5, this.y+40, 5, 5) == null) isReturnCliff = true;
            } else if (this.vx < 0) {
                if (this._collision[3].hit) isReturnWall = true;
                if (this.checkMapCollision2(this.x-5, this.y+40, 5, 5) == null) isReturnCliff = true;
            }
            if (isReturnWall || isReturnCliff) {
                if (this.chaseTime > 0) {
                    //プレイヤー追跡中で段差がある場合は飛び越える
                    if (isReturnWall) {
                        if (this.direction == 0) {
                            if (this.x < pl.x) {
                                this.isJump = true;
                                this.vy = -10;
                            }
                        } else {
                            if (this.x > pl.x) {
                                this.isJump = true;
                                this.vy = -10;
                            }
                        }
                    }
                    //プレイヤー追跡中で崖がある場合は着地点があるか調べて飛び降りる
                    if (isReturnCliff) {
                        var jumpOk = false;
                        if (this.direction == 0) {
                            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 96)) jumpOk = true;
                        } else {
                            if (this.checkMapCollision2(this.x-5, this.y+20, 5, 96)) jumpOk = true;
                        }
                        if (jumpOk) {
                            this.isJump = true;
                            this.vy = -5;
                        } else {
                            //着地点が無い場合は諦めて折り返す
                            this.chaseTime = 0;
                            this.stopTime = 30;
                            this.turnWait = 15;
                            this.direction = (this.direction + 180) % 360;
                            this.vx = 0;
                            this.flare('balloon', {pattern: "..."});
                         }
                    }
                } else {
                    this.direction = (this.direction + 180) % 360;
                    this.vx *= -1;
                    this.turnWait = 1;
                }
            }

            //攻撃
            if (look && !this.isJump && dis < 64 && !this.isAttack) {
                this.attack();
            }

            //プレイヤー飛び道具を弾く
            if (look && !this.isAttack) {
                var that = this;
                //プレイヤーショットとの距離判定
                this.parentScene.playerLayer.children.forEach(function(e) {
                    if (e instanceof qft.PlayerAttack && e.isCollision && e.type == "arrow") {
                        if (that.getDistance(e) < 64) that.guard();
                    }
                }.bind(this));
            }
        }
        if (this.chaseTime == 30) this.flare('balloon', {pattern: "?"});
    },

    attack: function() {
        var that = this;
        var width = 24, height = 24;
        var atk = qft.EnemyAttack(this.parentScene, {width: 24, height: 48, power: 20 + this.level * 5})
            .addChildTo(this.parentScene.enemyLayer)
            .setPosition(this.x + this.scaleX * 18, this.y)
            .setAlpha(0.0);
        if (DEBUG_COLLISION) atk.setAlpha(0.3);
        atk.master = this;
        atk.tweener.setUpdateType('fps');
        atk.update = function() {
            this.x = that.x + that.scaleX * 18;
        }

        if (this.weapon.kind == "sword" || this.weapon.kind == "ax") {
            atk.isActive = false;
            this.weapon.tweener.clear()
                .to({rotation: 270}, 2)
                .call(function() {
                    atk.isActive = true;
                    that.isSuperArmor = true;
                    that.vx = 16 * that.scaleX;
                })
                .to({rotation: 430}, 6)
                .call(function() {
                    that.isAttack = false;
                    that.isSuperArmor = false;
                    atk.remove();
                });
        } else if (this.weapon.kind == "spear") {
            atk.width = 32;
            atk.height = 8;
            atk.setPosition(this.x + this.scaleX * 1, this.y);
            atk.tweener.clear().by({x: 20 * this.scaleX}, 10).by({x: -20 * this.scaleX}, 10);
            atk.isActive = false;

            this.weapon.tweener.clear()
                .set({rotation: 45, x: -20})
                .wait(6)
                .call(function() {
                    atk.isActive = true;
                    that.isSuperArmor = true;
                    that.vx = 32 * that.scaleX;
                })
                .by({x: 20}, 3)
                .by({x: -30}, 5)
                .call(function() {
                    that.isAttack = false;
                    that.isSuperArmor = false;
                    atk.remove();
                })
                .set({rotation: 430, x: -2});
        }
        this.isAttack = true;
        this.stopTime = 30;
    },

    //飛び道具弾き
    guard: function() {
        var that = this;
        var width = 24, height = 24;
        var atk = qft.EnemyAttack(this.parentScene, {width: 24, height: 48, power: 20 + this.level * 5})
            .addChildTo(this.parentScene.enemyLayer)
            .setPosition(this.x + this.scaleX * 18, this.y)
            .setAlpha(0.0);
        if (DEBUG_COLLISION) atk.setAlpha(0.3);
        atk.master = this;
        atk.tweener.setUpdateType('fps');
        atk.update = function() {
            this.x = that.x + that.scaleX * 18;
        }

        this.isMuteki = true;
        this.weapon.tweener.clear()
            .set({rotation: 430})
            .to({rotation: 300}, 3)
            .call(function() {
                that.vx = 4 * that.scaleX;
            })
            .to({rotation: 430}, 3)
            .call(function() {
                that.isAttack = false;
                that.isMuteki = false;
                atk.remove();
            });
        this.isAttack = true;
        this.stopTime = Math.min(0, 6 - this.level);
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [3, 4, 5, 4];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.frame["turn"] = [6, "walk"];
        this.index = 0;
    },
});

/*
 *  enemy.archmage.js
 *  2017/05/01
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アークメイジ
phina.define("qft.Enemy.ArchMage", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 50,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 256,

    //視野角
    viewAngle: 360,

    //得点
    point: 800,

    //重力加速度
    gravity: 0,

    //アイテムドロップ率（％）
    dropRate: 30,
    dropItem: ITEM_COIN,

    //レアドロップ率（％）
    rareDropRate: 5,
    rareDropItem: ITEM_BAG,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        //表示用スプライト
        var lv = Math.min(this.level, 3);
        this.sprite = phina.display.Sprite("monster03", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming((lv % 2) * 144 + 72, Math.floor(lv / 2) * 128, 72, 128);

        this.hp += this.level * 5;
        this.power += this.level * 2;
        this.point += this.level * 300;

        this.setAnimation("walk");
        this.animationInterval = 10;
        this.setupLifeGauge();

        this.direction = 0;
        this.speed = 1;
        this.phase = 0;
        this.isAttack = false;

        //接近戦経過時間
        this.nearCount = 0;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        var player = this.parentScene.player;
        var look = this.isLookPlayer();
        var distance = this.getDistancePlayer();

        //これ以上進めない場合は折り返す
        if (this._collision[1].hit) {
            this.direction = 180;
        } else if (this._collision[3].hit) {
            this.direction = 0;
        }

        //テリトリー指定
        if (this.territory) {
            //水平方向のみチェック
            var tx = this.x - this.firstX;
            if (Math.abs(tx) > this.territory) {
                if (tx > 0) {
                    this.direction = 180;
                } else {
                    this.direction = 0;
                }
            }
        }

        //通常フェーズでプレイヤーを発見したら警戒フェーズに移る
        if (this.phase == 0 && look) {
            this.flare('balloon', {pattern: "!"});
            this.phase = 1;
            this.speed = 0;
        }

        //プレイヤーが離れたら通常フェーズ
        if (this.phase != 0) {
            if (distance > 192 || !look) {
                this.flare('balloonerace');
                this.phase = 0;
                this.speed = 1;
                for (var i = 0; i < this.dagger.length; i++) {
                    this.dagger[i].phase = 0;
                }
            }
        }

        //通常
        if (this.phase == 0) {
            this.vx = this.speed;
            if (this.direction == 180) {
                this.vx *= -1;
            }
        } else {
            if (this.x < player.x) {
                this.scaleX = 1;
                this.direction = 0;
            } else {
                this.scaleX = -1;
                this.direction = 180;
            }
        }

        //警戒
        if (this.phase == 1) {
            if (this.balloon == null) this.flare('balloon', {pattern: "...", animationInterval : 15});
            if (distance < 192) this.phase = 2;
        }

        //攻撃
        if (this.phase == 2) {
            this.flare('balloonerace');
            for (var i = 0; i < this.dagger.length; i++) {
                this.dagger[i].isAttack = true;
            }
            if (distance < 92) this.phase = 3;
        }
        if (this.phase == 3) {
            this.phase++;
            this.flare('balloonerace');
            for (var i = 0; i < this.dagger.length; i++) {
                this.dagger[i].phase = 10;
            }
        }
        if (this.phase == 4 && this.time % 90 == 0) {
            this.isAttack = true;
        }

        if (this.isAttack) {
            this.isAttack = false;
            if (this.phase == 2) {
                var b = this.parentScene.spawnEnemy(this.x, this.y, "Bullet", {explode: true});
                b.rotation = this.getPlayerAngle() + Math.randint(-30, 30);
            }
            if (this.phase == 4) {
                for (var i = 0; i < 4; i++) {
                    var b = this.parentScene.spawnEnemy(this.x, this.y, "Bullet", {explode: true});
                    b.rotation = this.getPlayerAngle() + Math.randint(-60, 60);
                }
            }
        }

        if (distance < 96) {
            this.nearCount++;
            if (this.nearCount > 90) {
                this.teleport();
                this.nearCount = 0;
            }
        } else {
            this.nearCount -= 10;
            if (this.nearCount < 0) this.nearCount = 0;
        }
    },

    //テレポート
    teleport: function() {
        for (var i = 0; i < this.dagger.length; i++) {
            this.dagger[i].phase = 10;
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [0, 1, 2, 1];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },

    firstFrame: function() {
        //マジックダガー装備
        this.dagger = [];
        this.dagger[0] = this.parentScene.spawnEnemy(this.x, this.y, "MagicDagger", {parent: this, offsetX:  16, offsetY: -16, order: 0, level: this.level});
        this.dagger[1] = this.parentScene.spawnEnemy(this.x, this.y, "MagicDagger", {parent: this, offsetX: -16, offsetY: -16, order: 1, level: this.level});
        if (this.level > 2) this.dagger[2] = this.parentScene.spawnEnemy(this.x, this.y, "MagicDagger", {parent: this, offsetX: -32, offsetY: -8, order: 2, level: this.level});
        if (this.level > 3) this.dagger[3] = this.parentScene.spawnEnemy(this.x, this.y, "MagicDagger", {parent: this, offsetX:  32, offsetY: -8, order: 3, level: this.level});
    },
});

/*
 *  enemy.babydemon.js
 *  2017/01/13
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ベビーデーモン
phina.define("qft.Enemy.BabyDemon", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 40,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 90,

    //得点
    point: 500,

    //アイテムドロップ率（％）
    dropRate: 5,
    dropItem: ITEM_JEWEL,

    //レアドロップ率（％）
    rareDropRate: 2,
    rareDropItem: ITEM_JEWELBOX,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 20, height: 20});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster02", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 0, 72, 128);

        this.hp += this.level * 5;
        this.power += this.level * 2;
        this.point += this.level * 100;

        this.setAnimation("walk");
        this.animationInterval = 6;
        this.setupLifeGauge();

        this.direction = 0;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        //プレイヤーとの距離
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        //汎用追跡アルゴリズム
        this.chaseAlgorithm(dis, look);

        //プレイヤーが近くにいたら攻撃
        if (this.isOnFloor && look && !this.isJump && dis < 64) {
            //飛びかかる
            this.isJump = true;
            this.vy = -6;
            var pl = this.parentScene.player;
            if (this.x > pl.x) {
                this.direction = 180;
            } else {
                this.direction = 0;
            }
        }
        if (this.isOnFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 1;
            } else {
                this.vx = -1;
            }
        }
        if (look || this.chaseTime > 0) {
            this.vx *= 4;
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [3, 4, 5, 4];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },
});

/*
 *  enemy.bird.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//鳥
phina.define("qft.Enemy.Bird", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 30,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 256,

    //視野角
    viewAngle: 60,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 0,

    //得点
    point: 200,

    //属性ダメージ倍率
    damageArrow: 5,

    defaultOptions: {
        speed: 2,
        direction: 0,
        returnTime: 120,
    },

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_COIN,

    //レアドロップ率（％）
    rareDropRate: 3,
    rareDropItem: ITEM_BAG,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 18});
        options = options.$safe(this.defaultOptions);
        this.superInit(parentScene, options);

        //表示用スプライト
        var capLevel = Math.min(this.level, 4);
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(capLevel * 72, 0, 72, 128).setScale(1 + capLevel * 0.1);

        this.hp += this.level * 5;
        this.power += this.level * 1;
        this.point += this.level * 100;

        this.setAnimation("walk");
        this.animationInterval = 6;
        this.setupLifeGauge();

        this.isVertical = this.options.vertical || false;
        this.direction = this.options.direction || this.isVertical? 90: 0;
        this.speed = this.options.speed || 2;
        this.returnTime = this.options.returnTime || 120;
        this.bombInterval = this.options.bombInterval || 90;

        this.on('damaged', e => {
            if (this.isVertical) return;
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        //チェックする壁決定
        var chk = 0;
        if (!this.isVertical) chk = 1;

        //壁に当たるか一定時間経過で折り返し
        if (this._collision[chk].hit || this._collision[chk+2].hit || this.returnTime < 0) {
            this.direction = (this.direction + 180) % 360;
            this.returnTime = this.options.returnTime;
        }

        //プレイヤーをみつけたら加速
        if (this.isLookPlayer()) {
            this.speed = 4;
            this.returnTime -= 2;
        } else {
            this.speed = 2;
            this.returnTime--;
        }

        //移動
        var rad = this.direction.toRadian();
        this.vx = Math.cos(rad) * this.speed;
        this.vy = Math.sin(rad) * this.speed;

        //落し物
        if (this.onScreen && this.time % this.bombInterval == 0) {
            this.parentScene.spawnEnemy(this.x, this.y, "BirdBomb", {});
        }

        //向きの指定
        if (this.vx != 0) {
            if (this.vx > 0) {
                this.scaleX = 1;
            } else {
                this.scaleX = -1;
            }
        }
        if (this.isVertical && this.getDistancePlayer() < 256) {
            if (this.x < this.parentScene.player.x) this.scaleX = 1; else this.scaleX = -1;
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["walk"] = [3, 4, 5, 4];
        this.index = 0;
    },
});

//鳥の落し物
phina.define("qft.Enemy.BirdBomb", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 1,

    //防御力
    deffence: 10,

    //攻撃力
    power: 5,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 5, height: 5});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("bullet", 24, 32).addChildTo(this).setFrameIndex(72);

        this.setAnimation("normal");
        this.animationInterval = 6;
    },

    update: function() {
        if (this.isOnFloor) this.remove();
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["normal"] = [72, 73, 74, 73];
        this.index = 0;
    },

    dropDead: function() {
        this.isDead = true;
        this.isDrop = true;
        return this;
    },
});

/*
 *  enemy.bullet.js
 *  2017/01/13
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Enemy.Bullet", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 1,

    //寿命
    lifespan: 75,

    //速度
    velocity: 2,

    //加速度
    accel: 1.02,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 1.0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //地形無視
    ignoreCollision: true,

    //得点
    point: 0,

    //爆発フラグ
    explode: false,

    //影表示フラグ
    isShadow: false,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 20, height: 20});
        this.superInit(parentScene, options);

        this.type = options.type;
        this.power = options.power || this.power;
        this.rotation = options.rotation || 0;
        this.velocity = options.velocity || this.velocity;
        this.lifeSpan = options.lifeSpan || this.lifeSpan;

        //表示用スプライト
        switch (options.type) {
            case "explode":
                this.sprite = phina.display.Sprite("effect", 48, 48).addChildTo(this).setFrameTrimming(0, 192, 192, 96);
                this.animationInterval = 3;
                this.explode = false;
                this.ignoreCollision = true;
                this.isMuteki = true;
                this.pattern = "explode";
                break;
            default:
                this.sprite = phina.display.Sprite("bullet", 24, 32).addChildTo(this).setFrameIndex(9);
                this.animationInterval = 3;
                this.explode = options.explode || true;
                this.pattern = options.pattern || "pattern1";
                break;
        }

        this.setAnimation(this.pattern);

        this.on('dead', function() {
            if (this.explode) {
                this.parentScene.spawnEffect(this.x, this.y);
                app.playSE("bomb");
            }
        });
    },

    algorithm: function() {
        var rad = this.rotation.toRadian();
        this.vx = Math.cos(rad) * this.velocity;
        this.vy = Math.sin(rad) * this.velocity;
        this.velocity *= this.accel;
        if (this.vx > 1) this.sprite.scaleX = 1; else this.sprite.scaleX = -1;
        if (this.time > this.lifespan) this.remove();

        if (!this.ignoreCollision) {
            if (this._collision[0].hit ||
                this._collision[1].hit ||
                this._collision[2].hit ||
                this._collision[3].hit) this.flare('dead');
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["pattern1"] = [9, 10, 11, 10];
        this.frame["pattern2"] = [15, 16, 17, 16];
        this.frame["explode"] = [0, 1, 2, 3, 4, 5, 6, 7, "remove"];
        this.index = 0;
    },

    hit: function() {
        if (this.type == "explode") return;

        this.remove();
        this.flare('dead');
    },

    dropDead: function() {
        this.isDead = true;
        this.isDrop = true;
        this.vx = 0;
        this.vy = -10;
        return this;
    },
});

/*
 *  enemy.death.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//死神
phina.define("qft.Enemy.Death", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 30,

    //重力加速度
    gravity: 0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 20,

    //気絶確率
    stunPower: 30,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 180,

    //地形無視
    ignoreCollision: true,

    //ノックバックキャンセル
    isSuperArmor: true,

    //得点
    point: 500,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_STONE,

    //レアドロップ率（％）
    rareDropRate: 5,
    rareDropItem: ITEM_STONE,

    //属性ダメージ倍率
    damageFire: 2.0,
    damageIce: 0.8,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster02", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 128, 72, 128);

        this.hp += this.level * 5;
        this.power += this.level * 1;
        this.point += this.level * 100;

        this.setAnimation("move");
        this.animationInterval = 10;
        this.setupLifeGauge();

        this.direction = 0;
        this.isAttack = false;

        this.phase = 0;
        this.speed = 1;

        //行動パターン
        this.pattern = options.pattern || "linear";
        this.moveLength = options.length || 48;
        this.degree = 0;
        this.isVertical = false;

        //被ダメージ時処理
        this.on('damaged', e => {
            this.phase = 0;
        });

        this.tweener2 = phina.accessory.Tweener().attachTo(this);
    },

    algorithm: function() {
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        var rad = this.degree.toRadian();
        if (this.pattern == "linear") {
            if (this.isVertical) {
                this.vy = Math.cos(rad) * 2;
            } else {
                this.vx = Math.cos(rad) * 2;
            }
        }
        this.degree += 2;

        //徘徊モードの場合は適当に攻撃
        if (this.time % 90 == 0) this.isAttack = true;

        //攻撃
        if (this.isAttack) {
            this.isAttack = false;
            var b = this.parentScene.spawnEnemy(this.x, this.y, "DeathFlame", {pattern: 0});
            b.vy = -2;
            b.vx = 2 * this.scaleX;
            this.actionWait = 120;
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["move"] = [3, 4, 5, 4];
        this.frame["up"] = [6, 7, 6, 8];
        this.frame["down"] =   [0, 1, 0, 2];
        this.frame["attack"] = [3, 4, 5, 4];
        this.index = 0;
    },
});

//炎
phina.define("qft.Enemy.DeathFlame", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 10,

    //攻撃力
    power: 10,

    //重力加速度
    gravity: 0.1,

    //横移動減衰率
    friction: 0.98,

    //気絶確率
    stunPower: 20,

    //地形無視
    ignoreCollision: false,

    //無敵フラグ
    isMuteki: true,

    //攻撃当たり判定有効フラグ
    isAttackCollision: true,

    //寿命
    lifeSpan: 120,

    //影表示フラグ
    isShadow: false,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 20});
        this.superInit(parentScene, options);

        this.pattern = options.pattern || 0;
        this.lifeSpan = options.lifeSpan || 120;
        this.power += this.level * 5;

        this.setupAnimation(this.pattern);

        //表示用スプライト
        this.sprite = phina.display.Sprite("flame03", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 0, 144, 128).setFrameIndex(15 + this.pattern);

        this.setAnimation("appear");
        this.animationInterval = 3;

        this.direction = 0;
    },

    algorithm: function() {
        if (this.lifeSpan == 0) this.remove();
        if (this.lifeSpan < 30) {
            if (this.time % 2 == 0) this.visible = !this.visible;
        } else if (this.lifeSpan < 60){
            if (this.time % 5 == 0) this.visible = !this.visible;
        } else if (this.lifeSpan < 90) {
            if (this.time % 10 == 0) this.visible = !this.visible;
        }
        this.lifeSpan--;
    },

    setupAnimation: function(index) {
        index = index || 0;
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["appear"] = [15+index, 9+index,  3+index, 21+index, "normal"];
        this.frame["normal"] = [ 0+index, 6+index, 12+index, 18+index];
        this.index = 0;
    },

    dropDead: function() {
        this.isDead = true;
        this.isDrop = true;
        return this;
    },
});

/*
 *  enemy.demon.js
 *  2017/01/13
 *  @auther minimo  
 *  This Program is MIT license.
 */

//デーモン
phina.define("qft.Enemy.Demon", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 100,

    //防御力
    deffence: 10,

    //攻撃力
    power: 30,

    //視力
    eyesight: 192,

    //視野角
    viewAngle: 90,

    //得点
    point: 500,

    //アイテムドロップ率（％）
    dropRate: 5,
    dropItem: ITEM_JEWEL,

    //レアドロップ率（％）
    rareDropRate: 2,
    rareDropItem: ITEM_JEWELBOX,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 20, height: 20});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(Math.min(this.level, 4) * 72, 640, 72, 128)
            .setScale(1.5)
            .setPosition(0, -8);

        this.hp += this.level * 10;
        this.power += this.level * 3;
        this.point += this.level * 300;

        this.setAnimation("walk");
        this.animationInterval = 6;
        this.setupLifeGauge();

        this.direction = 0;
        this.isAttack = false;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        //プレイヤーとの距離
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        if (this.isOnFloor) {
            //崖っぷちで折り返す
            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 16) == null) {
                this.direction = 180;
            } else if (this.checkMapCollision2(this.x-5, this.y+20, 5, 16) == null) {
                this.direction = 0;
            }

            //壁に当たったら折り返す
            if (this._collision[1].hit) {
                this.direction = 180;
            } else if (this._collision[3].hit) {
                this.direction = 0;
            }

            //プレイヤーが近くにいたら攻撃
            if (look && !this.isJump && !this.isAttack) {
                if (dis > 96) {
                    //火を吐く
                    this.fireball();
                } else {
                    //飛びかかる
                    this.isJump = true;
                    this.vy = -6;
                    var pl = this.parentScene.player;
                    if (this.x > pl.x) {
                        this.direction = 180;
                    } else {
                        this.direction = 0;
                    }
                }
            }
        }
        if (this.isOnFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 1;
            } else {
                this.vx = -1;
            }
        }
        if (look) {
            this.vx *= 3;
            this.flare('balloon', {pattern: "!"});
        } else {
            if (dis < 256) {
                this.flare('balloon', {pattern: "?"});
            } else {
                this.flare('balloonerace');
            }
        }
    },

    //火球を吐く
    fireball: function() {
        this.isAttack = true;
        this.stopTime = 30;
        var tw = phina.accessory.Tweener().attachTo(this).setUpdateType('fps')
            .call(() => {
                this.parentScene.spawnEnemy(this.x, this.y, "Bullet", {explode: true, power: 10 + this.level * 5, rotation: this.getPlayerAngle()});
            })
            .wait(30)
            .call(() => {
                tw.remove();
                this.isAttack = false;
            });
    },

    //火を吐く
    flaming: function() {
        this.isAttack = true;
        this.stopTime = 60;
        this.sprite2.tweener.clear()
            .fadeIn(15)
            .wait(60)
            .call(() => {
                this.isAttack = false;
            })
            .fadeOut(15);

        var rot = (this.scaleX == 1)? 0: 180;
        var ct = 0;
        var tw = phina.accessory.Tweener().attachTo(this)
            .setUpdateType('fps')
            .call(() => {
                var b = this.parentScene.spawnEnemy(this.x + 24 * this.scaleX, this.y-8, "Bullet", {type: "explode", power: 10, rotation: this.getPlayerAngle(), velocity: 5});
                b.setScale(0.1);
                b.tweener.clear().setUpdateType('fps').to({scaleX: 1, scaleY: 1}, 10);
                ct++;
                if (ct == 6 || this.attackCancel) {
                    tw.remove();
                    this.isAttackCancel = false;
                }
            })
            .wait(5)
            .setLoop(true);
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [3, 4, 5, 4];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },
});

/*
 *  enemy.devil.js
 *  2017/04/25
 *  @auther minimo  
 *  This Program is MIT license.
 */

//悪魔
phina.define("qft.Enemy.Devil", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 30,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 0.0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 256,

    //視野角
    viewAngle: 360,

    //地形無視
    ignoreCollision: true,

    //得点
    point: 800,

    //属性ダメージ倍率
    damageArrow: 5,

    defaultOptions: {
        speed: 2,
        direction: 0,
        returnTime: 120,
    },

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_BAG,

    //レアドロップ率（％）
    rareDropRate: 5,
    rareDropItem: ITEM_STONE,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 18}).$safe(this.defaultOptions);
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster02", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(72, 0, 72, 128);

        this.hp += this.level * 10;
        this.power += this.level * 5;
        this.point += this.level * 100;

        this.setAnimation("stand");
        this.animationInterval = 6;
        this.setupLifeGauge();

        this.isVertical = this.options.vertical || false;
        this.direction = this.options.direction || this.isVertical? 90: 0;
        this.speed = this.options.speed || 2;
        this.returnTime = this.options.returnTime || 120;
        this.attackInterval = this.options.attackInterval || 90;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        //プレイヤー情報
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        //プレイヤーが近くにいたら寄っていく
        if (look && dis > 32) {
            var p1 = phina.geom.Vector2(this.x, this.y);
            var p2 = phina.geom.Vector2(pl.x, pl.y);
            var p = p2.sub(p1);
            p.normalize();
            this.vx = p.x * (1 + this.level * 0.2);
            this.vy = p.y * (1 + this.level * 0.2);

            //プレイヤーの方向を向く
            var angle = this.getPlayerAngle();
            if (angle > 315 || angle < 45) this.setAnimation('horizon');
            if ( 45 < angle && angle < 135) this.setAnimation('down');
            if (135 < angle && angle < 225) this.setAnimation('horizon');
            if (225 < angle && angle < 315) this.setAnimation('down');

            //一定以上近づいたら攻撃
            if (dis < 96) this.isAttack = true;

            this.flare('balloon', {pattern: "!"});
        } else {
            this.vx = 0;
            this.vy = 0;
            this.setAnimation("stand");
            this.flare('balloonerace');
        }

        if (this.vx > 0) {
            this.scaleX = 1;
        } else {
            this.scaleX = -1;
        }

        if (this.isAttack) {
            this.attack();
        }
    },

    attack: function() {
        this.stopTime = 30;
        this.isAttack = false;
        this.parentScene.spawnEnemy(this.x, this.y, "Bullet", {explode: true, power: 10 + this.level * 5, rotation: this.getPlayerAngle()});
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [6, 7, 8, 7];
        this.frame["up"] = [0, 1, 2, 1];
        this.frame["down"] = [5, 6, 7, 6];
        this.frame["horizon"] = [3, 4, 5, 4];
        this.index = 0;
    },
});

/*
 *  enemy.explode.js
 *  2017/07/01
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Enemy.Explode", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 1,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 0.98,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //地形無視
    ignoreCollision: true,

    //得点
    point: 0,

    //無敵フラグ
    isMuteki: true,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 20, height: 20});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("effect", 48, 48)
            .addChildTo(this)
            .setFrameTrimming(0, 192, 192, 96);
        this.animationInterval = 3;

        this.power = options.power || this.power;

        this.pattern = options.pattern || "pattern1";
        this.setAnimation(this.pattern);
        this.animationInterval = 3;
    },

    algorithm: function() {
        if (this.index == 8) this.remove();
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["pattern1"] = [0, 1, 2, 3, 4, 5, 6, 7, 8, "stop"];
        this.index = 0;
    },
});

/*
 *  enemy.firebird.js
 *  2016/03/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

//鳥
phina.define("qft.Enemy.FireBird", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 50,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 256,

    //視野角
    viewAngle: 90,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 0,

    //得点
    point: 300,

    //属性ダメージ倍率
    damageArrow: 5,
    damageFire: 0.5,
    damageIce: 2,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_COIN,

    //レアドロップ率（％）
    rareDropRate: 3,
    rareDropItem: ITEM_BAG,

    defaultOptions: {
        speed: 2,
        direction: 0,
        returnTime: 120,
    },

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16, offsetCollisionX: -6});
        options = options.$safe(this.defaultOptions);
        this.superInit(parentScene, options);


        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(288, 0, 72, 128);

        this.setAnimation("walk");
        this.animationInterval = 6;
        this.setupLifeGauge();

        this.isVertical = this.options.vertical || false;
        this.direction = this.options.direction || this.isVertical? 90: 0;
        this.speed = this.options.speed || 2;
        this.returnTime = this.options.returnTime || 120;
        this.bombInterval = this.options.bombInterval || 90;
        this.attackInterval = 0;
        this.attackCount = 99;
        this.isAttack = false;

        this.on('damaged', e => {
            if (this.isVertical) return;
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
        this.on('dead', function() {
            this.parentScene.spawnEffect(this.x, this.y);
            app.playSE("bomb");
        });
    },

    algorithm: function() {
        //チェックする壁決定
        var chk = 1;
        if (this.isVertical) chk = 0;

        //壁に当たるか一定時間経過で折り返し
        if (this._collision[chk].hit || this._collision[chk+2].hit || this.returnTime < 0) {
            this.direction = (this.direction + 180) % 360;
            this.returnTime = this.options.returnTime;
        }
        //移動
        var rad = this.direction.toRadian();
        this.vx = Math.cos(rad) * this.speed;
        this.vy = Math.sin(rad) * this.speed;
        this.returnTime--;
 
        //プレイヤーを見つけたら攻撃
        var lookPlayer = this.isLookPlayer();
        if (lookPlayer) {
            if (this.attackInterval == 0) {
                var b = this.parentScene.spawnEnemy(this.x, this.y+6, "Bullet", {pattern: "pattern2", explode: true, velocity: 3});
                b.rotation = this.getPlayerAngle();
                this.attackInterval = 90;
            }
        } else {
                this.attackInterval = 60;
        }

        //落し物
        if (this.onScreen && this.time % this.bombInterval == 0) {
            this.parentScene.spawnEnemy(this.x, this.y, "FireBirdBomb", {});
        }

        //向きの指定
        if (this.vx != 0) {
            if (this.vx > 0) {
                this.scaleX = 1;
            } else {
                this.scaleX = -1;
            }
        }
        if (this.isVertical && this.getDistancePlayer() < 256) {
            if (this.x < this.parentScene.player.x) this.scaleX = 1; else this.scaleX = -1;
        }

        if (this.attackInterval > 0) this.attackInterval--;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["walk"] = [3, 4, 5, 4];
        this.index = 0;
    },

    attack: function() {
    },
});

//鳥の落し物
phina.define("qft.Enemy.FireBirdBomb", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 1,

    //防御力
    deffence: 10,

    //攻撃力
    power: 5,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 5, height: 5});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("bullet", 24, 32).addChildTo(this).setFrameIndex(72);

        this.setAnimation("normal");
        this.animationInterval = 6;
    },

    update: function() {
        if (this.isOnFloor) {
            this.parentScene.spawnEffect(this.x, this.y, {name: "explode_ground"});
            if (this.onScreen) app.playSE("bomb");
            this.remove();
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["normal"] = [72, 73, 74, 73];
        this.index = 0;
    },

    dropDead: function() {
        this.isDead = true;
        this.isDrop = true;
        return this;
    },
});

/*
 *  enemy.flame.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//炎
phina.define("qft.Enemy.Flame", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 10,

    //攻撃力
    power: 10,

    //無敵フラグ
    isMuteki: true,

    //攻撃当たり判定有効フラグ
    isAttackCollision: true,

    //寿命
    lifeSpan: 120,

    //影表示フラグ
    isShadow: false,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 20});
        this.superInit(parentScene, options);

        this.pattern = options.pattern || 0;
        this.lifeSpan = options.lifeSpan || 120;
        this.power += this.level * 5;

        //表示用スプライト
        this.sprite = phina.display.Sprite("flame02", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(Math.min(this.pattern, 2) * 24 + 72, 0, 24, 128);

        this.setAnimation("normal");
        this.animationInterval = 3;

        this.direction = 0;
    },

    algorithm: function() {
        if (this.lifeSpan == 0) this.remove();
        if (this.lifeSpan < 30) {
            if (this.time % 2 == 0) this.visible = !this.visible;
        } else if (this.lifeSpan < 60){
            if (this.time % 5 == 0) this.visible = !this.visible;
        } else if (this.lifeSpan < 90) {
            if (this.time % 10 == 0) this.visible = !this.visible;
        }
        this.lifeSpan--;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["normal"] = [0, 1, 2, 3];
        this.index = 0;
    },

    dropDead: function() {
        this.isDead = true;
        this.isDrop = true;
        return this;
    },
});

/*
 *  enemy.garuda.js
 *  2017/07/07
 *  @auther minimo  
 *  This Program is MIT license.
 */

//怪鳥
phina.define("qft.Enemy.Garuda", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 80,

    //防御力
    deffence: 10,

    //攻撃力
    power: 20,

    //視力
    eyesight: 256,

    //視野角
    viewAngle: 60,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 0,

    //スーパーアーマー
    isSuperArmor: true,

    //得点
    point: 3000,

    //属性ダメージ倍率
    damageArrow: 5,

    defaultOptions: {
        speed: 2,
        direction: 0,
        returnTime: 120,
    },

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_COIN,

    //レアドロップ率（％）
    rareDropRate: 3,
    rareDropItem: ITEM_BAG,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 18});
        options = options.$safe(this.defaultOptions);
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01x2", 48, 64).addChildTo(this);
        this.sprite.setFrameTrimming(0, 0, 72 * 2, 128 * 2).setScale(1.5).setPosition(0, 16);

        this.sprite2 = phina.display.Sprite("monster01x2", 48, 64).addChildTo(this);
        this.sprite2.setFrameTrimming(288 * 2, 0, 72 * 2, 128 * 2).setScale(1.5).setPosition(0, 16).setAlpha(0);
        var that = this;
        this.sprite2.update = function() {
            this.frameIndex = that.sprite.frameIndex;
        }

        this.setAnimation("walk");
        this.animationInterval = 6;
        this.setupLifeGauge();

        this.moveTime = 0;
    },

    algorithm: function() {
        if (this.path) {
            var p = this.getPathPosition(this.moveTime);
            this.setPosition(p.x, p.y);
        }
        this.moveTime += 2;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["up"] =   [0, 1, 2, 1];
        this.frame["down"] = [6, 7, 8, 7];
        this.frame["walk"] = [3, 4, 5, 4];
        this.index = 0;
    },
});

/*
 *  enemy.greaterdemon.js
 *  2017/05/01
 *  @auther minimo  
 *  This Program is MIT license.
 */

//グレーターデーモン
phina.define("qft.Enemy.GreaterDemon", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 120,

    //防御力
    deffence: 10,

    //攻撃力
    power: 20,

    //視力
    eyesight: 256,

    //視野角
    viewAngle: 180,

    //アニメーション間隔
    animationInterval: 15,

    //得点
    point: 5000,

    //飛行モード
    flying: false,
    flyingPhase: 0, //行動フェーズ
    flyingX: 0,     //飛行開始Ｘ座標

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_JEWEL,

    //レアドロップ率（％）
    rareDropRate: 2,
    rareDropItem: ITEM_JEWELBOX,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 35, height: 30});
        if (options.size) {
            var size = options.size || 1;
            options.width = size * 35;
            options.height = size * 30;
        }
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01x2", 24*2, 32*2).addChildTo(this);
        this.sprite.setFrameTrimming(72*2*2, 640*2, 72*2, 128*2).setPosition(0, -10);
        if (options.size) {
            var size = options.size || 1;
            this.sprite.setScale(size).setPosition(0, size * -12);
        }

        this.sprite2 = phina.display.Sprite("monster01x2", 24*2, 32*2).addChildTo(this).setAlpha(0);
        this.sprite2.setFrameTrimming(288*2, 640*2, 72*2, 128*2).setPosition(0, -10);
        this.sprite2.tweener.setUpdateType('fps');
        if (options.size) {
            var size = options.size || 1;
            this.sprite2.setScale(size).setPosition(0, size * -12);
        }
        var that = this;
        this.sprite2.update = function() {
            this.frameIndex = that.sprite.frameIndex;
        }

        this.setAnimation("walk");
        this.setupLifeGauge();

        this.phase = 0;
        this.direction = 0;
        this.isAttack = false;
        this.isAttackCancel = false;
        this.chaseTime = 0;
        this.turnTime = 0;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
            this.isAttackCancel = true;
        });
    },

    algorithm: function() {
        //プレイヤー情報
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        //進行方向決定
        if (this.isOnFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 1;
            } else {
                this.vx = -1;
            }
        }

        //プレイヤー発見後一定時間追跡する
        if (look) {
            this.chaseTime = 120;
            this.stopTime = 0;
            this.vx *= 3;
            this.flare('balloon', {pattern: "!"});
        }
        if (this.chaseTime > 0 && !this.isAttack && this.turnTime == 0) {
            if (this.x > pl.x) {
                if (this.direction == 0) this.turnCount++;
                this.direction = 180;
            } else {
                if (this.direction == 180) this.turnCount++;
                this.direction = 0;
            }
            this.turnTime = 15;
            if (look) this.turnCount = 0;
            //プレイヤーを見失った状態で三回振り返った場合は追跡終了
            if (this.turnCount > 3) {
                this.flare('balloon', {pattern: "?"});
                this.stopTime = 30;
                this.chaseTime = 0;
            }
        }
        //一定距離以上離れたら追跡解除
        if (dis > 512) this.chaseTime = 0;

        if (this.isOnFloor) {
            //崖っぷちで折り返す
            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) {
                this.direction = 180;
                this.chaseTime = 0;
            } else if (this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) {
                this.direction = 0;
                this.chaseTime = 0;
            }

            //壁に当たったら折り返す
            if (this._collision[1].hit) {
                this.direction = 180;
                this.chaseTime = 0;
            } else if (this._collision[3].hit) {
                this.direction = 0;
                this.chaseTime = 0;
            }

            //プレイヤーへの攻撃
            if (look && !this.isAttack && !this.isJump) {
                if (dis > 128) {
                    this.firebreath();
                } else {
                    this.exploding();
                }
            }
        }

        if (this.chaseTime == 30) this.flare('balloon', {pattern: "?"});
    },

    //火球を吐く
    fireball: function() {
        this.isAttack = true;
        this.stopTime = 30;
        this.sprite2.tweener.clear()
            .fadeIn(10)
            .call(() => {
                this.parentScene.spawnEnemy(this.x, this.y, "Bullet", {explode: true, rotation: this.getPlayerAngle(), power: 30});
            })
            .wait(45)
            .call(() => {
                this.isAttack = false;
            })
            .fadeOut(10);
    },

    //炎を吐く
    firebreath: function() {
        this.isAttack = true;
        this.stopTime = 60;
        this.sprite2.tweener.clear()
            .fadeIn(15)
            .wait(60)
            .call(() => {
                this.isAttack = false;
            })
            .fadeOut(15);

        var rot = (this.scaleX == 1)? 0: 180;
        var ct = 0;
        var tw = phina.accessory.Tweener().attachTo(this)
            .setUpdateType('fps')
            .call(() => {
                var b = this.parentScene.spawnEnemy(this.x + 24 * this.scaleX, this.y-8, "Bullet", {type: "explode", power: 10, rotation: this.getPlayerAngle(), velocity: 5});
                b.setScale(0.1);
                b.tweener.clear().setUpdateType('fps').to({scaleX: 1, scaleY: 1}, 10);
                ct++;
                if (ct == 6 || this.attackCancel) {
                    tw.remove();
                    this.isAttackCancel = false;
                }
            })
            .wait(5)
            .setLoop(true);
    },

    //爆発
    exploding: function() {
        app.playSE("bomb");
        this.isAttack = true;
        this.stopTime = 60;
        this.sprite2.tweener.clear()
            .fadeIn(15)
            .wait(45)
            .call(() => {
                this.isAttack = false;
            })
            .fadeOut(15);

        var rot = (this.scaleX == 1)? 0: 180;
        var ct = 0;
        var tw = phina.accessory.Tweener().attachTo(this)
            .setUpdateType('fps')
            .call(() => {
                var rad = rot.toRadian();
                var ex = Math.cos(rad) * 16;
                var ey = Math.sin(rad) * 16;
                this.parentScene.spawnEnemy(this.x + ex, this.y + ey, "Bullet", {type: "explode", power: 10, rotation: rot, velocity: 3});
                rot += 22.5;
                ct++;
                if (ct == 16 || this.attackCancel) {
                    tw.remove();
                    this.isAttackCancel = false;
                }
            })
            .wait(1)
            .setLoop(true);
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [3, 4, 5, 4];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },
});

/*
 *  enemy.intelligentsword.js
 *  2017/07/19
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Enemy.IntelligentSword", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 20,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 1.0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 20,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 360,

    //得点
    point: 2000,

    //アニメーションフラグ
    isAnimation: false,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_LONGSWORD,

    //レアドロップ率（％）
    rareDropRate: 1,
    rareDropItem: ITEM_LONGSWORD,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 24});
        this.superInit(parentScene, options);

        this.sprite = phina.display.Sprite("weapons", 24, 24)
            .addChildTo(this)
            .setFrameIndex(10 + Math.min(9, this.level))
            .setRotation(215);
        this.sprite.tweener.clear()
            .to({y: -2}, 1000, "easeInOutSine")
            .to({y: 4}, 1000, "easeInOutSine")
            .setLoop(true);

        this.type = options.type;
        this.power = options.power || this.power;
        this.rotation = options.rotation || 0;
        this.velocity = options.velocity || this.velocity;

        this.phase = 0;

        this.setupLifeGauge();
    },

    algorithm: function() {
        //プレイヤーとの距離
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        if (this.phase == 0) {
            if (look && dis < 64) {
                this.phase++;
            }
        }

        if (this.phase == 2) {
            var ang = this.getAngle(pl);
            this.rotation = ang + 30;
        }

        if (look) {
            this.flare('balloon', {pattern: "!", lifeSpan: 15, y: 0});
        } else {
            this.flare('balloonerace');
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["pattern1"] = [0];
        this.index = 0;
    },

    snap: function(target) {
        //効果音
        app.playSE("tinkling");
        this.tweener.clear()
            .by({y: -64, rotation: 700}, 15, "easeOutQuad")
            .call(function() {
                this.phase = 10;
            }.bind(this));
    },
});

/*
 *  enemy.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//敵キャラクタ基本クラス
phina.define("qft.Enemy", {
    superClass: "qft.Character",

    //識別フラグ
    isEnemy: true,

    //レベル
    level: 0,

    //ヒットポイント
    hp: 10,

    //防御力
    deffence: 1,

    //攻撃力
    power: 0,

    //移動速度
    speed: 1,

    //気絶確率
    stunPower: 1,

    //視力
    eyesight: 0,

    //視野角
    viewAngle: 90,

    //進行方向（0:右 180:左 270:上 90:下）
    direction: 0,

    //ポイント
    point: 0,

    //攻撃当たり判定有効フラグ
    isEnableAttackCollision: true,

    //スーパーアーマー状態フラグ
    isSuperArmor: false,

    //影表示フラグ
    isShadow: true,

    //属性ダメージ倍率
    damageSlash: 1,
    damageSting: 1,
    damageBlow: 1,
    damageArrow: 1,
    damageFire: 1,
    damageIce: 1,
    damageHoly: 1,
    damageDark: 1,

    //アイテムドロップ率（％）
    dropRate: 0,
    dropItem: ITEM_COIN,

    //レアドロップ率（％）
    rareDropRate: 0,
    rareDropItem: ITEM_BAG,

    //行動パターン用
    chaseTime: 0,
    turnTime: 0,
    stopTime: 0,
    turnCount: 0,

    init: function(parentScene, options) {
        options = options || {};
        this.superInit(parentScene, options);
        this.setupAnimation();
        this.options = options;
        this.level = options.level || 0;
        this.territory = options.territory;

        //デバッグ時視界の可視化
        if (DEBUG_EYESIGHT) {
            var that = this;
            var va = (this.viewAngle / 2).toRadian();
            phina.display.ArcShape({radius: this.eyesight, startAngle: -va, endAngle: va}).addChildTo(this).setAlpha(0.3);
        }

        this.on('enterframe', function() {
            if (this.parentScene.pauseScene) return;
            //画面外の場合は動作停止
            if (!this.onScreen) return;

            var pl = this.parentScene.player;

            //向きの指定
            if (this.vx != 0) {
                if (this.vx > 0) {
                    this.scaleX = 1;
                } else {
                    this.scaleX = -1;
                }
            }

            //ステージクリアの場合は当たり判定無し
            if (this.parentScene.isStageClear) return;

            //気絶中はアニメーションしない
            if (this.isStun) {
                this.isAdvanceAnimation = false;
            } else {
                this.isAdvanceAnimation = true;
            }

            //被ダメージ当たり判定
            if (!this.isMuteki && this.mutekiTime == 0) {
                //プレイヤー攻撃との当たり判定
                if (pl.isAttack && this.hitTestElement(pl.attackCollision)) {
                    this.damage(pl.attackCollision);
                }
                //プレイヤーショットとの当たり判定
                this.parentScene.playerLayer.children.forEach(function(e) {
                    if (e instanceof qft.PlayerAttack && e.isCollision && this.hitTestElement(e)) {
                        e.hit(this);
                        e.remove();
                        this.damage(e);
                    }
                }.bind(this));
            }

            //プレイヤーとの当たり判定
            if (this.isEnableAttackCollision && this.mutekiTime == 0) {
                if (!this.isDead && !pl.isDead && this.power > 0 && this.hitTestElement(pl)) {
                    this.hit();
                    pl.damage(this);
                }
            }

            if (this.stopTime == 0) {
                this.algorithm();
                if (this.chaseTime > 0) this.chaseTime--;
                if (this.turnTime > 0) this.turnTime--;
            }
        });

        this.on('dead', function() {
            //確定ドロップアイテム
            if (this.options.item) {
                var i = this.parentScene.spawnItem(this.x, this.y, {kind: this.options.item});
                i.vy = -5;
                if (this.options.item == "key") {
                    i.isEnemyDrop = false;
                } else {
                    i.isEnemyDrop = true;
                }
                this.remove();
                return;
            }
            //レアアイテムドロップ判定
            var dice = Math.randint(1, 100);
            if (dice <= this.rareDropRate) {
                var i = this.parentScene.spawnItem(this.x, this.y, {kind: this.rareDropItem});
                i.vy = -5;
                i.isEnemyDrop = true;
            } else {
                //通常アイテムドロップ判定
                var dice = Math.randint(1, 100);
                if (dice <= this.dropRate) {
                    var i = this.parentScene.spawnItem(this.x, this.y, {kind: this.dropItem});
                    i.vy = -5;
                    i.isEnemyDrop = true;
                }
            }
            this.remove();
        });
    },

    algorithm: function() {
    },

    damage: function(target) {
        if (this.mutekiTime > 0) return false;
        if (this.isMuteki) return false;

        //気絶キャンセル
        this.isStun = false;

        var dir = 0;
        if (target instanceof qft.PlayerAttack) {
            if (target.scaleX == 1) dir = 0; else dir = 180;
        } else {
            if (this.x > target.x) dir = 0; else dir = 180;
        }

        var power = target.power;
        if (target.isSlash) power *= this.damageSlash;
        if (target.isSting) power *= this.damageSting;
        if (target.isBlow) power *= this.damageBlow;
        if (target.isArrow) power *= this.damageArrow;
        if (target.isFire) power *= this.damageFire;
        if (target.isIce) power *= this.damageIce;
        if (target.isHoly) power *= this.damageHoly;
        if (target.isDark) power *= this.damageDark;
        power = Math.floor(power);
        if (!this.isSuperArmor) this.knockback(power, dir);
        this.mutekiTime = 10;
        this.hp -= power;
        if (this.hp <= 0) {
            this.hp = 0;
            this.parentScene.totalScore += this.point;
            this.parentScene.totalKill++;
            this.flare('dead');
        } else {
            this.flare('damaged', {direction: dir});

            //気絶判定
            var dice = Math.randint(1, 100);
            if (dice <= target.stunPower) this.flare('stun', {power: target.power});
        }
        app.playSE("hit");
        return true;
    },

    //プレイヤーが見える位置にいるのか判定
    isLookPlayer: function() {
        //視力外の場合は見えない
        if (this.getDistancePlayer() > this.eyesight) return false;

        //視野角外の場合は見えない
        if (this.viewAngle != 360) {
            //プレイヤーとの角度（右が360度）
            var angle = Math.floor(this.getPlayerAngle());

            //視界範囲内の判定
            if (this.direction == 0) {
                var va = this.viewAngle / 2;
                if (!(360-va < angle || angle < va)) return false;
            } else {
                var dir = this.direction;
                var va = this.viewAngle / 2;
                if (!(dir-va < angle && angle < dir+va)) return false;
            }
        }

        var result = true;
        var that = this;
        var player = this.parentScene.player;
        this.parentScene.collisionLayer.children.forEach(function(e) {
            if (e.type == "ladder" || this.type == "stairs") return;
            //自分とプレイヤー間に遮蔽物（地形当り判定）がある場合見えない
            if (phina.geom.Collision.testRectLine(e, that, player)) {
                result = false;
            }
        });
        return result;
    },

    //自分とプレイヤーを結ぶ直線の角度（弧度法）
    getPlayerAngle: function() {
        var p1 = phina.geom.Vector2(this.x, this.y);
        var p2 = phina.geom.Vector2(this.parentScene.player.x, this.parentScene.player.y);
        var p = p2.sub(p1);
        return p.toDegree();
    },

    //自分とプレイヤーを結ぶ直線の角度（ラジアン）
    getPlayerRadian: function() {
        var p1 = phina.geom.Vector2(this.x, this.y);
        var p2 = phina.geom.Vector2(this.parentScene.player.x, this.parentScene.player.y);
        var p = p2.sub(p1);
        return p.toAngle();
    },

    //体力ゲージ設置
    setupLifeGauge: function() {
        var that = this;
        //体力ゲージ
        var options = {
            width:  32,
            height: 2,
            backgroundColor: 'transparent',
            fill: 'red',
            stroke: 'white',
            strokeWidth: 1,
            gaugeColor: 'lime',
            cornerRadius: 0,
            value: this.hp,
            maxValue: this.hp,
        };
        this.lifeGauge = phina.ui.Gauge(options).addChildTo(this).setPosition(0, 0);
        this.lifeGauge.update = function() {
            this.visible = (that.hp != this.maxValue);
            this.value = that.hp;
            this.rotation = -that.rotation;
            this.scaleX = that.scaleX;

            if (this.dispTime > 150) this.visible = false;
            if (this.beforeValue == this.value) this.dispTime++; else this.dispTime = 0;
            this.beforeValue = this.value;
        };
        this.lifeGauge.dispTime = 0;
    },

    hit: function() {
    },

    //汎用往復アルゴリズム（陸上）
    roundtripAlgorithm_ground: function(dis, look) {
        var pl = this.parentScene.player;
        if (dis === undefined) dis = this.getDistancePlayer();
        if (look === undefined) look = this.isLookPlayer();

        if (this.isOnFloor) {
            //崖っぷちで折り返す
            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) {
                this.direction = 180;
            } else if (this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) {
                this.direction = 0;
            }

            //壁に当たったら折り返す
            if (this._collision[1].hit) {
                this.direction = 180;
            } else if (this._collision[3].hit) {
                this.direction = 0;
            }

            //テリトリー指定
            if (!look && this.territory) {
                //水平方向のみチェック
                var tx = this.x - this.firstX;
                if (Math.abs(tx) > this.territory) {
                    if (tx > 0) {
                        this.direction = 180;
                    } else {
                        this.direction = 0;
                    }
                }
            }
        }

        if (this.isOnFloor || this.isJump) {
            this.vx =  this.speed;
            if (this.direction == 180) {
                this.vx *= -1;
            }
        }
    },

    //汎用往復アルゴリズム（空中）
    roundtripAlgorithm_flying: function(dis, look) {
        var pl = this.parentScene.player;
        if (dis === undefined) dis = this.getDistancePlayer();
        if (look === undefined) look = this.isLookPlayer();

        var chk1 = 1;
        var chk2 = 3;
        if (this.vertical) {
            chk1 = 0;
            chk2 = 2;
        }
        //壁に当たったら折り返す
        var turn = false;
        if (this._collision[chk1].hit || this._collision[chk2].hit) turn = true;

        //テリトリー指定
        if (!look && this.territory) {
            if (this.vertical) {
                //垂直方向チェック
                var ty = this.y - this.firstY;
                if (Math.abs(ty) > this.territory) {
                    if (ty > 0) {
                        this.direction = 270;
                    } else {
                        this.direction = 90;
                    }
                }
            } else {
                //水平方向チェック
                var tx = this.x - this.firstX;
                if (Math.abs(tx) > this.territory) {
                    if (tx > 0) {
                        this.direction = 180;
                    } else {
                        this.direction = 0;
                    }
                }
            }
        }
    },

    //汎用追跡アルゴリズム
    chaseAlgorithm: function(dis, look) {
        var pl = this.parentScene.player;
        if (dis === undefined) dis = this.getDistancePlayer();
        if (look === undefined) look = this.isLookPlayer();

        //プレイヤー発見後一定時間追跡する
        if (this.chaseTime > 0 && !this.isAttack && this.turnTime == 0) {
            if (this.x > pl.x) {
                if (this.direction == 0) this.turnCount++;
                this.direction = 180;
            } else {
                if (this.direction == 180) this.turnCount++;
                this.direction = 0;
            }
            this.turnTime = 15;
            if (look) this.turnCount = 0;
            //プレイヤーを見失った状態で三回振り返った場合は追跡終了
            if (this.turnCount > 3) {
                this.flare('balloon', {pattern: "?"});
                this.stopTime = 30;
                this.chaseTime = 0;
                this.firstX = this.x;
                this.firstY = this.y;
            }
        }

        //一定距離以上離れたら追跡解除
        if (dis > 512) {
            this.chaseTime = 0;
            this.firstX = this.x;
            this.firstY = this.y;
        }

        if (this.isOnFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 1;
            } else {
                this.vx = -1;
            }
            if (this.isJump) this.vx *= 1;
        }

        if (look) {
            this.chaseTime = 120;
            this.stopTime = 0;
            this.flare('balloon', {pattern: "!"});
        } else {
            if (this.chaseTime == 0) this.flare('balloonerace');
        }

        if (this.isOnFloor) {
            //テリトリー指定
            if (this.chaseTime == 0 && this.territory) {
                //水平方向のみチェック
                var tx = this.x - this.firstX;
                if (Math.abs(tx) > this.territory) {
                    if (tx > 0) {
                        this.direction = 180;
                    } else {
                        this.direction = 0;
                    }
                }
            }

            //これ以上進めない場合は折り返す
            var isReturnWall = false;
            var isReturnCliff = false;
            if (this.vx > 0) {
                if (this._collision[1].hit) isReturnWall = true;
                if (this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) isReturnCliff = true;
            } else if (this.vx < 0) {
                if (this._collision[3].hit) isReturnWall = true;
                if (this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) isReturnCliff = true;
            }
            if (isReturnWall || isReturnCliff) {
                if (this.chaseTime > 0) {
                    //プレイヤー追跡中で段差がある場合は飛び越える
                    if (isReturnWall) {
                        if (this.direction == 0) {
                            if (this.x < pl.x) {
                                this.isJump = true;
                                this.vy = -12;
                            }
                        } else {
                            if (this.x > pl.x) {
                                this.isJump = true;
                                this.vy = -12;
                            }
                        }
                    }

                    //プレイヤー追跡中で崖がある場合は着地点があるか調べて飛び降りる
                    if (isReturnCliff) {
                        var jumpOk = false;
                        if (this.direction == 0) {
                            if (this.checkMapCollision2(this.x+32, this.y+32, 16, 96)) {jumpOk = true; this.vy = -7;}
                            if (this.checkMapCollision2(this.x+32, this.y-32, 16, 96)) {jumpOk = true; this.vy = -10;}
                        } else {
                            if (this.checkMapCollision2(this.x-32, this.y+32, 16, 96)) {jumpOk = true; this.vy = -7;}
                            if (this.checkMapCollision2(this.x-32, this.y-32, 16, 96)) {jumpOk = true; this.vy = -10;}
                        }
                        if (jumpOk) {
                            this.isJump = true;
                        } else {
                            //着地点が無い場合は諦めて折り返す
                            this.chaseTime = 0;
                            this.stopTime = 45;
                            this.turnWait = 15;
                            this.direction = (this.direction + 180) % 360;
                            this.vx = 0;
                            this.flare('balloon', {pattern: "..."});
                            this.firstX = this.x;
                            this.firstY = this.y;
                         }
                    }
                } else {
                    this.direction = (this.direction + 180) % 360;
                    this.vx *= -1;
                }
            }
        }

        if (this.chaseTime == 30) {
            this.flare('balloon', {pattern: "?"});
            this.firstX = this.x;
            this.firstY = this.y;
        }
    },

    //評価関数
    evaluate: function(dis, look) {
        var pl = this.parentScene.player;
        if (dis === undefined) dis = this.getDistancePlayer();
        if (look === undefined) look = this.isLookPlayer();

        //脅威度
        var threat = 0;

        //プレイヤーとの距離により脅威度を加算
        if (dis < 256) threat += 10
        if (dis < 128) threat += 20

        //プレイヤー視認可能状態
        if (look) threat += 30;

        //プレイヤー行動状態
        var playerAction = "";
        if (pl.x == pl.before.x && pl.y == pl.before.y) {
            //プレイヤーは移動していない
        } else {
            //プレイヤー進行方向（右:0 左:180）
            var pldir = 0;
            if (pl.x < pl.before.x) pldir = 180;
            if (this.x < pl.x) {
                if (prdir == 0) {
                    //プレイヤーは近づいている
                } else {
                    //プレイヤーは離れている
                }
            } else {
                if (prdir == 180) {
                    //プレイヤーは近づいている
                } else {
                    //プレイヤーは離れている
                }
            }
        }

        return {
            threat: threat,
            playerAction: playerAction,
        };
    },
});

//敵攻撃判定
phina.define("qft.EnemyAttack", {
    superClass: "phina.display.RectangleShape",

    //攻撃力
    power: 1,

    //有効フラグ
    isActive: true,

    //寿命
    lifeSpan: 15,

    init: function(parentScene, options) {
        options = (options || {}).$safe({width: 32, height: 32});
        this.superInit(options);
        this.parentScene = parentScene;

        this.$extend(options);
        this.time = 0;

        this.on('enterframe', e => {
            this.time++;
            if (this.time > this.lifeSpan) {
                this.remove();
                return;
            }
            if (!this.isActive) return;
            var pl = this.parentScene.player;

            //プレイヤー攻撃と当たった場合はエフェクトを出して無効化
            if (pl.isAttack && this.hitTestElement(pl.attackCollision)) {
                this.isActice = false;
                this.bump();
                return;
            }

            //プレイヤーショットとの当たり判定
            this.parentScene.playerLayer.children.forEach(function(e) {
                if (e instanceof qft.PlayerAttack && e.isCollision && this.hitTestElement(e)) {
                    e.snap(this);
                    e.isCollision = false;
                }
            }.bind(this));

            //プレイヤーとの当たり判定
            if (!pl.isDead && this.hitTestElement(pl)) {
                pl.damage(this);
            }
        });

        if (DEBUG_COLLISION) {
            phina.display.RectangleShape({width: this.width, height: this.height}).addChildTo(this).setAlpha(0.5);
        }
    },

    //判定同士がぶつかった場合の処理
    bump: function() {
        this.parentScene.spawnEffect(this.x, this.y, {name: "hit"});
        if (this.master) {
            var pl = this.parentScene.player;
            pl.knockback(5, this.master.direction);
            this.master.knockback(5, (this.master.direction + 180) % 360);
            app.playSE("tinkling");
        }
    },
});

/*
 *  enemy.knight.js
 *  2017/05/06
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ナイト
phina.define("qft.Enemy.Knight", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 70,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //速度
    speed: 1,

    //視力
    eyesight: 192,

    //視野角
    viewAngle: 90,

    //得点
    point: 1000,

    //アイテムドロップ率（％）
    dropRate: 7,
    dropItem: ITEM_JEWEL,

    //レアドロップ率（％）
    rareDropRate: 2,
    rareDropItem: ITEM_LONGSWORD,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 20, height: 20});
        this.superInit(parentScene, options);

        //武器スプライト
        this.weapon = phina.display.Sprite("weapons", 24, 24)
            .addChildTo(this)
            .setFrameIndex(10 + Math.min(9, this.level))
            .setOrigin(1, 1)
            .setPosition(-4, 2)
            .setScale(-1, 1)
            .setRotation(430);
        this.weapon.tweener.setUpdateType('fps');
        this.weapon.kind = "sword";
        if (options.weapon == "ax") {
            this.weapon.setFrameIndex(20 + Math.min(9, this.level));
            this.weapon.kind = "ax";
        }
        if (options.weapon == "spear") {
            this.weapon.setFrameIndex(30 + Math.min(9, this.level));
            this.weapon.kind = "spear";
        }

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster02", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(144, 128, 72, 128);
        this.sprite.setPosition(0, -5).setScale(1.3);

        this.hp += this.level * 10;
        this.power += this.level * 10;
        this.point += this.level * 500;

        this.setAnimation("walk");
        this.animationInterval = 6;
        this.setupLifeGauge();

        this.direction = 0;
        this.isAttack = false;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        //プレイヤーとの距離
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        //プレイヤー発見後一定時間追跡する
        if (this.chaseTime > 0 && !this.isAttack && this.turnTime == 0) {
            if (this.x > pl.x) {
                if (this.direction == 0) this.turnCount++;
                this.direction = 180;
            } else {
                if (this.direction == 180) this.turnCount++;
                this.direction = 0;
            }
            this.turnTime = 15;
            if (look) this.turnCount = 0;
            //プレイヤーを見失った状態で三回振り返った場合は追跡終了
            if (this.turnCount > 3) {
                this.flare('balloon', {pattern: "?"});
                this.stopTime = 30;
                this.chaseTime = 0;
            }
        }

        //一定距離以上離れたら追跡解除
        if (dis > 512) this.chaseTime = 0;

        if (this.isOnFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 1;
            } else {
                this.vx = -1;
            }
            if (this.isJump) this.vx *= 1;
        }

        if (look) {
            this.chaseTime = 120;
            this.stopTime = 0;
            this.flare('balloon', {pattern: "!"});
        } else {
            if (this.chaseTime == 0) this.flare('balloonerace');
        }
        if (this.chaseTime > 0) this.vx *= 3;

        if (this.isOnFloor) {
            //これ以上進めない場合は折り返す
            var isReturnWall = false;
            var isReturnCliff = false;
            if (this.vx > 0) {
                if (this._collision[1].hit) isReturnWall = true;
                if (this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) isReturnCliff = true;
            } else if (this.vx < 0) {
                if (this._collision[3].hit) isReturnWall = true;
                if (this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) isReturnCliff = true;
            }
            if (isReturnWall || isReturnCliff) {
                if (this.chaseTime > 0) {
                    //プレイヤー追跡中で段差がある場合は飛び越える
                    if (isReturnWall) {
                        if (this.direction == 0) {
                            if (this.x < pl.x) {
                                this.isJump = true;
                                this.vy = -12;
                            }
                        } else {
                            if (this.x > pl.x) {
                                this.isJump = true;
                                this.vy = -12;
                            }
                        }
                    }
                    //プレイヤー追跡中で崖がある場合は着地点があるか調べて飛び降りる
                    if (isReturnCliff) {
                        var jumpOk = false;
                        if (this.direction == 0) {
                            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 96)) jumpOk = true;
                        } else {
                            if (this.checkMapCollision2(this.x-5, this.y+20, 5, 96)) jumpOk = true;
                        }
                        if (jumpOk) {
                            this.isJump = true;
                            this.vy = -5;
                        } else {
                            //着地点が無い場合は諦めて折り返す
                            this.chaseTime = 0;
                            this.stopTime = 30;
                            this.turnWait = 15;
                            this.direction = (this.direction + 180) % 360;
                            this.vx = 0;
                            this.flare('balloon', {pattern: "..."});
                         }
                    }
                } else {
                    this.direction = (this.direction + 180) % 360;
                    this.vx *= -1;
                }
            }

            //攻撃
            if (look && !this.isJump && dis < 64 && !this.isAttack) {
                this.attack();
            }

            //プレイヤー飛び道具を弾く（レベル４以上）
            if (this.level > 3 && look && !this.isAttack) {
                var that = this;
                //プレイヤーショットとの距離判定
                this.parentScene.playerLayer.children.forEach(function(e) {
                    if (e instanceof qft.PlayerAttack && e.isCollision && e.type == "arrow") {
                        if (that.getDistance(e) < 64) that.guard();
                    }
                }.bind(this));
            }
        }

        if (this.chaseTime == 30) this.flare('balloon', {pattern: "?"});
    },

    attack: function() {
        var that = this;
        var width = 24, height = 24;
        var atk = qft.EnemyAttack(this.parentScene, {width: 24, height: 24, power: 20 + this.level * 5})
            .addChildTo(this.parentScene.enemyLayer)
            .setPosition(this.x + this.scaleX * 18, this.y)
            .setAlpha(0.0);
        if (DEBUG_COLLISION) atk.setAlpha(0.3);
        atk.master = this;
        atk.tweener.setUpdateType('fps');
        atk.update = function() {
            this.x = that.x + that.scaleX * 18;
        }

        if (this.weapon.kind == "sword" || this.weapon.kind == "ax") {
            atk.isActive = false;
            this.weapon.tweener.clear()
                .to({rotation: 270}, 3)
                .wait(3)
                .call(function() {
                    atk.isActive = true;
                    that.vx = 16 * that.scaleX;
                })
                .to({rotation: 430}, 6)
                .call(function() {
                    that.isAttack = false;
                    atk.remove();
                });
        } else if (this.weapon.kind == "spear") {
            atk.width = 32;
            atk.height = 8;
            atk.setPosition(this.x + this.scaleX * 1, this.y);
            atk.tweener.clear().by({x: 20 * this.scaleX}, 10).by({x: -20 * this.scaleX}, 10);
            atk.isActive = false;

            this.weapon.tweener.clear()
                .set({rotation: 45, x: -20})
                .wait(2)
                .call(function() {
                    atk.isActive = true;
                    that.isSuperArmor = true;
                    that.vx = 32 * that.scaleX;
                })
                .by({x: 20}, 3)
                .by({x: -30}, 5)
                .call(function() {
                    that.isAttack = false;
                    that.isSuperArmor = false;
                    atk.remove();
                })
                .set({rotation: 430, x: -2});
        }
        this.isAttack = true;
        this.stopTime = 30;
    },

    //飛び道具弾き
    guard: function() {
        var that = this;
        var width = 24, height = 24;
        var atk = qft.EnemyAttack(this.parentScene, {width: 24, height: 24, power: 20 + this.level * 5})
            .addChildTo(this.parentScene.enemyLayer)
            .setPosition(this.x + this.scaleX * 18, this.y)
            .setAlpha(0.0);
        if (DEBUG_COLLISION) atk.setAlpha(0.3);
        atk.master = this;
        atk.tweener.setUpdateType('fps');
        atk.update = function() {
            this.x = that.x + that.scaleX * 18;
        }

        this.isMuteki = true;
        this.weapon.tweener.clear()
            .set({rotation: 430})
            .to({rotation: 300}, 3)
            .to({rotation: 430}, 3)
            .call(function() {
                that.isAttack = false;
                that.isMuteki = false;
                atk.remove();
            });
        this.isAttack = true;
        this.stopTime = 6;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [3, 4, 5, 4];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },
});

/*
 *  enemy.mage.js
 *  2017/04/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

//魔術師
phina.define("qft.Enemy.Mage", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 20,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 256,

    //視野角
    viewAngle: 160,

    //得点
    point: 500,

    //アイテムドロップ率（％）
    dropRate: 30,
    dropItem: ITEM_COIN,

    //レアドロップ率（％）
    rareDropRate: 5,
    rareDropItem: ITEM_BAG,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        //表示用スプライト
        var lv = Math.min(this.level, 4);
        this.sprite = phina.display.Sprite("monster03", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming((lv % 2) * 144, Math.floor(lv / 2) * 128, 72, 128);
        this.sprite.setScale(1.2).setPosition(0, -2);

        this.hp += this.level * 5;
        this.power += this.level * 2;
        this.point += this.level * 200;

        this.setAnimation("walk");
        this.animationInterval = 10;
        this.setupLifeGauge();

        this.phase = 0;
        this.direction = 0;
        this.isAttack = false;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        var player = this.parentScene.player;
        var look = this.isLookPlayer();
        var distance = this.getDistancePlayer();

        if (this.isOnFloor) {
            //プレイヤーが近くにいたら距離を取る
            if (this.phase == 0 && look && !this.isJump && distance < 128) {
                this.flare('balloon', {pattern: "!"});
                this.phase = 1;
                this.speed = 3;
            }

            //逃げるフェーズ
            if (this.phase == 1) {
                if (distance < 128) {
                    if (this.x < player.x) this.direction = 180; else this.direction = 0;
                    this.speed = 3;
                } else {
                    if (this.x < player.x) this.direction = 0; else this.direction = 180;
                    this.speed = 0;
                    this.phase = 2;
                }
                var lv = Math.min(this.level, 4);
                this.sprite.setFrameTrimming((lv % 2) * 144, Math.floor(lv / 2) * 128, 72, 128);
            }

            //攻撃フェーズ
            if (this.phase == 2) {
                if (distance < 96) {
                    //プレイヤーが近づいたら逃げる
                    this.phase = 1;
                } else {
                    //プレイヤーが遠くにいる場合は攻撃
                    this.isAttack = true;
                }
            }

            //発狂モード
            if (this.phase == 3) {
                this.isAttack = true;
            }

            if (this.isAttack) {
                var lv = Math.min(this.level, 4);
                this.sprite.setFrameTrimming((lv % 2) * 144 + 72, Math.floor(lv / 2) * 128, 72, 128);
                this.isAttack = false;

                if (this.phase < 3) {
                    this.stopTime = 30;
                    this.fireball();
                } else {
                    this.stopTime = 8;
                    this.fireball();
                }

                //プレイヤー方向を向く
                if (this.x < player.x) {
                    this.diretion = 0;
                    this.scaleX = 1;
                } else {
                    this.direction = 180;
                    this.scaleX = -1;
                }
            }

            //これ以上進めない場合は折り返す
            var cantescape = false;
            if (this._collision[1].hit || this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) {
                this.direction = 180;
                if (this.phase == 1) cantescape = true;
            } else if (this._collision[3].hit || this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) {
                this.direction = 0;
                if (this.phase == 1) cantescape = true;
            }
            //逃げられない場合は発狂モード
            if (cantescape) {
                this.phase = 3;
                this.speed = 0;
            }

            //プレイヤーが離れたら通常フェーズ
            if (distance > 128 + 64) {
                var lv = Math.min(this.level, 4);
                this.sprite.setFrameTrimming((lv % 2) * 144, Math.floor(lv / 2) * 128, 72, 128);
                this.phase = 0;
                this.speed = 1;
            }
        }

        if (this.isOnFloor || this.isJump) {
            this.vx = this.speed;
            if (this.direction == 180) {
                this.vx *= -1;
            }
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [0, 1, 2, 1];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },

    //ファイアボール
    fireball: function() {
        this.parentScene.spawnEnemy(this.x, this.y, "Bullet", {explode: true, rotation: this.getPlayerAngle() + Math.randint(-40, 40)});
    },

    //爆発
    explode: function() {
        app.playSE("bomb");
        this.isAttack = false;
        var rot = (this.scaleX == 1)? 0: 180;
        var ct = 0;
        var tw = phina.accessory.Tweener().attachTo(this)
            .setUpdateType('fps')
            .call(() => {
                var rad = rot.toRadian();
                var ex = Math.cos(rad) * 16;
                var ey = Math.sin(rad) * 16;
                this.parentScene.spawnEnemy(this.x + ex, this.y + ey, "Bullet", {type: "explode", power: 10, rotation: rot, velocity: 3});
                rot += 22.5;
                ct++;
                if (ct == 32 || this.attackCancel) {
                    tw.remove();
                }
            })
            .wait(1)
            .setLoop(true);
    },
});

/*
 *  enemy.magicdgger.js
 *  2017/07/19
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Enemy.MagicDagger", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 1,

    //寿命
    lifespan: 75,

    //速度
    velocity: 2,

    //加速度
    accel: 1.02,

    //重力加速度
    gravity: 0,

    //横移動減衰率
    friction: 1.0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //地形無視
    ignoreCollision: true,

    //得点
    point: 0,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        this.sprite = phina.display.Sprite("weapons", 24, 24).addChildTo(this).setFrameIndex(0);
        this.setAnimation("pattern1");

        this.power = options.power || this.power;
        this.power += this.level * 2;

        this.parentUnit = options.parent || null;
        this.offsetX = options.offsetX || Math.randint(-16, 16);
        this.offsetY = options.offsetY || Math.randint(-16, 16);
        this.order = options.order || 0;

        this.isAttack = false;
        this.isAttack_before = false;
        this.isDamaged = false;

        this.phase = 0;
    },

    algorithm: function() {
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        //待機開始
        if (this.phase == 0) {
            this.phase++;
            var x = this.parentUnit.x + this.offsetX;
            var y = this.parentUnit.y + this.offsetY;
            y += Math.cos(this.time.toRadian() * 6) * 5;
            this.tweener.clear()
                .moveTo(x, y, 5)
                .call(() => {
                    this.phase++;
                });
        }

        //待機中
        if (this.phase == 2) {
            this.x = this.parentUnit.x + this.offsetX;
            this.y = this.parentUnit.y + this.offsetY;
            this.y += Math.cos(this.time.toRadian() * 6) * 5;
            this.rotation -= 3;

            if (this.isAttack) {
                this.phase = 3;
                this.isAttack = false;
            }
        }

        //プレイヤー攻撃開始
        if (this.phase == 3) {
            this.phase++;
            this.rotation = this.getPlayerAngle() + 135;
            this.tweener.clear()
                .moveTo(pl.x, pl.y, 20, "easeInQuad")
                .call(() => {
                    this.phase++;
                });
        }

        //攻撃終了
        if (this.phase == 5) {
            this.phase++;
            this.isEnableAttackCollision = false;
            var x = this.parentUnit.x + this.offsetX;
            var y = this.parentUnit.y + this.offsetY;
            this.tweener.clear()
                .moveTo(x, y, 15, "easeInOutQuad")
                .wait(5)
                .call(() => {
                    this.phase = 0;
                    this.isEnableAttackCollision = true;
                });
        }

        //警戒待機開始
        if (this.phase == 10) {
            this.phase++;
            var deg = this.time.toRadian() * 6 + this.order * 60;
            var x = this.parentUnit.x + Math.cos(deg) * 16;
            var y = this.parentUnit.y + Math.sin(deg) * 16;
            this.tweener.clear()
                .moveTo(x, y, 5)
                .call(() => {
                    this.phase++;
                });
        }

        //警戒待機中
        if (this.phase == 12) {
            var deg = this.time.toRadian() * 6 + this.order * 60;
            this.x = this.parentUnit.x + Math.cos(deg) * 16;
            this.y = this.parentUnit.y + Math.sin(deg) * 16;
            this.rotation -= 6;

            if (this.isAttack) {
                this.phase = 13;
                this.isAttack = false;
            }
        }

        //近接攻撃開始
        if (this.phase == 13) {
            this.phase++;
            this.tweener.clear()
                .wait(10)
                .call(() => {
                    this.phase++;
                    this.rotation = this.getPlayerAngle() + 135;
                })
                .moveTo(pl.x, pl.y, 6)
                .call(() => {
                    this.phase++;
                });
        }

        //近接攻撃
        if (this.phase == 14) {
            var deg = this.time.toRadian() * 20 + this.order * 60;
            this.x = this.parentUnit.x + Math.cos(deg) * 24;
            this.y = this.parentUnit.y + Math.sin(deg) * 24;
            this.rotation -= 6;
        }

        //攻撃終了
        if (this.phase == 16) {
            this.phase++;
            this.isEnableAttackCollision = false;
            var x = this.parentUnit.x + this.offsetX;
            var y = this.parentUnit.y + this.offsetY;
            this.tweener.clear()
                .moveTo(x, y, 10)
                .call(() => {
                    this.phase = 10;
                    this.isEnableAttackCollision = true;
                });
        }

        //親ユニット同期
        if (this.parentUnit) {
            this.direction = this.parentUnit.direction;
            if (this.parentUnit.hp == 0) this.remove();
        }

        //飛び道具迎撃
        this.parentScene.playerLayer.children.forEach(function(e) {
            if (e instanceof qft.PlayerAttack && e.isCollision) {
                if (e.type != "arrow" && e.type != "masakari") return;
                var dis = this.getDistance(e);
                if (dis < 64) {
                    this.phase = 20;
                    this.tweener.clear()
                        .moveTo(e.x, e.y, 5)
                        .call(() => {
                            this.phase = 10;
                        });
                }
            }
        }.bind(this));

        this.isAttack_before = this.isAttack;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["pattern1"] = [0];
        this.index = 0;
    },

    damage: function(target) {
        this.isDamaged = true;
        if (this.phase < 10) this.phase = 6; else this.phase = 17;

        //効果音
        app.playSE("tinkling");
        this.tweener.clear()
            .by({y: -64, rotation: 700}, 15, "easeOutQuad")
            .call(function() {
                if (this.phase < 10) this.phase = 0; else this.phase = 10;
                this.isDamaged = false;
            }.bind(this));
    },
});

/*
 *  enemy.ogre.js
 *  2017/05/06
 *  @auther minimo  
 *  This Program is MIT license.
 */

//オーガ
phina.define("qft.Enemy.Ogre", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 60,

    //防御力
    deffence: 10,

    //攻撃力
    power: 20,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 90,

    //得点
    point: 1000,

    //アイテムドロップ率（％）
    dropRate: 7,
    dropItem: ITEM_BAG,

    //レアドロップ率（％）
    rareDropRate: 2,
    rareDropItem: ITEM_JEWEL,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 20, height: 20});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster02", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(216, 0, 72, 128);
        this.sprite.setPosition(0, -5).setScale(1.3);

        this.hp += this.level * 5;
        this.power += this.level * 3;
        this.point += this.level * 300;

        this.setAnimation("walk");
        this.animationInterval = 10;
        this.setupLifeGauge();

        this.direction = 0;
        this.isAttack = false;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        //プレイヤーとの距離
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        //プレイヤー発見後一定時間追跡する
        if (this.chaseTime > 0 && !this.isAttack && this.turnTime == 0) {
            if (this.x > pl.x) {
                if (this.direction == 0) this.turnCount++;
                this.direction = 180;
            } else {
                if (this.direction == 180) this.turnCount++;
                this.direction = 0;
            }
            this.turnTime = 15;
            if (look) this.turnCount = 0;
            //プレイヤーを見失った状態で三回振り返った場合は追跡終了
            if (this.turnCount > 3) {
                this.flare('balloon', {pattern: "?"});
                this.stopTime = 30;
                this.chaseTime = 0;
            }
        }

        //一定距離以上離れたら追跡解除
        if (dis > 512) this.chaseTime = 0;

        if (this.isOnFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 0.5;
            } else {
                this.vx = -0.5;
            }
            if (this.chaseTime > 0) this.vx *= 4;
        }

        if (look) {
            this.chaseTime = 150;
            this.turnCount = 0;
            this.stopTime = 0;
            this.flare('balloon', {pattern: "!"});
        } else {
            if (this.chaseTime == 0) this.flare('balloonerace');
        }

        if (this.isOnFloor) {
            //これ以上進めない場合は折り返す
            var isReturnWall = false;
            var isReturnCliff = false;
            if (this.vx > 0) {
                if (this._collision[1].hit) isReturnWall = true;
                if (this.checkMapCollision2(this.x+5, this.y+40, 5, 5) == null) isReturnCliff = true;
            } else if (this.vx < 0) {
                if (this._collision[3].hit) isReturnWall = true;
                if (this.checkMapCollision2(this.x-5, this.y+40, 5, 5) == null) isReturnCliff = true;
            }
            if (isReturnWall || isReturnCliff) {
                if (this.chaseTime > 0) {
                    //プレイヤー追跡中で段差がある場合は飛び越える
                    if (isReturnWall) {
                        if (this.direction == 0) {
                            if (this.x < pl.x) {
                                this.isJump = true;
                                this.vy = -10;
                            }
                        } else {
                            if (this.x > pl.x) {
                                this.isJump = true;
                                this.vy = -10;
                            }
                        }
                    }
                    //プレイヤー追跡中で崖がある場合は着地点があるか調べて飛び降りる
                    if (isReturnCliff) {
                        var jumpOk = false;
                        if (this.direction == 0) {
                            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 96)) jumpOk = true;
                        } else {
                            if (this.checkMapCollision2(this.x-5, this.y+20, 5, 96)) jumpOk = true;
                        }
                        if (jumpOk) {
                            this.isJump = true;
                            this.vy = -5;
                        } else {
                            //着地点が無い場合は諦めて折り返す
                            this.chaseTime = 0;
                            this.stopTime = 30;
                            this.turnWait = 15;
                            this.direction = (this.direction + 180) % 360;
                            this.vx = 0;
                            this.flare('balloon', {pattern: "..."});
                         }
                    }
                } else {
                    this.direction = (this.direction + 180) % 360;
                    this.vx *= -1;
                    this.turnWait = 1;
                }
            }
        }
        if (this.chaseTime == 30) this.flare('balloon', {pattern: "?"});
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [3, 4, 5, 4];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },
});

/*
 *  enemy.orochi.js
 *  2017/06/13
 *  @auther minimo  
 *  This Program is MIT license.
 */

//大蛇
phina.define("qft.Enemy.Orochi", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 50,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 90,

    //得点
    point: 700,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_COIN,

    //レアドロップ率（％）
    rareDropRate: 3,
    rareDropItem: ITEM_BAG,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 32, height: 36});
        this.superInit(parentScene, options);

        //表示用スプライト
        var capLevel = Math.min(this.level, 4);
        this.sprite = phina.display.Sprite("monster01x2", 24 * 2, 32 * 2).addChildTo(this);
        this.sprite.setFrameTrimming(capLevel * 72 * 2, 384 * 2, 72 * 2, 128 * 2)
            .setScale(1 + capLevel * 0.1)
            .setPosition(0, capLevel * -1 - 4);
        this.width += capLevel * 10;

        this.hp += this.level * 10;
        this.power += this.level * 5;
        this.point += this.level * 300;

        this.setAnimation("walk");
        this.animationInterval = 15;
        this.setupLifeGauge();

        this.direction = 0;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        if (this.isDead) return;

        //プレイヤーとの距離
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        if (this.isOnFloor) {
            //崖っぷちで折り返す
            if (this.checkMapCollision2(this.x+10, this.y+40, 5, 5) == null) {
                this.direction = 180;
            } else if (this.checkMapCollision2(this.x-10, this.y+40, 5, 5) == null) {
                this.direction = 0;
            }

            //壁に当たったら折り返す
            if (this._collision[1].hit) {
                this.direction = 180;
            } else if (this._collision[3].hit) {
                this.direction = 0;
            }

            //プレイヤーが近くにいたらジャンプ攻撃
            if (look && !this.isJump && dis < 40) {
                this.isJump = true;
                this.vy = -6;
                var pl = this.parentScene.player;
                if (this.x > pl.x) {
                    this.direction = 180;
                } else {
                    this.direction = 0;
                }
            }
        }
        if (this.isOnFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 1;
            } else {
                this.vx = -1;
            }
        }
        if (look) {
            this.vx *= 4;
            this.flare('balloon', {pattern: "!", lifeSpan: 15, y: 0});
        } else {
            this.flare('balloonerace');
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [3, 4, 5, 4];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },
});

/*
 *  enemy.slime.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//スライム
phina.define("qft.Enemy.Slime", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 20,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 90,

    //得点
    point: 100,

    //属性ダメージ倍率
    damageSting: 0.8,
    damageBlow: 0.5,

    //アイテムドロップ率（％）
    dropRate: 30,
    dropItem: ITEM_COIN,

    //レアドロップ率（％）
    rareDropRate: 5,
    rareDropItem: ITEM_BAG,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        //表示用スプライト
        var capLevel = Math.min(this.level, 4);
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(capLevel * 72, 256, 72, 128)
            .setScale(1 + capLevel * 0.2)
            .setPosition(0, -2 + capLevel * -3);
        this.width += capLevel * 5;

        this.hp += this.level * 10;
        if (this.level > 3) this.hp += 30;
        this.power += this.level * 5;
        this.point += this.level * 200;

        this.setAnimation("walk");
        this.animationInterval = 10;
        this.setupLifeGauge();

        this.direction = 0;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
            if (this.level > 3　&& this.stopTime == 0) {
                this.attack();
                this.flare('balloon', {pattern: "anger1", lifeSpan: 60, y: 0, force: true});
            }
        });
    },

    algorithm: function() {
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        if (this.isOnFloor) {
            //崖っぷちで折り返す
            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) {
                this.direction = 180;
            } else if (this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) {
                this.direction = 0;
            }

            //壁に当たったら折り返す
            if (this._collision[1].hit) {
                this.direction = 180;
            } else if (this._collision[3].hit) {
                this.direction = 0;
            }

            //テリトリー指定
            if (this.territory) {
                //水平方向のみチェック
                var tx = this.x - this.firstX;
                if (Math.abs(tx) > this.territory) {
                    if (tx > 0) {
                        this.direction = 180;
                    } else {
                        this.direction = 0;
                    }
                }
            }

            if (this.level < 4) {
                //プレイヤーが近くにいたらジャンプ攻撃
                if (look && !this.isJump && dis < 40) {
                    this.isJump = true;
                    this.vy = -6;
                    var pl = this.parentScene.player;
                    if (this.x > pl.x) {
                        this.direction = 180;
                    } else {
                        this.direction = 0;
                    }
                }
            }
        }
        if (this.isOnFloor || this.isJump) {
            this.vx =  2 + Math.floor(this.level*0.5) * this.speed;
            if (this.direction == 180) {
                this.vx *= -1;
            }
        }
    },

    attack: function() {
        this.stopTime = 30;
        var vx = 1;
        if (this.direction == 180) vx = -1;
        for (var i = 0; i < this.level; i++) {
            var b = this.parentScene.spawnEnemy(this.x, this.y, "WispBomb", {pattern: 2});
            b.vy = -8;
            b.vx = i * 2 * vx;
        }
    },

    randomAttack: function() {
        this.stopTime = 30;
        var vx = 1;
        if (this.direction == 180) vx = -1;
        for (var i = 0; i < this.level; i++) {
            var b = this.parentScene.spawnEnemy(this.x, this.y, "WispBomb", {pattern: 2});
            b.vy = -8;
            b.vx = i * 2 * vx;
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [0, 1, 2, 1];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },
});

/*
 *  enemy.snake.js
 *  2017/01/27
 *  @auther minimo  
 *  This Program is MIT license.
 */

//蛇
phina.define("qft.Enemy.Snake", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 20,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 90,

    //得点
    point: 150,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_COIN,

    //レアドロップ率（％）
    rareDropRate: 3,
    rareDropItem: ITEM_BAG,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 18});
        this.superInit(parentScene, options);

        //表示用スプライト
        var capLevel = Math.min(this.level, 4);
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(capLevel * 72, 384, 72, 128)
            .setScale(1 + capLevel * 0.1)
            .setPosition(0, capLevel * -1)
        this.width += capLevel * 5;

        this.hp += this.level * 5;
        this.power += this.level * 2;
        this.point += this.level * 100;

        this.setAnimation("walk");
        this.animationInterval = 10;
        this.setupLifeGauge();

        this.direction = 0;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        if (this.isDead) return;

        //プレイヤーとの距離
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        if (this.isOnFloor) {
            //崖っぷちで折り返す
            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) {
                this.direction = 180;
            } else if (this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) {
                this.direction = 0;
            }

            //壁に当たったら折り返す
            if (this._collision[1].hit) {
                this.direction = 180;
            } else if (this._collision[3].hit) {
                this.direction = 0;
            }

            //プレイヤーが近くにいたらジャンプ攻撃
            if (look && !this.isJump && dis < 40) {
                this.isJump = true;
                this.vy = -6;
                var pl = this.parentScene.player;
                if (this.x > pl.x) {
                    this.direction = 180;
                } else {
                    this.direction = 0;
                }
            }
        }
        if (this.isOnFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 1;
            } else {
                this.vx = -1;
            }
        }
        if (look) {
            this.vx *= 4;
            this.flare('balloon', {pattern: "!", lifeSpan: 15, y: 0});
        } else {
            this.flare('balloonerace');
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [3, 4, 5, 4];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },
});

/*
 *  enemy.titan.js
 *  2017/05/06
 *  @auther minimo  
 *  This Program is MIT license.
 */

//巨人
phina.define("qft.Enemy.Titan", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 100,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 90,

    //得点
    point: 3000,

    //アイテムドロップ率（％）
    dropRate: 7,
    dropItem: ITEM_BAG,

    //レアドロップ率（％）
    rareDropRate: 2,
    rareDropItem: ITEM_JEWEL,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 25, height: 40});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster02x2", 24*2, 32*2).addChildTo(this);
        this.sprite.setFrameTrimming(216*2, 0, 72*2, 128*2);
        this.sprite.setPosition(0, -5);

        this.hp += this.level * 10;
        this.power += this.level * 5;
        this.point += this.level * 500;

        this.setAnimation("walk");
        this.animationInterval = 10;
        this.setupLifeGauge();

        this.direction = 0;
        this.isAttack = false;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        //プレイヤーとの距離
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        //プレイヤー発見後一定時間追跡する
        if (this.chaseTime > 0 && !this.isAttack && this.turnTime == 0) {
            if (this.x > pl.x) {
                if (this.direction == 0) this.turnCount++;
                this.direction = 180;
            } else {
                if (this.direction == 180) this.turnCount++;
                this.direction = 0;
            }
            this.turnTime = 15;
            if (look) this.turnCount = 0;
            //プレイヤーを見失った状態で三回振り返った場合は追跡終了
            if (this.turnCount > 3) {
                this.flare('balloon', {pattern: "?"});
                this.stopTime = 30;
                this.chaseTime = 0;
            }
        }

        //一定距離以上離れたら追跡解除
        if (dis > 512) this.chaseTime = 0;

        if (this.isOnFloor || this.isJump) {
            if (this.direction == 0) {
                this.vx = 0.5;
            } else {
                this.vx = -0.5;
            }
            if (this.isJump) this.vx *= 1.5;
        }

        if (look) {
            this.chaseTime = 120;
            this.stopTime = 0;
            this.flare('balloon', {pattern: "!"});
        } else {
            if (this.chaseTime == 0) this.flare('balloonerace');
        }
        if (this.chaseTime > 0) this.vx *= 3;

        if (this.isOnFloor) {
            //これ以上進めない場合は折り返す
            var isReturnWall = false;
            var isReturnCliff = false;
            if (this.vx > 0) {
                if (this._collision[1].hit) isReturnWall = true;
                if (this.checkMapCollision2(this.x+5, this.y+40, 5, 5) == null) isReturnCliff = true;
            } else if (this.vx < 0) {
                if (this._collision[3].hit) isReturnWall = true;
                if (this.checkMapCollision2(this.x-5, this.y+40, 5, 5) == null) isReturnCliff = true;
            }
            if (isReturnWall || isReturnCliff) {
                if (this.chaseTime > 0) {
                    //プレイヤー追跡中で段差がある場合は飛び越える
                    if (isReturnWall) {
                        if (this.direction == 0) {
                            if (this.x < pl.x) {
                                this.isJump = true;
                                this.vy = -10;
                            }
                        } else {
                            if (this.x > pl.x) {
                                this.isJump = true;
                                this.vy = -10;
                            }
                        }
                    }
                    //プレイヤー追跡中で崖がある場合は着地点があるか調べて飛び降りる
                    if (isReturnCliff) {
                        var jumpOk = false;
                        if (this.direction == 0) {
                            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 96)) jumpOk = true;
                        } else {
                            if (this.checkMapCollision2(this.x-5, this.y+20, 5, 96)) jumpOk = true;
                        }
                        if (jumpOk) {
                            this.isJump = true;
                            this.vy = -5;
                        } else {
                            //着地点が無い場合は諦めて折り返す
                            this.chaseTime = 0;
                            this.stopTime = 30;
                            this.turnWait = 15;
                            this.direction = (this.direction + 180) % 360;
                            this.vx = 0;
                            this.flare('balloon', {pattern: "..."});
                         }
                    }
                } else {
                    this.direction = (this.direction + 180) % 360;
                    this.vx *= -1;
                    this.turnWait = 1;
                }
            }

            //攻撃
            if (look && !this.isJump && dis < 64 && !this.isAttack) {
                this.attack();
            }
        }
        if (this.chaseTime == 30) this.flare('balloon', {pattern: "?"});
    },

    attack: function() {
        var that = this;
        var atk = qft.EnemyAttack(this.parentScene, {width: 1, height: 24, power: 40 + this.level * 5})
            .addChildTo(this.parentScene.enemyLayer)
            .setPosition(this.x + this.scaleX * 18, this.y)
            .setAlpha(0.0);
        if (DEBUG_COLLISION) atk.setAlpha(0.3);
        atk.master = this;
        atk.tweener.setUpdateType('fps');
        atk.update = function() {
            this.x = that.x + that.scaleX * 18;
        }

        atk.isActive = false;
        atk.tweener.clear()
            .wait(6)
            .call(function() {
                atk.isActive = true;
                that.vx = 24 * that.scaleX;
            })
            .wait(6)
            .call(function() {
                that.isAttack = false;
                atk.remove();
            });
        this.isAttack = true;
        this.stopTime = 30;

        qft.Character.balloon({pattern: "anger2"}).addChildTo(this).setPosition(0, -this.height/2-10);
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [3, 4, 5, 4];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },
});

/*
 *  enemy.wisp.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ウィスプ
phina.define("qft.Enemy.Wisp", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 10,

    //重力加速度
    gravity: 0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 360,

    //地形無視
    ignoreCollision: true,

    //得点
    point: 100,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_STONE,

    //レアドロップ率（％）
    rareDropRate: 0,
    rareDropItem: ITEM_STONE,

    //属性ダメージ倍率
    damageFire: 0.8,
    damageIce: 2,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(Math.min(this.level, 4) * 72, 512, 72, 128);

        this.hp += this.level * 5;
        this.power += this.level * 2;
        this.eyesight += this.level * 64,
        this.point += this.level * 200;

        this.setAnimation("stand");
        this.animationInterval = 10;
        this.setupLifeGauge();

        this.direction = 0;
        this.move = false;
        this.attackCount = 0;
    },

    algorithm: function() {
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        //プレイヤーが近くにいたら寄っていく
        if (look) {
            var p1 = phina.geom.Vector2(this.x, this.y);
            var p2 = phina.geom.Vector2(pl.x, pl.y);
            var p = p2.sub(p1);
            p.normalize();
            this.vx = p.x * (1 + this.level * 0.2);
            this.vy = p.y * (1 + this.level * 0.2);
        } else {
            this.vx = 0;
            this.vy = 0;
        }

        //攻撃
        if (this.level > 3 && dis < 128) {
            this.attackCount--;
            if (this.attackCount == 0) {
                for (var i = 0; i < this.level; i++) {
                    var b = this.parentScene.spawnEnemy(this.x, this.y, "WispBomb", {pattern: 1});
                    b.vy = -10;
                    b.vx = (i*2) * this.scaleX;
                }
                this.attackCount = 180 - this.level * 15;
            }
        } else {
            this.attackCount = 60;
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [3, 4, 5, 4];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },
});

//ウィスプ（強）
phina.define("qft.Enemy.WispHard", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 20,

    //重力加速度
    gravity: 0,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 128,

    //視野角
    viewAngle: 360,

    //地形無視
    ignoreCollision: true,

    //得点
    point: 300,

    //アイテムドロップ率（％）
    dropRate: 10,
    dropItem: ITEM_STONE,

    //レアドロップ率（％）
    rareDropRate: 5,
    rareDropItem: ITEM_JEWEL,

    //属性ダメージ倍率
    damageFire: 0.5,
    damageIce: 2,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster01", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(288, 512, 72, 128);

        this.setAnimation("stand");
        this.animationInterval = 10;
        this.setupLifeGauge();

        this.direction = 0;
        this.move = false;
        this.attackCount = 0;
    },

    update: function() {
        var pl = this.parentScene.player;
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        //プレイヤーが近くにいたら寄っていく
        if (look) {
            var player = this.parentScene.player;
            var p1 = phina.geom.Vector2(this.x, this.y);
            var p2 = phina.geom.Vector2(player.x, player.y);
            var p = p2.sub(p1);
            p.normalize();
            this.vx = p.x / 2;
            this.vy = p.y / 2;
        } else {
            this.vx = 0;
            this.vy = 0;
        }

        //攻撃
        if (dis < 160) {
            this.attackCount--;
            if (this.attackCount == 0) {
                for (var i = 0; i < this.level+4; i++) {
                    var b = this.parentScene.spawnEnemy(this.x, this.y, "WispBomb", {pattern: 1});
                    b.vy = -10;
                    b.vx = (i*2) * this.scaleX;
                }
                this.attackCount = 180 - this.level * 15;
            }
        } else {
            this.attackCount = 60;
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [3, 4, 5, 4];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },
});

phina.define("qft.Enemy.WispBomb", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 1,

    //横移動減衰率
    friction: 0.99,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //得点
    point: 0,

    //無敵フラグ
    isMuteki: true,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 10, height: 10});
        options = options || {};
        this.$extend(options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("particle", 16, 16).addChildTo(this).setFrameIndex(31);
        this.animationInterval = 3;

        this.pattern = options.pattern || 1;
        this.setAnimation("pattern"+this.pattern);

        this.on('dead', function() {
        });
    },

    update: function() {
        if (this.isOnFloor) {
            if (this.onScreen) app.playSE("bomb");
            var b = this.parentScene.spawnEnemy(this.x, this.y, "Flame", {pattern: 1});
            this.remove();
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["pattern1"] = [31, 30, 29, 28, 27, 26, "stop"];
        this.frame["pattern2"] = [31, 30, 29, 28, 27, 26, "stop"];
        this.index = 0;
    },

    dropDead: function() {
        this.isDead = true;
        this.isDrop = true;
        return this;
    },
});

/*
 *  enemy.wizard.js
 *  2017/08/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

//ウィザード
phina.define("qft.Enemy.Wizard", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 50,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 256,

    //視野角
    viewAngle: 360,

    //得点
    point: 3000,

    //重力加速度
    gravity: 0,

    //アイテムドロップ率（％）
    dropRate: 30,
    dropItem: ITEM_COIN,

    //レアドロップ率（％）
    rareDropRate: 5,
    rareDropItem: ITEM_BAG,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster03", 24, 32).addChildTo(this)
            .setFrameTrimming(0, 0, 72, 128)
            .setScale(1.2);

        this.hp += this.level * 5;
        this.power += this.level * 2;
        this.point += this.level * 300;

        this.setAnimation("walk");
        this.animationInterval = 10;
        this.setupLifeGauge();

        this.direction = 0;
        this.speed = 1;
        this.isAttack = false;

        //行動フェーズ
        this.phase = "wait";

        //接近戦経過時間
        this.nearCount = 0;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        var player = this.parentScene.player;
        var look = this.isLookPlayer();
        var distance = this.getDistancePlayer();

        //待機中
        if (this.phase == "wait") {
            if (look) {
                this.flare('balloon', {pattern: "!", lifeSpan: 15});
                this.phase = "approach";
            }
        }

        //プレイヤー発見後接近
        if (this.phase == "approach") {
        }

        if (distance < 128) {
            this.nearCount++
        } else {
            this.nearCount = 0;
        }
    },

    //テレポート開始
    teleportIn: function() {
        this.sprite.tweener.fadeOut(30);
        for (var i = 0; i < 7; i++) {
            var sp = phina.display.Sprite("monster03", 24, 32)
                .addChildTo(this)
                .setFrameTrimming(0, 0, 72, 128);
            sp.tweener.setUpdateType('fps').clear()
                .by({x: -64 + i * 16, alpha: -1}, 30,"easeOutSine");
        }
    },

    //テレポート終了
    teleportOut: function() {
        this.sprite.tweener.fadeIn(30);
        for (var i = 0; i < 7; i++) {
            var sp = phina.display.Sprite("monster03", 24, 32)
                .addChildTo(this)
                .setFrameTrimming(0, 0, 72, 128);
            sp.tweener.setUpdateType('fps').clear()
                .by({x: -64 + i * 16, alpha: -1}, 30,"easeOutSine");
        }
    },

    //分身
    cloneMySelf: function() {
    },

    //火炎魔法
    flame: function() {
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [0, 1, 2, 1];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },

    firstFrame: function() {
    },
});

//ウィザード分身
phina.define("qft.Enemy.WizardClone", {
    superClass: "qft.Enemy",

    //ヒットポイント
    hp: 10,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //得点
    point: 0,

    //重力加速度
    gravity: 0,

    //アイテムドロップ率（％）
    dropRate: 0,

    //レアドロップ率（％）
    rareDropRate: 0,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 16, height: 16});
        this.superInit(parentScene, options);

        //表示用スプライト
        var lv = Math.min(this.level, 3);
        this.sprite = phina.display.Sprite("monster03", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming((lv % 2) * 144 + 72, Math.floor(lv / 2) * 128, 72, 128);
        this.sprite.setScale(1.2);

        this.setAnimation("walk");
        this.animationInterval = 10;

        this.direction = 0;
        this.speed = 1;
        this.phase = 0;
        this.isAttack = false;
        this.isTeleport = false;
    },

    algorithm: function() {
        var player = this.parentScene.player;
        var look = this.isLookPlayer();
        var distance = this.getDistancePlayer();

    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [0, 1, 2, 1];
        this.frame["jump"] = [3, "stop"];
        this.frame["walk"] = [3, 4, 5, 4];
        this.frame["up"] =   [3, 4, 5, 4];
        this.frame["down"] = [3, 4, 5, 4];
        this.frame["attack"] = [3, "stop"];
        this.index = 0;
    },
});

/*
 *  item.js
 *  2017/01/04
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アイテムクラス
phina.define("qft.Item", {
    superClass: "qft.Character",

    //識別フラグ
    isItem: true,

    //アイテム種別
    kind: 0,

    //アイテムレベル
    level: 0,

    //捨てアイテム
    throwAway: false,

    //大まかな種別フラグ
    isWeapon: false,
    isEquip: false,
    isFood: false,
    isItem: false,
    isKey: false,

    //敵ドロップアイテムフラグ
    isEnemyDrop: false,

    //アイテム情報
    status: null,

    //反発係数
    rebound: 0.3,

    //アニメーション進行可能フラグ   
    isAdvanceAnimation: false,

    //影表示フラグ
    isShadow: false,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 16, height: 16});

        //アイテムレベル
        this.level = 0;
        this.kind = null;
        if (options.properties) {
            this.level = options.properties.level || 0;
            this.kind = options.properties.kind;
        }
        if (options.kind !== undefined) this.kind = options.kind;

        //アイテム種別
        if (this.kind == null) {
            if (options.name == "food") {
                this.kind = ITEM_APPLE + this.level;
            } else {
                var name = "ITEM_"+options.name.toUpperCase();
                this.kind = eval(name);
            }
        } else if (typeof this.kind === "string") {
            var name = "ITEM_"+this.kind.toUpperCase();
            this.kind = eval(name);
        }

        //アイテムステータス取得
        this.$extend(qft.ItemInfo.get(this.kind));

        //アイテムスプライト
        if (this.isWeapon) {
            //武器の場合
            var index = this.kind * 10 + Math.min(this.level, this.maxIndex);
            this.sprite = phina.display.Sprite("weapons", 24, 24).addChildTo(this).setFrameIndex(index);

            if (this.level > 0) {
                //強化レベル表示
                var labelParam = {
                    fill: "white",
                    stroke: "black",
                    strokeWidth: 2,

                    fontFamily: "Orbitron",
                    align: "center",
                    baseline: "middle",
                    fontSize: 10,
                    fontWeight: ''
                };
                phina.display.Label({text: "+"+this.level}.$safe(labelParam)).setPosition(6, 6).addChildTo(this);
            }
        } else {
            this.sprite = phina.display.Sprite("item", 24, 24).addChildTo(this).setFrameIndex(this.kind);
        }

        //寿命
        this.lifeSpan = 150;

        //アクティブフラグ
        if (this.options.active === undefined || this.options.active == true) {
            this.isActive = true;
        } else {
            this.isActive = false;
        }

        this.on('enterframe', e => {
            //プレイヤーとの当たり判定
            var pl = this.parentScene.player;
            if (this.hitTestElement(pl)) {
                if (this.time > 10 && !this.throwAway) {
                    pl.getItem(this);
                    this.remove();
                }
            } else if (this.time > 30 && this.throwAway) this.throwAway = false;

            if (this.isEnemyDrop) {
                if (this.lifeSpan == 0) this.remove();
                if (this.lifeSpan < 30) {
                    if (this.time % 2 == 0) this.visible = !this.visible;
                } else if (this.lifeSpan < 60){
                    if (this.time % 5 == 0) this.visible = !this.visible;
                } else if (this.lifeSpan < 90) {
                    if (this.time % 10 == 0) this.visible = !this.visible;
                }
                this.lifeSpan--;
            }
        });
    },
});

phina.define("qft.ItemInfo", {
    _static: {
        get: function(kind) {
            switch (kind) {
                case "shortsword":
                case ITEM_SHORTSWORD:
                    return {
                        name: "SHORT SWORD",
                        type: "sword",
                        isWeapon: true,
                        isSlash: true,
                        power: 10,
                        stunPower: 1,
                        maxIndex: 0,
                        collision: {
                            width: 14,
                            height: 30
                        }
                    };
                case "longsword":
                case ITEM_LONGSWORD:
                    return {
                        name: "LONG SWORD",
                        type: "sword",
                        isWeapon: true,
                        isSlash: true,
                        power: 15,
                        stunPower: 5,
                        maxIndex: 7,
                        collision: {
                            width: 24,
                            height: 25
                        }
                    };
                case "ax":
                case ITEM_AX:
                    return {
                        name: "AX",
                        type: "ax",
                        isWeapon: true,
                        isSlash: true,
                        isBrow: true,
                        power: 20,
                        stunPower: 20,
                        maxIndex: 4,
                        collision: {
                            width: 14,
                            height: 26
                        }
                    };
                case "spear":
                case ITEM_SPEAR:
                    return {
                        name: "SPEAR",
                        type: "spear",
                        isWeapon: true,
                        isSting: true,
                        power: 10,
                        stunPower: 1,
                        maxIndex: 4,
                        collision: {
                            width: 39,
                            height: 10
                        }
                    };
                case "bow":
                case ITEM_BOW:
                    return {
                        name: "BOW",
                        type: "bow",
                        isWeapon: true,
                        isBrow: true,
                        power: 5,
                        stunPower: 5,
                        maxIndex: 0,
                        collision: {
                            width: 20,
                            height: 10
                        }
                    };
                case "rod":
                case ITEM_ROD:
                    return {
                        name: "MAGIC ROD",
                        type: "rod",
                        isWeapon: true,
                        isBrow: true,
                        isFire: true,
                        power: 5,
                        stunPower: 10,
                        maxIndex: 7,
                        collision: {
                            width: 20,
                            height: 10
                        }
                    };
                case "book":
                case ITEM_BOOK:
                    return {
                        name: "BOOK",
                        type: "book",
                        isWeapon: true,
                        isBrow: true,
                        isHoly: true,
                        power: 10,
                        stunPower: 40,
                        maxIndex: 0,
                        collision: {
                            width: 20,
                            height: 20
                        }
                    };
                case "shield":
                case ITEM_SHIELD:
                    return {
                        name: "SHIELD",
                        type: "equip",
                        isEquip: true,
                        power: 20,
                        point: 1000,
                    };
                case "armor":
                case ITEM_ARMOR:
                    return {
                        name: "ARMOR",
                        type: "equip",
                        isEquip: true,
                        power: 30,
                        point: 5000,
                    };
                case "hat":
                case ITEM_HAT:
                    return {
                        name: "HAT",
                        type: "equip",
                        isEquip: true,
                        power: 10,
                        point: 300,
                    };
                case "boots":
                case ITEM_BOOTS:
                    return {
                        name: "BOOTS",
                        type: "equip",
                        isEquip: true,
                        power: 10,
                        point: 500,
                    };
                case "grove":
                case ITEM_GROVE:
                    return {
                        name: "GROVE",
                        type: "equip",
                        isEquip: true,
                        power: 10,
                        point: 500,
                    };
                case "ring":
                case ITEM_RING:
                    return {
                        name: "RING",
                        type: "equip",
                        isEquip: true,
                        power: 20,
                        point: 3000,
                    };
                case "scroll":
                case ITEM_SCROLL:
                    return {
                        name: "SCROLL",
                        type: "item",
                        isItem: true,
                        point: 1000,
                    };
                case "letter":
                case ITEM_LETTER:
                    return {
                        name: "LETTER",
                        type: "item",
                        isItem: true,
                        point: 100,
                    };
                case "card":
                case ITEM_CARD:
                    return {
                        name: "CARD",
                        type: "item",
                        isItem: true,
                        point: 1000,
                    };
                case "key":
                case ITEM_KEY:
                    return {
                        name: "KEY",
                        type: "key",
                        isKey: true,
                        point: 2000,
                    };
                case "coin":
                case ITEM_COIN:
                    return {
                        name: "COIN",
                        type: "item",
                        isItem: true,
                        point: 500,
                    };
                case "bag":
                case ITEM_BAG:
                    return {
                        name: "BAG",
                        type: "item",
                        isItem: true,
                        point: 1000,
                    };
                case "orb":
                case ITEM_ORB:
                    return {
                        name: "ORB",
                        type: "item",
                        isItem: true,
                        point: 5000,
                    };
                case "stone":
                case ITEM_STONE:
                    return {
                        name: "STONE",
                        type: "item",
                        isItem: true,
                        point: 2000,
                    };
                case "jewel":
                case ITEM_JEWEL:
                    return {
                        name: "JEWEL",
                        type: "item",
                        isItem: true,
                        point: 5000,
                    };
                case "jewelbox":
                case ITEM_JEWELBOX:
                    return {
                        name: "JEWELBOX",
                        type: "item",
                        isItem: true,
                        point: 10000,
                    };
                case "apple":
                case ITEM_APPLE:
                    return {
                        name: "APPLE",
                        type: "food",
                        isFood: true,
                        power: 20,
                    };
                case "harb":
                case ITEM_HARB:
                    return {
                        name: "HARB",
                        type: "food",
                        isFood: true,
                        power: 40,
                    };
                case "meat":
                case ITEM_MEAT:
                    return {
                        name: "MEAT",
                        type: "food",
                        isFood: true,
                        power: 60,
                    };
                case "potion":
                case ITEM_POTION:
                    return {
                        name: "POTION",
                        type: "food",
                        isFood: true,
                        power: 100,
                    };
                default:
                    return {};
            }
        },
    },
});


/*
 *  itembox.js
 *  2017/01/04
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アイテムボックスクラス
phina.define("qft.ItemBox", {
    superClass: "qft.Character",

    //識別フラグ
    isItemBox: true,

    //耐久力
    hp: 1,

    //開いたフラグ
    opened: false,

    //アイテム種別
    kind: 0,

    //アニメーション間隔
    animationInterval: 3,

    //反発係数
    rebound: 0.3,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 26, height: 26}.$safe(options.properties));

        //アイテムボックススプライト
        this.sprite = phina.display.Sprite("itembox", 32, 32)
            .addChildTo(this)
            .setScale(0.8)
            .setFrameIndex(0);
        this.sprite.tweener.setUpdateType('fps');

        this.setAnimation("close");

        //内容物
        this.name = options.name;
        this.kind = options.properties? options.properties.kind: undefined;
        this.level = options.properties? options.properties.level: 0;
    },

    update: function() {
        if (!this.opened) {
            //プレイヤー攻撃（固定）との当たり判定
            var pl = this.parentScene.player;
            if (pl.isAttack && this.hitTestElement(pl.attackCollision)) {
                this.damage(pl);
            }
            //プレイヤー攻撃判定との当たり判定
            this.parentScene.playerLayer.children.forEach(function(e) {
                if (e instanceof qft.PlayerAttack && e.isCollision && this.hitTestElement(e)) {
                    e.remove();
                    this.damage(e);
                }
            }.bind(this));
        }
        this.visible = true;    //点滅キャンセル
    },

    damage: function(target) {
        if (this.opened) return;
        this.hp -= target.power;
        this.mutekiTime = 10;
        if (this.hp <= 0) {
            this.open();
        }
        if (this.x < target.x) {
            this.sprite.tweener.clear().moveBy(-5, 0, 2).moveBy(5, 0, 2);
        } else {
            this.sprite.tweener.clear().moveBy(5, 0, 2).moveBy(-5, 0, 2);
        }
    },

    open: function() {
        this.isAdvanceAnimation = true;
        this.opened = true;
        this.setAnimation("open");
        switch (this.name) {
            case "empty":
                break;
            case "item":
                this.tweener.clear()
                    .wait(10)
                    .call(function() {
                        var options = {
                            kind: this.kind,
                            properties: {
                                level: this.level
                            }
                        };
                        var i = this.parentScene.spawnItem(this.x, this.y, options);
                        i.vy = -5;
                    }.bind(this));
                break;
            default:
                this.tweener.clear()
                    .wait(10)
                    .call(function() {
                        var options = {
                            name: this.name,
                            properties: {
                                level: this.level
                            }
                        };
                        var i = this.parentScene.spawnItem(this.x, this.y, options);
                        i.vy = -5;
                    }.bind(this));
                break;
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        if (this.options.color == "gold") {
            this.frame["close"] = [2];
            this.frame["open"] = [2, 6, 8, "stop"];
        } else if (this.options.color == "red") {
            this.frame["close"] = [1];
            this.frame["open"] = [1, 4, 7, "stop"];
        } else if (this.options.color == "blue") {
            this.frame["close"] = [0];
            this.frame["open"] = [0, 3, 6, "stop"];
        } else {
            this.frame["close"] = [1];
            this.frame["open"] = [1, 4, 7, "stop"];
        }
        this.index = 0;
    },
});

/*
 *  mapobject.accessory.js
 *  2017/01/14
 *  @auther minimo  
 *  This Program is MIT license.
 */

qft.MapObject = qft.MapObject || {};

//マップ装飾アクセサリ
phina.define("qft.MapObject.Accessory", {
    superClass: "qft.Character",

    id: null,

    //識別フラグ
    isMapAccessory: true,

    //重力加速度
    gravity: 0.0,

    //アニメーション間隔
    animationInterval: 2,

    isAdvanceAnimation: true,

    //地形無視
    ignoreCollision: true,

    init: function(parentScene, options) {
        this.options = (options || {}).$safe({
            width: 32,
            height: 32,
            index: 0,
        })
        this.superInit(parentScene, {width: this.options.width, height: this.options.height});

        this.id = options.id;
        this.level = options.properties.level || 0;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["normal"] = [2, 1, 0, 3];
        this.frame["normal2"] = [1, 0, 3, 2];
        this.index = 0;
    },
});

//ランプ
phina.define("qft.MapObject.Lamp", {
    superClass: "qft.MapObject.Accessory",

    init: function(parentScene, options) {
        this.superInit(parentScene, options);

        //スプライト
        this.sprite = phina.display.Sprite("flame02", 24, 32).addChildTo(this).setFrameIndex(0);
        this.sprite.setFrameTrimming(this.level * 24, 0, 24, 128);

        //アニメーション設定
        if (this.id % 2) {
            this.setAnimation("normal");
        } else {
            this.setAnimation("normal2");
        }
        this.animationInterval = 8;
    },
});

//たき火
phina.define("qft.MapObject.Bonfire", {
    superClass: "qft.MapObject.Accessory",

    init: function(parentScene, options) {
        this.superInit(parentScene, options);

        //スプライト
        this.sprite = phina.display.Sprite("flame02", 24, 32).addChildTo(this).setFrameIndex(0);
        this.sprite.setFrameTrimming(this.level * 24, 128, 24, 128);

        //アニメーション設定
        this.setAnimation("normal");
        this.animationInterval = 3;
    },
});

//炎
phina.define("qft.MapObject.Flame", {
    superClass: "qft.MapObject.Accessory",

    init: function(parentScene, options) {
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("flame02", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(this.level * 24 + 72, 0, 24, 128);

        //アニメーション設定
        this.setAnimation("normal");
        this.animationInterval = 3;
    },
});

//火
phina.define("qft.MapObject.Fire", {
    superClass: "qft.MapObject.Accessory",

    init: function(parentScene, options) {
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("flame05", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(this.level * 24 + 72, 0, 24, 128);

        //アニメーション設定
        this.setAnimation("normal");
        this.animationInterval = 3;
    },
});

//燭台
phina.define("qft.MapObject.Candle", {
    superClass: "qft.MapObject.Accessory",

    init: function(parentScene, options) {
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("flame05", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(this.level * 24 + 72, 128, 24, 128);

        //アニメーション設定
        this.setAnimation("normal");
        this.animationInterval = 3;
    },
});

//ランタン
phina.define("qft.MapObject.Lanthanum", {
    superClass: "qft.MapObject.Accessory",

    init: function(parentScene, options) {
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("accessory1", 16, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 96, 72, 32);

        //アニメーション設定
        this.setAnimation("normal");
        this.animationInterval = 3;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["normal"] = [0, 1, 2, 1];
        this.index = 0;
    },
});

//ランプ２
phina.define("qft.MapObject.CandleLamp", {
    superClass: "qft.MapObject.Accessory",

    init: function(parentScene, options) {
        this.superInit(parentScene, options);

        //表示用スプライト
        this.sprite = phina.display.Sprite("accessory1", 16, 32).addChildTo(this);
        this.sprite.setFrameTrimming(0, 32, 72, 32);

        //アニメーション設定
        this.setAnimation("normal");
        this.animationInterval = 3;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["normal"] = [0, 1, 2, 1];
        this.index = 0;
    },
});

/*
 *  mapobject.block.js
 *  2017/03/13
 *  @auther minimo  
 *  This Program is MIT license.
 */

qft.MapObject = qft.MapObject || {};

//ブロッククラス
phina.define("qft.MapObject.Block", {
    superClass: "qft.Character",

    id: null,

    //耐久力
    hp: 30,

    //識別フラグ
    isBlock: true,

    //重力加速度
    gravity: 0.0,

    //アニメーション間隔
    animationInterval: 1,

    isAdvanceAnimation: false,

    //地形無視
    ignoreCollision: true,

    init: function(parentScene, options) {
        this.options = (options || {}).$safe({
            width: 32,
            height: 32,
            index: 0,
        })
        this.superInit(parentScene, {width: this.options.width, height: this.options.height});

        this.id = options.id;

        //スプライト
        this.index = options.index;
        this.sprite = phina.display.Sprite("block", 32, 32).addChildTo(this).setFrameIndex(this.index);

        var param = {
            width: 32,
            height: 32,
            fill: "rgba(0, 0, 0, 0.0)",
            stroke: "black",
            strokeWidth: 1,
            backgroundColor: 'transparent',
        };
        this.waku = phina.display.RectangleShape(param).setPosition(0, 0);
        if (options.enableFrame) this.waku.addChildTo(this);

        //スクリプト
        if (options.properties.script) {
            var sc = "(function(app) {"+options.properties.script+"})";
            var f = eval(sc);
            this.on('enterframe', f);
        }

        this.on('dead', function() {
            this.sprite.remove();
            this.waku.remove();
            if (this.collision) this.collision.remove();
            var s = [];
            s[0] = phina.display.Sprite("block", 16, 16).addChildTo(this).setPosition(-8, -8).setFrameIndex(this.index * 2 + 0);
            s[1] = phina.display.Sprite("block", 16, 16).addChildTo(this).setPosition( 8, -8).setFrameIndex(this.index * 2 + 1);
            s[2] = phina.display.Sprite("block", 16, 16).addChildTo(this).setPosition(-8,  8).setFrameIndex(this.index * 2 + 16 + 0);
            s[3] = phina.display.Sprite("block", 16, 16).addChildTo(this).setPosition( 8,  8).setFrameIndex(this.index * 2 + 16 + 1);
            //スプライトがバラバラに壊れるよ
            (4).times(function(i) {
                s[i].update = function() {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.vx *= 0.9;
                    this.vy += 0.9;
                    this.rotation += this.rot;
                    this.alpha -= 0.05;
                }
                s[i].vx = 0;
                s[i].vy = -5;
            }.bind(this));
            s[0].vx = -6; s[0].rot = -3;
            s[1].vx =  6; s[1].rot =  3;
            s[2].vx = -3; s[2].rot = -3;
            s[3].vx =  3; s[3].rot =  3;
            this.tweener.clear()
                .wait(10)
                .call(function() {
                    this.remove();
                }.bind(this));
        });
    },

    update: function(e) {
        if (this.collision) {
            this.collision.x = this.x;
            this.collision.y = this.y;
        }
        if (!this.isDead) {
            //プレイヤー攻撃（固定）との当たり判定
            var pl = this.parentScene.player;
            if (pl.isAttack && this.hitTestElement(pl.attackCollision)) {
                this.damage(pl);
            }
            //プレイヤー攻撃判定との当たり判定
            this.parentScene.playerLayer.children.forEach(function(e) {
                if (e instanceof qft.PlayerAttack && e.isCollision && this.hitTestElement(e)) {
                    e.remove();
                    this.damage(e);
                }
            }.bind(this));
        }
        this.visible = true;    //点滅キャンセル
    },

    damage: function(target) {
        if (this.isDead) return;
        if (this.mutekiTime > 0) return;
        this.hp -= target.power;
        this.mutekiTime = 10;
        if (this.hp <= 0) {
            this.isDead = true;
            this.flare('dead');
            return;
        }
        var dir = 2;
        if (this.x < target.x) dir = -2;
        this.sprite.tweener.clear()
            .moveBy(dir, 0, 1)
            .moveBy(-dir, 0, 1)
            .call(function(){
                app.playSE("hit_blunt");
            });
    },

    //当たり判定の追加
    addCollision: function (layer) {
        this.collision = phina.display.RectangleShape({width: 32, height: 32})
            .addChildTo(layer)
            .setPosition(this.x, this.y)
            .setVisible(DEBUG_COLLISION);
        this.collision.alpha = 0.3;
        this.collision.vx = 0;
        this.collision.vy = 0;
        this.collision.ignore = false;
        this.collision.type = "block";
    }
});

/*
 *  mapobject.door.js
 *  2017/01/14
 *  @auther minimo  
 *  This Program is MIT license.
 */

qft.MapObject = qft.MapObject || {};

//大型ドアクラス
phina.define("qft.MapObject.Door", {
    superClass: "qft.Character",

    id: null,

    //重力加速度
    gravity: 0.0,

    //アニメーション間隔
    animationInterval: 3,

    //地形無視
    ignoreCollision: true,

    //実行済みフラグ
    already: false,

    //ロックされているか
    isLock: false,

    init: function(parentScene, options) {
        var width = options.width || 36;
        var height = options.height || 64;
        this.superInit(parentScene, {width: width, height: height});

        //スプライト
        this.sprite = phina.display.Sprite("door", 36, 64).addChildTo(this).setFrameIndex(3);
        this.setAnimation("closed");

        this.id = options.id;
        this.isLock = options.properties.lock || false;
        this.name = options.name;
        this.enterOffset = options.properties.enterOffset || 0;
        this.sprite.visible = options.properties.visible == undefined? true: options.properties.visible;

        //ドア機能
        var properties = options.properties;
        switch (options.name) {
            //クリア
            case "clear":
                this.isLock = true;
                this.on('enterdoor', function() {
                    this.parentScene.flare('stageclear');
                });
                break;
            //マップ内移動
            case "warp":
                this.nextID = properties.nextID;
                this.offset = properties.offset || 0;
                this.on('enterdoor', function() {
                    //行き先の検索
                    var next = this.findDoor(this.nextID);
                    if (!next) return;
                    this.enterPlayer();
                    this.parentScene.warp(next.x, next.y+next.offset);
                    this.tweener.clear()
                        .wait(120)
                        .call(function(){
                            this.already = false;
                            next.leavePlayer();
                        }.bind(this));
                });
                break;
            //マップ切り替え
            case "mapswitch":
                this.nextID = properties.nextID;
                this.offset = properties.offset || 0;
                this.toLayerNumber = properties.toLayerNumber;
                this.on('enterdoor', function() {
                    var layer = this.parentScene.stageController.mapLayer[this.toLayerNumber];
                    var next = this.parentScene.stageController.findObject(this.nextID, this.toLayerNumber);
                    if (!next) return;
                    this.enterPlayer();
                    this.tweener.clear()
                        .wait(60)
                        .call(function(){
                            this.parentScene.switchMap(layer);
                            this.parentScene.player.setPosition(next.x, next.y + next.offset);
                            this.already = false;
                            next.leavePlayer();
                        }.bind(this));
                    this.parentScene.fg.tweener.clear().wait(30).fadeIn(30).fadeOut(30);
                });
                break;
        }
    },

    update: function(e) {
        //近くに来たら自動的に開ける
        if (this.getDistancePlayer() < 64) {
            if (!this.isLock) this.open();
        } else {
            if (this.nowAnimation == "open") {
                this.close();
            }
        }

        //プレイヤーとの当たり判定
        var pl = this.parentScene.player;
        var hit = this.hitTestElement(pl);
        if (hit && !this.isLock && !this.already) {
            if (this.name == "clear") {
                //ステージクリアの扉は無条件で入る
                this.flare('enterdoor');
                this.already = true;
            }
        }
    },

    setupAnimation: function(options) {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["opend"] = [3, "stop"];
        this.frame["closed"] = [2, "stop"];
        this.frame["open"] = [2, 1, 0, 3, "stop"];
        this.frame["close"] = [3, 0, 1, 2, "stop"];
        this.index = 0;
    },

    open: function() {
        this.setAnimation("open");
    },

    close: function() {
        this.setAnimation("close");
    },

    //プレイヤーが扉に入る
    enterPlayer: function() {
        var enterOffset = this.enterOffset;
        var player = this.parentScene.player;
        player.alpha = 0;
        player.isControl = false;
        player.isMuteki = true;
        var pl = qft.PlayerDummy("player1")
            .setPosition(player.x, player.y)
            .addChildTo(this.parentScene.mapLayer.playerLayer);
        pl.setAnimation("up");
        pl.tweener.clear().setUpdateType('fps')
            .moveTo(this.x, this.y+this.height/2-16+enterOffset, 15)
            .call(function() {
                pl.animation = false;
            })
            .fadeOut(15)
            .call(function() {
                pl.remove();
            });
    },

    //プレイヤーが扉から出る
    leavePlayer: function() {
        var player = this.parentScene.player;
        player.alpha = 0;
        player.isControl = false;
        player.isMuteki = true;
        var pl = qft.PlayerDummy("player1")
            .setPosition(this.x, this.y+16)
            .addChildTo(this.parentScene.mapLayer.playerLayer);
        pl.alpha = 0;
        pl.setAnimation("down");
        pl.tweener.clear().setUpdateType('fps')
            .fadeIn(15)
            .moveTo(player.x, player.y, 30)
            .fadeIn(10)
            .call(function() {
                player.alpha = 1;
                player.isControl = true;
                player.isMuteki = false;
                pl.remove();
            });
    },

    //他の扉を検索
    findDoor: function(id) {
        var result = null;
        this.parentScene.objLayer.children.forEach(function(e) {
            if (e instanceof qft.MapObject.Door) {
                if (e.id == id) result = e;
            }
        }.bind(this));
        return result;
    },
});

/*
 *  mapobject.floor.js
 *  2017/03/27
 *  @auther minimo  
 *  This Program is MIT license.
 */

qft.MapObject = qft.MapObject || {};

//可動フロアクラス
phina.define("qft.MapObject.Floor", {
    superClass: "qft.Character",

    id: null,

    //識別フラグ
    isFloor: true,

    //重力加速度
    gravity: 0.0,

    //移動フラグ
    isActive: true,

    //プレイヤーが上に乗ってるフラグ
    isOnPlayer: false,

    //アニメーション進行可能フラグ
    isAdvanceAnimation: false,

    //地形無視
    ignoreCollision: true,

    //移動パス
    movePath: null,

    //移動パス現在時間(0-1)
    pathTime: 0,

    init: function(parentScene, options) {
        this.options = (options || {}).$safe({
            width: 32,
            height: 32,
            index: 0,
        })
        this.superInit(parentScene, {width: this.options.width, height: this.options.height});

        this.id = options.id;

        this.moveType = options.properties.moveType || "linear";
        this.moveAngle = options.properties.moveAngle || 0;
        this.moveLength = options.properties.moveLength || 0;
        this.moveRadius = options.properties.moveRadius || 64;
        this.moveSpeed = options.properties.moveSpeed || 60;
        this.moveWait = (options.properties.moveWait !== undefined)? options.properties.moveWait: 60;

        //始点と終点
        this.startX = options.x + (options.width || 16) / 2;
        this.startY = options.y + (options.height || 16) / 2;
        if (this.moveLength > 0) {
            //移動距離が設定されている場合
            var rad = this.moveAngle.toRadian();
            this.endX = this.startX + Math.cos(rad) * this.moveLength;
            this.endY = this.startY + Math.sin(rad) * this.moveLength;
        } else {
            //終点座標が設定されている場合
            this.endX = options.properties.endX || this.startX;
            this.endY = options.properties.endY || this.startY;
        }

        //円運動の場合は中心を設定（無い場合は終点を中心とする）
        if (this.moveType == "circle") {
            this.centerX = options.properties.centerX || this.endX;
            this.centerY = options.properties.centerY || this.endY;
        }

        //移動パターン
        switch (this.moveType) {
            //直線運動
            case "linear":
                this.tweener.clear()
                    .moveTo(this.endX, this.endY, this.moveSpeed, "easeInOutSine")
                    .call(function() {this.flare('moveend');}.bind(this))
                    .wait(this.moveWait)
                    .moveTo(this.startX, this.startY, this.moveSpeed, "easeInOutSine")
                    .call(function() {this.flare('movestart');}.bind(this))
                    .wait(this.moveWait)
                    .setLoop(true);
                break;
            //円運動
            case "circle":
                this.angle = 0;
                if (options.properties.counterClockWise) {
                    //反時計回り
                    this.tweener.clear()
                        .to({angle: -360}, this.moveSpeed)
                        .call(function() {this.flare('moveend');}.bind(this))
                        .set({angle: 0})
                        .setLoop(true);
                } else {
                    //時計回り
                    this.tweener.clear()
                        .to({angle: 360}, this.moveSpeed)
                        .call(function() {this.flare('moveend');}.bind(this))
                        .set({angle: 0})
                        .setLoop(true);
                    break;
                }
            //設定されたパスに沿って移動
            case "path":
                break;
        }

        //スプライト
        this.index = options.properties.index || 0;
        var sw = Math.floor(this.width / 16);
        var sh = Math.floor(this.height / 16)+32;
        var top = this.height / 2;
        for (var x = 0; x < sw; x++) {
            var idx = (x % 2) + 1;
            if (x == 0) idx = 0;
            if (x == sw-1) idx = 3;
            var s = phina.display.Sprite("floor", 16, 96)
                .addChildTo(this)
                .setFrameTrimming(this.index * 64, 32, 64, 96)
                .setFrameIndex(idx)
                .setPosition(x * 16 - this.width / 2 + 8, 16-top);
        }
    },

    update: function(e) {
        if (this.moveType == "circle") {
            var rad = this.radius.toRadian();
            this.x = this.centerX + Math.cos(rad) * this.moveRadius;
            this.y = this.centerY + Math.sin(rad) * this.moveRadius;
        } else if (this.moveType == 'path') {
        }

        //停止と再生
        if (!this.isActive) this.tweener.pause();
        if (this.isActive) this.tweener.play();

        if (this.collision) {
            this.collision.vx = this.x - this.collision.x;
            this.collision.vy = this.y - this.collision.y;
            this.collision.x = this.x;
            this.collision.y = this.y;
        }

        //プレイヤーが上に乗っているか判定
        var pl = this.parentScene.player;
        this.isOnPlayer = false;
        if (pl.floorObject && pl.floorObject.parentObject === this) {
            this.isOnPlayer = true;
            //床が下降している時のみ
            if (!pl.isJump && this.collision.vy > 0) {
                pl.y = this.y - this.height * 0.5;
            }
        }
    },

    //フロア当たり判定の追加
    addCollision: function (layer) {
        this.collision = phina.display.RectangleShape({width: this.width, height: this.height})
            .addChildTo(layer)
            .setPosition(this.x, this.y)
            .setVisible(DEBUG_COLLISION);
        this.collision.alpha = 0.3;
        this.collision.vx = 0;
        this.collision.vy = 0;
        this.collision.ignore = false;
        this.collision.type = "movefloor";
        this.collision.parentObject = this;
    },

    //移動パスの設定
    setPath: function(startX, startY, path, loop) {
        this.x = startX;
        this.y = startY;
        this.path = path;
        this.loop = loop;

        if (loop) {
            //距離計算
            var sum = 0;
            for (var i = 0; i < path.length - 1; i++) {
                var p1 = path[i];
                var p2 = path[i+1];
                p2.magnitude = Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
                sum += p2.magnitude;
            }
            //終点から始点までの距離を加算
            var p1 = path[path.length - 1];
            var p2 = path[0];
            p2.magnitude = Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
            sum += p2.magnitude;
            var unit = this.moveSpeed / sum;

            this.tweener.clear().wait(60);
            for (var i = 1; i < path.length; i++) {
                var p = path[i];
                var time = Math.floor(p.magnitude * unit);
                this.tweener.moveTo(startX + p.x, startY + p.y, time);
            }
            this.tweener.moveTo(startX + path[0].x, startY + path[0].y, time);
            this.tweener.setLoop(true);
        } else {
            //往路距離計算
            var sum = 0;
            for (var i = 0; i < path.length - 1; i++) {
                var p1 = path[i];
                var p2 = path[i+1];
                p2.magnitude = Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
                sum += p2.magnitude;
            }
            var unit = this.moveSpeed / sum;

            //復路距離計算
            for (var i = path.length - 1; i > 0; i--) {
                var p1 = path[i];
                var p2 = path[i-1];
                p2.magnitude_ret = Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
            }

            this.tweener.clear().wait(60);
            for (var i = 1; i < path.length; i++) {
                var p = path[i];
                var time = Math.floor(p.magnitude * unit);
                this.tweener.moveTo(startX + p.x, startY + p.y, time);
            }
            this.tweener.wait(60);
            for (var i = path.length - 2; i >= 0; i--) {
                var p = path[i];
                var time = Math.floor(p.magnitude_ret * unit);
                this.tweener.moveTo(startX + p.x, startY + p.y, time);
            }
            this.tweener.setLoop(true);
        }
    },
});

/*
 *  mapobject.gate.js
 *  2017/03/20
 *  @auther minimo  
 *  This Program is MIT license.
 */

qft.MapObject = qft.MapObject || {};

//ワープゲート
phina.define("qft.MapObject.Gate", {
    superClass: "qft.Character",

    id: null,

    //重力加速度
    gravity: 0.0,

    //地形無視
    ignoreCollision: true,

    //実行済みフラグ
    already: false,

    //ロックされているか
    isLock: false,

    //アニメーションフラグ
    isAdvanceAnimation: false,

    init: function(parentScene, options) {
        var width = options.width || 36;
        var height = options.height || 64;
        this.superInit(parentScene, {width: width, height: height});
        this.width_half = width / 2;
        this.height_half = height / 2;

        this.id = options.id;
        this.isLock = options.properties.lock || false;
        this.name = options.name;
        this.enterOffset = options.properties.enterOffset || 0;

        //スプライト
        this.sprite = null;

        //ゲート機能
        var properties = options.properties;
        switch (options.name) {
            //マップ内移動
            case "warp":
                this.nextID = properties.nextID;
                this.offset = properties.offset || 0;
                this.on('enterdoor', function() {
                    //行き先の検索
                    var next = this.findGate(this.nextID);
                    if (!next) return;
                    this.enterPlayer();
                    this.parentScene.warp(next.x, next.y+next.offset);
                    this.tweener.clear()
                        .wait(120)
                        .call(function(){
                            this.already = false;
                            next.leavePlayer();
                        }.bind(this));
                });
                break;
            //マップ切り替え
            case "mapswitch":
                this.nextID = properties.nextID;
                this.offset = properties.offset || 0;
                this.toLayerNumber = properties.toLayerNumber;
                this.on('enterdoor', function() {
                    var layer = this.parentScene.stageController.mapLayer[this.toLayerNumber];
                    var next = this.parentScene.stageController.findObject(this.nextID, this.toLayerNumber);
                    if (!next) return;
                    this.enterPlayer();
                    this.tweener.clear()
                        .wait(60)
                        .call(function(){
                            this.parentScene.switchMap(layer);
                            this.parentScene.player.setPosition(next.x, next.y + next.offset);
                            this.already = false;
                            next.leavePlayer();
                        }.bind(this));
                    this.parentScene.fg.tweener.clear().wait(30).fadeIn(30).fadeOut(30);
                });
                break;
        }

        this.time = 0;
    },

    update: function() {
        //パーティクル
        if (!this.isLock && this.time % 6 == 0) {
            (2).times(function(i) {
                var sp = phina.display.Sprite("particle", 16, 16)
                    .addChildTo(this)
                    .setFrameIndex(0)
                    .setScale(0)
                    .setPosition(Math.randint(-this.width_half, this.width_half), this.height_half + Math.randint(-4, 4));
                sp.alpha = 0.3;
                sp.tweener.clear()
                    .by({y: -48, alpha:  0.9, scaleX:  0.3, scaleY:  0.3}, 1000, "easeInSine")
                    .by({y: -48, alpha: -0.9, scaleX: -0.3, scaleY: -0.3}, 1000, "easeOutSine")
                    .call(function() {
                        this.remove();
                    }.bind(sp));
            }.bind(this));
        }
    },

    //プレイヤーがゲートに入る
    enterPlayer: function() {
        var enterOffset = this.enterOffset;
        var player = this.parentScene.player;
        player.alpha = 0;
        player.isControl = false;
        player.isMuteki = true;
        var pl = qft.PlayerDummy("player1").setPosition(player.x, player.y).addChildTo(this.parentScene.mapLayer.playerLayer);
        pl.setAnimation("walk");
        pl.tweener.clear().setUpdateType('fps')
            .moveTo(this.x, this.y+enterOffset, 15)
            .call(function() {
                pl.animation = false;
            })
            .fadeOut(15)
            .call(function() {
                pl.remove();
            });
    },

    //プレイヤーがゲートから出る
    leavePlayer: function() {
        var player = this.parentScene.player;
        player.alpha = 0;
        player.isControl = false;
        player.isMuteki = true;
        var pl = qft.PlayerDummy("player1").setPosition(this.x, this.y).addChildTo(this.parentScene.mapLayer.playerLayer);
        pl.alpha = 0;
        pl.setAnimation("walk");
        pl.animation = false;
        pl.tweener.clear().setUpdateType('fps')
            .fadeIn(15)
            .moveTo(player.x, player.y, 30)
            .fadeIn(10)
            .call(function() {
                player.alpha = 1;
                player.isControl = true;
                player.isMuteki = false;
                pl.remove();
            });
    },

    //他のゲートを検索
    findGate: function(id) {
        var result = null;
        this.parentScene.objLayer.children.forEach(function(e) {
            if (e instanceof qft.MapObject.Gate) {
                if (e.id == id) result = e;
            }
        }.bind(this));
        return result;
    },
});

/*
 *  mapobject.js
 *  2017/01/14
 *  @auther minimo  
 *  This Program is MIT license.
 */

qft.MapObject = qft.MapObject || {};

//チェックアイコン
phina.define("qft.MapObject.CheckIcon", {
    superClass: "qft.Character",

    //重力加速度
    gravity: 0.0,

    //アニメーション間隔
    animationInterval: 3,

    //地形無視
    ignoreCollision: true,

    init: function(parentScene, options) {
        this.superInit(parentScene, {width: 36, height: 64});
        this.$safe(options);

        //スプライト
        this.sprite = phina.display.Sprite("checkicon", 32, 32).addChildTo(this);
        this.setAnimation("up");
        this.animationInterval = 10;
    },

    update: function(e) {
    },

    setupAnimation: function(options) {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["in"] = [2, 1, 0];
        this.frame["up"] = [5, 4, 3];
        this.frame["down"] = [8, 7, 6];
        this.frame["out"] = [11, 10, 9];
        this.index = 0;
    },
});

//メッセージ表示
phina.define("qft.MapObject.Message", {
    superClass: "phina.display.DisplayElement",

    //オブジェクトID
    id: null,

    //一回のみ表示フラグ
    once: false,

    //表示済みフラグ
    alreadyRead: false,

    init: function(parentScene, options) {
        this.superInit(options);
        this.parentScene = parentScene;
        this.id = options.id;
        this.once = options.properties.once || false;
        this.text = options.properties.text || "TEST";
    },

    update: function(e) {
        //プレイヤーとの当たり判定
        var pl = this.parentScene.player;
        var hit = this.hitTestElement(pl);
        if (hit && !this.alreadyRead) {
            this.parentScene.spawnEventMessage(this.id, this.text);
            this.alreadyRead = true;

            //一回のみの場合はリムーブ
            if (this.once) this.remove();
        }

        //判定を外れたら表示済みフラグを外す
        if (!hit && this.alreadyRead) this.alreadyRead = false;
    },
});

//イベント
phina.define("qft.MapObject.Event", {
    superClass: "phina.display.DisplayElement",

    //オブジェクトID
    id: null,

    //一回のみ表示フラグ
    once: false,

    //実行済みフラグ
    already: false,

    init: function(parentScene, options) {
        this.superInit(options);
        this.parentScene = parentScene;
        this.id = options.id;
        this.once = options.properties.once || false;
        this.properties = options.properties;
    },

    update: function(e) {
        //プレイヤーとの当たり判定
        var pl = this.parentScene.player;
        var hit = this.hitTestElement(pl);
        if (hit && !this.alreadyRead) {
            this.parentScene.spawnEventMessage(this.id, this.text);
            this.already = true;

            //一回のみの場合はリムーブ
            if (this.once) this.remove();
        }

        //判定を外れたら実行済みフラグを外す
        if (!hit && this.already) this.alreadyRead = false;
    },
});

/*
 *  mapobject.npc.js
 *  2017/08/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

//冒険者
phina.define("qft.MapObject.npc", {
    superClass: "qft.Character",

    //移動速度
    speed: 2,

    //アニメーション間隔
    animationInterval: 8,

    //影表示フラグ
    isShadow: true,

    //移動フラグ
    isMove: true,

    //不動フラグ
    toFix: false,

    init: function(parentScene, options) {
        options = (options || {}).$extend({width: 24, height: 20});
        this.superInit(parentScene, options);

        this.sprite = phina.display.Sprite("actor" + (options.properties.actor || "40"), 32, 32).addChildTo(this);
        this.sprite.scaleX = -1;

        this.speed = options.properties.speed || this.speed;
        this.isMove = (options.properties.isMove === undefined? true: options.properties.isMove);
        this.territory = options.properties.territory || null;
        this.direction = options.properties.direction || 0;
        this.text = options.properties.text;

        if (options.properties.toFix) {
            this.ignoreCollision = true;
            this.gravity = 0;
            this.isMove = false;
            this.toFix = true;
            this.one('enterframe', () => {
                this.setupFixedShadow();
            });
        }

        this.setAnimation("walk");

        this.waitTime = 0;

        this.one('enterframe', () => {
            if (!this.isMove) {
                switch (this.direction) {
                    case 0:
                        this.setAnimation("walk");
                        this.scaleX = 1;
                        break;
                    case 90:
                        this.setAnimation("down");
                        break;
                    case 180:
                        this.setAnimation("walk");
                        this.scaleX = -1;
                        break;
                    case 270:
                        this.setAnimation("up");
                        break;
                }
            }
        });
    },

    update: function() {
        if (this.waitTime == 0) {
            if (this.isMove) {
                this.moveAlgorithm();
            }

            //プレイヤー攻撃との当たり判定
            var pl = this.parentScene.player;
            if (pl.isAttack && this.hitTestElement(pl.attackCollision)) {
                //話しかけた事になる
                this.tweener.clear()
                    .wait(5)
                    .call(()=> {
                        var scene = qft.ConversationScene(this.parentScene, this.text);
                        app.pushScene(scene);
                    });
                this.waitTime = 15;

                //向きの調整
                this.setAnimation("walk");
                if (this.x < pl.x) {
                    this.scaleX = 1;
                } else {
                    this.scaleX = -1;
                }
            }
        }

        this.waitTime--;
        if (this.waitTime < 0) this.waitTime = 0;
    },

    moveAlgorithm: function() {
        if (this.isOnFloor) {
            //崖っぷちで折り返す
            if (this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) {
                this.direction = 180;
            } else if (this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) {
                this.direction = 0;
            }

            //壁に当たったら折り返す
            if (this._collision[1].hit) {
                this.direction = 180;
            } else if (this._collision[3].hit) {
                this.direction = 0;
            }

            //テリトリー指定
            if (this.territory) {
                //水平方向のみチェック
                var tx = this.x - this.firstX;
                if (Math.abs(tx) > this.territory) {
                    if (tx > 0) {
                        this.direction = 180;
                    } else {
                        this.direction = 0;
                    }
                }
            }
        }

        if (this.isOnFloor) {
            this.vx =  this.speed;
            if (this.direction == 180) {
                this.vx *= -1;
                this.scaleX = -1;
            } else {
                this.scaleX = 1;
            }
        }
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [13, 14];
        this.frame["jump"] = [36, "stop"];
        this.frame["walk"] = [ 3,  4,  5,  4];
        this.frame["up"] =   [ 9, 10, 11, 10];
        this.frame["down"] = [ 0,  1,  2,  1];
        this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
        this.frame["defense"] = [ 41, 42, 43, 44, "stop"];
        this.frame["damage"] = [ 18, 19, 20];
        this.frame["drop"] = [18, 19, 20];
        this.frame["dead"] = [18, 19, 20, 33, 34, 35, "stop"];
        this.frame["clear"] = [24, 25, 26];
        this.frame["stun"] = [ 18, 19, 20];
        this.index = 0;
        return this;
    },

    //固定影表示セットアップ
    setupFixedShadow: function() {
        var that = this;
        var sc = this.width / 24;
        if (sc < 1) sc += 0.2;
        this.fixedShadowSprite = phina.display.Sprite("shadow", 24, 8)
            .addChildTo(this.parentScene.shadowLayer)
            .setAlpha(0.5)
            .setScale(sc, 1.0);
        this.fixedShadowSprite.update = function() {
            this.alpha = 0.5;
            if (that.alpha < 0.5) this.alpha = that.alpha;
            this.x = that.x;
            this.y = that.y + 16;
        }
    },
});

/*
 *  player.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Player", {
    superClass: "qft.Character",

    //識別フラグ
    isPlayer: true,

    //最大ヒットポイント
    hpMax: 100,

    //ヒットポイント
    hp: 100,

    //攻撃力
    power: 10,

    //気絶確率
    stunPower: 1,

    //防御力
    defense: 10,

    //移動速度
    speed: 5,

    //登坂速度
    speedAscend: 4,

    //下押し連続フレーム数
    downFrame: 0,

    //多段ジャンプ可能回数
    numJump: 0,
    numJumpMax: 1,

    //所持装備アイテム
    equip: null,

    //アイテム所持最大数
    maxItem: 10,

    //所持アイテム
    items: null,

    //所持クリア条件キー
    keys: null,

    //操作可能フラグ
    isControl: true,

    //攻撃中フラグ
    isAttack: false,

    //防御中フラグ
    isDefense: false,

    //ドア上フラグ
    isOnDoor: false,

    //ダミー表示スプライト
    dummy: null,

    //影表示フラグ
    isShadow: true,

    //オートパイロット
    isAuto: false,
    autoKey: {
        up: false,
        right: false,
        down: false,
        left: false,
        attack: false,
        jump: false,
    },

    //前フレームの情報
    before: {
        //操作系
        up: false,
        down: false,
        attack: false,
        jump: false,
        change: false,
        isStun: false,
        isOnFloor: false,
        x: 0,
        y: 0,
    },

    //ステージ開始時ステータス
    startStatus: null,

    init: function(parentScene) {
        this.superInit(parentScene, {width: 16, height: 20});
        var that = this;

        //スプライト背後
        this.back = phina.display.DisplayElement().addChildTo(this).setScale(-1, 1);

        //表示用スプライト
        this.sprite = phina.display.Sprite("player1", 32, 32).addChildTo(this).setFrameIndex(0);
        this.sprite.scaleX = -1;

        //武器用スプライト
        this.weapon = phina.display.Sprite("weapons", 24, 24)
            .addChildTo(this.back)
            .setFrameIndex(0)
            .setOrigin(1, 1)
            .setPosition(3, 3);
        this.weapon.alpha = 0;
        this.weapon.tweener.setUpdateType('fps');
        this.weapon.type = "sword";

        //盾
        this.shield = phina.display.Sprite("item", 24, 24)
//            .addChildTo(this)
            .setFrameIndex(7)
            .setPosition(10, 6)
            .setScale(0.8)
            .setVisible(false);

        //攻撃判定用
        this.attackCollision = phina.display.RectangleShape({width: 14, height: 26});
        //当たり判定デバッグ用
        if (DEBUG_COLLISION) {
            this.one('enterframe', e => {
                this.attackCollision.addChildTo(this.parentScene.playerLayer);
                this.attackCollision.alpha = 0.3;
            });
            this.on('removed', e => {
                this.attackCollision.remove();
            });
        }

        //プレイヤー情報の初期化
        this.reset();

        //はしご判定用
        this.ladderCollision = phina.display.RectangleShape({width: 16, height: 20});

        //初期アニメーション設定
        this.setAnimation("walk");
        this.beforeAnimation = "";

        //死亡時コールバック
        this.on('dead', function(e) {
            this.parentScene.flare('gameover');
        });

        //ステージ開始時ステータス
        this.saveStatus();

        //最後に床上にいた場所を保存
        this.lastOnFloorX = 0;
        this.lastOnFloorY = 0;
    },

    update: function(app) {
        if (this.parentScene.pauseScene) return;

        //オブジェクトレイヤー接触判定
        this.isOnDoor = null;
        this.parentScene.objLayer.children.forEach(function(e) {
            //扉判定
            if (e instanceof qft.MapObject.Door || e instanceof qft.MapObject.Gate) {
                if (e.hitTestElement(this)) {
                    this.isOnDoor = e;
                    return;
                }
            }
        }.bind(this));

        //死亡時は何も出来ない
        if (this.isDead) {
            //マップ外落下
            if (this.isDrop) {
                this.hp = 0;
                this.setAnimation("drop");
            }
            return;
        }

//        this.shield.setVisible(false);
//        this.isDefense = false;

        //プレイヤー操作
        var ct = app.controller;
        //バーチャルパッド情報取得
        var vp = app.virtualPad;
        if (vp.getKey("up")) ct.up = true;
        if (vp.getKey("right")) ct.right = true;
        if (vp.getKey("down")) ct.down = true;
        if (vp.getKey("left")) ct.left = true;
        if (vp.getKey("Z")) ct.attack = true;
        if (vp.getKey("X")) ct.jump = true;

        //オートパイロット
        if (this.isAuto) {
            ct = this.autoKey;
        }

        if (!this.isControl) ct = {};
        if (this.stopTime == 0) {
            //左移動
            if (ct.left && !ct.down) {
                if (!this.isJump && !this.isAttack && !this.isCatchLadder) this.setAnimation("walk");
                //はしご掴み状態で左に壁がある場合は不可
                var c = this._collision[3];
                if (!(this.isCatchLadder && this.checkMapCollision2(c.x+6, c.y, c.width, c.height))) {
                    this.scaleX = -1;
                    this.vx = -this.speed;
                }
            }
            //右移動
            if (ct.right && !ct.down) {
                if (!this.isJump && !this.isAttack && !this.isCatchLadder) this.setAnimation("walk");
                //はしご掴み状態で右に壁がある場合は不可
                var c = this._collision[1];
                if (!(this.isCatchLadder && this.checkMapCollision2(c.x-6, c.y, c.width, c.height))) {
                    this.scaleX = 1;
                    this.vx = this.speed;
                }
            }

            //頭上足元はしご検知
            var headLadder = this.checkHeadLadder();
            var footLadder = this.checkFootLadder();

            //はしご掴み状態で操作分岐
            if (this.isCatchLadder) {
                if (ct.up) {
                    this.vx = 0;
                    this.vy = -this.speedAscend;
                    var c = this._collision[0];
                    if (!headLadder && this.checkMapCollision2(c.x, c.y-6, c.width, c.height)) {
                        this.vy = 0;
                    }
                }
                if (ct.down) {
                    this.vx = 0;
                    this.vy = this.speedAscend;
                }
            } else {
                //ジャンプボタンのみ
                if (ct.jump && !ct.up) {
                    //ジャンプ二段目以降
                    if (this.isJump && this.numJump < this.numJumpMax && this.vy > -5) {
                        this.vy = -11;
                        this.numJump++;
                    }
                    //ジャンプ
                    var chk = this.checkMapCollision2(this.x, this.y-16, 5, 3);
                    if (!this.isJump && this.isOnFloor && !chk) {
                        this.setAnimation("jump");
                        this.isJump = true;
                        this.vy = -11;
                        this.numJump = 1;
                    }
                }
                //上キー押下
                if (ct.up) {
                    //ジャンプ二段目以降
                    if (this.isJump && this.numJump < this.numJumpMax && this.vy > -5) {
                        this.vy = -11;
                        this.numJump++;
                    }
                    //ジャンプ
                    var chk = this.checkMapCollision2(this.x, this.y-16, 5, 3);
                    if (!this.isJump && this.isOnFloor && !this.isOnLadder && !chk) {
                        this.setAnimation("jump");
                        this.isJump = true;
                        this.vy = -11;
                        this.numJump = 1;
                    }
                    //はしごを昇る（階段は接地時のみ）
                    if (this.isOnLadder && !this.isOnStairs || this.isOnFloor && this.isOnStairs) {
                        this.setAnimation("up");
                        this.vx = 0;
                        this.vy = 0;
                        this.isCatchLadder = true;
                        this.throughFloor = null;
                    }
                    //扉に入る（接地時＆左右キーオフ時のみ）
                    if (!ct.left && !ct.right && this.isOnFloor && this.isOnDoor && !this.isOnDoor.isLock && !this.isOnDoor.already) {
                        this.vx = 0;
                        this.vy = 0;
                        this.isOnDoor.flare('enterdoor');
                        this.isOnDoor.already = false;
                    }
                }
                //下キー押下
                if (ct.down) {
                    //はしごを降りる
                    if (footLadder) {
                        this.setAnimation("up");
                        this.vx = 0;
                        this.vy = 0;
                        this.isCatchLadder = true;
                        this.throughFloor = null;
                    }
                    //床スルー
                    if (this.downFrame > 6 && !this.jump && !footLadder) {
                        if (this.isOnFloor && !this.throughFloor) {
                            var floor = this.checkMapCollision2(this.x, this.y+16, 5, 5);
                            if (floor && floor[0].enableThrough) this.throughFloor = floor[0];
                        }
                    }
                    //盾を構える
                    if (!this.isAttack) {
//                        this.shield.setVisible(true);
//                        this.isDefense = true;
//                        this.setAnimation("defense");
                    }
                }
            }

        }

        //はしごから外れたら梯子掴み状態キャンセル
        if (this.isCatchLadder) {
            if (!this.isOnLadder && !ct.down || this.isOnLadder && !footLadder && !ct.up) {
                this.isCatchLadder = false;
            }
        }

        //攻撃
        if (!this.isAttack) {
            if (this.isOnFloor) {
                if (this.nowAnimation != "damage" && !this.isDefense) this.setAnimation("walk");
            } else if (this.isCatchLadder) {
                if (ct.up) {
                    this.setAnimation("up");
                } else if (ct.down) {
                    if (this.isOnStairs) {
                        this.setAnimation("down");
                    } else {
                        this.setAnimation("up");
                    }
                }
            } else {
                if (!this.isStun && !this.isDead) this.setAnimation("jump");
            }
            if (ct.attack && !this.before.attack && this.stopTime == 0 && !(this.isCatchLadder && this.isOnLadder)) {
                this.isCatchLadder = false;
                this.setAnimation("attack");
                this.weaponAttack();
            }

            //武器の変更
            if (ct.change && !this.before.change && this.equip.switchOk) {
                this.switchWeapon();
            }
        }

        //気絶状態
        if (this.isStun) {
            this.setAnimation("stun");

            //梯子掴みキャンセル
            this.isCatchLadder = false;

            //レバガチャで気絶復帰を早める
            if (ct.left && !ct.before.left ||
                ct.right && !ct.before.right ||
                ct.up && !ct.before.up ||
                ct.down && !ct.before.down) this.stopTime -= 2;
        } else if (this.before.isStun) {
            //気絶復帰したらアニメーションを標準に
            this.setAnimation("stand");
        }

        //死亡状態
        if (this.isDead) {
            this.setAnimation("dead");
            this.isCatchLadder = false;
        }

        //アニメーション変更を検知
        if (this.nowAnimation != this.beforeAnimation) {
            this.time = 0;
            this.isAdvanceAnimation = true;
            this.animationInterval = 6;
            if (this.nowAnimation == "attack") this.animationInterval = 2;
            if (this.nowAnimation == "defense") this.animationInterval = 1;
        } else {
            //歩行アニメーションの場合は移動している時のみ進める
            if (this.nowAnimation == "walk" && !ct.left && !ct.right) {
                this.isAdvanceAnimation = false;
            } else {
                this.isAdvanceAnimation = true;
            }
            if (this.nowAnimation == "up" || this.nowAnimation == "down") {
                if (ct.up || ct.down || ct.left || ct.right) {
                    this.isAdvanceAnimation = true;
                } else {
                    this.isAdvanceAnimation = false;
                }
            }
        }

        //攻撃判定追従
        this.attackCollision.x = this.x + this.scaleX * 12;
        this.attackCollision.y = this.y;

        //コントローラ他情報保存
        this.before.up = ct.up;
        this.before.down = ct.down;
        this.before.attack = ct.attack;
        this.before.jump = ct.up || ct.jump;
        this.before.change = ct.change;
        this.before.isStun = this.isStun;
        this.before.inOnFloor = this.isOnFloor;
        this.before.x = this.x;
        this.before.y = this.y;

        //ダウンキー連続押下フレームカウント
        if (this.isOnFloor && !this.isCatchLadder && ct.down && !ct.right && !ct.left && !ct.up && !ct.attack) {
            this.downFrame++;
        } else {
            this.downFrame = 0;
        }

        //接地時座標保存
        if (this.isOnFloor && this._collision[2].hit.type != "movefloor") {
            this.lastOnFloorX = this.x;
            this.lastOnFloorY = this.y;
        }
    },

    //プレイヤー情報リセット
    reset: function() {
        //移動情報
        this.vx = 0;
        this.vy = 0;

        //ステータス
        this.hp = this.hpMax;

        //各種フラグ
        this.isJump = false;
        this.isDead = false;
        this.isCatchLadder = false;
        this.isDrop = false;
        this.isOnFloor = false;
        this.isAdvanceAnimation = true;
        this.ignoreCollision = false;

        //経過時間系
        this.mutekiTime = 0;
        this.stopTime = 0;
        this.downFrame = 0;
        this.time = 0;

        //アニメーション
        this.setAnimation("walk");
        this.beforeAnimation = "";
        this.animationInterval = 6;

        //所持装備
        this.equip = {
            using: 0,         //現在使用中（weaponsのindex）
            weapons: [0],     //所持リスト（最大３）
            level: [0],       //武器レベル
            switchOk: true,   //変更可能フラグ
        };

        //武器セット
        this.setWeapon(this.equip.weapons[this.equip.using]);

        //所持アイテム
        this.items = [];

        //所持クリア条件キー
        this.keys = [];

        //操作可能フラグ
        this.isControl = true;

        //多段ジャンプ最大回数
        this.numJumpMax = 0;

        //ダミースプライト除去
        if (this.dummy) {
            this.dummy.remove();
            this.dummy = null;
        }

        return this;
    },

    //プレイヤー情報コンティニュー用リセット
    continueReset: function() {
        //移動情報
        this.vx = 0;
        this.vy = 0;

        //ステータス
        this.hp = this.hpMax;

        //各種フラグ
        this.isJump = false;
        this.isDead = false;
        this.isCatchLadder = false;
        this.isDrop = false;
        this.isOnFloor = false;
        this.isAdvanceAnimation = true;
        this.ignoreCollision = false;

        //経過時間系
        this.mutekiTime = 0;
        this.stopTime = 0;
        this.downFrame = 0;
        this.time = 0;

        //アニメーション
        this.setAnimation("walk");
        this.beforeAnimation = "";
        this.animationInterval = 6;

        //操作可能フラグ
        this.isControl = true;

        //多段ジャンプ最大回数
        this.numJumpMax = 0;

        //ダミースプライト除去
        if (this.dummy) {
            this.dummy.remove();
            this.dummy = null;
        }
        this.sprite.visible = true;

        return this;
    },

    //ダメージ処理
    damage: function(target) {
        if (this.mutekiTime > 0) return false;
        if (target.power == 0) return false;
        if (this.isDead) return false;
        if (this.isMuteki) return false;

        //気絶キャンセル
        this.isStun = false;

        var dir = 0;
        if (this.x < target.x) dir = 180;
        if (!this.isCatchLadder) this.knockback(target.power, dir);

        this.hp -= target.power;
        this.isCatchLadder = false;
        app.playSE("damage");

        if (this.hp <= 0) {
            this.dead();
        } else {
            this.mutekiTime = 60;
            this.stopTime = 15;
            if (this.nowAnimation != "jump") this.setAnimation("damage");

            //気絶判定
            var dice = Math.randint(1, 100);
            if (dice <= target.stunPower) {
                this.flare('stun', {power: 10});
                this.setAnimation("stun");
            }
        }
        return true;
    },

    //死亡時処理
    dead: function() {
        this.hp = 0;
        this.isDead = true;
        this.isCatchLadder = false;
        this.vx = 0;
        this.vy = -6;
        var tw = phina.accessory.Tweener().attachTo(this).setUpdateType('fps');
        tw.clear()
            .wait(60)
            .call(function(){
                this.flare('dead');
                tw.remove();
            }.bind(this));

        //ダミースプライト追加
        this.sprite.visible = false;
        this.dummy = qft.PlayerDummy("player1").addChildTo(this).setAnimation("dead");
    },

    //アイテム取得
    getItem: function(item) {
        //武器
        if (item.isWeapon) {
            //既に持っている武器かチェック
            var index = this.equip.weapons.findIndex(function(e, i, a) {
                return e == item.kind;
            });
            if (index == null || index == -1) {
                //持って無い武器だった場合
                if (this.equip.weapons.length < 3) {
                    //リストに追加
                    this.equip.weapons.push(item.kind);
                    this.equip.level.push(item.level);
                } else {
                    //現在使用武器の手前の武器を捨てる
                    var dropIndex = this.equip.using == 0? 2: this.equip.using - 1;
                    var options = {
                        properties: {
                            kind: this.equip.weapons[dropIndex],
                            level: this.equip.level[dropIndex],
                        },
                    };
                    var drop = this.parentScene.spawnItem(this.x, this.y, options);
                    drop.friction = 0.8;
                    drop.vx = 0 * -this.scaleX;
                    drop.vy = -5;
                    drop.throwAway = true;
                    this.equip.weapons[dropIndex] = item.kind;
                    this.equip.level[dropIndex] = item.level;
                }
            } else {
                //所持武器を拾ったらその武器のレベルが上がる
                this.equip.level[index]++;
                var id = this.equip.weapons[this.equip.using];
                var lv = this.equip.level[this.equip.using];
                this.setWeapon(id, lv);
            }
            app.playSE("getitem");
        }
        //装備品
        if (item.isEquip) {
            this.hpMax += (item.power || 0);
            this.hp += (item.power || 0);
            if (this.hpMax > 200) this.hpMax = 200;
            if (this.hp > this.hpMax) this.hp = this.hpMax;
            this.parentScene.totalScore += (item.point || 0);
            app.playSE("getitem");
        }
        //食べ物
        if (item.isFood) {
            //ステージ進度によって回復量が増加
            var power = item.power;
            if (this.parentScene.stageNumber > 4) power *= 1.5;
            this.hp += power;
            app.playSE("recovery");
            if (this.hp > this.hpMax) this.hp = this.hpMax;
            this.parentScene.totalScore += (item.point || 0);
        }
        //鍵
        if (item.isKey) {
            this.keys.push(item);
            app.playSE("getkeyitem");
            this.parentScene.flare('getkey', {key: item});
            this.parentScene.totalScore += (item.point || 0);
        }
        //得点アイテム
        if (item.isItem) {
            this.parentScene.totalScore += (item.point || 0);
            app.playSE("getitem");
        }
        return this;
    },

    //使用武器の変更
    switchWeapon: function() {
        //手持ちの武器が一個の場合は何もしない
        if (this.equip.weapons.length < 2) return;

        this.equip.switchOk = false;

        var rot = 120;
        if (this.equip.weapons.length == 2 && this.equip.using == 1) rot = 240;
        this.parentScene.playerWeapon.tweener.clear()
            .by({rotation: rot}, 300)
            .call(function() {
                this.equip.switchOk = true;
            }.bind(this));

        //現在使用武器設定
        this.equip.using = (this.equip.using + 1) % this.equip.weapons.length;
        var id = this.equip.weapons[this.equip.using];
        var lv = this.equip.level[this.equip.using];
        this.setWeapon(id, lv);

        app.playSE("select");
    },

    //武器変更
    setWeapon: function(kind, level) {
        kind = kind || 0;
        level = level || 0;

        //属性初期化
        this.attackCollision.$extend({
            isSlash: false,
            isSting: false,
            isBlow: false,
            isArrow: false,
            isFire: false,
            isIce: false,
            stunPower: 1,
        });

        //アイテム情報取得
        var spec = qft.ItemInfo.get(kind);
        this.attackCollision.$extend(spec);
        this.attackCollision.power += level * (spec.levelBonus || 2);

        switch (kind) {
            case 0:
                //ショートソード
                level = 0;
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(-3, 3);
                break;
            case 1:
                //ロングソード
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(-3, 3);
                break;
            case 2:
                //斧
                this.frame["attack"] = [ 44, 44, 44, 43, 43, 43, 42, 42, 42, 41, 41, 41, "stop"];
                this.weapon.setPosition(-3, 3);
                break;
            case 3:
                //槍
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(0, 0);
                break;
            case 4:
                //弓
                level = 0;
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(0, 0);
                break;
            case 5:
                //魔法の杖
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(0, 0);
                break;
            case 6:
                //魔導書
                this.frame["attack"] = [ 44, 44, 44, 43, 43, 43, 42, 42, 42, 41, 41, 41, "stop"];
                this.weapon.setPosition(-3, 3);
                break;
        }

        //武器画像設定
        var index = kind * 10 + Math.min(level, spec.maxIndex);
        this.weapon.setFrameIndex(index);

        return this;
    },

    //装備武器により攻撃モーションを変える
    weaponAttack: function() {
        var kind = this.equip.weapons[this.equip.using];
        var level = this.equip.level[this.equip.using];
        this.isAttack = true;
        var that = this;
        switch (kind) {
            case 0:
                //ショートソード
                app.playSE("attack");
                this.weapon.tweener.clear()
                    .set({rotation: 200, alpha: 1.0})
                    .to({rotation: 360}, 5)
                    .fadeOut(1)
                    .call(function() {
                        that.isAttack = false;
                    });
                break;
            case 1:
                //ロングソード
                app.playSE("attack");
                this.weapon.tweener.clear()
                    .set({rotation: 200, alpha: 1.0})
                    .to({rotation: 360}, 6)
                    .fadeOut(1)
                    .call(function() {
                        that.isAttack = false;
                    });
                break;
            case 2:
                //斧
                app.playSE("attack");
                this.weapon.tweener.clear()
                    .set({rotation: 400, alpha: 1.0})
                    .to({rotation: 270}, 8)
                    .fadeOut(1)
                    .call(function() {
                        that.isAttack = false;
                    });
                break;
            case 3:
                //槍
                app.playSE("attack");
                this.weapon.tweener.clear()
                    .set({rotation: -45, alpha: 1.0})
                    .by({x: -10}, 2)
                    .by({x: 10}, 2)
                    .fadeOut(1)
                    .call(function() {
                        that.isAttack = false;
                    });
                break;
            case 4:
                //弓
                app.playSE("attack");
                this.weapon.tweener.clear()
                    .set({rotation: -45, alpha: 1.0})
                    .by({x: 7}, 3)
                    .by({x: -7}, 3)
                    .fadeOut(1)
                    .call(function() {
                        that.isAttack = false;
                    });
                    var arrowPower = 5 + level * 2;
                    var arrow = qft.PlayerAttack(this.parentScene, {width: 15, height: 10, power: arrowPower, type: "arrow"})
                        .addChildTo(this.parentScene.playerLayer)
                        .setScale(this.scaleX, 1)
                        .setPosition(this.x, this.y);
                    arrow.tweener.setUpdateType('fps').clear()
                        .by({x: (150 + level * 5) * this.scaleX}, 7)
                        .call(function() {
                            this.remove();
                        }.bind(arrow));
                break;
            case 5:
                //魔法の杖
                app.playSE("bomb");
                this.weapon.tweener.clear()
                    .set({rotation: 200, alpha: 1.0})
                    .to({rotation: 360}, 8)
                    .fadeOut(1)
                    .call(function() {
                        that.isAttack = false;
                    });
                var magicPower = 15 + level * 2;
                for (var i = 0; i < 6; i++) {
                    var magic = qft.PlayerAttack(this.parentScene, {width: 15, height: 10, index: 30, power: magicPower, type: "flame"})
                        .addChildTo(this.parentScene.playerLayer)
                        .setScale(this.scaleX, 1);
                    magic.rad = (90 - i * 30).toRadian();
                    magic.isCollision = false;
                    magic.visible = false;
                    magic.tweener.setUpdateType('fps').clear()
                        .wait(i)
                        .call(function() {
                            this.isCollision = true;
                            this.visible = true;
                            var mx = Math.cos(this.rad) * that.scaleX;
                            var my = Math.sin(this.rad);
                            this.setPosition(that.x + 32 * mx, that.y + 32 * my);
                        }.bind(magic))
                        .wait(8)
                        .call(function() {
                            this.remove();
                        }.bind(magic));
                }
                break;
            case 6:
                //魔導書
                app.playSE("attack");
                this.weapon.tweener.clear()
                    .set({rotation: 400, alpha: 1.0})
                    .to({rotation: 270}, 8)
                    .fadeOut(1)
                    .call(function() {
                        that.isAttack = false;
                    });
                break;
        }
        return this;
    },

    setupAnimation: function() {
        this.spcialAnimation = false;
        this.frame = [];
        this.frame["stand"] = [13, 14];
        this.frame["jump"] = [36, "stop"];
        this.frame["walk"] = [ 3,  4,  5,  4];
        this.frame["up"] =   [ 9, 10, 11, 10];
        this.frame["down"] = [ 0,  1,  2,  1];
        this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
        this.frame["defense"] = [ 41, 42, 43, 44, "stop"];
        this.frame["damage"] = [ 18, 19, 20];
        this.frame["drop"] = [18, 19, 20];
        this.frame["dead"] = [18, 19, 20, 33, 34, 35, "stop"];
        this.frame["clear"] = [24, 25, 26];
        this.frame["stun"] = [ 18, 19, 20];
        this.index = 0;
        return this;
    },

    //当たり判定用エレメントの位置再セット
    resetCollisionPosition: function() {
        var w = Math.floor(this.width/2)+6;
        var h = Math.floor(this.height/2)+6;
        this._collision[0].setPosition(this.x, this.y - h);
        this._collision[1].setPosition(this.x + w, this.y - 5);
        this._collision[2].setPosition(this.x, this.y + h);
        this._collision[3].setPosition(this.x - w, this.y - 5);
        this.ladderCollision.setPosition(this.x, this.y);
        return this;
    },

    //頭上はしごチェック
    checkHeadLadder: function() {
        var h = Math.floor(this.height/2)+10;
        var c = phina.display.DisplayElement({width: 16, height: 2}).setPosition(this.x, this.y-h);
        var ret = null;
        this.parentScene.collisionLayer.children.forEach(function(e) {
            if (e.hitTestElement(c)) {
                if (e.type == "ladder" || e.type == "stairs") ret = e;
            }
        }.bind(this));
        return ret;
    },

    //足下はしごチェック
    checkFootLadder: function() {
        var h = Math.floor(this.height/2)+10;
        var c = phina.display.DisplayElement({width: 16, height: 2}).setPosition(this.x, this.y+h);
        var ret = null;
        this.parentScene.collisionLayer.children.forEach(function(e) {
            if (e.hitTestElement(c)) {
                if (e.type == "ladder" || e.type == "stairs") ret = e;
            }
        }.bind(this));
        return ret;
    },

    //現在ステータス保存
    saveStatus: function() {
        //所持武器、アイテム等ステータスの取得
        var eq = this.equip;
        var equip = {
            using: 0,
            weapons: eq.weapons.concat(),
            level: eq.level.concat(),
            switchOk: true,
        };
        var items = this.items.concat();
        var numJumpMax = this.numJumpMax;

        this.startStatus = {
            hpMax: this.hpMax,
            hp: this.hp,
            power: this.power,
            defense: this.defense,
            equip: equip,
            items: items,
            numJumpMax: numJumpMax,
        };
    },

    //ステータス復元
    restoreStatus: function() {
        var ss = this.startStatus;
        this.hpMax = ss.hpMax;
        this.hp = ss.hp;
        this.power = ss.power;
        this.defense = ss.defense;
        this.equip = {
            using: 0,
            weapons: ss.equip.weapons.concat(),
            level: ss.equip.level.concat(),
            switchOk: true,
        }
        if (ss.items) {
            this.items = ss.items.concat();
        } else {
            this.item = [];
        }
        this.numJumpMax = ss.numJumpMax;

        var id = this.equip.weapons[this.equip.using];
        var lv = this.equip.level[this.equip.using];
        this.setWeapon(id, lv);
    },
});

//プレイヤー攻撃判定
phina.define("qft.PlayerAttack", {
    superClass: "phina.display.DisplayElement",

    //攻撃力
    power: 1,

    //当たり判定発生フラグ
    isCollision: true,

    //属性
    isSlash: false,
    isSting: false,
    isBlow: false,
    isArrow: false,
    isFire: false,
    isIce: false,

    init: function(parentScene, options) {
        this.superInit(options);
        this.parentScene = parentScene;

        this.type = options.type || "arrow";
        this.power = options.power || 0;
        this.time = 0;
        this.index = 0;

        //表示スプライト
        switch (this.type) {
            case "arrow":
                this.sprite = phina.display.Sprite("weapons", 24, 24).addChildTo(this).setFrameIndex(1);
                this.frame = [1];
                this.isArrow = true;
                this.isSting = true;
                this.stunPower = 10;
                break;
            case "fireball":
                this.sprite = phina.display.Sprite("bullet", 24, 32).addChildTo(this).setFrameIndex(9);
                this.frame = [9, 10, 11, 10];
                this.isFire = true;
                break;
            case "masakari":
                this.sprite = phina.display.Sprite("weapons", 24, 24).addChildTo(this).setFrameIndex(20);
                this.frame = [20];
                this.isSlash = true;
                this.isBrow = true;
                this.stunPower = 50;
                break;
            case "dagger":
                this.sprite = phina.display.Sprite("weapons", 24, 24).addChildTo(this).setFrameIndex(20);
                this.sprite.rotation = 135;
                this.frame = [0];
                this.isSting = true;
                this.stunPower = 1;
                break;
            case "flame":
                this.sprite = phina.display.Sprite("effect", 48, 48)
                    .addChildTo(this)
                    .setFrameTrimming(0, 192, 192, 96)
                    .setScale(0.5);
                this.frame = [0, 1, 2, 3, 4, 5, 6, 7, 8];
                this.isFire = true;
                this.stunPower = 1;
                break;
        }

        if (DEBUG_COLLISION) {
            phina.display.RectangleShape({width: this.width, height: this.height}).addChildTo(this).setAlpha(0.5);
        }
    },

    update: function(app) {
        if (!this.isCollision || this.type == "explode") return;

        if (this.time % 3 == 0) {
            this.sprite.setFrameIndex(this.frame[this.index]);
            this.index = (this.index + 1) % this.frame.length;
        }
        if (this.type == "flame") return;

        //地形接触判定
        var that = this;
        this.parentScene.collisionLayer.children.forEach(function(e) {
            if (e.type == "ladder" || e.type == "stairs") return;
            if (this.hitTestElement(e)) {
                this.isCollision = false;
                switch (this.type) {
                    case "arrow":
                        this.stick(e);
                        break;
                    case "fireball":
                        this.explode(e);
                        break;
                }
            }
        }.bind(this));

        this.time++;
    },

    //ヒット後処理
    hit: function(target) {
        switch (this.type) {
            case "fireball":
                this.explode(target);
                break;
        }
    },

    //刺さる
    stick: function(e) {
        //効果音
        switch (this.type) {
            case "arrow":
                app.playSE("arrowstick");
                break;
            case "masakari":
                break;
        }

        if (this.scaleX == 1) {
            this.x = e.left;
        } else {
            this.x = e.right;
        }
        this.tweener.clear()
            .wait(30)
            .call(function() {
                this.remove();
            }.bind(this));
    },

    //弾かれる
    snap: function(e) {
        //効果音
        app.playSE("tinkling");
        this.tweener.clear()
            .by({y: -92, rotation: 700}, 15, "easeOutQuad")
            .call(function() {
                this.remove();
            }.bind(this));
    },

    //爆発
    explode: function(e) {
        this.parentScene.spawnEffect(this.x, this.y);
        app.playSE("bomb");
        this.remove();
    },
});

//プレイヤーダミースプライト
phina.define("qft.PlayerDummy", {
    superClass: "phina.display.Sprite",

    init: function(assetName) {
        this.superInit(assetName, 32, 32);
        this.frame = [];
        this.frame["stand"] = [13, 14];
        this.frame["walk"] = [ 3,  4,  5,  4];
        this.frame["walk_stop"] = [ 3,  4,  5,  4, "stop"];
        this.frame["up"] =   [ 9, 10, 11, 10];
        this.frame["up_stop"] =   [10, "stop"];
        this.frame["down"] = [ 0,  1,  2,  1];
        this.frame["clear"] = [24, "stop"];
        this.frame["damage"] = [ 18, 19, 20];
        this.frame["dead"] = [18, 19, 20, 33, 34, 35, "stop"];
        this.index = 0;

        this.nowAnimation = "stand";
        this.animation = true;

        this.bx = 0;
        this.by = 0;
        this.time = 0;

        //影の追加
        var that = this;
        var sc = 16 / 24;
        if (sc < 1) sc += 0.2;
        this.shadowSprite = phina.display.Sprite("shadow", 24, 8)
            .addChildTo(this)
            .setAlpha(0.5)
            .setScale(sc, 1.0)
            .setPosition(0, 16);
    },

    update: function() {
        if (this.animation && this.time % 6 == 0) {
            this.index = (this.index+1) % this.frame[this.nowAnimation].length;
            if (this.frame[this.nowAnimation][this.index] == "stop") this.index--;
            this.frameIndex = this.frame[this.nowAnimation][this.index];
        }

        if (this.x < this.bx) this.scaleX = 1;
        if (this.x > this.bx) this.scaleX = -1;
        this.bx = this.x;
        this.by = this.y;

        this.time++;
    },

    setAnimation: function(animName) {
        if (!this.frame[animName]) return;
        if (animName == this.nowAnimation) return;
        this.nowAnimation = animName;
        this.index = -1;
        return this;
    },
});

//プレイヤー現在使用武器表示
phina.define("qft.PlayerWeapon", {
    superClass: "phina.display.DisplayElement",

    init: function(player) {
        this.superInit();
        this.player = player;

        var that = this;
        this.base = phina.display.DisplayElement().addChildTo(this);
        this.base.update = function() {
            this.rotation = -that.rotation;
        }
        var param = {
            width: 25,
            height: 25,
            fill: "rgba(0,0,0,0.0)",
            stroke: "yellow",
            strokeWidth: 2,
            backgroundColor: 'transparent',
        };
        //使用中武器
        phina.display.RectangleShape(param).addChildTo(this.base).setPosition(0, -18);
        //捨てちゃう武器
        this.dropFrame = phina.display.RectangleShape({stroke: "red"}.$safe(param))
            .addChildTo(this.base)
            .setPosition(14, 10)
            .setVisible(false);
        this.dropFrame.update = function() {
            if (that.player.equip.weapons.length < 3) {
                this.visible = false;
            } else {
                this.visible = true;
            }
        }

        //武器リスト（３つ）
        this.weapons = [];
        var rad = 0;
        var rad_1 = (Math.PI*2) / 3;
        (3).times(function(i) {
            var x =  Math.sin(rad)*18;
            var y = -Math.cos(rad)*18;
            rad -= rad_1;
            this.weapons[i] = phina.display.Sprite("weapons", 24, 24)
                .addChildTo(this)
                .setPosition(x, y);
            this.weapons[i].index = i;
            this.weapons[i].update = function() {
                this.rotation = -that.rotation;
                var weapons = that.player.equip.weapons;
                if (this.index < weapons.length) {
                    var kind = that.player.equip.weapons[this.index];
                    var level = that.player.equip.level[this.index];
                    var spec = qft.ItemInfo.get(kind);
                    var index = kind * 10 + Math.min(level, spec.maxIndex);
                    this.setFrameIndex(index);
                    this.visible = true;
                } else {
                    this.visible = false;
                }
            }
            var labelParam = {
                fill: "white",
                stroke: "black",
                strokeWidth: 2,

                fontFamily: "Orbitron",
                align: "center",
                baseline: "middle",
                fontSize: 10,
                fontWeight: ''
            };
            //強化レベル表示
            this.weapons[i].level = phina.display.Label({text: ""}.$safe(labelParam)).setPosition(6, 6).addChildTo(this.weapons[i]);
            this.weapons[i].level.index = i;
            this.weapons[i].level.update = function() {
                var level = that.player.equip.level[this.index];
                if (level != 0) {
                    this.text = "+"+level;
                } else {
                    this.text = "";
                }
            }
        }.bind(this));
    },

    clear: function() {
    },
});
