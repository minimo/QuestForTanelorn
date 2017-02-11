/*
 *  openingscene.js
 *  2017/02/08
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.OpeningScene", {
    superClass: "phina.display.DisplayScene",

    //進行
    seq: 0,

    init: function(currentScene) {
        this.superInit({width: SC_W, height: SC_H});
        this.currentScene = currentScene;

        //ＢＧＭ再生
        app.playBGM("openingbgm");

        this.text = [
            "世界の中心にそびえる塔",
            "塔の最上階には",
            "「永遠の都」と呼ばれる楽園があるという",
            "噂を聞いた多くの冒険者が",
            "楽園を求めて塔へと赴き",
            "その謎に挑んでいった",
            "しかし…",
            "彼らが果たして楽園に辿り着いたのか",
            "それとも世界の果てで力尽きたのか",
            "その末路を知る者はいない",
            "そして…",
            "新たな冒険者がまた一人",
            "いまだ見ぬ楽園への道に挑もうとしていた",
        ];

        //バックグラウンド
        var param = {
            width: SC_W,
            height: SC_H,
            fill: "rgba(0,0,0,1)",
            stroke: "rgba(0,0,0,1)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.5)

        //イメージ表示用レイヤ
        this.imageLayer = phina.display.DisplayElement().addChildTo(this);

        //フォアグラウンド
        this.fg = phina.display.RectangleShape(param).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.5)
        this.fg.alpha = 0;

        //上下黒帯
        param.height = SC_H * 0.15;
        this.bg1 = phina.display.RectangleShape(param).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.07)
        this.bg2 = phina.display.RectangleShape(param).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.93)
      
        //字幕
        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 14,
        };
        var num = 0;
        this.textLabel = phina.display.Label({text: ""}.$safe(labelParam)).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.9);
        this.textLabel.alpha = 0;
        this.textLabel.tweener.clear()
            .call(function() {
                this.textLabel.text = this.text[num];
                num++;
                if (num == this.text.length) {
                    this.textLabel.tweener.setLoop(false);
                }
            }.bind(this))
            .fadeIn(500)
            .wait(3000)
            .fadeOut(500)
            .wait(1000)
            .setLoop(true);

        //基本アセットをロード
        var that = this;
        var assets = qft.Assets.get({assetType: "common"});
        this.loader = phina.extension.AssetLoaderEx().load(assets, function(){app.soundset.readAsset();});
        this.loadLabel = phina.display.Label({text: "", align: "right", fontSize: 12}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.99, SC_H*0.1);
        this.loadLabel.time = 1;    
        this.loadLabel.update = function() {
            this.text = "Loading... "+Math.floor(that.loader.loadprogress * 100)+"%";
            if (that.loader.loadcomplete) {
                this.text = "Push button to skip.";
                this.visible = true;
            } else {
                if (this.time % 20 == 0) this.visible = !this.visible;
            }
            this.time++;
        };
    },

    update: function() {
        if (this.loader.loadcomplete) {
            var ct = app.controller;
            if (ct.ok || ct.cancel) this.exit();
        }

        if (this.seq == 0) {
            this.worldmap();
            this.seq++;
        }
        if (this.seq == 2) {
            this.towerimage();
            this.seq++;
        }
        if (this.seq == 4) {
            this.sequence3();
            this.seq++;
        }
        if (this.seq == 6) {
            this.playerimage();
            this.seq++;
        }
        if (this.seq == 8) {
            this.exit();
        }
    },

    //世界地図
    worldmap: function() {
        var sprite1 = phina.display.Sprite("openingmap").addChildTo(this.imageLayer).setPosition(SC_W * 0.5, -SC_H * 0.3).setScale(0.8);
        sprite1.alpha = 0;
        sprite1.tweener.clear()
            .by({alpha: 1.0, y: 250}, 7000)
            .by({alpha: -1.0, y: 250}, 7000)
            .call(function(){
                sprite1.remove();
                this.seq++;
            }.bind(this));
    },

    //塔外観
    towerimage: function() {
        var sprite1 = phina.display.Sprite("background").addChildTo(this.imageLayer).setPosition(SC_W * 0.5, SC_H * 0.5);
        sprite1.alpha = 0;
        sprite1.tweener.clear()
            .call(function(){
                sprite1.alpha = 1;
                this.fg.alpha = 1;
                this.fg.tweener.clear().fadeOut(7000).fadeIn(7000);
            }.bind(this))
            .wait(14000)
            .call(function(){
                sprite1.remove();
                this.seq++;
            }.bind(this));

        var sprite2 = phina.display.Sprite("openingtower").addChildTo(this.imageLayer).setPosition(SC_W * 0.5, SC_H * 0.3);
        sprite2.alpha = 0;
        sprite2.tweener.clear()
            .call(function(){
                sprite2.alpha = 1;
            }.bind(this))
            .by({x: -100}, 4000, "easeInOutSine")
            .wait(3000)
            .by({y: 300}, 7000, "easeInSine")
            .call(function(){
                sprite2.remove();
            }.bind(this));
    },

    //三番目表示（暫定）
    sequence3: function() {
        var sprite1 = phina.display.Sprite("openingback2").addChildTo(this.imageLayer).setPosition(SC_W * 0.5, SC_H * 0.3);
        sprite1.alpha = 0;
        sprite1.tweener.clear()
            .call(function(){
                sprite1.alpha = 1;
                this.fg.alpha = 1;
                this.fg.tweener.clear().fadeOut(7000).wait(10000).fadeIn(7000);
            }.bind(this))
            .by({y: 150}, 12000, "easeInOutSine")
            .wait(12000)
            .call(function(){
                sprite1.remove();
                this.seq++;
            }.bind(this));

        var sprite2 = phina.display.Sprite("openinglight").addChildTo(this.imageLayer).setPosition(SC_W * 0.5, SC_H * 0.5);
        sprite2.blendMode = 'lighter';
        sprite2.alpha = 0.3;
        sprite2.tweener.clear()
            .wait(12000)
            .by({x: -50}, 12000, "easeInOutSine");
    },

    //プレイヤー表示
    playerimage: function() {
        var sprite1 = phina.display.Sprite("openingback").addChildTo(this.imageLayer).setPosition(SC_W * 0.5, SC_H * 0.35);
        sprite1.alpha = 0;
        sprite1.tweener.clear()
            .call(function(){
                sprite1.alpha = 1;
                this.fg.alpha = 1;
                this.fg.tweener.clear().fadeOut(7000).wait(5000).fadeIn(7000);
            }.bind(this))
            .wait(15000)
            .by({y: 150}, 5000, "easeInOutSine")
            .call(function(){
                sprite1.remove();
                this.seq++;
            }.bind(this));

        var sprite2 = phina.display.Sprite("openingground").addChildTo(this.imageLayer).setPosition(SC_W * 0.5, SC_H * 0.9);
        sprite2.tweener.clear()
            .by({y: -50}, 4000, "easeInOutSine")
            .wait(10000)
            .by({y: 200}, 5000, "easeInOutSine")

        var pl = qft.PlayerDummy("player1").addChildTo(sprite2).setPosition(0, 38);
        pl.setAnimation("up");
        pl.tweener.clear()
            .wait(3000)
            .by({y: -76}, 5000, "easeInOutSine")
            .call(function() {
                pl.setAnimation("up_stop");
            })
            .wait(6000)
            .call(function() {
                pl.setAnimation("down");
            })
            .by({y: 76}, 5000, "easeInOutSine");
    },
});

