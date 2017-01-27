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
            ic.isClose = false;
            ic.update = function() {
                this.rotation = -that.menuBase.rotation;
                this.x =  Math.sin(this.rad)*this.distance;
                this.y = -Math.cos(this.rad)*this.distance;
                if (this.isClose) return;
                if (this.id == that.currentScene.menuSelect) {
                    this.tweener.clear().to({distance: 100, scaleX: 3, scaleY: 3}, 100);
                } else {
                    this.tweener.clear().to({distance: 72, scaleX: 1, scaleY: 1}, 100);
                }
            }
            ic.close = function() {
                this.tweener.clear().to({distance: 0, scaleX: 1, scaleY: 1}, 100);
                this.isClose = true;
            }
            ic.tweener.clear().to({distance: 48}, 500);
            this.icon.push(ic);
            rad += rad_1;
            id++;
        }.bind(this));

        this.deg_1 = 360/ this.menuItems.length;
        this.menuBase.rotation = -(this.currentScene.menuSelect * this.deg_1) - 90;
        this.menuBase.tweener.by({rotation: 90}, 15, "easeOutSine");

        this.limitFrame = 30;

        this.isExit = false;
        this.time = 0;        
    },

    update: function() {
        var ct = app.controller;
        if (this.time > 10 && !this.isExit) {
            if (ct.start || ct.pause || ct.menu) {
                this.isExit = true;
                this.close();
                this.tweener.clear()
                    .wait(100)
                    .call(function() {
                        app.popScene();
                    });
            }
        }
        if (ct.right && this.limitFrame < 0) {
            this.menuBase.tweener.clear()
                .by({rotation: -this.deg_1}, 8)
                .call(function(){
                    if (this.rotation < 0) this.rotation += 360;
                }.bind(this.menuBase));
            this.limitFrame = 10;
            this.currentScene.menuSelect++;
            if (this.currentScene.menuSelect == this.icon.length) this.currentScene.menuSelect = 0;
        }
        if (ct.left && this.limitFrame < 0) {
            this.menuBase.tweener.clear()
                .by({rotation: this.deg_1}, 8)
                .call(function(){
                    if (this.rotation > 360) this.rotation -= 360;
                }.bind(this.menuBase));
            this.limitFrame = 10;
            this.currentScene.menuSelect--;
            if (this.currentScene.menuSelect < 0) this.currentScene.menuSelect = this.icon.length-1;
        }
        this.limitFrame--;
        this.time++;
    },

    setItems: function() {
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
            ic.isClose = false;
            ic.update = function() {
                this.rotation = -that.menuBase.rotation;
                this.x =  Math.sin(this.rad)*this.distance;
                this.y = -Math.cos(this.rad)*this.distance;
                if (this.isClose) return;
                if (this.id == that.currentScene.menuSelect) {
                    this.tweener.clear().to({distance: 100, scaleX: 3, scaleY: 3}, 100);
                } else {
                    this.tweener.clear().to({distance: 72, scaleX: 1, scaleY: 1}, 100);
                }
            }
            ic.close = function() {
                this.tweener.clear().to({distance: 0, scaleX: 1, scaleY: 1}, 100);
                this.isClose = true;
            }
            ic.tweener.clear().to({distance: 48}, 500);
            this.icon.push(ic);
            rad += rad_1;
            id++;
        }.bind(this));

        this.deg_1 = 360/ this.menuItems.length;
    },

    close: function() {
        this.menuBase.tweener.clear().by({rotation: 180}, 15, "easeOutSine");
        this.icon.forEach(function(e) {
            e.close();
        }.bind(this));
    },
});

