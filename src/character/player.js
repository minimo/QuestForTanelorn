/*
 *  player.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Player", {
    superClass: "qft.Character",

    //ヒットポイント
    hp: 100,

    //攻撃力
    power: 10,

    //防御力
    deffence: 10,

    init: function(parentScene) {
        this.superInit({width: 16, height: 20}, parentScene);
        var that = this;

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
        this.attackCollision = phina.display.DisplayElement({width: 10, height: 26});
        this.attackCollision.update = function() {
            this.x = that.x + that.scaleX*16;
            this.y = that.y;
        }

        this.setAnimation("walk");
        this.beforeAnimation = "";

        this.on('dead', function(e) {
            this.parentScene.flare('gameover');
        });
    },

    update: function(app) {
        //プレイヤー操作
        var ct = app.controller;
        if (!this.isDead && this.stopTime == 0) {
            if (ct.left) {
                if (!this.isJump && !this.attack) this.setAnimation("walk");
                this.scaleX = -1;
                this.vx = -5;
            }
            if (ct.right) {
                if (!this.isJump && !this.attack) this.setAnimation("walk");
                this.scaleX = 1;
                this.vx = 5;
            }
            if (ct.up || ct.jump) {
                if (!ct.down && !this.isJump && this.onFloor) {
                    this.setAnimation("jump");
                    this.isJump = true;
                    this.vy = -11;
                }
            }
            if (ct.down && ct.jump && this.onFloor && !this.throughFloor) {
                var floor = this.checkMapCollision2(this.x, this.y+16, 5, 5);
                if (!floor.disableThrough) this.throughFloor = floor;
            }
        }
        if (!this.attack) {
            if (this.onFloor) {
                if (this.nowAnimation != "damage") this.nowAnimation = "walk";
            } else {
                this.setAnimation("jump");
            }
            if (ct.attack && this.stopTime == 0) {
                this.setAnimation("attack");
                this.weaponAttack();
                app.playSE("attack");
            }
        }

        if (this.isDead && this.isDrop) {
            this.setAnimation("dead");
        }

        //アクション変更を検知
        if (this.nowAnimation != this.beforeAnimation) {
            this.time = 0;
            this.isAdvanceAnimation = true;
            this.advanceTime = 6;
            if (this.nowAnimation == "attack") this.advanceTime = 2;
        } else {
            //歩行アニメーションの場合は移動している時のみ進める
            if (this.nowAnimation == "walk" && !ct.left && !ct.right) {
                this.isAdvanceAnimation = false;
            } else {
                this.isAdvanceAnimation = true;
            }
        }

        //攻撃判定追従
        this.attackCollision.x = this.x + this.scaleX*16;
        this.attackCollision.y = this.y;
    },

    damage: function(target) {
        if (this.mutekiTime > 0) return false;
        if (target.power == 0) return false;
        var dir = 0;
        if (this.x < target.x) dir = 180;
        this.knockback(target.power, dir);
        this.mutekiTime = 60;
        this.stopTime = 15;
        this.hp -= target.power;
        if (this.nowAnimation != "jump") this.setAnimation("damage");

        return true;
    },

    //アイテム取得
    getItem: function(item) {
        //武器
        if (item.weapon) {
            this.setWeapon(item.kind);
            return;
        }
        //装備品
        if (item.equip) {
        }
        //食べ物
        if (item.food) {
            this.hp += item.power;
        }
    },

    //武器変更
    setWeapon: function(kind) {
        switch (kind) {
            case 0:
                this.power = 10;
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                break;
            case 1:
                this.power = 15;
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                break;
            case 2:
                this.power = 20;
                this.frame["attack"] = [ 44, 44, 43, 43, 42, 42, 41, 41, "stop"];
                break;
            
        }
        this.weapon.setFrameIndex(kind);
    },

    //装備武器により攻撃モーションを変える
    weaponAttack: function() {
        this.attack = true;
        var that = this;
        switch (this.weapon.frameIndex) {
            case 0:
            case 1:
                this.weapon.tweener.clear()
                    .set({rotation: 200, alpha: 1.0})
                    .to({rotation: 360}, 5)
                    .fadeOut(1)
                    .call(function() {
                        that.attack = false;
                    });
                break;
            case 2:
                this.weapon.tweener.clear()
                    .set({rotation: 400, alpha: 1.0})
                    .to({rotation: 270}, 7)
                    .fadeOut(1)
                    .call(function() {
                        that.attack = false;
                    });
                break;
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
        this.frame["damage"] = [ 18, 19, 20];
        this.frame["dead"] = [18, 19, 20];
        this.index = 0;
    },

    //当たり判定用エレメントの位置再セット
    resetCollisionPosition: function() {
        var w = Math.floor(this.width/2)+6;
        var h = Math.floor(this.height/2)+6;
        this._collision[0].setPosition(this.x, this.y - h);
        this._collision[1].setPosition(this.x + w, this.y - 5);
        this._collision[2].setPosition(this.x, this.y + h);
        this._collision[3].setPosition(this.x - w, this.y - 5);
    },
});
