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

    //多段ジャンプ可能回数
    numJump: 0,
    numJumpMax: 1,

    //装備中アイテム
    equip: {
        weapon: 0,
        ring: null,
    },

    //アイテム所持最大数
    maxItem: 10,

    //所持アイテム
    items: [0, 7, 8, 9, 10, 11],

    //所持クリア条件キー
    keys: [],

    //討伐モンスター数
    kill: 0,

    //操作可能フラグ
    isControl: true,

    //前フレームの情報
    before: {
        //操作系
        up: false,
        down: false,
        attack: false,
        jump: false,
    },

    init: function(parentScene) {
        this.superInit(parentScene, {width: 16, height: 20});
        var that = this;

        //スプライト背後
        this.back = phina.display.DisplayElement().addChildTo(this).setScale(-1, 1);

        //表示用スプライト
        this.sprite = phina.display.Sprite("player1", 32, 32).addChildTo(this).setFrameIndex(0);

        //武器用スプライト
        this.weapon = phina.display.Sprite("item", 20, 20)
            .addChildTo(this.back)
            .setFrameIndex(0)
            .setOrigin(1, 1)
            .setPosition(-3, 3);
        this.weapon.alpha = 0;
        this.weapon.tweener.setUpdateType('fps');
        this.weapon.type = "sword";

        //攻撃判定用
        this.attackCollision = phina.display.RectangleShape({width: 14, height: 26});
        //当たり判定デバッグ用
        if (DEBUG_COLLISION) {
            this.attackCollision.addChildTo(this.parentScene.playerLayer);
            this.attackCollision.alpha = 0.3;
            this.on('removed', function(e) {
                this.attackCollision.remove();
            });
        }

        //はしご判定用
        this.ladderCollision = phina.display.RectangleShape({width: 16, height: 20});

        this.setAnimation("walk");
        this.beforeAnimation = "";

        this.on('dead', function(e) {
            this.parentScene.flare('gameover');
        });
    },

    update: function(app) {
        //死亡時は何も出来ない
        if (this.isDead) {
            //マップ外落下
            if (this.isDrop) {
                this.hp = 0;
                this.setAnimation("drop");
            }
            return;
        }

        //プレイヤー操作
        var ct = app.controller;
        if (!this.isControl) ct = {};
        if (this.stopTime == 0) {
            //左移動
            if (ct.left) {
                if (!this.isJump && !this.attack && !this.isCatchLadder) this.setAnimation("walk");
                //はしご掴み状態で左に壁がある場合は不可
                var c = this._collision[3];
                if (!(this.isCatchLadder && this.checkMapCollision2(c.x+6, c.y, c.width, c.height))) {
                    this.scaleX = -1;
                    this.vx = -5;
                }
            }
            //右移動
            if (ct.right) {
                if (!this.isJump && !this.attack && !this.isCatchLadder) this.setAnimation("walk");
                //はしご掴み状態で右に壁がある場合は不可
                var c = this._collision[1];
                if (!(this.isCatchLadder && this.checkMapCollision2(c.x-6, c.y, c.width, c.height))) {
                    this.scaleX = 1;
                    this.vx = 5;
                }
            }

            //頭上足元はしご検知
            var headLadder = this.checkHeadLadder();
            var footLadder = this.checkFootLadder();

            //はしご掴み状態で操作分岐
            if (this.isCatchLadder) {
                if (ct.up) {
                    this.vx = 0;
                    this.vy = -4;
                    var c = this._collision[0];
                    if (!headLadder && this.checkMapCollision2(c.x, c.y-6, c.width, c.height)) {
                        this.vy = 0;
                    }
                }
                if (ct.down) {
                    this.vx = 0;
                    this.vy = 4;
                }
            } else {
                //上キー押下
                if (ct.up) {
                    //ジャンプ二段目以降
                    if (this.isJump && this.numJump < this.numJumpMax && this.vy > -5) {
                        this.vy = -11;
                        this.numJump++;
                    }
                    //ジャンプ
                    if (!this.isJump && this.onFloor && !this.onLadder) {
                        this.setAnimation("jump");
                        this.isJump = true;
                        this.vy = -11;
                        this.numJump = 1;
                    }
                    //はしごを昇る（階段は接地時のみ）
                    if (this.onLadder && !this.onStairs || this.onFloor && this.onStairs) {
                        this.setAnimation("up");
                        this.vx = 0;
                        this.vy = 0;
                        this.isCatchLadder = true;
                        this.throughFloor = null;
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
                        this.throughFloor = null;
                    }
                    //床スルー
                    if (this.downFrame > 6 && !this.jump && !footLadder) {
                        if (this.onFloor && !this.throughFloor) {
                            var floor = this.checkMapCollision2(this.x, this.y+16, 5, 5);
                            if (floor[0].enableThrough) this.throughFloor = floor[0];
                        }
                    }
                }
            }

        }
        //はしごから外れたら梯子掴み状態キャンセル
        if (this.isCatchLadder) {
            if (!this.onLadder && !ct.down || this.onLadder && !footLadder && !ct.up) {
                this.isCatchLadder = false;
            }
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
            if (ct.attack && !this.before.attack && this.stopTime == 0 && !(this.isCatchLadder && this.onLadder)) {
                this.isCatchLadder = false;
                this.setAnimation("attack");
                this.weaponAttack();
                app.playSE("attack");
            }
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
        if (this.isDead) return false;

        var dir = 0;
        if (this.x < target.x) dir = 180;
        this.knockback(target.power, dir);

        this.hp -= target.power;
        this.isCatchLadder = false;
        app.playSE("damage");

        if (this.hp <= 0) {
            this.dead();
        } else {
            this.mutekiTime = 60;
            this.stopTime = 15;
            if (this.nowAnimation != "jump") this.setAnimation("damage");
        }
        return true;
    },

    dead: function() {
        this.hp = 0;
        this.setAnimation("dead");
        this.isDead = true;
        this.isCatchLadder = false;
        this.vx = 0;
        this.vy = -6;
        this.tweener.clear()
            .wait(120)
            .call(function(){
                this.flare('dead');
            }.bind(this));
    },

    //アイテム取得
    getItem: function(item) {
        //武器
        if (item.weapon) {
            this.setWeapon(item.kind);
            this.items.push(item.kind);
            return;
        }
        //装備品
        if (item.equip) {
            this.items.push(item.kind);
        }
        //食べ物
        if (item.food) {
            this.hp += item.power;
        }
        //鍵
        if (item.key) {
            this.keys.push(item);
            app.playSE("getkeyitem");
        }
        return this;
    },

    //武器変更
    setWeapon: function(kind) {
        switch (kind) {
            case 0:
                //ショートソード
                this.power = 10;
                this.attackCollision.width = 14;
                this.attackCollision.height = 30;
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(-3, 3);
                break;
            case 1:
                //ロングソード
                this.power = 15;
                this.attackCollision.width = 24;
                this.attackCollision.height = 35;
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(-3, 3);
                break;
            case 2:
                //斧
                this.power = 20;
                this.attackCollision.width = 14;
                this.attackCollision.height = 26;
                this.frame["attack"] = [ 44, 44, 44, 43, 43, 43, 42, 42, 42, 41, 41, 41, "stop"];
                this.weapon.setPosition(-3, 3);
                break;
            case 3:
                //槍
                this.power = 10;
                this.attackCollision.width = 39;
                this.attackCollision.height = 10;
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(0, 0);
                break;
            case 4:
                //弓
                this.power = 5;
                this.attackCollision.width = 10;
                this.attackCollision.height = 5;
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(0, 0);
                break;
            case 5:
                //魔法の杖
                this.power = 10;
                this.attackCollision.width = 10;
                this.attackCollision.height = 5;
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
            case 4:
                this.weapon.tweener.clear()
                    .set({rotation: -45, alpha: 1.0})
                    .by({x: 7}, 3)
                    .by({x: -7}, 3)
                    .fadeOut(1)
                    .call(function() {
                        that.attack = false;
                    });
                    var arrow = qft.PlayerAttack(this.parentScene, {width: 15, height: 5, power: this.power, type: "arrow"})
                        .addChildTo(this.parentScene.playerLayer)
                        .setScale(this.scaleX, 1)
                        .setPosition(this.x, this.y);
                    arrow.tweener.setUpdateType('fps').clear()
                        .by({x: 150*this.scaleX}, 7)
                        .call(function() {
                            this.remove();
                        }.bind(arrow));
                break;
            case 5:
                this.weapon.tweener.clear()
                    .set({rotation: 200, alpha: 1.0})
                    .to({rotation: 360}, 8)
                    .fadeOut(1)
                    .call(function() {
                        that.attack = false;
                    });
                    var arrow = qft.PlayerAttack(this.parentScene, {width: 15, height: 10, index: 30, power: 20, type: "fireball"})
                        .addChildTo(this.parentScene.playerLayer)
                        .setScale(this.scaleX, 1)
                        .setPosition(this.x, this.y);
                    arrow.tweener.setUpdateType('fps').clear()
                        .by({x: 100*this.scaleX}, 30, "easeInQuart")
                        .call(function() {
                            this.remove();
                        }.bind(arrow));
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
        this.frame["drop"] = [18, 19, 20];
        this.frame["dead"] = [18, 19, 20, 33, 34, 35, "stop"];
        this.frame["clear"] = [24, 25, 26];
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
        this.ladderCollision.setPosition(this.x, this.y);
        return this;
    },

    //頭上はしごチェック
    checkHeadLadder: function() {
        var h = Math.floor(this.height/2)+10;
        var c = phina.display.DisplayElement({width: 16, height: 2}).setPosition(this.x, this.y-h);
        var ret = null;
        this.parentScene.collisionLayer.children.forEach(function(e) {
            if (e.hitTestElement(c)) {
                if (e.type == "ladder" || e.type == "stairs") ret = e;
            }
        }.bind(this));
        return ret;
    },

    //足下はしごチェック
    checkFootLadder: function() {
        var h = Math.floor(this.height/2)+10;
        var c = phina.display.DisplayElement({width: 16, height: 2}).setPosition(this.x, this.y+h);
        var ret = null;
        this.parentScene.collisionLayer.children.forEach(function(e) {
            if (e.hitTestElement(c)) {
                if (e.type == "ladder" || e.type == "stairs") ret = e;
            }
        }.bind(this));
        return ret;
    },

    //プレイヤー情報リセット
    reset: function() {
        //移動情報
        this.vx = 0;
        this.vy = 0;

        //ステータス
        this.hp = 100;

        //各種フラグ
        this.isJump = false;
        this.isDead = false;
        this.isCatchLadder = false;
        this.isDrop = false;
        this.onFloor = false;
        this.isAdvanceAnimation = true;
        this.ignoreCollision = false;

        //経過時間系
        this.mutekiTime = 0;
        this.stopTime = 0;
        this.downFrame = 0;
        this.time = 0;

        //アニメーション
        this.setAnimation("walk");
        this.beforeAnimation = "";
        this.advanceTime = 6;

        //所持武器
        this.setWeapon(0);

        //所持アイテム
        this.items = [0, 7, 8, 9, 10, 11];

        //所持クリア条件キー
        this.keys = [];

        //討伐モンスター数
        this.kill = 0;

        //操作可能フラグ
        this.isControl = true;

        //多段ジャンプ最大回数
        this.numJumpMax = 0;

        return this;
    },
});

