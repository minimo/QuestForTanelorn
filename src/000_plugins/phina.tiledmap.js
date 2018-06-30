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
