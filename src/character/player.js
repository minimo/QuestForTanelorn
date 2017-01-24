/*
 *  player.js
 *  2016/12/28
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("qft.Player", {
    superClass: "qft.Character",

    //識別フラグ
    isPlayer: true,

    //ヒットポイント
    hp: 100,

    //攻撃力
    power: 10,

    //防御力
    deffence: 10,

    //下押し連続フレーム数
    downFrame: 0,

    //アイテム所持最大数
    maxItem: 10,

    //所持アイテム
    items: [0],

    //前フレームの情報
    before: {
        //操作系
        up: false,
        down: false,
        attack: false,
        jump: false,
    },

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
        this.attackCollision = phina.display.RectangleShape({width: 14, height: 26});
        //当たり判定デバッグ用
        if (DEBUG_COLLISION) {
            this.attackCollision.addChildTo(this.parentScene.playerLayer);
            this.attackCollision.alpha = 0.5;
            this.on('removed', function(e) {
                this.attackCollision.remove();
            });
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
            //左移動
            if (ct.left) {
                if (!this.isJump && !this.attack && !this.isCatchLadder) this.setAnimation("walk");
                //はしご掴み状態で左に壁がある場合は不可
                var c = this._collision[3];
                if (!(this.isCatchLadder && this.checkMapCollision2(c.x, c.y, c.width, c.height))) {
                    this.scaleX = -1;
                    this.vx = -5;
                }
            }
            //右移動
            if (ct.right) {
                if (!this.isJump && !this.attack && !this.isCatchLadder) this.setAnimation("walk");
                //はしご掴み状態で右に壁がある場合は不可
                var c = this._collision[1];
                if (!(this.isCatchLadder && this.checkMapCollision2(c.x, c.y, c.width, c.height))) {
                    this.scaleX = 1;
                    this.vx = 5;
                }
            }

            //足元はしご検知
            var footLadder = this.checkFootLadder();
            //はしご掴み状態で操作分岐
            if (this.isCatchLadder) {
                if (ct.up) {
                    this.vx = 0;
                    this.vy = -4;
                }
                if (ct.down) {
                    this.vx = 0;
                    this.vy = 4;
                }
            } else {
                //上キー押下
                if (ct.up) {
                    //ジャンプ
                    if (!this.isJump && this.onFloor && !this.onLadder) {
                        this.setAnimation("jump");
                        this.isJump = true;
                        this.vy = -11;
                    }
                    //はしごを昇る
                    if (this.onLadder) {
                        this.setAnimation("up");
                        this.vx = 0;
                        this.vy = 0;
                        this.isCatchLadder = true;
                    }
                }
                //下キー押下
                if (ct.down) {
                    //はしごを降りる
                    if (footLadder) {
                        this.setAnimation("up");
                        this.vx = 0;
                        this.vy = 0;
                        this.isCatchLadder = true;
                    }
                    //床スルー
                    if (this.downFrame > 6 && !this.jump && !footLadder) {
                        if (this.onFloor && !this.throughFloor) {
                            var floor = this.checkMapCollision2(this.x, this.y+16, 5, 5);
                            if (!floor[0].disableThrough) this.throughFloor = floor[0];
                        }
                    }
                }
            }

        }
        //はしごから外れたら梯子掴み状態キャンセル
        if (this.isCatchLadder) {
            if (!this.onLadder && !ct.down || this.onLadder && !footLadder && !ct.up) this.isCatchLadder = false;
        }

        //攻撃
        if (!this.attack) {
            if (this.onFloor) {
                if (this.nowAnimation != "damage") this.setAnimation("walk");
            } else if (this.isCatchLadder) {
                if (ct.up) {
                    this.setAnimation("up");
                } else if (ct.down) {
                    if (this.onStairs) {
                        this.setAnimation("down");
                    } else {
                        this.setAnimation("up");
                    }
                }
            }else {
                this.setAnimation("jump");
            }
            if (ct.attack && !this.before.attack && this.stopTime == 0) {
                this.isCatchLadder = false;
                this.setAnimation("attack");
                this.weaponAttack();
                app.playSE("attack");
            }
        }

        //マップ外落下
        if (this.isDead && this.isDrop) {
            this.hp = 0;
            this.setAnimation("dead");
        }

        //アニメーション変更を検知
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
            if (this.nowAnimation == "up" || this.nowAnimation == "down")
                if (ct.up || ct.down) {
                    this.isAdvanceAnimation = true;
                } else {
                    this.isAdvanceAnimation = false;
                }
        }

        //攻撃判定追従
        this.attackCollision.x = this.x + this.scaleX*12;
        this.attackCollision.y = this.y;

        //情報保存
        this.before.up = ct.up;
        this.before.down = ct.down;
        this.before.attack = ct.attack;
        this.before.jump = ct.up || ct.jump;

        //ダウンキー連続押下フレームカウント
        if (this.onFloor && !this.isCatchLadder && ct.down && !ct.right && !ct.left && !ct.up && !ct.attack) {
            this.downFrame++;
        } else {
            this.downFrame = 0;
        }
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
        this.isCatchLadder = false;
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
        return this;
    },

    //武器変更
    setWeapon: function(kind) {
        switch (kind) {
            case 0:
                this.power = 10;
                this.attackCollision.width = 14;
                this.attackCollision.height = 30;
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(-3, 3);
                break;
            case 1:
                this.power = 15;
                this.attackCollision.width = 24;
                this.attackCollision.height = 35;
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(-3, 3);
                break;
            case 2:
                this.power = 20;
                this.attackCollision.width = 14;
                this.attackCollision.height = 26;
                this.frame["attack"] = [ 44, 44, 44, 43, 43, 43, 42, 42, 42, 41, 41, 41, "stop"];
                this.weapon.setPosition(-3, 3);
                break;
            case 3:
                this.power = 10;
                this.attackCollision.width = 39;
                this.attackCollision.height = 10;
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(0, 0);
                break;
        }
        this.weapon.setFrameIndex(kind);
        return this;
    },

    //装備武器により攻撃モーションを変える
    weaponAttack: function() {
        this.attack = true;
        var that = this;
        switch (this.weapon.frameIndex) {
            case 0:
                this.weapon.tweener.clear()
                    .set({rotation: 200, alpha: 1.0})
                    .to({rotation: 360}, 5)
                    .fadeOut(1)
                    .call(function() {
                        that.attack = false;
                    });
                break;
            case 1:
                this.weapon.tweener.clear()
                    .set({rotation: 200, alpha: 1.0})
                    .to({rotation: 360}, 6)
                    .fadeOut(1)
                    .call(function() {
                        that.attack = false;
                    });
                break;
            case 2:
                this.weapon.tweener.clear()
                    .set({rotation: 400, alpha: 1.0})
                    .to({rotation: 270}, 8)
                    .fadeOut(1)
                    .call(function() {
                        that.attack = false;
                    });
                break;
            case 3:
                this.weapon.tweener.clear()
                    .set({rotation: -45, alpha: 1.0})
                    .by({x: -10}, 2)
                    .by({x: 10}, 5)
                    .fadeOut(1)
                    .call(function() {
                        that.attack = false;
                    });
                break;
        }
        return this;
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
        return this;
    },

    //当たり判定用エレメントの位置再セット
    resetCollisionPosition: function() {
        var w = Math.floor(this.width/2)+6;
        var h = Math.floor(this.height/2)+6;
        this._collision[0].setPosition(this.x, this.y - h);
        this._collision[1].setPosition(this.x + w, this.y - 5);
        this._collision[2].setPosition(this.x, this.y + h);
        this._collision[3].setPosition(this.x - w, this.y - 5);
        return this;
    },

    //足下はしごチェック
    checkFootLadder: function() {
        var h = Math.floor(this.height/2)+10;
        var c = phina.display.DisplayElement({width: 2, height: 2}).setPosition(this.x, this.y+h);
        var ret = null;
        this.parentScene.collisionLayer.children.forEach(function(e) {
            if (e.hitTestElement(c)) {
                if (e.type == "ladder" || e.type == "stairs") ret = e;
            }
        }.bind(this));
        return ret;
    },
});
