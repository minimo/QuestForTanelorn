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
