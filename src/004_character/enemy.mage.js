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
