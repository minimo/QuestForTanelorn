/*
 *  player.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Player", {
    superClass: "qft.Character",

    //攻撃力
    power: 1,

    init: function(parentScene) {
        this.superInit({width: 16, height: 20}, parentScene);

        //表示用スプライト
        this.sprite = phina.display.Sprite("player1", 32, 32).addChildTo(this).setFrameIndex(0);

        //武器用スプライト
        this.weapon = phina.display.Sprite("item", 20, 20)
            .addChildTo(this.sprite)
            .setFrameIndex(0)
            .setOrigin(1, 1)
            .setPosition(-3, 3);
        this.weapon.alpha = 0;
        this.weapon.tweener.setUpdateType('fps');

        //攻撃判定用
        var that = this;
        this.attackCollision = phina.display.DisplayElement({width: 10, height: 26});
        this.attackCollision.update = function() {
            this.x = that.x - that.sprite.scaleX*16;
            this.y = that.y;
        }

        this.nowAction = "walk";
        this.beforeAction = "";
        this.setupAnimation();

        this.tweener.setUpdateType('fps');
    },

    update: function(app) {
        //プレイヤー操作
        var ct = app.controller;
        if (!this.isDead) {
            if (ct.left) {
                if (!this.isJump && !this.attack) this.nowAction = "walk";
                this.sprite.scaleX = 1;
                this.vx = -5;
            }
            if (ct.right) {
                if (!this.isJump && !this.attack) this.nowAction = "walk";
                this.sprite.scaleX = -1;
                this.vx = 5;
            }
            if (ct.up || ct.isJump) {
                if (!this.isJump && this.onFloor) {
                    this.nowAction = "jump";
                    this.isJump = true;
                    this.vy = -11;
                }
            }
            if (ct.down) {
                this.throughFloor = true;
            }
        }
        if (!this.attack) {
            if (this.onFloor) {
                this.nowAction = "walk";
            } else {
                this.nowAction = "jump";
            }
            if (ct.attack) {
                this.attack = true;
                this.nowAction = "attack";
                this.index = -1;
                this.weaponAttack();
            }
        }

        if (this.isDead && this.isDrop) {
            this.nowAction = "dead";
        }

        //アクション変更を検知
        if (this.nowAction != this.beforeAction) {
            this.time = 0;
            this.index = -1;
            this.isAdvanceAnimation = true;
            this.advanceTime = 6;
            if (this.nowAction == "attack") this.advanceTime = 2;
        } else {
            //歩行アニメーションの場合は移動している時のみ進める
            if (this.nowAction == "walk" && this.vx == 0 && !ct.left && !ct.right) {
                this.isAdvanceAnimation = false;
            } else {
                this.isAdvanceAnimation = true;
            }
        }

        this.attackCollision.x = this.x - this.sprite.scaleX*16;
        this.attackCollision.y = this.y;
    },

    damage: function(target) {
        if (this.mutekiTime > 0) return false;
        var dir = 0;
        if (this.x < target.x) dir = 180;
        this.knockback(target.power, dir);
        this.mutekiTime = 60;
        this.nowAction = "damage";
        return true;
    },

    //装備武器により攻撃モーションを変える
    weaponAttack: function() {
        var that = this;
        this.weapon.tweener.clear()
            .set({rotation: 200, alpha: 1.0})
            .to({rotation: 360}, 5)
            .fadeOut(1)
            .call(function() {
                that.attack = false;
            });
    },

    setupAnimation: function() {
        this.spcialAction = false;
        this.frame = [];
        this.frame["stand"] = [13, 14];
        this.frame["jump"] = [36, "stop"];
        this.frame["walk"] = [ 3,  4,  5,  4];
        this.frame["up"] =   [ 9, 10, 11, 10];
        this.frame["down"] = [ 0,  1,  2,  1];
        this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
        this.frame["damage"] = [ 18, 19, 20, "stop"];
        this.frame["dead"] = [18, 19, 20];
        this.index = 0;
    },
});
