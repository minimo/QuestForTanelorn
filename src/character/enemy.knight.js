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
    hp: 150,

    //防御力
    deffence: 10,

    //攻撃力
    power: 30,

    //視力
    eyesight: 96,

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
        this.weapon = phina.display.Sprite("item", 24, 24).addChildTo(this).setFrameIndex(1)
            .setAlpha(0)
            .setOrigin(1, 1)
            .setPosition(0, 4)
            .setScale(-1, 1);
        this.weapon.tweener.setUpdateType('fps');

        //表示用スプライト
        this.sprite = phina.display.Sprite("monster02", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming(144, 128, 72, 128);
        this.sprite.setPosition(0, -5).setScale(1.3);

        this.setAnimation("walk");
        this.advanceTime = 6;
        this.setupLifeGauge();

        this.direction = 0;
        this.stopTime = 0;
        this.isAttack = false;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        //プレイヤーとの距離
        var dis = this.getDistancePlayer();
        var look = this.isLookPlayer();

        if (this.onFloor) {
            //これ以上進めない場合は折り返す
            if (this._collision[1].hit || this.checkMapCollision2(this.x+5, this.y+20, 5, 5) == null) {
                this.direction = 180;
            } else if (this._collision[3].hit || this.checkMapCollision2(this.x-5, this.y+20, 5, 5) == null) {
                this.direction = 0;
            }

            //攻撃
            if (look && !this.isJump && dis < 48 && this.stopTime == 0 && !this.isAttack) {
                var that = this;
                this.weapon.tweener.clear()
                    .set({rotation: 270, alpha: 1.0})
                    .to({rotation: 430}, 6)
                    .fadeOut(1)
                    .call(function() {
                        that.isAttack = false;
                    });
                this.isAttack = true;
                this.stopTime = 30;
            }
        }

        if (this.onFloor || this.isJump) {
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
            this.flare('balloonerace');
        }


        this.stopTime--;
        if (this.stopTime < 0) {
            this.stopTime = 0;
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
