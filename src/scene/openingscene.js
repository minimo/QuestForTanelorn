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

        this.text = [
            "世界の中心にそびえる塔",
            "その塔は、楽園「永遠の都」に通じているという。",
            "いつしか多くの冒険者が",
            "楽園を求めて塔の扉を開き",
            "その謎に挑んでいった",
            "しかし…",
            "彼らがどのような結末を辿ったのか",
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
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)

        //イメージ表示用レイヤ
        this.imageLayer = phina.display.DisplayElement().addChildTo(this);

        this.sprite = phina.display.Sprite("openingmap", 1024, 768)
            .addChildTo(this)
            .setPosition(SC_W * 0.5, -SC_H * 0.3)
            .setScale(0.8);
        this.sprite.alpha = 0;
        this.sprite.tweener.clear()
            .by({alpha: 1.0, y: 250}, 8000)
            .by({alpha: -1.0, y: 250}, 8000);

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
            fontSize: 10,
            fontWeight: ''
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
    },

    update: function() {
    },
});

