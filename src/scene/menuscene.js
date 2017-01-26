/*
 *  pausescene.js
 *  2016/08/17
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.MenuScene", {
    superClass: "phina.display.DisplayScene",

    init: function(currentScene) {
        this.superInit();

        this.currentScene = currentScene;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: "rgba(0,0,0,0.5)",
            stroke: "rgba(0,0,0,0.5)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 24,
            fontWeight: ''
        };

        this.player = this.currentScene.player;
        var x = this.player.x + this.currentScene.mapLayer.x;
        var y = this.player.y + this.currentScene.mapLayer.y;

        var that = this;

        //ベースエレメント
        this.menuBase = phina.display.DisplayElement().addChildTo(this).setPosition(x, y);
        this.menuBase.tweener.setUpdateType('fps');

        //選択中アイテムＩＤ
        this.select = 0;

        //メニューアイテム
        this.icon = [];
        this.menuItems = this.player.items.clone();

        var rad = 0;
        var rad_1 = (Math.PI*2) / this.menuItems.length;
        var id = 0;
        this.menuItems.forEach(function(e) {
            var ic;
            if (typeof e === 'string') {
                ic = phina.display.Label({text: e}.$safe(labelParam)).addChildTo(this.menuBase);
                ic.setScale(0.5);
            } else {
                ic = phina.display.Sprite("item", 20, 20)
                    .addChildTo(this.menuBase)
                    .setFrameIndex(e);
            }
            ic.rad = rad;
            ic.id = id;
            ic.distance = 0;
            ic.update = function() {
                this.rotation = -that.menuBase.rotation;
                this.x =  Math.sin(this.rad)*this.distance;
                this.y = -Math.cos(this.rad)*this.distance;
                if (this.id == that.select) {
                    ic.tweener.clear().to({distance: 72, scaleX: 3, scaleY: 3}, 100);
                } else {
                    ic.tweener.clear().to({distance: 48, scaleX: 1, scaleY: 1}, 100);
                }
            }
            ic.tweener.clear().to({distance: 48}, 500);
            this.icon.push(ic);
            rad += rad_1;
            id++;
        }.bind(this));
        this.menuBase.tweener.to({rotation: 360}, 30, "easeOutSine");

        this.deg_1 = 360/ this.menuItems.length;

        this.limitFrame = 30;

        this.isExit = false;
        this.time = 0;        
    },

    update: function() {
        var ct = app.controller;
        if (this.time > 30 && !this.isExit) {
            if (ct.start || ct.pause) {
                this.tweener.clear()
                    .wait(100)
                    .call(function() {
                        app.popScene();
                    });
            }
        }
        if (ct.left && this.limitFrame < 0) {
            this.menuBase.tweener.clear()
                .by({rotation: -this.deg_1}, 8)
                .call(function(){
                    if (this.rotation < 0) this.rotation += 360;
                }.bind(this.menuBase));
            this.limitFrame = 10;
            this.select++;
            if (this.select == this.icon.length) this.select = 0;
        }
        if (ct.right && this.limitFrame < 0) {
            this.menuBase.tweener.clear()
                .by({rotation: this.deg_1}, 8)
                .call(function(){
                    if (this.rotation > 360) this.rotation -= 360;
                }.bind(this.menuBase));
            this.limitFrame = 10;
            this.select--;
            if (this.select < 0) this.select = this.icon.length-1;
        }
        this.limitFrame--;
        this.time++;
    },
});

