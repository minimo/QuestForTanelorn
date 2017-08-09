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

        if (dis < 128) {
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
