#target aftereffects

/*
 * NANDAROU MG Factory / Design System v2
 * 対象: C01 / C13 / C25
 * 目的: 汎用テンプレート感を排し、低彩度・紙・墨・金茶・朱の
 *       「編集的な分解図」として番組の完成ルックを確定する。
 */
(function () {
    var PAYLOAD = {"project":{"episode":"EP01","title":"『なんだろう』解体","width":1920,"height":1080,"fps":23.976,"fps_numerator":24000,"fps_denominator":1001,"duration_seconds":585.0},"cuts":[{"cut":"C01","part":"P0","tc_in":"00:00:00.000","tc_out":"00:00:10.000","in_seconds":0.0,"out_seconds":10.0,"in_frame":0,"out_frame":240,"duration_frames":240,"category":"MGテンプレート","template_id":"AE_CARD_STACK_THUMBNAIL","visual":"黒背景に煽りサムネ(自作再現・3枚)が通知音と同時に次々スタック。1枚ごとに画面が埋まっていく","automation":"3枚のサムネ画像を読み込み、通知音に合わせて順次スタック。各カードの出現遅延、105→100%スケール、最終微ズームを自動設定。","required_inputs":"サムネ画像3枚、表示順、出現間隔、背景色、最終ズーム量","support":"Canvaで架空サムネの静止画を一括作成。Claude/Codexは画像リストをAEへ流し込むJSX生成。VHSノイズはEnvato部品。","manual_check":"サムネ文言の可読性と煽りの強さだけ確認。実在チャンネル・ロゴが混入していないことを確認。","source_search":"—","ai_prompt":"—","effect_notes":"サムネにVHS風ノイズ薄く=「VHS overlay texture」","transition_notes":"カット尻で全サムネ微ズーム寄り→C02へハードカット","motion_notes":"1枚ごとにスケール105→100%のドン付き出現 [maxchar:10]","params":{"fictional":true,"card_size":[1040,360],"pop_frames":8,"final_zoom":104,"final_zoom_start":180,"cards":[{"eyebrow":"速報","headline":"日本、終わる","accent":"#B8352E","x":0.37,"y":0.34,"rotation":-3,"delay":0},{"eyebrow":"知らないと危険","headline":"年金、消える","accent":"#C9A063","x":0.63,"y":0.5,"rotation":2,"delay":18},{"eyebrow":"損する前に","headline":"知らないと、損する","accent":"#EAE6DF","x":0.49,"y":0.67,"rotation":-1,"delay":36}]}},{"cut":"C13","part":"P1","tc_in":"00:01:31.000","tc_out":"00:01:44.000","in_seconds":91.0,"out_seconds":104.0,"in_frame":2182,"out_frame":2494,"duration_frames":312,"category":"MG自動生成","template_id":"DATA_FLOW_THREE_STEP","visual":"再生回数カウンターが回る→数字が¥グラフへ変換されるフロー図の自作MG(視線→再生→広告費の3段変換)","automation":"3段のノード、矢印、アイコン、数値をJSONから生成し、視線→再生→広告費を順番に開示。","required_inputs":"ノード名3件、補足値、アイコンID、強調ノード、表示順","support":"Claude/CodexでSVGアイコンとJSXを生成。共通アイコンは番組ライブラリへ保存。","manual_check":"因果関係を断定しすぎない文言か確認。","source_search":"—","ai_prompt":"—","effect_notes":"フロー矢印にライトスウィープ=「light sweep overlay」","transition_notes":"¥グラフが編集タイムラインのUIへ変形→C14","motion_notes":"★文:中央。「注意」のみ金茶+鍵括弧を1.2倍","params":{"title":"注意がお金に変わるまで","conceptual":true,"nodes":[{"icon":"◉","label":"視線","sub":"ATTENTION"},{"icon":"▶","label":"再生","sub":"VIEW"},{"icon":"¥","label":"広告費","sub":"REVENUE"}],"reveal_frames":[8,38,68],"statement":"売られているのは、あなたの『注意』です。","statement_frame":104}},{"cut":"C25","part":"P2","tc_in":"00:03:47.000","tc_out":"00:03:54.000","in_seconds":227.0,"out_seconds":234.0,"in_frame":5443,"out_frame":5610,"duration_frames":167,"category":"MG自動生成","template_id":"DATA_REPLACE_ARROW_DIAGRAM","visual":"白地に図解MG:「商品」→打ち消し→「なれる自分」への矢印(ミニマルな線画)","automation":"左語句を打ち消し、右語句へ矢印が伸びるミニマル図解を文字列からShape Layerとして生成。","required_inputs":"左語句、右語句、打消し方式、矢印方向、アクセント色","support":"Claude/CodexがJSX／SVGを生成。紙質感は番組AEマスター。","manual_check":"左右の意味関係と改行だけ確認。","source_search":"—","ai_prompt":"—","effect_notes":"紙テクスチャ=「paper texture overlay」","transition_notes":"図解の矢印がスマホのフィードUIへ変形→C26(現在往復)","motion_notes":"★文:図解と同期して中央下、フェード [pos:bottom]","params":{"kicker":"売っているもの","left":"商品そのもの","right":"なれる自分","strike_frame":28,"arrow_frame":48,"reveal_frame":70,"statement":"『それを買うと、どんな自分になれるか』を売る。"}}]};
    var PROJECT = PAYLOAD.project;
    var FPS = PROJECT.fps_numerator && PROJECT.fps_denominator ? PROJECT.fps_numerator / PROJECT.fps_denominator : PROJECT.fps;
    var FD = 1 / FPS;
    var ROOT_NAME = "NANDAROU_MG_FACTORY_" + PROJECT.episode + "_DESIGN_V2";
    var BUILDING_NAME = ROOT_NAME + "_BUILDING";
    var SIGNATURE = "NMF|owner=" + PROJECT.episode + "|design=v2";
    var warnings = [];
    var created = [];
    var placed = 0;

    // 全テンプレートで共有する番組パレット。金茶は「重要な接続」だけに使う。
    var C = {
        ink: [0.055, 0.059, 0.064],
        ink2: [0.09, 0.095, 0.10],
        paper: [0.89, 0.87, 0.82],
        paper2: [0.82, 0.79, 0.73],
        gold: [0.74, 0.56, 0.29],
        red: [0.64, 0.10, 0.10],
        ash: [0.43, 0.44, 0.42],
        white: [0.94, 0.93, 0.90]
    };
    var F = {
        bold: ["SourceHanSans-Bold", "NotoSansCJKjp-Medium"],
        regular: ["NotoSansCJKjp-Medium", "ShipporiMincho-Regular"],
        number: ["Oswald-Regular", "SourceHanSans-Bold"]
    };

    function logWarning(message) {
        warnings.push(message);
        $.writeln("[NMF DESIGN V2] " + message);
    }

    function t(frame) { return frame / FPS; }
    function safeTime(value, duration) { return Math.max(0, Math.min(value, Math.max(0, duration - FD))); }

    function fontExists(name) {
        try { return app.fonts && app.fonts.getFontsByPostScriptName(name).length > 0; }
        catch (error) { return false; }
    }

    function chooseFont(candidates, fallback, label) {
        var i;
        for (i = 0; i < candidates.length; i++) if (fontExists(candidates[i])) return candidates[i];
        logWarning(label + ": 指定フォントがないため既定フォントを使用");
        return fallback;
    }

    function makeComp(parent, name, duration, role) {
        var comp = app.project.items.addComp(name, PROJECT.width, PROJECT.height, 1, Math.max(FD, duration), FPS);
        comp.parentFolder = parent;
        comp.comment = SIGNATURE + "|" + role;
        comp.displayStartTime = 0;
        comp.workAreaStart = 0;
        comp.workAreaDuration = comp.duration;
        return comp;
    }

    function folder(parent, name) {
        var item = app.project.items.addFolder(name);
        item.parentFolder = parent;
        item.comment = SIGNATURE;
        return item;
    }

    function addSolid(comp, name, color, width, height, position, duration) {
        var layer = comp.layers.addSolid(color, name, Math.max(4, Math.round(width)), Math.max(4, Math.round(height)), 1, duration || comp.duration);
        layer.name = name;
        layer.comment = SIGNATURE;
        layer.property("ADBE Transform Group").property("ADBE Position").setValue(position);
        return layer;
    }

    function setText(layer, value, size, color, fonts, tracking, justification) {
        var prop = layer.property("ADBE Text Properties").property("ADBE Text Document");
        var doc = prop.value;
        doc.resetCharStyle();
        doc.resetParagraphStyle();
        doc.text = value;
        doc.font = chooseFont(fonts || F.regular, doc.font, layer.name);
        doc.fontSize = size;
        doc.fillColor = color;
        doc.applyFill = true;
        doc.applyStroke = false;
        doc.tracking = tracking || 0;
        doc.justification = justification || ParagraphJustification.LEFT_JUSTIFY;
        prop.setValue(doc);
        return prop;
    }

    // AEのparagraph textはコンポ／ネスト状態でAnchorの扱いが不安定になる。
    // Design v2では短文をpoint textとして置き、実測幅に応じて縮小する。
    // これにより、文字切れと意図しないbox中心基準を根本から避ける。
    function boxText(comp, name, value, box, size, color, position, fonts, tracking, leading, justification) {
        var layer = comp.layers.addText(value);
        layer.name = name;
        layer.comment = SIGNATURE;
        var prop = setText(layer, value, size, color, fonts, tracking, justification);
        var doc = prop.value;
        doc.leading = leading || Math.round(size * 1.25);
        doc.autoLeading = false;
        prop.setValue(doc);
        try {
            var measured = layer.sourceRectAtTime(0, false);
            if (measured.width > box[0]) {
                doc = prop.value;
                doc.fontSize = Math.max(18, Math.floor(size * box[0] / measured.width));
                prop.setValue(doc);
            }
        } catch (measureError) { logWarning(name + ": text measure失敗"); }
        var tr = layer.property("ADBE Transform Group");
        if (justification === ParagraphJustification.CENTER_JUSTIFY) {
            tr.property("ADBE Anchor Point").expression = "r=sourceRectAtTime(time,false);[r.left+r.width/2,r.top]";
            tr.property("ADBE Position").setValue([position[0] + box[0] / 2, position[1]]);
        } else {
            tr.property("ADBE Anchor Point").expression = "r=sourceRectAtTime(time,false);[r.left,r.top]";
            tr.property("ADBE Position").setValue(position);
        }
        return layer;
    }

    function pointText(comp, name, value, size, color, position, fonts, tracking) {
        var layer = comp.layers.addText(value);
        layer.name = name;
        layer.comment = SIGNATURE;
        setText(layer, value, size, color, fonts, tracking, ParagraphJustification.CENTER_JUSTIFY);
        var tr = layer.property("ADBE Transform Group");
        tr.property("ADBE Anchor Point").expression = "r=sourceRectAtTime(time,false);[r.left+r.width/2,r.top+r.height/2]";
        tr.property("ADBE Position").setValue(position);
        return layer;
    }

    function rect(comp, name, size, position, color, roundness, duration, opacity) {
        var layer = comp.layers.addShape();
        layer.name = name;
        layer.comment = SIGNATURE;
        var group = layer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        var vectors = group.property("ADBE Vectors Group");
        var shape = vectors.addProperty("ADBE Vector Shape - Rect");
        shape.property("ADBE Vector Rect Size").setValue(size);
        shape.property("ADBE Vector Rect Roundness").setValue(roundness || 0);
        var fill = vectors.addProperty("ADBE Vector Graphic - Fill");
        fill.property("ADBE Vector Fill Color").setValue(color);
        layer.property("ADBE Transform Group").property("ADBE Position").setValue(position);
        if (opacity !== undefined) layer.property("ADBE Transform Group").property("ADBE Opacity").setValue(opacity);
        layer.outPoint = duration || comp.duration;
        return layer;
    }

    function circle(comp, name, diameter, position, fillColor, strokeColor, strokeWidth, duration) {
        var layer = comp.layers.addShape();
        layer.name = name;
        layer.comment = SIGNATURE;
        var group = layer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        var vectors = group.property("ADBE Vectors Group");
        var shape = vectors.addProperty("ADBE Vector Shape - Ellipse");
        shape.property("ADBE Vector Ellipse Size").setValue([diameter, diameter]);
        if (fillColor) {
            var fill = vectors.addProperty("ADBE Vector Graphic - Fill");
            fill.property("ADBE Vector Fill Color").setValue(fillColor);
        }
        if (strokeColor) {
            var stroke = vectors.addProperty("ADBE Vector Graphic - Stroke");
            stroke.property("ADBE Vector Stroke Color").setValue(strokeColor);
            stroke.property("ADBE Vector Stroke Width").setValue(strokeWidth || 2);
        }
        layer.property("ADBE Transform Group").property("ADBE Position").setValue(position);
        layer.outPoint = duration || comp.duration;
        return layer;
    }

    function line(comp, name, vertices, color, width, startFrame, endFrame, duration) {
        var layer = comp.layers.addShape();
        layer.name = name;
        layer.comment = SIGNATURE;
        var group = layer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        var vectors = group.property("ADBE Vectors Group");
        var path = vectors.addProperty("ADBE Vector Shape - Group").property("ADBE Vector Shape");
        var shape = new Shape(), i, tangents = [];
        for (i = 0; i < vertices.length; i++) tangents.push([0, 0]);
        shape.vertices = vertices;
        shape.inTangents = tangents;
        shape.outTangents = tangents;
        shape.closed = false;
        path.setValue(shape);
        var stroke = vectors.addProperty("ADBE Vector Graphic - Stroke");
        stroke.property("ADBE Vector Stroke Color").setValue(color);
        stroke.property("ADBE Vector Stroke Width").setValue(width || 3);
        try { stroke.property("ADBE Vector Stroke Line Cap").setValue(2); } catch (error) {}
        var trim = vectors.addProperty("ADBE Vector Filter - Trim");
        var end = trim.property("ADBE Vector Trim End");
        end.setValueAtTime(safeTime(t(startFrame || 0), duration), 0);
        end.setValueAtTime(safeTime(t(endFrame || 1), duration), 100);
        layer.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([0, 0]);
        layer.property("ADBE Transform Group").property("ADBE Position").setValue([0, 0]);
        return layer;
    }

    function fade(layer, inFrame, outFrame, duration) {
        var op = layer.property("ADBE Transform Group").property("ADBE Opacity");
        op.setValueAtTime(0, 0);
        op.setValueAtTime(safeTime(t(inFrame), duration), 100);
        op.setValueAtTime(safeTime(duration - t(outFrame), duration), 100);
        op.setValueAtTime(safeTime(duration, duration), 0);
    }

    function pop(layer, frame, duration) {
        var tr = layer.property("ADBE Transform Group");
        var sc = tr.property("ADBE Scale");
        var op = tr.property("ADBE Opacity");
        sc.setValueAtTime(safeTime(t(frame), duration), [92, 92]);
        sc.setValueAtTime(safeTime(t(frame + 8), duration), [102, 102]);
        sc.setValueAtTime(safeTime(t(frame + 15), duration), [100, 100]);
        op.setValueAtTime(safeTime(t(frame), duration), 0);
        op.setValueAtTime(safeTime(t(frame + 5), duration), 100);
    }

    function darkEditorialGround(comp, duration, cutNo) {
        addSolid(comp, "BG_INK", C.ink, 1920, 1080, [960, 540], duration);
        var i;
        for (i = 0; i < 12; i++) rect(comp, "GRID_V_" + i, [1, 880], [140 + i * 145, 540], C.white, 0, duration, 5);
        for (i = 0; i < 6; i++) rect(comp, "GRID_H_" + i, [1640, 1], [960, 140 + i * 155], C.white, 0, duration, 4);
        pointText(comp, "CUT_ID", cutNo + " / NND-01", 22, C.gold, [170, 1030], F.number, 100);
        pointText(comp, "SERIES", "『なんだろう』解体", 20, C.ash, [1720, 1030], F.regular, 40);
    }

    function paperEditorialGround(comp, duration, cutNo) {
        addSolid(comp, "BG_PAPER", C.paper, 1920, 1080, [960, 540], duration);
        var i;
        for (i = 0; i < 18; i++) rect(comp, "PAPER_RULE_" + i, [1640, 1], [960, 120 + i * 49], C.ink, 0, duration, 3);
        rect(comp, "LEFT_INDEX", [8, 860], [140, 540], C.red, 0, duration, 100);
        pointText(comp, "CUT_ID", cutNo + " / NND-01", 22, C.gold, [190, 1030], F.number, 100);
    }

    function makeCover(parent, cut, card, index, duration) {
        var comp = app.project.items.addComp("COMP_" + cut.cut + "_COVER_" + (index + 1), 620, 420, 1, duration, FPS);
        comp.parentFolder = parent;
        comp.comment = SIGNATURE + "|component|cover";
        var accent = card.accent === "#B8352E" ? C.red : (card.accent === "#EAE6DF" ? C.white : C.gold);
        rect(comp, "CARD_SHADOW", [594, 394], [325, 225], [0, 0, 0], 18, duration, 50);
        rect(comp, "CARD_SURFACE", [594, 394], [300, 195], C.ink2, 18, duration, 100);
        rect(comp, "CARD_ACCENT", [14, 394], [26, 195], accent, 0, duration, 100);
        rect(comp, "MEDIA_PANEL", [520, 138], [330, 112], accent, 10, duration, 20);
        rect(comp, "MEDIA_STRIP_1", [310, 14], [275, 75], accent, 0, duration, 70);
        rect(comp, "MEDIA_STRIP_2", [180, 14], [445, 139], C.white, 0, duration, 12);
        pointText(comp, "COVER_INDEX", "0" + (index + 1), 23, accent, [555, 55], F.number, 80);
        boxText(comp, "KICKER", card.eyebrow, [420, 38], 21, accent, [54, 48], F.number, 150, 26, ParagraphJustification.LEFT_JUSTIFY);
        boxText(comp, "HEADLINE", card.headline, [500, 145], 56, C.white, [54, 215], F.bold, 20, 70, ParagraphJustification.LEFT_JUSTIFY);
        pointText(comp, "MARK", "///", 28, C.white, [535, 355], F.number, 150);
        return comp;
    }

    function buildC01(cut, cutsFolder, components) {
        var p = cut.params, duration = cut.duration_frames / FPS;
        var comp = makeComp(cutsFolder, "DESIGN_V2_" + cut.cut + "_HOOK", duration, "cut=C01");
        darkEditorialGround(comp, duration, cut.cut);
        boxText(comp, "OVERLINE", "THE HOOK / 強い言葉が、先に視線を奪う。", [900, 50], 22, C.gold, [140, 115], F.number, 120, 28, ParagraphJustification.LEFT_JUSTIFY);
        line(comp, "TOP_RULE", [[140, 180], [1780, 180]], C.gold, 3, 0, 18, duration);
        var positions = [[450, 375], [960, 510], [1470, 650]];
        var rotations = [-5, 1, -2];
        var i, cardComp, layer, tr;
        for (i = 0; i < p.cards.length; i++) {
            cardComp = makeCover(components, cut, p.cards[i], i, duration);
            layer = comp.layers.add(cardComp);
            layer.name = "COVER_" + (i + 1);
            tr = layer.property("ADBE Transform Group");
            tr.property("ADBE Position").setValue([positions[i][0], -210]);
            tr.property("ADBE Rotate Z").setValue(rotations[i]);
            tr.property("ADBE Position").setValueAtTime(t(i * 14), [positions[i][0], -210]);
            tr.property("ADBE Position").setValueAtTime(t(i * 14 + 16), [positions[i][0], positions[i][1] - 20]);
            tr.property("ADBE Position").setValueAtTime(t(i * 14 + 23), positions[i]);
            pop(layer, i * 14, duration);
        }
        boxText(comp, "FOOTNOTE", "架空の見出し表現。実在メディア・ロゴは使用しない。", [800, 34], 18, C.ash, [140, 960], F.regular, 20, 24, ParagraphJustification.LEFT_JUSTIFY);
        created.push(comp.name);
        return comp;
    }

    function buildC13(cut, cutsFolder) {
        var p = cut.params, duration = cut.duration_frames / FPS;
        var comp = makeComp(cutsFolder, "DESIGN_V2_" + cut.cut + "_FLOW", duration, "cut=C13");
        darkEditorialGround(comp, duration, cut.cut);
        boxText(comp, "OVERLINE", "THE EXCHANGE", [600, 35], 21, C.gold, [140, 115], F.number, 180, 26, ParagraphJustification.LEFT_JUSTIFY);
        boxText(comp, "TITLE", "視線は、\nお金に変わる。", [760, 170], 68, C.white, [140, 160], F.bold, 15, 82, ParagraphJustification.LEFT_JUSTIFY);
        var xs = [430, 960, 1490];
        var i, node, ring, inner, label, sub, number, connector;
        for (i = 0; i < p.nodes.length; i++) {
            node = p.nodes[i];
            ring = circle(comp, "RING_" + (i + 1), 250, [xs[i], 535], null, C.gold, 4, duration);
            inner = circle(comp, "CORE_" + (i + 1), 216, [xs[i], 535], C.ink2, null, 0, duration);
            number = pointText(comp, "STEP_" + (i + 1), "0" + (i + 1), 20, C.gold, [xs[i], 430], F.number, 140);
            label = boxText(comp, "LABEL_" + (i + 1), node.label, [250, 80], 54, C.white, [xs[i] - 125, 475], F.bold, 15, 68, ParagraphJustification.CENTER_JUSTIFY);
            sub = boxText(comp, "SUB_" + (i + 1), node.sub, [250, 38], 19, C.gold, [xs[i] - 125, 610], F.number, 150, 24, ParagraphJustification.CENTER_JUSTIFY);
            pop(ring, i * 22 + 6, duration);
            pop(inner, i * 22 + 6, duration);
            fade(number, i * 22 + 8, 14, duration);
            fade(label, i * 22 + 10, 14, duration);
            fade(sub, i * 22 + 14, 14, duration);
            if (i < p.nodes.length - 1) {
                connector = line(comp, "FLOW_" + (i + 1), [[xs[i] + 130, 535], [xs[i + 1] - 130, 535]], C.gold, 4, i * 22 + 14, i * 22 + 30, duration);
                line(comp, "CHEVRON_A_" + (i + 1), [[xs[i + 1] - 158, 515], [xs[i + 1] - 138, 535]], C.gold, 4, i * 22 + 27, i * 22 + 32, duration);
                line(comp, "CHEVRON_B_" + (i + 1), [[xs[i + 1] - 158, 555], [xs[i + 1] - 138, 535]], C.gold, 4, i * 22 + 27, i * 22 + 32, duration);
            }
        }
        line(comp, "BOTTOM_RULE", [[140, 760], [1780, 760]], C.ash, 2, 70, 86, duration);
        boxText(comp, "STATEMENT", "売られているのは、あなたの『注意』です。", [1640, 90], 48, C.white, [140, 805], F.bold, 25, 62, ParagraphJustification.LEFT_JUSTIFY);
        created.push(comp.name);
        return comp;
    }

    function buildC25(cut, cutsFolder) {
        var p = cut.params, duration = cut.duration_frames / FPS;
        var comp = makeComp(cutsFolder, "DESIGN_V2_" + cut.cut + "_REPLACE", duration, "cut=C25");
        paperEditorialGround(comp, duration, cut.cut);
        boxText(comp, "OVERLINE", "WHAT IS ACTUALLY SOLD?", [600, 36], 21, C.gold, [190, 120], F.number, 170, 26, ParagraphJustification.LEFT_JUSTIFY);
        boxText(comp, "LEFT_KICKER", "01 / THE OBJECT", [560, 32], 20, C.ash, [190, 280], F.number, 140, 24, ParagraphJustification.LEFT_JUSTIFY);
        var left = boxText(comp, "BEFORE", p.left, [620, 120], 70, C.ink, [190, 330], F.bold, 0, 84, ParagraphJustification.LEFT_JUSTIFY);
        line(comp, "STRIKE", [[190, 440], [770, 340]], C.red, 12, 22, 38, duration);
        boxText(comp, "RIGHT_KICKER", "02 / THE PROMISE", [560, 32], 20, C.gold, [1110, 280], F.number, 140, 24, ParagraphJustification.LEFT_JUSTIFY);
        var right = boxText(comp, "AFTER", p.right, [640, 120], 74, C.ink, [1110, 330], F.bold, 0, 88, ParagraphJustification.LEFT_JUSTIFY);
        right.property("ADBE Transform Group").property("ADBE Position").setValueAtTime(t(0), [1210, 330]);
        right.property("ADBE Transform Group").property("ADBE Position").setValueAtTime(t(62), [1110, 330]);
        fade(right, 54, 16, duration);
        line(comp, "VECTOR", [[790, 460], [1060, 460]], C.gold, 5, 40, 58, duration);
        line(comp, "VECTOR_A", [[1030, 430], [1060, 460]], C.gold, 5, 54, 60, duration);
        line(comp, "VECTOR_B", [[1030, 490], [1060, 460]], C.gold, 5, 54, 60, duration);
        line(comp, "CAPTION_RULE", [[190, 760], [1730, 760]], C.ink, 3, 66, 78, duration);
        boxText(comp, "STATEMENT", "商品ではなく、買った先の『なれる自分』を売る。", [1540, 70], 37, C.ink, [190, 805], F.bold, 0, 48, ParagraphJustification.LEFT_JUSTIFY);
        fade(left, 8, 18, duration);
        created.push(comp.name);
        return comp;
    }

    function removeRoots(name) {
        var i, item;
        for (i = app.project.numItems; i >= 1; i--) {
            item = app.project.item(i);
            if (item instanceof FolderItem && item.name === name && item.comment.indexOf("NMF|owner=" + PROJECT.episode + "|design=v2") === 0) item.remove();
        }
    }

    var root = null;
    var failed = "";
    app.beginUndoGroup("NANDAROU MG Design v2");
    try {
        if (!app.project) app.newProject();
        removeRoots(BUILDING_NAME);
        root = app.project.items.addFolder(BUILDING_NAME);
        root.comment = SIGNATURE + "|building";
        var cutsFolder = folder(root, "01_DESIGN_CUTS");
        var components = folder(root, "02_COMPONENTS");
        var outputFolder = folder(root, "90_OUTPUT");
        var reviewFrames = 18, i, cut, child;
        for (i = 0; i < PAYLOAD.cuts.length; i++) reviewFrames += PAYLOAD.cuts[i].duration_frames + 18;
        var review = makeComp(outputFolder, PROJECT.episode + "_DESIGN_V2_REVIEW", reviewFrames / FPS, "review");
        addSolid(review, "BG", C.ink, 1920, 1080, [960, 540], review.duration);
        var cursor = 0, layer, label;
        for (i = 0; i < PAYLOAD.cuts.length; i++) {
            cut = PAYLOAD.cuts[i];
            if (cut.cut === "C01") child = buildC01(cut, cutsFolder, components);
            else if (cut.cut === "C13") child = buildC13(cut, cutsFolder);
            else if (cut.cut === "C25") child = buildC25(cut, cutsFolder);
            else continue;
            layer = review.layers.add(child);
            layer.name = cut.cut + " / DESIGN V2";
            layer.startTime = cursor / FPS;
            layer.inPoint = cursor / FPS;
            layer.outPoint = (cursor + cut.duration_frames) / FPS;
            label = pointText(review, "REVIEW_LABEL_" + cut.cut, cut.cut + " / DESIGN V2", 18, C.gold, [1730, 1030], F.number, 100);
            label.inPoint = layer.inPoint;
            label.outPoint = layer.outPoint;
            cursor += cut.duration_frames + 18;
            placed++;
        }
        removeRoots(ROOT_NAME);
        root.name = ROOT_NAME;
        root.comment = SIGNATURE;
        review.openInViewer();
    } catch (error) {
        failed = error.toString() + " line=" + error.line;
        logWarning(failed);
        try { if (root) root.remove(); } catch (cleanupError) {}
    } finally {
        app.endUndoGroup();
    }
    if (failed) alert("Design v2 生成失敗\n" + failed + "\n詳細はJavaScript Consoleを確認してください。");
    else alert("Design v2 生成完了\n配置カット: " + placed + "\n警告: " + warnings.length + "\n\n" + PROJECT.episode + "_DESIGN_V2_REVIEW を確認してください。");
}());
