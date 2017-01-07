/*
 *  phina.tiledmap.js
 *  2016/9/10
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("phina.asset.TiledMap", {
    superClass: "phina.asset.Asset",

    image: null,

    tilesets: null,
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

    //マップイメージ取得
    getImage: function(layerName) {
        if (layerName === undefined) {
            return this.image;
        } else {
            return this._generateImage(layerName);
        }
    },

    //指定マップレイヤーを配列として取得
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

    //オブジェクトグループを配列にして取得
    getObjectGroup: function(groupName) {
        groupName = groupName || null;
        var ls = [];
        var len = this.layers.length;
        for (var i = 0; i < len; i++) {
            if (this.layers[i].type == "objectgroup") {
                if (groupName == null || groupName == this.layers[i].name) {
                    //ディープコピー
                    var obj = {}.$safe(this.layers[i]);
                    obj.objects = [];
                    var len2 = this.layers[i].objects.length;
                    for (var r = 0; r < len2; r++) {
                        var obj2 = {
                            properties: {}.$safe(this.layers[i].objects[r].properties),
                        }.$safe(this.layers[i].objects[r]);
                        obj.objects[r] = obj2;
                    }
                    if (groupName !== null) return obj;
                }
                ls.push(obj);
            }
        }
        return ls;
    },

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

    //アセットに無いイメージデータを読み込み
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
            assets.image[imageSource[i].image] = this.path+imageSource[i].image;
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
                //マップイメージ生成
                that.image = that._generateImage();
                //読み込み終了
                that._resolve(that);
            }.bind(this));
        } else {
            //マップイメージ生成
            this.image = that._generateImage();
            //読み込み終了
            this._resolve(that);
        }
    },

    //マップイメージ作成
    _generateImage: function(layerName) {
        var numLayer = 0;
        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i].type == "layer" || this.layers[i].type == "imagelayer") numLayer++;
        }
        if (numLayer == 0) return null;

        var width = this.width * this.tilewidth;
        var height = this.height * this.tileheight;
        var canvas = phina.graphics.Canvas().setSize(width, height);

        for (var i = 0; i < this.layers.length; i++) {
            //マップレイヤー
            if (this.layers[i].type == "layer" && this.layers[i].visible != "0") {
                if (layerName === undefined || layerName === this.layers[i].name) {
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
                }
            }
            //イメージレイヤー
            if (this.layers[i].type == "imagelayer") {
                if (layerName === undefined || layerName === this.layers[i].name) {
                    var len = this.layers[i];
                    var image = phina.asset.AssetManager.get('image', this.layers[i].image.source);
                    canvas.context.drawImage(image.domElement, this.layers[i].x, this.layers[i].y);
                }
            }
        }

        var texture = phina.asset.Texture();
        texture.domElement = canvas.domElement;
        return texture;
    },

    //キャンバスの指定した座標にマップチップのイメージをコピーする
    _setMapChip: function(canvas, index, x, y, opacity) {
        //タイルセットからマップチップを取得
        var chip = this.tilesets.chips[index];
        var image = phina.asset.AssetManager.get('image', chip.image);
        canvas.context.drawImage(
            image.domElement,
            chip.x + chip.margin, chip.y + chip.margin,
            chip.tilewidth, chip.tileheight,
            x, y,
            chip.tilewidth, chip.tileheight);
    },

    //XMLプロパティをJSONに変換
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

    //XML属性をJSONに変換
    _attrToJSON: function(source) {
        var obj = {};
        for (var i = 0; i < source.attributes.length; i++) {
            var val = source.attributes[i].value;
            val = isNaN(parseFloat(val))? val: parseFloat(val);
            obj[source.attributes[i].name] = val;
        }
        return obj;
    },

    //タイルセットのパース
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

    //レイヤー情報のパース
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
                    };
                    each.call(layer.childNodes, function(elm) {
                        if (elm.nodeType == 3) return;
                        var d = this._attrToJSON(elm);
                        d.properties = this._propertiesToJSON(elm);
                        l.objects.push(d);
                    }.bind(this));
                    l.properties = this._propertiesToJSON(layer);

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

    //CSVパース
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
     * BASE64パース
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
