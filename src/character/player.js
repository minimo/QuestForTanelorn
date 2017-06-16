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

    //最大ヒットポイント
    hpMax: 100,

    //ヒットポイント
    hp: 100,

    //攻撃力
    power: 10,

    //気絶確率
    stunPower: 1,

    //防御力
    defense: 10,

    //下押し連続フレーム数
    downFrame: 0,

    //多段ジャンプ可能回数
    numJump: 0,
    numJumpMax: 1,

    //所持装備アイテム
    equip: null,

    //アイテム所持最大数
    maxItem: 10,

    //所持アイテム
    items: null,

    //所持クリア条件キー
    keys: null,

    //操作可能フラグ
    isControl: true,

    //攻撃中フラグ
    isAttack: false,

    //防御中フラグ
    isDefense: false,

    //ドア上フラグ
    isOnDoor: false,

    //前フレームの情報
    before: {
        //操作系
        up: false,
        down: false,
        attack: false,
        jump: false,
        change: false,
        isStun: false,
        isOnFloor: false,
    },

    //ステージ開始時ステータス
    startStatus: null,

    init: function(parentScene) {
        this.superInit(parentScene, {width: 16, height: 20});
        var that = this;

        //スプライト背後
        this.back = phina.display.DisplayElement().addChildTo(this).setScale(-1, 1);

        //表示用スプライト
        this.sprite = phina.display.Sprite("player1", 32, 32).addChildTo(this).setFrameIndex(0);
        this.sprite.scaleX = -1;

        //武器用スプライト
        this.weapon = phina.display.Sprite("weapons", 24, 24)
            .addChildTo(this.back)
            .setFrameIndex(0)
            .setOrigin(1, 1)
            .setPosition(3, 3);
        this.weapon.alpha = 0;
        this.weapon.tweener.setUpdateType('fps');
        this.weapon.type = "sword";

        //盾
        this.shield = phina.display.Sprite("item", 24, 24)
//            .addChildTo(this)
            .setFrameIndex(7)
            .setPosition(10, 6)
            .setScale(0.8)
            .setVisible(false);

        //攻撃判定用
        this.attackCollision = phina.display.RectangleShape({width: 14, height: 26});
        //当たり判定デバッグ用
        if (DEBUG_COLLISION) {
            this.one('enterframe', e => {
                this.attackCollision.addChildTo(this.parentScene.playerLayer);
                this.attackCollision.alpha = 0.3;
            });
            this.on('removed', e => {
                this.attackCollision.remove();
            });
        }

        //プレイヤー情報の初期化
        this.reset();

        //はしご判定用
        this.ladderCollision = phina.display.RectangleShape({width: 16, height: 20});

        //初期アニメーション設定
        this.setAnimation("walk");
        this.beforeAnimation = "";

        //死亡時コールバック
        this.on('dead', function(e) {
            this.parentScene.flare('gameover');
        });

        //ステージ開始時ステータス
        this.saveStatus();

        //最後に床上にいた場所を保存
        this.lastOnFloorX = 0;
        this.lastOnFloorY = 0;
    },
    update: function(app) {
        //オブジェクトレイヤー接触判定
        this.isOnDoor = null;
        this.parentScene.objLayer.children.forEach(function(e) {
            //扉判定
            if (e instanceof qft.MapObject.Door || e instanceof qft.MapObject.Gate) {
                if (e.hitTestElement(this)) {
                    this.isOnDoor = e;
                    return;
                }
            }
        }.bind(this));

        //死亡時は何も出来ない
        if (this.isDead) {
            //マップ外落下
            if (this.isDrop) {
                this.hp = 0;
                this.setAnimation("drop");
            }
            return;
        }

//        this.shield.setVisible(false);
//        this.isDefense = false;

        //プレイヤー操作
        var ct = app.controller;
        //バーチャルパッド情報取得
        var vp = app.virtualPad;
        if (vp.getKey("up")) ct.up = true;
        if (vp.getKey("right")) ct.right = true;
        if (vp.getKey("down")) ct.down = true;
        if (vp.getKey("left")) ct.left = true;
        if (vp.getKey("Z")) ct.attack = true;
        if (vp.getKey("X")) ct.jump = true;

        if (!this.isControl) ct = {};
        if (this.stopTime == 0) {
            //左移動
            if (ct.left && !ct.down) {
                if (!this.isJump && !this.isAttack && !this.isCatchLadder) this.setAnimation("walk");
                //はしご掴み状態で左に壁がある場合は不可
                var c = this._collision[3];
                if (!(this.isCatchLadder && this.checkMapCollision2(c.x+6, c.y, c.width, c.height))) {
                    this.scaleX = -1;
                    this.vx = -5;
                }
            }
            //右移動
            if (ct.right && !ct.down) {
                if (!this.isJump && !this.isAttack && !this.isCatchLadder) this.setAnimation("walk");
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
                //ジャンプボタンのみ
                if (ct.jump && !ct.up) {
                    //ジャンプ二段目以降
                    if (this.isJump && this.numJump < this.numJumpMax && this.vy > -5) {
                        this.vy = -11;
                        this.numJump++;
                    }
                    //ジャンプ
                    var chk = this.checkMapCollision2(this.x, this.y-16, 5, 3);
                    if (!this.isJump && this.isOnFloor && !chk) {
                        this.setAnimation("jump");
                        this.isJump = true;
                        this.vy = -11;
                        this.numJump = 1;
                    }
                }
                //上キー押下
                if (ct.up) {
                    //ジャンプ二段目以降
                    if (this.isJump && this.numJump < this.numJumpMax && this.vy > -5) {
                        this.vy = -11;
                        this.numJump++;
                    }
                    //ジャンプ
                    var chk = this.checkMapCollision2(this.x, this.y-16, 5, 3);
                    if (!this.isJump && this.isOnFloor && !this.isOnLadder && !chk) {
                        this.setAnimation("jump");
                        this.isJump = true;
                        this.vy = -11;
                        this.numJump = 1;
                    }
                    //はしごを昇る（階段は接地時のみ）
                    if (this.isOnLadder && !this.isOnStairs || this.isOnFloor && this.isOnStairs) {
                        this.setAnimation("up");
                        this.vx = 0;
                        this.vy = 0;
                        this.isCatchLadder = true;
                        this.throughFloor = null;
                    }
                    //扉に入る（接地時＆左右キーオフ時のみ）
                    if (!ct.left && !ct.right && this.isOnFloor && this.isOnDoor && !this.isOnDoor.isLock && !this.isOnDoor.already) {
                        this.vx = 0;
                        this.vy = 0;
                        this.isOnDoor.flare('enterdoor');
                        this.isOnDoor.already = false;
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
                        if (this.isOnFloor && !this.throughFloor) {
                            var floor = this.checkMapCollision2(this.x, this.y+16, 5, 5);
                            if (floor && floor[0].enableThrough) this.throughFloor = floor[0];
                        }
                    }
                    //盾を構える
                    if (!this.isAttack) {
//                        this.shield.setVisible(true);
//                        this.isDefense = true;
//                        this.setAnimation("defense");
                    }
                }
            }

        }

        //はしごから外れたら梯子掴み状態キャンセル
        if (this.isCatchLadder) {
            if (!this.isOnLadder && !ct.down || this.isOnLadder && !footLadder && !ct.up) {
                this.isCatchLadder = false;
            }
        }

        //攻撃
        if (!this.isAttack) {
            if (this.isOnFloor) {
                if (this.nowAnimation != "damage" && !this.isDefense) this.setAnimation("walk");
            } else if (this.isCatchLadder) {
                if (ct.up) {
                    this.setAnimation("up");
                } else if (ct.down) {
                    if (this.isOnStairs) {
                        this.setAnimation("down");
                    } else {
                        this.setAnimation("up");
                    }
                }
            } else {
                if (!this.isStun && !this.isDead) this.setAnimation("jump");
            }
            if (ct.attack && !this.before.attack && this.stopTime == 0 && !(this.isCatchLadder && this.isOnLadder)) {
                this.isCatchLadder = false;
                this.setAnimation("attack");
                this.weaponAttack();
                app.playSE("attack");
            }

            //武器の変更
            if (ct.change && !this.before.change && this.equip.switchOk) {
                this.switchWeapon();
            }
        }

        //気絶状態
        if (this.isStun) {
            this.setAnimation("damage");

            //梯子掴みキャンセル
            this.isCatchLadder = false;

            //レバガチャで気絶復帰を早める
            if (ct.left && !ct.before.left ||
                ct.right && !ct.before.right ||
                ct.up && !ct.before.up ||
                ct.down && !ct.before.down) this.stopTime -= 2;
        } else if (this.before.isStun) {
            //気絶復帰したらアニメーションを標準に
            this.setAnimation("stand");
        }

        //死亡状態
        if (this.isDead) {
            this.setAnimation("dead");
            this.isCatchLadder = false;
        }

        //アニメーション変更を検知
        if (this.nowAnimation != this.beforeAnimation) {
            this.time = 0;
            this.isAdvanceAnimation = true;
            this.animationInterval = 6;
            if (this.nowAnimation == "attack") this.animationInterval = 2;
            if (this.nowAnimation == "defense") this.animationInterval = 1;
        } else {
            //歩行アニメーションの場合は移動している時のみ進める
            if (this.nowAnimation == "walk" && !ct.left && !ct.right) {
                this.isAdvanceAnimation = false;
            } else {
                this.isAdvanceAnimation = true;
            }
            if (this.nowAnimation == "up" || this.nowAnimation == "down") {
                if (ct.up || ct.down) {
                    this.isAdvanceAnimation = true;
                } else {
                    this.isAdvanceAnimation = false;
                }
            }
        }

        //攻撃判定追従
        this.attackCollision.x = this.x + this.scaleX*12;
        this.attackCollision.y = this.y;

        //コントローラ他情報保存
        this.before.up = ct.up;
        this.before.down = ct.down;
        this.before.attack = ct.attack;
        this.before.jump = ct.up || ct.jump;
        this.before.change = ct.change;
        this.before.isStun = this.isStun;
        this.before.inOnFloor = this.isOnFloor;

        //ダウンキー連続押下フレームカウント
        if (this.isOnFloor && !this.isCatchLadder && ct.down && !ct.right && !ct.left && !ct.up && !ct.attack) {
            this.downFrame++;
        } else {
            this.downFrame = 0;
        }

        //接地時座標保存
        if (this.isOnFloor && this._collision[2].hit.type != "movefloor") {
            this.lastOnFloorX = this.x;
            this.lastOnFloorY = this.y;
        }
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
        this.isOnFloor = false;
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
        this.animationInterval = 6;

        //所持装備
        this.equip = {
            using: 0,         //現在使用中（weaponsのindex）
            weapons: [0],     //所持リスト（最大３）
            level: [0],       //武器レベル
            switchOk: true,   //変更可能フラグ
        };

        //武器セット
        this.setWeapon(0);

        //所持アイテム
        this.items = [];

        //所持クリア条件キー
        this.keys = [];

        //操作可能フラグ
        this.isControl = true;

        //多段ジャンプ最大回数
        this.numJumpMax = 0;

        return this;
    },

    //プレイヤー情報コンティニュー用リセット
    continueReset: function() {
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
        this.isOnFloor = false;
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
        this.animationInterval = 6;

        //操作可能フラグ
        this.isControl = true;

        //多段ジャンプ最大回数
        this.numJumpMax = 0;

        return this;
    },

    //ダメージ処理
    damage: function(target) {
        if (this.mutekiTime > 0) return false;
        if (target.power == 0) return false;
        if (this.isDead) return false;
        if (this.isMuteki) return false;

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

            //気絶判定
            var dice = Math.randint(1, 100);
            if (dice <= target.stunPower) this.flare('stun', {power: target.power});
        }
        return true;
    },

    //死亡時処理
    dead: function() {
        this.hp = 0;
        this.setAnimation("dead");
        this.isDead = true;
        this.isCatchLadder = false;
        this.vx = 0;
        this.vy = -6;
        this.tweener.clear()
            .wait(90)
            .call(function(){
                this.flare('dead');
            }.bind(this));
    },

    //アイテム取得
    getItem: function(item) {
        //武器
        if (item.isWeapon) {
            //既に持っている武器かチェック
            var index = this.equip.weapons.findIndex(function(e, i, a) {
                return e == item.kind;
            });
            if (index == null || index == -1) {
                //持って無い武器だった場合
                if (this.equip.weapons.length < 3) {
                    //リストに追加
                    this.equip.weapons.push(item.kind);
                    this.equip.level.push(item.level);
                } else {
                    //現在使用武器の手前の武器を捨てる
                    var dropIndex = this.equip.using == 0? 2: this.equip.using - 1;
                    var options = {
                        properties: {
                            kind: this.equip.weapons[dropIndex],
                            level: this.equip.level[dropIndex],
                        },
                    };
                    var drop = this.parentScene.spawnItem(this.x, this.y, options);
                    drop.friction = 0.8;
                    drop.vx = 0 * -this.scaleX;
                    drop.vy = -5;
                    drop.throwAway = true;
                    this.equip.weapons[dropIndex] = item.kind;
                    this.equip.level[dropIndex] = item.level;
                }
            } else {
                //所持武器を拾ったらその武器のレベルが上がる
                this.equip.level[index]++;
                var id = this.equip.weapons[this.equip.using];
                var lv = this.equip.level[this.equip.using];
                this.setWeapon(id, lv);
            }
            app.playSE("getitem");
        }
        //装備品
        if (item.isEquip) {
            if (this.hpMax < 200) this.hpMax += (item.power || 0);
            this.parentScene.totalScore += (item.point || 0);
            app.playSE("getitem");
        }
        //食べ物
        if (item.isFood) {
            this.hp += item.power;
            app.playSE("recovery");
            if (this.hp > 100) this.hp = 100;
            this.parentScene.totalScore += (item.point || 0);
        }
        //鍵
        if (item.isKey) {
            this.keys.push(item);
            app.playSE("getkeyitem");
            this.parentScene.flare('getkey', {key: item});
            this.parentScene.totalScore += (item.point || 0);
        }
        //得点アイテム
        if (item.isItem) {
            this.parentScene.totalScore += (item.point || 0);
            app.playSE("getitem");
        }
        return this;
    },

    //使用武器の変更
    switchWeapon: function() {
        //手持ちの武器が一個の場合は何もしない
        if (this.equip.weapons.length < 2) return;

        this.equip.switchOk = false;

        var rot = 120;
        if (this.equip.weapons.length == 2 && this.equip.using == 1) rot = 240;
        this.parentScene.playerWeapon.tweener.clear()
            .by({rotation: rot}, 300)
            .call(function() {
                this.equip.switchOk = true;
            }.bind(this));

        //現在使用武器設定
        this.equip.using = (this.equip.using + 1) % this.equip.weapons.length;
        var id = this.equip.weapons[this.equip.using];
        var lv = this.equip.level[this.equip.using];
        this.setWeapon(id, lv);

        app.playSE("select");
    },

    //武器変更
    setWeapon: function(kind, level) {
        kind = kind || 0;
        level = level || 0;

        //属性初期化
        this.attackCollision.$extend({
            isSlash: false,
            isSting: false,
            isBlow: false,
            isArrow: false,
            isFire: false,
            isIce: false,
            stunPower: 1,
        });

        //アイテム情報取得
        var spec = qft.ItemInfo.get(kind);
        this.attackCollision.$extend(spec);
        this.attackCollision.power += level * (spec.levelBonus || 2);

        switch (kind) {
            case 0:
                //ショートソード
                level = 0;
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(-3, 3);
                break;
            case 1:
                //ロングソード
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(-3, 3);
                break;
            case 2:
                //斧
                this.frame["attack"] = [ 44, 44, 44, 43, 43, 43, 42, 42, 42, 41, 41, 41, "stop"];
                this.weapon.setPosition(-3, 3);
                break;
            case 3:
                //槍
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(0, 0);
                break;
            case 4:
                //弓
                level = 0;
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(0, 0);
                break;
            case 5:
                //魔法の杖
                this.frame["attack"] = [ 41, 42, 43, 44, "stop"];
                this.weapon.setPosition(0, 0);
                break;
            case 6:
                //魔導書
                this.frame["attack"] = [ 44, 44, 44, 43, 43, 43, 42, 42, 42, 41, 41, 41, "stop"];
                this.weapon.setPosition(-3, 3);
                break;
        }

        //武器画像設定
        var index = kind * 10 + Math.min(level, spec.maxIndex);
        this.weapon.setFrameIndex(index);

        return this;
    },

    //装備武器により攻撃モーションを変える
    weaponAttack: function() {
        var kind = this.equip.weapons[this.equip.using];
        var level = this.equip.level[this.equip.using];
        this.isAttack = true;
        var that = this;
        switch (kind) {
            case 0:
                //ショートソード
                this.weapon.tweener.clear()
                    .set({rotation: 200, alpha: 1.0})
                    .to({rotation: 360}, 5)
                    .fadeOut(1)
                    .call(function() {
                        that.isAttack = false;
                    });
                break;
            case 1:
                //ロングソード
                this.weapon.tweener.clear()
                    .set({rotation: 200, alpha: 1.0})
                    .to({rotation: 360}, 6)
                    .fadeOut(1)
                    .call(function() {
                        that.isAttack = false;
                    });
                break;
            case 2:
                //斧
                this.weapon.tweener.clear()
                    .set({rotation: 400, alpha: 1.0})
                    .to({rotation: 270}, 8)
                    .fadeOut(1)
                    .call(function() {
                        that.isAttack = false;
                    });
                break;
            case 3:
                //槍
                this.weapon.tweener.clear()
                    .set({rotation: -45, alpha: 1.0})
                    .by({x: -10}, 2)
                    .by({x: 10}, 2)
                    .fadeOut(1)
                    .call(function() {
                        that.isAttack = false;
                    });
                break;
            case 4:
                //弓
                this.weapon.tweener.clear()
                    .set({rotation: -45, alpha: 1.0})
                    .by({x: 7}, 3)
                    .by({x: -7}, 3)
                    .fadeOut(1)
                    .call(function() {
                        that.isAttack = false;
                    });
                    var arrowPower = 5 + level * 2;
                    var arrow = qft.PlayerAttack(this.parentScene, {width: 15, height: 10, power: arrowPower, type: "arrow"})
                        .addChildTo(this.parentScene.playerLayer)
                        .setScale(this.scaleX, 1)
                        .setPosition(this.x, this.y);
                    arrow.tweener.setUpdateType('fps').clear()
                        .by({x: (150 + level * 5) * this.scaleX}, 7)
                        .call(function() {
                            this.remove();
                        }.bind(arrow));
                break;
            case 5:
                //魔法の杖
                this.weapon.tweener.clear()
                    .set({rotation: 200, alpha: 1.0})
                    .to({rotation: 360}, 8)
                    .fadeOut(1)
                    .call(function() {
                        that.isAttack = false;
                    });
                    var magicPower = 20 + level * 2;
                    var magic = qft.PlayerAttack(this.parentScene, {width: 15, height: 10, index: 30, power: magicPower, type: "fireball"})
                        .addChildTo(this.parentScene.playerLayer)
                        .setScale(this.scaleX, 1)
                        .setPosition(this.x, this.y);
                    magic.tweener.setUpdateType('fps').clear()
                        .by({x: 100*this.scaleX}, 30, "easeInQuart")
                        .call(function() {
                            this.remove();
                        }.bind(magic));
                break;
            case 6:
                //魔導書
                this.weapon.tweener.clear()
                    .set({rotation: 400, alpha: 1.0})
                    .to({rotation: 270}, 8)
                    .fadeOut(1)
                    .call(function() {
                        that.isAttack = false;
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
        this.frame["defense"] = [ 41, 42, 43, 44, "stop"];
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

    //現在ステータス保存
    saveStatus: function() {
        //所持武器、アイテム等ステータスの取得
        var eq = this.equip;
        var equip = {
            using: 0,
            weapons: eq.weapons.concat(),
            level: eq.level.concat(),
            switchOk: true,
        };
        var items = this.items.concat();
        var numJumpMax = this.numJumpMax;

        this.startStatus = {
            hpMax: this.hpMax,
            hp: this.hp,
            power: this.power,
            defense: this.defense,
            equip: equip,
            item: items,
            numJumpMax: numJumpMax,
        };
    },

    //ステータス復元
    restoreStatus: function() {
        this.$extend(this.startStatus);
        this.parentScene.playerWeapon.rotation = 0;

        var id = this.equip.weapons[this.equip.using];
        var lv = this.equip.level[this.equip.using];
        this.setWeapon(id, lv);
    },
});

//プレイヤー攻撃判定
phina.define("qft.PlayerAttack", {
    superClass: "phina.display.DisplayElement",

    //攻撃力
    power: 1,

    //当たり判定発生フラグ
    isCollision: true,

    //属性
    isSlash: false,
    isSting: false,
    isBlow: false,
    isArrow: false,
    isFire: false,
    isIce: false,

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
                this.sprite = phina.display.Sprite("weapons", 24, 24).addChildTo(this).setFrameIndex(1);
                this.frame = [1];
                this.isArrow = true;
                this.isSting = true;
                this.stunPower = 10;
                break;
            case "fireball":
                this.sprite = phina.display.Sprite("bullet", 24, 32).addChildTo(this).setFrameIndex(9);
                this.frame = [9, 10, 11, 10];
                this.isFire = true;
                break;
            case "masakari":
                this.sprite = phina.display.Sprite("weapons", 24, 24).addChildTo(this).setFrameIndex(20);
                this.frame = [20];
                this.isSlash = true;
                this.isBrow = true;
                this.stunPower = 50;
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

    //ヒット後処理
    hit: function(target) {
        switch (this.type) {
            case "fireball":
                this.explode(target);
                break;
        }
    },

    //刺さる
    stick: function(e) {
        //効果音
        switch (this.type) {
            case "arrow":
                app.playSE("arrowstick");
                break;
            case "masakari":
                break;
        }

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
        this.parentScene.spawnEffect(this.x, this.y);
        app.playSE("bomb");
        this.remove();
    },
});

//プレイヤーダミースプライト
phina.define("qft.PlayerDummy", {
    superClass: "phina.display.Sprite",

    init: function(assetName) {
        this.superInit(assetName, 32, 32);
        this.frame = [];
        this.frame["stand"] = [13, 14];
        this.frame["walk"] = [ 3,  4,  5,  4];
        this.frame["walk_stop"] = [ 3,  4,  5,  4, "stop"];
        this.frame["up"] =   [ 9, 10, 11, 10];
        this.frame["up_stop"] =   [10, "stop"];
        this.frame["down"] = [ 0,  1,  2,  1];
        this.frame["clear"] = [24, "stop"];
        this.frame["damage"] = [ 18, 19, 20];
        this.frame["dead"] = [18, 19, 20, 33, 34, 35, "stop"];
        this.index = 0;

        this.nowAnimation = "stand";
        this.animation = true;

        this.bx = 0;
        this.by = 0;
        this.time = 0;
    },

    update: function() {
        if (this.animation && this.time % 6 == 0) {
            this.index = (this.index+1) % this.frame[this.nowAnimation].length;
            if (this.frame[this.nowAnimation][this.index] == "stop") this.index--;
            this.frameIndex = this.frame[this.nowAnimation][this.index];
        }

        if (this.x < this.bx) this.scaleX = 1;
        if (this.x > this.bx) this.scaleX = -1;
        this.bx = this.x;
        this.by = this.y;

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

//プレイヤー現在使用武器表示
phina.define("qft.PlayerWeapon", {
    superClass: "phina.display.DisplayElement",

    init: function(player) {
        this.superInit();
        this.player = player;

        var that = this;
        this.base = phina.display.DisplayElement().addChildTo(this);
        this.base.update = function() {
            this.rotation = -that.rotation;
        }
        var param = {
            width: 25,
            height: 25,
            fill: "rgba(0,0,0,0.0)",
            stroke: "yellow",
            strokeWidth: 2,
            backgroundColor: 'transparent',
        };
        //使用中武器
        phina.display.RectangleShape(param).addChildTo(this.base).setPosition(0, -18);
        //捨てちゃう武器
        this.dropFrame = phina.display.RectangleShape({stroke: "red"}.$safe(param))
            .addChildTo(this.base)
            .setPosition(14, 10)
            .setVisible(false);
        this.dropFrame.update = function() {
            if (that.player.equip.weapons.length < 3) {
                this.visible = false;
            } else {
                this.visible = true;
            }
        }

        //武器リスト（３つ）
        this.weapons = [];
        var rad = 0;
        var rad_1 = (Math.PI*2) / 3;
        (3).times(function(i) {
            var x =  Math.sin(rad)*18;
            var y = -Math.cos(rad)*18;
            rad -= rad_1;
            this.weapons[i] = phina.display.Sprite("weapons", 24, 24)
                .addChildTo(this)
                .setPosition(x, y);
            this.weapons[i].index = i;
            this.weapons[i].update = function() {
                this.rotation = -that.rotation;
                var weapons = that.player.equip.weapons;
                if (this.index < weapons.length) {
                    var kind = that.player.equip.weapons[this.index];
                    var level = that.player.equip.level[this.index];
                    var spec = qft.ItemInfo.get(kind);
                    var index = kind * 10 + Math.min(level, spec.maxIndex);
                    this.setFrameIndex(index);
                    this.visible = true;
                } else {
                    this.visible = false;
                }
            }
            var labelParam = {
                fill: "white",
                stroke: "black",
                strokeWidth: 2,

                fontFamily: "Orbitron",
                align: "center",
                baseline: "middle",
                fontSize: 10,
                fontWeight: ''
            };
            //強化レベル表示
            this.weapons[i].level = phina.display.Label({text: ""}.$safe(labelParam)).setPosition(6, 6).addChildTo(this.weapons[i]);
            this.weapons[i].level.index = i;
            this.weapons[i].level.update = function() {
                var level = that.player.equip.level[this.index];
                if (level != 0) {
                    this.text = "+"+level;
                } else {
                    this.text = "";
                }
            }
        }.bind(this));
    },

    clear: function() {
    },
});
