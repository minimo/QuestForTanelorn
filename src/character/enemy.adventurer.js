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
        this.phase = "wait";

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
        }

        this.attackInterval--;
        if (this.attackInterval < 0) this.attackInterval = 0;
    },

    //攻撃
    attack: function() {
        this.animationInterval = 2;
        this.setAnimation("attack");
        this.phase = "attacking";

        app.playSE("attack");
        this.weapon.tweener.clear()
            .set({rotation: 200, alpha: 1.0})
            .to({rotation: 360}, 6)
            .fadeOut(1)
            .call(() => {
                this.animationInterval = 6;
                this.setAnimation("walk");
                this.phase = "approach";
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
