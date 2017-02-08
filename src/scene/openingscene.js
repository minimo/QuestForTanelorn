/*
 *  openingscene.js
 *  2017/02/08
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.OpeningScene", {
    superClass: "phina.display.DisplayScene",

    init: function(currentScene) {
        this.superInit();
        this.currentScene = currentScene;

        //ＢＧＭ再生
        app.playBGM("openingbgm");

        this.text = [
            "世界の中心にそびえる塔",
            "その塔は、楽園「永遠の都」に通じているという。",
            "噂を聞いた多くの冒険者が",
            "楽園を求めて塔の扉を開き",
            "その謎に挑んでいった",
            "しかし…",
            "彼らが果たして楽園に辿り着いたのか",
            "それとも世界の果てで力尽きたのか",
            "それを知る者はいない",
            "そして今…",
            "新たな冒険者がまた一人",
            "まだ見ぬ楽園への道に挑もうとしていた",
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

        //世界地図
        this.sprite1 = phina.display.Sprite("openingmap")
            .addChildTo(this.imageLayer)
            .setPosition(SC_W * 0.5, -SC_H * 0.3)
            .setScale(0.8);
        this.sprite1.alpha = 0;
        this.sprite1.tweener.clear()
            .by({alpha: 1.0, y: 250}, 7000)
            .by({alpha: -1.0, y: 250}, 7000)
            .call(function(){this.sprite1.remove()}.bind(this));

        //塔外観
        this.sprite2 = phina.display.Sprite("background")
            .addChildTo(this.imageLayer)
            .setPosition(SC_W * 0.5, SC_H * 0.5)
        this.sprite2.alpha = 0;
        this.sprite2.tweener.clear()
            .wait(14000)
            .call(function(){
                this.sprite2.alpha = 1;
                this.fg.alpha = 1;
                this.fg.tweener.clear().fadeOut(7000).fadeIn(7000);
            }.bind(this))
            .wait(14000)
            .call(function(){this.sprite2.remove()}.bind(this));

        this.sprite3 = phina.display.Sprite("openingtower")
            .addChildTo(this.imageLayer)
            .setPosition(SC_W * 0.5, SC_H * 0.3)
        this.sprite3.alpha = 0;
        this.sprite3.tweener.clear()
            .wait(14000)
            .call(function(){
                this.sprite3.alpha = 1;
            }.bind(this))
            .wait(7000)
            .by({y: 300}, 7000)
            .call(function(){this.sprite3.remove()}.bind(this));

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
                if (num > this.text.length) {
                    this.exit();
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
    },
});

