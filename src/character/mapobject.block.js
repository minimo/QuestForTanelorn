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
    advanceTime: 1,

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
