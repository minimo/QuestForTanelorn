/*
 *  enemy.js
 *  2016/12/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

//敵キャラクタ基本クラス
phina.define("qft.Enemy", {
    superClass: "qft.Character",

    //ヒットポイント
    hp: 1,

    //防御力
    deffence: 1,

    //攻撃力
    power: 1,

    //視力
    eyesight: 64,

    //視野角
    viewAngle: 90,

    //進行方向（0:右 180:左）
    direction: 0,

    init: function(options, parentScene) {
        this.superInit(options, parentScene);
        this.setupAnimation();

        this.on('enterframe', function() {
            var pl = this.parentScene.player;
            //プレイヤー攻撃との当たり判定
            if (pl.attack && this.hitTestElement(pl.attackCollision)) {
                this.damage(pl);
            }

            //プレイヤーとの当たり判定
            if (!this.isDead && this.hitTestElement(pl)) {
                pl.damage(this);
            }
        });
    },

    damage: function(target) {
        if (this.mutekiTime > 0) return false;
        var dir = 0;
        if (this.x < target.x) dir = 180;

        var pow = Math.floor(target.power / this.deffence);
        this.knockback(pow, dir);
        this.mutekiTime = 10;
        this.hp -= pow;
        if (this.hp < 0) {
            this.hp = 0;
            this.dead();
        }
        app.playSE("hit");
        return true;
    },

    dead: function() {
        this.remove();
        return;
    },

    //プレイヤーが見える位置にいるのか判定
    isLookPlayer: function() {
        //視力外の場合は見えない
        if (this.getDistancePlayer() > this.eyesight) return false;

        //視野角外の場合は見えない
        //TODO

        var result = true;
        var that = this;
        var player = this.parentScene.player;
        this.parentScene.collisionLayer.children.forEach(function(e) {
            //自分とプレイヤー間に地形当り判定がある場合見えない
            if (phina.geom.Collision.testLineRect(that, player, e)) result = false;
        });
        return result;
    },

    //プレイヤーからの直線距離
    getDistancePlayer: function() {
        var x = this.x-this.parentScene.player.x;
        var y = this.y-this.parentScene.player.y;
        return Math.sqrt(x*x+y*y);
    },

    //自分とプレイヤーを結ぶ直線の角度
    getPlayerAngle: function() {
        var p1 = phina.geom.Vector2(this.x, this.y);
        var p2 = phina.geom.Vector2(this.parentScene.player.x, this.parentScene.player.y);
        var p = p2.sub(p1);
        return p.toDegree();
    },
});
