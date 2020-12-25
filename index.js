var parseFlowchart = (d) => {
    var l = d.split("\n");
    //console.log(l);
    var getVariableString = (v) => {
        var regex = new RegExp(`public const ${v}:String = "(.+?)";`);
        if (!regex) return;
        var line = l.find((t) => regex.test(t));
        var match = line.match(regex);
        return match ? match[1] : null;
    };
    var media = getVariableString("media");
    var dict = getVariableString("dict");
    var mediaMatches = media.match(/\|([0-9]+)\|([0-9]+)\|([0-9]+)\|M,([0-9.]+)/g);
    if (!mediaMatches) throw new Error("no media matches");
    var dictSplit = dict.split("^");
    var categoryRegex = /\[category=(.+?)\]/g;
    var filterByProp = false;
    var filterOR = true;
    var mediaMatchesParsed = mediaMatches.map((m) => {
        var s = m.split("|");
        var index = s[3];
        var dictRaw = dictSplit[s[3]];
        var dict = dictRaw.replace(/\\n/g, " ").replace(/\\t/g, "\t").replace(/\\/g, "").trim();
        var dictClean = dict.replace(categoryRegex, "").trim();
        var r = { audio: s[1], index, dict, dictClean, duration: parseFloat(m.split(",")[1]), dictRaw };
        var categoryMatch = dict.match(categoryRegex);
        if (categoryMatch) r.category = categoryMatch[0].replace(categoryRegex, "$1");
        return r;
    });
    //console.log(mediaMatchesParsed);
    if (filterByProp) mediaMatchesParsed = mediaMatchesParsed.filter((m) => {
        return Object.entries(filterByProp)[filterOR ? "some" : "every"]((e) => m[e[0]] && m[e[0]].toLowerCase().includes(e[1].toLowerCase()));
    });
    return mediaMatchesParsed;
};


var loading = () => Swal.fire({
    title: "Loading\u2026",
    icon: "info",
    showConfirmButton: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    allowOutsideClick: false
});
loading();


var gameNames = {
    AuctionBundle: "Bidiots",
    DrawfulBundle: "Drawful",
    PatentlyStupidBundle: "Patently Stupid",
    JackboxTalksBundle: "Talking Points",
    RapBattleBundle: "Mad Verse City",
    JokeboatBundle: "Joke Boat",
    MonsterMingleBundle: "Monster Seeking Monster",
    Quiplash: "Quiplash",
    FakinItBundle: "Fakin\u2019 It",
    AwShirtBundle: "Tee K.O.",
    WorldChampionsBundle: "Champ\u2019d Up",
    YDKJ2018Bundle: "YDKJ: Full Stream",
    TriviaDeathBundle: "Trivia Murder Party",
    QuiplashBundle: "Quiplash XL",
    Quiplash2Bundle: "Quiplash 2",
    RidictionaryBundle: "Dictionarium",
    BracketeeringBundle: "Bracketeering",
    Fibbage2Bundle: "Fibbage 2",
    EverydayBundle: "The Devils and the Details",
    SplitTheRoomBundle: "Split The Room",
    Quiplash2InterLASHional: "Quiplash 2 InterLASHional",
    SurviveTheInternetBundle: "Survive The Internet",
    BombInternsBundle: "Bomb Corp.",
    EarwaxBundle: "Earwax",
    PollPositionBundle: "Guesspionage",
    OverdrawnBundle: "Civic Doodle",
    Drawful2: "Drawful 2",
    TriviaDeath2Bundle: "Trivia Murder Party 2",
    YDKJ2015Bundle: "YDKJ 2015",
    Quiplash3Bundle: "Quiplash 3",
    FibbageXL: "Fibbage XL (standalone)",
    BlankyBlankBundle: "Blather \u2018Round",
    PushTheButtonBundle: "Push The Button",
    Fibbage3Bundle: "Fibbage 3",
    SlingShootBundle: "Zeeple Dome",
    RoleModelsBundle: "Role Models",
    FibbageBundle: "Fibbage XL"
};
var packs = [
    {
        pack: 0,
        games: ["YDKJ2015Bundle", "DrawfulBundle", "FibbageBundle"] //YDKJ 2015, Drawful, Fibbage XL (Word Spud and Lie Swatter don't have Talkshow)
    },
    {
        pack: 1,
        games: ["QuiplashBundle", "AuctionBundle", "Fibbage2Bundle", "EarwaxBundle", "BombInternsBundle"] //Quiplash XL, Bidiots, Fibbage 2, Earwax, Bomb Corp.
    },
    {
        pack: 2,
        games: ["PollPositionBundle", "AwShirtBundle", "TriviaDeathBundle", "Quiplash2Bundle", "FakinItBundle"] //Guesspionage, Tee K.O., TMP, Quiplash 2, Fakin' It
    },
    {
        pack: 3,
        games: ["Fibbage3Bundle", "MonsterMingleBundle", "OverdrawnBundle", "BracketeeringBundle", "SurviveTheInternetBundle"] //Fibbage 3, MSM, Civic Doodle, Bracketeering, STI
    },
    {
        pack: 4,
        games: ["YDKJ2018Bundle", "PatentlyStupidBundle", "SplitTheRoomBundle", "RapBattleBundle", "SlingShootBundle"] //YDKJ: FS, Patently Stupid, STR, MVC, Zeeple Dome
    },
    {
        pack: 5,
        games: ["TriviaDeath2Bundle", "RidictionaryBundle", "JokeboatBundle", "PushTheButtonBundle", "RoleModelsBundle"] //TMP2, Dictionarium, Joke Boat, PTB, Role Models
    },
    {
        pack: 6,
        games: ["JackboxTalksBundle", "Quiplash3Bundle", "WorldChampionsBundle", "EverydayBundle", "BlankyBlankBundle"] //Talking Points, Quiplash 3, Champ'd Up, DATD, Blather Round
    },
    {
        pack: -1, //standalones
        games: ["Drawful2", "FibbageXL", "Quiplash", "Quiplash2InterLASHional"] //Drawful 2, Fibbage XL standalone, Quiplash, Quiplash 2 Int.
    }
];
var allGamesOrdered = [].concat(...packs.map((d) => d.games));
var gw = $("<div/>").appendTo(".wrapper");
$.getJSON("talkshow/talkshow.json", (d) => {
    Swal.close();
    d.sort((a, b) => allGamesOrdered.indexOf(a.id) - allGamesOrdered.indexOf(b.id));
    var cp = 0;
    var cpc = 0;
    d.forEach((g) => {
        if (!cpc) {
            var n = packs[cp].pack + 1;
            $("<div/>").addClass("game-selector-pack-break").html(n ? "Party Pack ".concat(n) : "Standalones").appendTo(gw);
        }
        $("<button/>").addClass("game-selector-button").html(gameNames[g.id]).appendTo(gw).on("click", () => {
            showGame(g);
        });
        if (++cpc == packs[cp].games.length) {
            cpc = 0;
            cp++;
        }
    });
});

