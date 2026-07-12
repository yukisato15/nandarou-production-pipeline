#!/usr/bin/env python3
"""Build the C13 After Effects scaffold JSX.

This is the first asset-driven master after the design reset.  The script does
not invent a new look; it translates the approved C13 spec into an AE scaffold
that imports the prepared assets, builds the BOARD precomp, places named PH/TXT
ports, and saves QA stills when the JSX is run in After Effects.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "mg_factory" / "generated" / "generate_c13_master.jsx"


def jsx_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def build_payload() -> dict[str, object]:
    return {
        "project": {
            "episode": "EP01",
            "fps": 23.976,
            "width": 1920,
            "height": 1080,
            "duration_frames": 312,
        },
        "paths": {
            "eye": str((ROOT / "assets" / "mg" / "c13" / "eye_phone_glow.png").resolve()),
            "paper": str((ROOT / "assets" / "textures" / "paper_scan_01.jpg").resolve()),
            "paper_white": str((ROOT / "assets" / "textures" / "paper_scan_02_white.jpg").resolve()),
            "paper_aged": str((ROOT / "assets" / "textures" / "paper_scan_03_aged.jpg").resolve()),
            "qa_dir": str((ROOT / "mg_factory" / "qa" / "C13").resolve()),
        },
    }


JSX_TEMPLATE = r'''#target aftereffects

/*
 * NANDAROU / C13 master scaffold
 *
 * Source of truth:
 * - mg_factory/design_reference/C13_board_master_spec.md
 * - mg_factory/design_reference/C13_board_master_spec.html
 *
 * This JSX builds the first asset-driven master.  It intentionally keeps all
 * colors, sizes, coordinates, and timings close to the approved C13 spec.
 */
(function () {
    var PAYLOAD = __PAYLOAD__;
    var PROJECT = PAYLOAD.project;
    var PATHS = PAYLOAD.paths;
    var FPS = PROJECT.fps;
    var FD = 1 / FPS;
    var DURATION = PROJECT.duration_frames / FPS;
    var ROOT_NAME = "NANDAROU_" + PROJECT.episode + "_C13_MASTER_SCAFFOLD";
    var SIGNATURE = "NND|C13|master_scaffold";
    var warnings = [];

    var C = {
        paper: [0.890, 0.870, 0.820],
        paper2: [0.937, 0.918, 0.878],
        ink: [0.055, 0.059, 0.063],
        ink2: [0.090, 0.095, 0.102],
        gold: [0.788, 0.627, 0.388],
        goldDeep: [0.663, 0.506, 0.290],
        red: [0.722, 0.208, 0.180],
        ash: [0.431, 0.427, 0.400],
        white: [0.918, 0.902, 0.875],
        tape: [0.886, 0.855, 0.765],
        note: [0.227, 0.227, 0.220]
    };
    var F = {
        minchoHeavy: ["ShipporiMincho-ExtraBold", "ShipporiMincho-Bold", "ShipporiMincho-Regular"],
        minchoBold: ["ShipporiMincho-Bold", "ShipporiMincho-SemiBold", "ShipporiMincho-Regular"],
        mincho: ["ShipporiMincho-Regular"],
        oswald: ["Oswald-Regular", "AvenirNextCondensed-Bold", "HelveticaNeue-CondensedBold"],
        hand: ["ZenKurenaido-Regular", "ShipporiMincho-Regular"]
    };

    function warn(message) {
        warnings.push(message);
        $.writeln("[C13] " + message);
    }

    function at(frame) { return frame / FPS; }
    function board(v) { return v * 2; }
    function p(x, y) { return [board(x), board(y)]; }
    function s(w, h) { return [board(w), board(h)]; }

    function fontExists(name) {
        try {
            return app.fonts && app.fonts.getFontsByPostScriptName(name).length > 0;
        } catch (error) {
            return false;
        }
    }

    function chooseFont(candidates, fallback, label) {
        var i;
        for (i = 0; i < candidates.length; i++) {
            if (fontExists(candidates[i])) return candidates[i];
        }
        warn(label + ": requested font missing, fallback used");
        return fallback;
    }

    function ensureFolder(parent, name) {
        var item = app.project.items.addFolder(name);
        item.parentFolder = parent;
        item.comment = SIGNATURE;
        return item;
    }

    function comp(parent, name, width, height, duration) {
        var c = app.project.items.addComp(name, width, height, 1, duration, FPS);
        c.parentFolder = parent;
        c.comment = SIGNATURE;
        c.displayStartTime = 0;
        c.workAreaStart = 0;
        c.workAreaDuration = duration;
        return c;
    }

    function importAsset(path, name, folder) {
        var file = new File(path);
        if (!file.exists) {
            warn("missing asset: " + path);
            return null;
        }
        var io = new ImportOptions(file);
        var item = app.project.importFile(io);
        item.name = name;
        item.parentFolder = folder;
        item.comment = SIGNATURE + "|asset";
        return item;
    }

    function solid(cmp, name, color, width, height, pos, duration) {
        var layer = cmp.layers.addSolid(color, name, Math.max(4, Math.round(width)), Math.max(4, Math.round(height)), 1, duration || cmp.duration);
        layer.name = name;
        layer.comment = SIGNATURE;
        layer.property("ADBE Transform Group").property("ADBE Position").setValue(pos);
        return layer;
    }

    function shapeRect(cmp, name, size, pos, color, roundness, opacity) {
        var layer = cmp.layers.addShape();
        var group, vectors, rect, fill;
        layer.name = name;
        layer.comment = SIGNATURE;
        group = layer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        vectors = group.property("ADBE Vectors Group");
        rect = vectors.addProperty("ADBE Vector Shape - Rect");
        rect.property("ADBE Vector Rect Size").setValue(size);
        rect.property("ADBE Vector Rect Roundness").setValue(roundness || 0);
        fill = vectors.addProperty("ADBE Vector Graphic - Fill");
        fill.property("ADBE Vector Fill Color").setValue(color);
        layer.property("ADBE Transform Group").property("ADBE Position").setValue(pos);
        if (opacity !== undefined) layer.property("ADBE Transform Group").property("ADBE Opacity").setValue(opacity);
        return layer;
    }

    function shapeEllipse(cmp, name, diameter, pos, fillColor, strokeColor, strokeWidth, opacity) {
        var layer = cmp.layers.addShape();
        var group, vectors, ellipse, fill, stroke;
        layer.name = name;
        layer.comment = SIGNATURE;
        group = layer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        vectors = group.property("ADBE Vectors Group");
        ellipse = vectors.addProperty("ADBE Vector Shape - Ellipse");
        ellipse.property("ADBE Vector Ellipse Size").setValue([diameter, diameter]);
        if (fillColor) {
            fill = vectors.addProperty("ADBE Vector Graphic - Fill");
            fill.property("ADBE Vector Fill Color").setValue(fillColor);
        }
        if (strokeColor) {
            stroke = vectors.addProperty("ADBE Vector Graphic - Stroke");
            stroke.property("ADBE Vector Stroke Color").setValue(strokeColor);
            stroke.property("ADBE Vector Stroke Width").setValue(strokeWidth || 2);
        }
        layer.property("ADBE Transform Group").property("ADBE Position").setValue(pos);
        if (opacity !== undefined) layer.property("ADBE Transform Group").property("ADBE Opacity").setValue(opacity);
        return layer;
    }

    function setText(layer, text, size, color, fonts, tracking, justification) {
        var prop = layer.property("ADBE Text Properties").property("ADBE Text Document");
        var doc = prop.value;
        doc.resetCharStyle();
        doc.resetParagraphStyle();
        doc.text = text;
        doc.font = chooseFont(fonts, doc.font, layer.name);
        doc.fontSize = size;
        doc.fillColor = color;
        doc.applyFill = true;
        doc.applyStroke = false;
        doc.tracking = tracking || 0;
        doc.justification = justification || ParagraphJustification.CENTER_JUSTIFY;
        prop.setValue(doc);
        return layer;
    }

    function textLayer(cmp, name, text, size, color, pos, fonts, tracking, justification) {
        var layer = cmp.layers.addText(text);
        var tr, rect;
        layer.name = name;
        layer.comment = SIGNATURE + "|TXT";
        setText(layer, text, size, color, fonts, tracking, justification);
        tr = layer.property("ADBE Transform Group");
        try {
            rect = layer.sourceRectAtTime(0, false);
            tr.property("ADBE Anchor Point").setValue([rect.left + rect.width / 2, rect.top + rect.height / 2]);
        } catch (error) {
            tr.property("ADBE Anchor Point").setValue([0, 0]);
            warn(name + ": sourceRect anchor fallback used");
        }
        tr.property("ADBE Position").setValue(pos);
        return layer;
    }

    function addDropShadow(layer, distance, softness, opacity) {
        try {
            var fx = layer.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow");
            fx.property(2).setValue(opacity || 35);
            fx.property(3).setValue(135);
            fx.property(4).setValue(distance || 14);
            fx.property(5).setValue(softness || 30);
        } catch (error) {
            warn(layer.name + ": drop shadow not applied");
        }
    }

    function addTurbulence(layer, amount, sizeValue) {
        try {
            var fx = layer.property("ADBE Effect Parade").addProperty("ADBE Turbulent Displace");
            fx.property(2).setValue(amount || 7);
            fx.property(3).setValue(sizeValue || 15);
        } catch (error) {
            warn(layer.name + ": turbulent displace not applied");
        }
    }

    function scaleAssetToCover(layer, targetW, targetH) {
        var src = layer.source;
        var sc;
        if (!src || !src.width || !src.height) return;
        sc = Math.max(targetW / src.width, targetH / src.height) * 100;
        layer.property("ADBE Transform Group").property("ADBE Scale").setValue([sc, sc]);
    }

    function lineShape(cmp, name, vertices, color, width, startFrame, endFrame) {
        var layer = cmp.layers.addShape();
        var group, vectors, pathProp, shape, stroke, trim, end, i, tangents = [];
        layer.name = name;
        layer.comment = SIGNATURE + "|FX";
        group = layer.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        vectors = group.property("ADBE Vectors Group");
        pathProp = vectors.addProperty("ADBE Vector Shape - Group").property("ADBE Vector Shape");
        for (i = 0; i < vertices.length; i++) tangents.push([0, 0]);
        shape = new Shape();
        shape.vertices = vertices;
        shape.inTangents = tangents;
        shape.outTangents = tangents;
        shape.closed = false;
        pathProp.setValue(shape);
        stroke = vectors.addProperty("ADBE Vector Graphic - Stroke");
        stroke.property("ADBE Vector Stroke Color").setValue(color);
        stroke.property("ADBE Vector Stroke Width").setValue(width);
        try { stroke.property("ADBE Vector Stroke Line Cap").setValue(2); } catch (error) {}
        trim = vectors.addProperty("ADBE Vector Filter - Trim");
        end = trim.property("ADBE Vector Trim End");
        end.setValueAtTime(at(startFrame), 0);
        end.setValueAtTime(at(endFrame), 100);
        layer.property("ADBE Transform Group").property("ADBE Position").setValue([0, 0]);
        addTurbulence(layer, 7, 15);
        return layer;
    }

    function setOpacity(layer, keys) {
        var op = layer.property("ADBE Transform Group").property("ADBE Opacity");
        var i;
        for (i = 0; i < keys.length; i++) op.setValueAtTime(keys[i][0], keys[i][1]);
    }

    function setScaleKeys(layer, keys) {
        var prop = layer.property("ADBE Transform Group").property("ADBE Scale");
        var i;
        for (i = 0; i < keys.length; i++) prop.setValueAtTime(keys[i][0], keys[i][1]);
    }

    function setPositionKeys(layer, keys) {
        var prop = layer.property("ADBE Transform Group").property("ADBE Position");
        var i;
        for (i = 0; i < keys.length; i++) prop.setValueAtTime(keys[i][0], keys[i][1]);
    }

    function buildBoard(root, assetsFolder) {
        var boardComp = comp(root, "C13_BOARD_2X", 3840, 2160, DURATION);
        var eyeItem = importAsset(PATHS.eye, "PH_IMG_1_eye_phone_glow", assetsFolder);
        var paperItem = importAsset(PATHS.paper, "BG_PAPER_texture_beige", assetsFolder);
        var agedItem = importAsset(PATHS.paper_aged, "UNIT_SCRAP_texture_aged", assetsFolder);
        var bg, tex, ledger, photoFrame, photoMatte, eye, tape1, tape2;
        var counter, play, number, sub, pin, scrap, scrapTex, yen, yenSub;

        bg = solid(boardComp, "BG_PAPER_BASE", C.paper, 3840, 2160, [1920, 1080], DURATION);
        if (paperItem) {
            tex = boardComp.layers.add(paperItem);
            tex.name = "BG_PAPER_TEXTURE_MULTIPLY_20";
            tex.comment = SIGNATURE + "|BG_PAPER";
            tex.property("ADBE Transform Group").property("ADBE Position").setValue([1920, 1080]);
            scaleAssetToCover(tex, 3840, 2160);
            tex.blendingMode = BlendingMode.MULTIPLY;
            tex.property("ADBE Transform Group").property("ADBE Opacity").setValue(20);
        }

        ledger = lineShape(boardComp, "FX_LEDGER_LINE", [[board(300), board(760)], [board(1620), board(760)]], C.note, 4, 0, 1);
        ledger.property("ADBE Transform Group").property("ADBE Opacity").setValue(55);

        photoFrame = shapeRect(boardComp, "PH_IMG_1_FRAME_BLACK", s(340, 250), p(390, 405), [0.078, 0.080, 0.086], 0, 100);
        photoFrame.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(-2.2);
        addDropShadow(photoFrame, 28, 60, 35);
        photoMatte = shapeRect(boardComp, "PH_IMG_1_INNER_MATTE", s(320, 230), p(390, 405), [0.050, 0.052, 0.058], 0, 100);
        photoMatte.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(-2.2);
        if (eyeItem) {
            eye = boardComp.layers.add(eyeItem);
            eye.name = "PH_IMG_1";
            eye.comment = SIGNATURE + "|PH";
            eye.property("ADBE Transform Group").property("ADBE Position").setValue(p(390, 405));
            eye.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(-2.2);
            scaleAssetToCover(eye, board(320), board(230));
        }
        tape1 = shapeRect(boardComp, "TAPE_1", s(110, 34), p(265, 275), C.tape, 0, 75);
        tape1.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(-38);
        tape2 = shapeRect(boardComp, "TAPE_2", s(110, 34), p(515, 275), C.tape, 0, 75);
        tape2.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(34);

        counter = shapeRect(boardComp, "UNIT_COUNTER_CARD", s(360, 150), p(970, 415), C.ink2, 20, 100);
        counter.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(1.2);
        addDropShadow(counter, 28, 60, 35);
        play = textLayer(boardComp, "UNIT_COUNTER_PLAY", "▶", 76, C.white, p(835, 410), F.oswald, 0, ParagraphJustification.CENTER_JUSTIFY);
        number = textLayer(boardComp, "TXT_COUNTER_VALUE", "1,024,553", 108, C.white, p(1012, 400), F.oswald, 40, ParagraphJustification.CENTER_JUSTIFY);
        sub = textLayer(boardComp, "TXT_COUNTER_SUB", "回再生", 32, [0.545, 0.545, 0.522], p(970, 475), F.oswald, 300, ParagraphJustification.CENTER_JUSTIFY);
        pin = shapeEllipse(boardComp, "PIN_RED", 32, p(970, 340), C.red, null, 0, 100);

        scrap = shapeRect(boardComp, "UNIT_SCRAP_PAPER", s(330, 230), p(1565, 415), C.paper2, 0, 100);
        scrap.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(2);
        addDropShadow(scrap, 28, 60, 30);
        if (agedItem) {
            scrapTex = boardComp.layers.add(agedItem);
            scrapTex.name = "UNIT_SCRAP_TEXTURE_MULTIPLY_18";
            scrapTex.property("ADBE Transform Group").property("ADBE Position").setValue(p(1565, 415));
            scaleAssetToCover(scrapTex, board(330), board(230));
            scrapTex.blendingMode = BlendingMode.MULTIPLY;
            scrapTex.property("ADBE Transform Group").property("ADBE Opacity").setValue(18);
            scrapTex.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(2);
        }
        yen = textLayer(boardComp, "TXT_YEN", "¥", 220, C.goldDeep, p(1565, 395), F.minchoHeavy, 0, ParagraphJustification.CENTER_JUSTIFY);
        yenSub = textLayer(boardComp, "TXT_YEN_SUB", "1再生 ≈ 0.1〜0.5円", 44, [0.290, 0.290, 0.270], p(1565, 490), F.hand, 0, ParagraphJustification.CENTER_JUSTIFY);

        textLayer(boardComp, "TXT_LABEL_1", "視線", 80, C.ink, p(390, 610), F.minchoBold, 180, ParagraphJustification.CENTER_JUSTIFY);
        textLayer(boardComp, "TXT_SUB_1", "GAZE", 30, C.ash, p(390, 690), F.oswald, 350, ParagraphJustification.CENTER_JUSTIFY);
        textLayer(boardComp, "TXT_LABEL_2", "再生", 80, C.ink, p(970, 610), F.minchoBold, 180, ParagraphJustification.CENTER_JUSTIFY);
        textLayer(boardComp, "TXT_SUB_2", "PLAY COUNT", 30, C.ash, p(970, 690), F.oswald, 350, ParagraphJustification.CENTER_JUSTIFY);
        textLayer(boardComp, "TXT_LABEL_3", "広告費", 80, C.ink, p(1565, 610), F.minchoBold, 180, ParagraphJustification.CENTER_JUSTIFY);
        textLayer(boardComp, "TXT_SUB_3", "AD REVENUE", 30, C.ash, p(1565, 690), F.oswald, 350, ParagraphJustification.CENTER_JUSTIFY);
        textLayer(boardComp, "HAND_NOTE_1", "つい、見てしまう。", 54, C.note, p(330, 735), F.hand, 60, ParagraphJustification.CENTER_JUSTIFY)
            .property("ADBE Transform Group").property("ADBE Rotate Z").setValue(-2);

        textLayer(boardComp, "STAMP_1_TEXT", "一", 48, C.red, p(238, 328), F.minchoBold, 0, ParagraphJustification.CENTER_JUSTIFY);
        shapeEllipse(boardComp, "STAMP_1_CIRCLE", 88, p(238, 328), null, C.red, 5, 85);
        textLayer(boardComp, "STAMP_2_TEXT", "二", 48, C.red, p(805, 365), F.minchoBold, 0, ParagraphJustification.CENTER_JUSTIFY);
        shapeEllipse(boardComp, "STAMP_2_CIRCLE", 88, p(805, 365), null, C.red, 5, 85);
        textLayer(boardComp, "STAMP_3_TEXT", "三", 48, C.red, p(1395, 340), F.minchoBold, 0, ParagraphJustification.CENTER_JUSTIFY);
        shapeEllipse(boardComp, "STAMP_3_CIRCLE", 88, p(1395, 340), null, C.red, 5, 85);

        lineShape(boardComp, "FX_LINE_1", [p(505, 430), p(625, 442), p(770, 452)], C.goldDeep, 9, 77, 101);
        lineShape(boardComp, "FX_LINE_1_ARROW_A", [p(748, 438), p(770, 452), p(745, 466)], C.goldDeep, 9, 96, 103);
        lineShape(boardComp, "FX_LINE_2", [p(1155, 445), p(1270, 456), p(1395, 455)], C.goldDeep, 9, 163, 187);
        lineShape(boardComp, "FX_LINE_2_ARROW_A", [p(1372, 440), p(1395, 455), p(1370, 470)], C.goldDeep, 9, 184, 191);

        setScaleKeys(scrap, [[at(187), [94, 94]], [at(198), [102, 102]], [at(204), [100, 100]]]);
        setScaleKeys(pin, [[at(96), [106, 106]], [at(98), [100, 100]]]);
        return boardComp;
    }

    function addM6Statement(master) {
        var bg = solid(master, "M6_STATEMENT_BG_INK", C.ink, PROJECT.width, PROJECT.height, [960, 540], DURATION);
        bg.inPoint = at(235);
        bg.outPoint = DURATION;

        var left = textLayer(master, "TXT_M6_LEFT", "売られているのは、あなたの『", 78, C.white, [710, 540], F.minchoBold, 100, ParagraphJustification.CENTER_JUSTIFY);
        var center = textLayer(master, "TXT_M6_EM_ATTENTION", "注意", 78, C.gold, [1208, 540], F.minchoBold, 100, ParagraphJustification.CENTER_JUSTIFY);
        var right = textLayer(master, "TXT_M6_RIGHT", "』です。", 78, C.white, [1405, 540], F.minchoBold, 100, ParagraphJustification.CENTER_JUSTIFY);
        left.inPoint = at(235); center.inPoint = at(247); right.inPoint = at(255);
        left.outPoint = DURATION; center.outPoint = DURATION; right.outPoint = DURATION;
        setOpacity(left, [[at(235), 0], [at(247), 100]]);
        setOpacity(center, [[at(247), 0], [at(259), 100]]);
        setOpacity(right, [[at(255), 0], [at(267), 100]]);
    }

    function addLook(master, camRig) {
        var vignette = solid(master, "LOOK_GLOBAL_VIGNETTE_DISABLED_REFERENCE", [0, 0, 0], PROJECT.width, PROJECT.height, [960, 540], DURATION);
        var grain;
        vignette.enabled = false;
        vignette.comment = SIGNATURE + "|disabled until mask is hand-checked";

        grain = solid(master, "LOOK_GLOBAL_GRAIN_NOISE", [0.5, 0.5, 0.5], PROJECT.width, PROJECT.height, [960, 540], DURATION);
        grain.adjustmentLayer = true;
        grain.property("ADBE Transform Group").property("ADBE Opacity").setValue(4);
        try {
            grain.property("ADBE Effect Parade").addProperty("ADBE Noise");
        } catch (noiseError) {
            warn("noise effect not applied");
        }
    }

    function buildMaster(root, boardComp) {
        var master = comp(root, "C13_MASTER", PROJECT.width, PROJECT.height, DURATION);
        var cam = master.layers.addNull(DURATION);
        var boardLayer = master.layers.add(boardComp);
        var flash = solid(master, "FLASH_PAPER_WHITE", C.white, PROJECT.width, PROJECT.height, [960, 540], DURATION);
        var ref;

        cam.name = "CAM_RIG";
        cam.comment = SIGNATURE + "|CAM_RIG";
        boardLayer.name = "BOARD";
        boardLayer.comment = SIGNATURE + "|BOARD";
        boardLayer.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([1920, 1080]);
        boardLayer.property("ADBE Transform Group").property("ADBE Position").setValue([960, 540]);

        setScaleKeys(boardLayer, [
            [at(0), [82, 82]],
            [at(77), [82, 82]],
            [at(101), [72, 72]],
            [at(156), [78, 78]],
            [at(204), [72, 72]],
            [at(228), [50, 50]],
            [at(235), [50, 50]]
        ]);
        setPositionKeys(boardLayer, [
            [at(0), [1895, 762]],
            [at(77), [1895, 762]],
            [at(101), [1050, 720]],
            [at(156), [945, 735]],
            [at(204), [70, 735]],
            [at(228), [960, 540]],
            [at(235), [960, 540]]
        ]);

        flash.inPoint = at(230);
        flash.outPoint = at(238);
        setOpacity(flash, [[at(230), 0], [at(231), 100], [at(235), 0]]);

        addM6Statement(master);
        addLook(master, cam);

        ref = solid(master, "QA_REFERENCE_FRAME_OFF_BY_DEFAULT", [1, 1, 1], 20, 20, [30, 30], DURATION);
        ref.enabled = false;
        return master;
    }

    function saveQa(master) {
        try {
            var folder = new Folder(PATHS.qa_dir);
            if (!folder.exists) folder.create();
            master.saveFrameToPng(0, new File(PATHS.qa_dir + "/C13_qa_000.png"));
            master.saveFrameToPng(DURATION * 0.50, new File(PATHS.qa_dir + "/C13_qa_050.png"));
            master.saveFrameToPng(DURATION * 0.95, new File(PATHS.qa_dir + "/C13_qa_095.png"));
        } catch (error) {
            warn("QA PNG export skipped or failed. Enable AE Preferences > Scripting & Expressions > Allow Scripts to Write Files and Access Network, then rerun if QA stills are needed. " + error.toString());
        }
    }

    app.beginUndoGroup("Build C13 master scaffold");
    try {
        var root = ensureFolder(app.project.rootFolder, ROOT_NAME);
        var assets = ensureFolder(root, "_assets");
        var boardComp = buildBoard(root, assets);
        var master = buildMaster(root, boardComp);
        saveQa(master);
        alert("C13 master scaffold complete\nWarnings: " + warnings.length + "\nComp: C13_MASTER\nQA: " + PATHS.qa_dir);
    } catch (error) {
        alert("C13 master scaffold failed\n" + error.toString() + "\nWarnings: " + warnings.length);
        throw error;
    } finally {
        app.endUndoGroup();
    }
}());
'''


def main() -> None:
    payload = build_payload()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    source = JSX_TEMPLATE.replace("__PAYLOAD__", json.dumps(payload, ensure_ascii=False, indent=4))
    OUT.write_text(source, encoding="utf-8-sig")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
