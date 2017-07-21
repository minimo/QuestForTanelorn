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
        this.moveWait = options.properties.moveWait || 60;

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
        if (this.parentScene.player.floorObject) {
            if (this.parentScene.player.floorObject.parentObject === this)
                this.isOnPlayer = true;
        } else {
            this.isOnPlayer = false;
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
