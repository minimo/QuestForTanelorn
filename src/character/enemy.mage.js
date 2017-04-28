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
    viewAngle: 90,

    //得点
    point: 100,

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
        this.sprite = phina.display.Sprite("monster03", 24, 32).addChildTo(this);
        this.sprite.setFrameTrimming((this.level % 2) * 144, Math.floor(this.level / 2) * 128, 72, 128);
        this.hp += this.level * 5;
        this.power += this.level * 5;

        this.setAnimation("walk");
        this.advanceTime = 10;
        this.setupLifeGauge();

        this.direction = 0;
        this.speed = 1;
        this.phase = 0;

        this.on('damaged', e => {
            if (e.direction == 0) this.direction = 180; else this.direction = 0;
        });
    },

    algorithm: function() {
        var look = this.isLookPlayer();
        var distance = this.getDistancePlayer();

        if (this.onFloor) {
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

            //プレイヤーが近くにいたら距離を取る
            if (this.phase == 0 && look && !this.isJump && distance < 64) {
                this.flare('balloon', {pattern: "!"});
                this.phase = 1;
                this.speed = 3;
            }

            //逃げるフェーズ
            if (this.phase == 1) {
                if (this.phase == 0 && look && !this.isJump && distance < 96) {
                    if (this.x < this.player.x) this.diretion = 0; else this.direction = 180;
                    this.speed = 3;
                } else {
                    if (this.x < this.player.x) this.diretion = 180; else this.direction = 0;
                    this.speed = 0;
                    this.phase = 3;
                }
            }

            //攻撃フェーズ
            if (this.phase == 2) {
                if (this.phase == 0 && look && !this.isJump && distance < 64) {
                    //プレイヤーが近づいたら逃げる
                    this.sprite.setFrameTrimming((this.level % 2) * 144 + 72, Math.floor(this.level / 2) * 128, 72, 128);
                    this.phase = 1;
                } else {
                    //プレイヤーが遠くにいる場合は攻撃
                    this.sprite.setFrameTrimming((this.level % 2) * 144, Math.floor(this.level / 2) * 128, 72, 128);
                    var b = this.parentScene.spawnEnemy(this.x, this.y, "Bullet", {explode: true});
                    b.rotation = this.getPlayerAngle();
                }
            }

            //プレイヤーが見えない場合は通常フェーズ
            if (!look) this.phase = 0;
        }

        if (this.onFloor || this.isJump) {
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
});
