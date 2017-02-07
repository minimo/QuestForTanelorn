/*
 *  openingscene.js
 *  2016/08/17
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("qft.OpeningScene", {
    superClass: "phina.display.DisplayScene",

    init: function(currentScene) {
        this.superInit();
        this.currentScene = currentScene;

        this.text = [
            "かつて平和だった世界も今は昔。",
            "モンスターが跳梁跋扈しており、世界の中心に立っている塔も、",
            "以前は自由に登れたはずだが現在は入り口が閉ざされている。",
            "モンスターとの終わりの見えない戦いの中で",
            "人々の生活は次第に荒廃していた。",
            "そんな人々の間でも、希望をもたらす伝説があった。",
            "塔の頂上には素晴らしい楽園が存在するのだという。",
            "いつしか多くの冒険者が、楽園を求めて塔の扉を開き、その謎に挑んでいった。",
            "しかし、それらの冒険者たちがどのような結末をたどったのかを知る者はいない。",
            "そして今、塔へ挑もうとする冒険者がまた新たに1人現れたのだった。",
        ];

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: "rgba(0,0,0,1)",
            stroke: "rgba(0,0,0,1)",
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
        phina.display.Label({text: "This game is a test version."}.$safe(labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.4);
    },

    update: function() {
    },
});

