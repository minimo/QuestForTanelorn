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
    hp: 20,

    //防御力
    deffence: 10,

    //攻撃力
    power: 10,

    //視力
    eyesight: 192,

    //視野角
    viewAngle: 360,

    //得点
    point: 100,

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
        var lv = Math.min(this.level, 4);
        this.sprite = phina.display.Sprite("monster03", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming((lv % 2) * 144 + 72, Math.floor(lv / 2) * 128, 72, 128);
        this.hp += this.level * 5;
        this.power += this.level * 5;

        this.setAnimation("walk");
        this.advanceTime = 10;
        this.setupLifeGauge();

        this.direction = 0;
        this.speed = 1;
        this.phase = 0;
        this.isAttack = false;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        var player = this.parentScene.player;
        var look = this.isLookPlayer();
        var distance = this.getDistancePlayer();

        //これ以上進めない場合は折り返す
        var cantescape = false;
        if (this._collision[1].hit) {
            this.direction = 180;
        } else if (this._collision[3].hit) {
            this.direction = 0;
        }

        //通常フェーズでプレイヤーを発見したら警戒フェーズに移る
        if (this.phase == 0 && look) {
            this.flare('balloon', {pattern: "!"});
            this.phase = 1;
            this.speed = 0;
        }

        //プレイヤーが離れたら通常フェーズ
        if (distance > 192 || !look) {
            this.flare('balloonerace');
            this.phase = 0;
            this.speed = 1;
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
            if (distance < 128) this.phase = 2;
        }

        //攻撃
        if (this.phase == 2) {
            this.flare('balloonerace');
            if (this.time % 30 == 0) this.isAttack = true;
            if (distance < 92) this.phase = 3;
        }
        if (this.phase == 3) {
            this.flare('balloonerace');
            if (this.time % 60 == 0) this.isAttack = true;
        }

        if (this.isAttack) {
            this.isAttack = false;
            if (this.phase == 2) {
                var b = this.parentScene.spawnEnemy(this.x, this.y, "Bullet", {explode: true});
                b.rotation = this.getPlayerAngle() + Math.randint(-30, 30);
            }
            if (this.phase == 3) {
                for (var i = 0; i < 4; i++) {
                    var b = this.parentScene.spawnEnemy(this.x, this.y, "Bullet", {explode: true});
                    b.rotation = this.getPlayerAngle() + Math.randint(-60, 60);
                }
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
});