var stt = $(".scrolltotop").hide().on("click", () => window.scrollTo(0, 0));
$(window).on("scroll", () => {
    stt[window.scrollY > 100 ? "show" : "hide"]();
});

var showGame = (g) => {
    gw.hide();
    var media = parseFlowchart(g.flowchart);
    console.log(media);
    var w = $("<div/>").appendTo(".wrapper");
    $("<button/>").addClass("game-selector-button").html("Back").appendTo(w).on("click", () => {
        if (cp) cp.stop();
        w.remove();
        gw.show();
    });
    $("<div/>").addClass("media-title").html(gameNames[g.id]).appendTo(w);
    var cp = null;
    media.forEach((m) => {
        var h = null;
        var p = false;
        var oc = () => {
            p = !p;
            var ci = (t) => {
                b.removeClass("play").removeClass("pause").addClass(t ? "pause" : "play");
                e[t ? "addClass" : "removeClass"]("playing");
            }
            if (p) {
                if (cp) cp.stop();
                if (!h) {
                    loading();
                    h = new Howl({
                        src: ["talkshow/".concat(g.id, "/", m.audio, ".ogg")],
                        autoplay: true,
                        volume: 1,
                        onload: () => {
                            Swal.close();
                        },
                        onplay: () => {
                            ci(true);
                            p = true;
                        },
                        onend: () => {
                            ci(false);
                            p = false;
                        },
                        onstop: () => {
                            ci(false);
                            p = false;
                        }
                    });
                } else h.play();
                cp = h;
            } else h.stop();
        };
        var e = $("<div/>").addClass("media-row").appendTo(w).on("click", () => oc()).on("contextmenu", (e) => {
            e.preventDefault();
            //console.log("<a href='talkshow/".concat(g.id, "/", m.audio, ".ogg' target='_blank'>talkshow/", g.id, "/", m.audio, ".ogg</a>"));
            var q = {
                "Audio path": { t: "<a href='talkshow/".concat(g.id, "/", m.audio, ".ogg' target='_blank'>talkshow/", g.id, "/", m.audio, ".ogg</a>") },
                "Audio ID": m.audio,
                "Dict index": m.index,
                "Talkshow duration": "".concat(m.duration, "s"),
                "Raw dict string": m.dictRaw,
                "Category": m.category
            };
            Swal.fire({
                title: "Information",
                html: "<span style='text-align: left; display: inline-block;'>".concat(Object.entries(q).map((y) => "<strong>".concat(y[0], ":</strong> ", y[1] ? y[1].t || y[1].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "none")).join("<br/>"), "</span>")
            });
        });
        var b = $("<button/>").addClass("media-button play").appendTo(e);
        $("<div/>").addClass("media-text").text(m.dictClean).appendTo(e);
    });
    window.scrollTo(0, 0);
};