//プレイヤー攻撃判定
phina.define("qft.PlayerAttack", {
    superClass: "phina.display.DisplayElement",

    //攻撃力
    power: 1,

    //あたり判定発生フラグ
    isCollision: true,

    init: function(parentScene, options) {
        this.superInit(options);
        this.parentScene = parentScene;

        this.type = options.type || "arrow";
        this.power = options.power || 0;
        this.time = 0;
        this.index = 0;

        //表示スプライト
        switch (this.type) {
            case "arrow":
                this.sprite = phina.display.Sprite("item", 20, 20).addChildTo(this).setFrameIndex(30);
                this.setAnimation("arrow");
                this.frame = [30];
                break;
            case "fireball":
                this.sprite = phina.display.Sprite("bullet", 24, 32).addChildTo(this).setFrameIndex(9);
                this.power = options.power || 0;
                this.frame = [9,10,11,10];
                break;
        }
    },

    update: function(app) {
        if (!this.isCollision || this.type == "explode") return;

        if (this.time % 3 == 0) {
            this.sprite.setFrameIndex(this.frame[this.index]);
            this.index = (this.index + 1) % this.frame.length;
        }

        //地形接触判定
        var that = this;
        this.parentScene.collisionLayer.children.forEach(function(e) {
            if (e.type == "ladder" || e.type == "stairs") return;
            if (this.hitTestElement(e)) {
                this.isCollision = false;
                switch (this.type) {
                    case "arrow":
                        this.stick(e);
                        break;
                    case "fireball":
                        this.explode(e);
                        break;
                }
            }
        }.bind(this));

        this.time++;
    },

    //刺さる
    stick: function(e) {
        app.playSE("arrowstick");
        if (this.scaleX == 1) {
            this.x = e.left;
        } else {
            this.x = e.right;
        }
        this.tweener.clear()
            .wait(30)
            .call(function() {
                this.remove();
            }.bind(this));
    },

    //爆発
    explode: function(e) {
        this.remove();
    },

    setAnimation: function(name) {
    },
});

//プレイヤーダミースプライト
phina.define("qft.PlayerDummy", {
    superClass: "phina.display.Sprite",

    init: function(assetName) {
        this.superInit(assetName, 32, 32);
        this.frame = [];
        this.frame["stand"] = [13, 14];
        this.frame["up"] =   [ 9, 10, 11, 10];
        this.frame["up_stop"] =   [10, "stop"];
        this.frame["down"] = [ 0,  1,  2,  1];
        this.frame["clear"] = [24, "stop"];
        this.frame["dead"] = [18, 19, 20, 33, 34, 35, "stop"];
        this.index = 0;

        this.nowAnimation = "stand";
        this.animation = true;

        this.time = 0;
    },

    update: function() {
        if (this.animation && this.time % 6 == 0) {
            this.index = (this.index+1) % this.frame[this.nowAnimation].length;
            if (this.frame[this.nowAnimation][this.index] == "stop") this.index--;
            this.frameIndex = this.frame[this.nowAnimation][this.index];
        }
        this.time++;
    },

    setAnimation: function(animName) {
        if (!this.frame[animName]) return;
        if (animName == this.nowAnimation) return;
        this.nowAnimation = animName;
        this.index = -1;
        return this;
    },
});
