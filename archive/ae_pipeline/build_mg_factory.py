#!/usr/bin/env python3
"""MG専用JSONを埋め込んだ、AE用MG Factory JSXを生成する。"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

from mg_factory.template_registry import IMPLEMENTED_TEMPLATES, validate_cut

CUT_SPEC_RE = re.compile(r"^([A-Za-z]+)(\d+)(?:-([A-Za-z]+)(\d+))?$")


JSX_TEMPLATE = r'''#target aftereffects

/*
 * NANDAROU MG Factory v0.2 - Reusable AE/Data Builder
 * PythonがMG JSONを直接埋め込んでいるためJSON.parseは使用しません。
 * 元TC確認用リールと、カットを詰めたレビュー用リールを同時生成します。
 */
(function () {
    var PAYLOAD = __MG_PAYLOAD__;
    var PROJECT = PAYLOAD.project;
    var PALETTE = PAYLOAD.palette;
    var BUILD = PAYLOAD.build || {id: PROJECT.episode, root_name: "NANDAROU_MG_FACTORY_" + PROJECT.episode, reel_prefix: PROJECT.episode};
    var FPS = PROJECT.fps_numerator && PROJECT.fps_denominator ? PROJECT.fps_numerator / PROJECT.fps_denominator : PROJECT.fps;
    var FD = 1 / FPS;
    var SIGNATURE = "NMF|owner=" + BUILD.id + "|version=0.2";
    var ROOT_NAME = BUILD.root_name;
    var warnings = [];
    var created = [];
    var placedCount = 0;
    var ASSET_FOLDER = null;
    var SHARED_COMPS = {};

    var FONTS = {
        BOLD: ["SourceHanSans-Bold", "NotoSansCJKjp-Medium"],
        REGULAR: ["NotoSansCJKjp-Medium", "ShipporiMincho-Regular"],
        NUMBER: ["Oswald-Regular", "SourceHanSans-Bold"]
    };

    function logWarning(message) {
        warnings.push(message);
        $.writeln("[NMF WARNING] " + message);
    }

    function hexColor(value) {
        var text = String(value || "#000000").replace("#", "");
        return [parseInt(text.substr(0, 2), 16) / 255, parseInt(text.substr(2, 2), 16) / 255, parseInt(text.substr(4, 2), 16) / 255];
    }

    function timeOfFrame(frame) {
        return frame / FPS;
    }

    function clampTime(value, duration) {
        return Math.max(0, Math.min(value, Math.max(0, duration - FD)));
    }

    function fontExists(postScriptName) {
        try {
            return app.fonts && app.fonts.getFontsByPostScriptName(postScriptName).length > 0;
        } catch (error) {
            return false;
        }
    }

    function chooseFont(candidates, fallback, context) {
        var i;
        for (i = 0; i < candidates.length; i++) {
            if (fontExists(candidates[i])) return candidates[i];
        }
        logWarning(context + ": 指定フォントがなくAE既定フォント " + fallback + " を使用");
        return fallback;
    }

    function removeOwnedRoot() {
        var i, item;
        for (i = app.project.numItems; i >= 1; i--) {
            item = app.project.item(i);
            if (item instanceof FolderItem && item.name === ROOT_NAME && item.comment.indexOf("NMF|owner=" + BUILD.id + "|") === 0) {
                item.remove();
            } else if (item instanceof FolderItem && PROJECT.episode === "EP01" && item.name === "NANDAROU_MG_FACTORY" && item.comment.indexOf("NMF|version=") === 0) {
                // v0.1試作の旧ルートを一度だけ掃除する後方互換処理。
                item.remove();
            }
        }
    }

    function removeAbandonedBuildingRoot() {
        var i, item;
        for (i = app.project.numItems; i >= 1; i--) {
            item = app.project.item(i);
            if (item instanceof FolderItem && item.name === ROOT_NAME + "_BUILDING" && item.comment.indexOf("NMF|owner=" + BUILD.id + "|") === 0) {
                item.remove();
            }
        }
    }

    function folder(parent, name) {
        var item = app.project.items.addFolder(name);
        item.parentFolder = parent;
        item.comment = SIGNATURE;
        return item;
    }

    function makeComp(parent, name, duration, role) {
        var comp = app.project.items.addComp(name, PROJECT.width, PROJECT.height, 1, Math.max(FD, duration), FPS);
        comp.parentFolder = parent;
        comp.displayStartTime = 0;
        comp.workAreaStart = 0;
        comp.workAreaDuration = comp.duration;
        comp.preserveNestedFrameRate = true;
        comp.preserveNestedResolution = true;
        comp.comment = SIGNATURE + "|role=" + role;
        comp.time = 0;
        return comp;
    }

    function addCompMarker(comp, time, comment) {
        try {
            comp.markerProperty.setValueAtTime(clampTime(time, comp.duration), new MarkerValue(comment));
        } catch (error) {
            logWarning(comp.name + ": comp marker失敗 " + error.toString());
        }
    }

    function addLayerMarker(layer, time, comment) {
        try {
            layer.property("ADBE Marker").setValueAtTime(time, new MarkerValue(comment));
        } catch (error) {
            logWarning(layer.name + ": layer marker失敗 " + error.toString());
        }
    }

    function addSolid(comp, name, color, width, height, position, duration) {
        // AEのSolidSourceは縦横とも4px未満を受け付けないため、細線も4pxへ丸める。
        var safeWidth = Math.max(4, Math.round(width));
        var safeHeight = Math.max(4, Math.round(height));
        var layer = comp.layers.addSolid(color, name, safeWidth, safeHeight, 1, duration || comp.duration);
        if (ASSET_FOLDER && layer.source) layer.source.parentFolder = ASSET_FOLDER;
        layer.property("ADBE Transform Group").property("ADBE Position").setValue(position || [comp.width / 2, comp.height / 2]);
        layer.comment = SIGNATURE;
        return layer;
    }

    function applyText(layer, value, size, color, fontCandidates, tracking, justification) {
        var prop = layer.property("ADBE Text Properties").property("ADBE Text Document");
        var doc = prop.value;
        var fallback = doc.font;
        doc.resetCharStyle();
        doc.resetParagraphStyle();
        doc.text = value;
        doc.font = chooseFont(fontCandidates || FONTS.REGULAR, fallback, layer.name);
        doc.fontSize = size;
        doc.fillColor = color;
        doc.applyFill = true;
        doc.applyStroke = false;
        doc.tracking = tracking || 0;
        doc.justification = justification || ParagraphJustification.CENTER_JUSTIFY;
        prop.setValue(doc);
        layer.comment = SIGNATURE;
        return prop;
    }

    function addText(comp, name, value, size, color, position, fontCandidates, tracking) {
        var layer = comp.layers.addText(value);
        layer.name = name;
        applyText(layer, value, size, color, fontCandidates, tracking, ParagraphJustification.CENTER_JUSTIFY);
        var transform = layer.property("ADBE Transform Group");
        transform.property("ADBE Anchor Point").expression = "r=sourceRectAtTime(time,false);[r.left+r.width/2,r.top+r.height/2]";
        transform.property("ADBE Position").setValue(position);
        return layer;
    }

    // 長文用の段落テキスト。point textと違い、指定幅でAEが自動改行する。
    function addTextBox(comp, name, value, boxSize, size, color, position, fontCandidates, tracking, leading, justification) {
        var layer = comp.layers.addBoxText(boxSize);
        layer.name = name;
        var prop = applyText(layer, value, size, color, fontCandidates, tracking, justification || ParagraphJustification.LEFT_JUSTIFY);
        var doc = prop.value;
        doc.leading = leading || Math.round(size * 1.35);
        doc.autoLeading = false;
        prop.setValue(doc);
        // Box Textの既定Anchorはbox中央になるため、Positionだけを指定すると
        // 左端・上端が画面外へずれる。左上を基準に固定して安全領域を守る。
        var transform = layer.property("ADBE Transform Group");
        transform.property("ADBE Anchor Point").setValue([0, 0]);
        transform.property("ADBE Position").setValue(position);
        try {
            var measured = layer.sourceRectAtTime(0, false);
            if (measured.height > boxSize[1] + 2) logWarning(name + ": テキストがbox高を超える可能性 " + Math.round(measured.height) + "px");
        } catch (measureError) {
            logWarning(name + ": テキスト実測失敗 " + measureError.toString());
        }
        return layer;
    }

    function expressionString(value) {
        return String(value || "").replace(/\\/g, "\\\\").replace(/\"/g, "\\\"").replace(/\r/g, "\\r").replace(/\n/g, "\\n");
    }

    function fadeLayerAt(layer, atFrame, fadeFrames, duration) {
        var opacity = layer.property("ADBE Transform Group").property("ADBE Opacity");
        var t0 = clampTime(timeOfFrame(atFrame), duration);
        var t1 = clampTime(timeOfFrame(atFrame + fadeFrames), duration);
        opacity.setValueAtTime(t0, 0);
        opacity.setValueAtTime(t1, 100);
    }

    function fadeOutLayerAt(layer, atFrame, fadeFrames, duration) {
        var opacity = layer.property("ADBE Transform Group").property("ADBE Opacity");
        var t0 = clampTime(timeOfFrame(atFrame), duration);
        var t1 = clampTime(timeOfFrame(atFrame + fadeFrames), duration);
        opacity.setValueAtTime(t0, 100);
        opacity.setValueAtTime(t1, 0);
    }

    function slideLayerAt(layer, fromPosition, toPosition, atFrame, moveFrames, duration) {
        var position = layer.property("ADBE Transform Group").property("ADBE Position");
        position.setValueAtTime(clampTime(timeOfFrame(atFrame), duration), fromPosition);
        position.setValueAtTime(clampTime(timeOfFrame(atFrame + moveFrames), duration), toPosition);
    }

    function opacityFade(layer, inFrame, outFrame, duration) {
        var opacity = layer.property("ADBE Transform Group").property("ADBE Opacity");
        var inTime = clampTime(timeOfFrame(inFrame), duration);
        var outTime = clampTime(duration - timeOfFrame(outFrame), duration);
        opacity.setValueAtTime(0, 0);
        opacity.setValueAtTime(inTime, 100);
        opacity.setValueAtTime(Math.max(inTime, outTime), 100);
        opacity.setValueAtTime(clampTime(duration, duration), 0);
    }

    function popLayer(layer, atFrame, popFrames, duration) {
        var transform = layer.property("ADBE Transform Group");
        var scale = transform.property("ADBE Scale");
        var opacity = transform.property("ADBE Opacity");
        var t0 = clampTime(timeOfFrame(atFrame), duration);
        var t1 = clampTime(timeOfFrame(atFrame + Math.max(2, Math.floor(popFrames * 0.55))), duration);
        var t2 = clampTime(timeOfFrame(atFrame + popFrames), duration);
        scale.setValueAtTime(t0, [0, 0]);
        scale.setValueAtTime(t1, [112, 112]);
        scale.setValueAtTime(t2, [100, 100]);
        opacity.setValueAtTime(t0, 0);
        opacity.setValueAtTime(Math.min(t2, t0 + 2 * FD), 100);
    }

    function addRectShape(comp, name, size, position, fillColor, roundness, duration) {
        var layer = comp.layers.addShape();
        layer.name = name;
        layer.comment = SIGNATURE;
        var root = layer.property("ADBE Root Vectors Group");
        var group = root.addProperty("ADBE Vector Group");
        group.name = name + "_GROUP";
        var vectors = group.property("ADBE Vectors Group");
        var rect = vectors.addProperty("ADBE Vector Shape - Rect");
        rect.property("ADBE Vector Rect Size").setValue(size);
        rect.property("ADBE Vector Rect Roundness").setValue(roundness || 0);
        var fill = vectors.addProperty("ADBE Vector Graphic - Fill");
        fill.property("ADBE Vector Fill Color").setValue(fillColor);
        var transform = layer.property("ADBE Transform Group");
        transform.property("ADBE Position").setValue(position);
        layer.outPoint = duration || comp.duration;
        return layer;
    }

    function addLineShape(comp, name, values, graph, color, drawFrames, duration) {
        var layer = comp.layers.addShape();
        layer.name = name;
        layer.comment = SIGNATURE;
        var root = layer.property("ADBE Root Vectors Group");
        var group = root.addProperty("ADBE Vector Group");
        group.name = name + "_GROUP";
        var vectors = group.property("ADBE Vectors Group");
        var pathProp = vectors.addProperty("ADBE Vector Shape - Group").property("ADBE Vector Shape");
        var shape = new Shape();
        var vertices = [];
        var tangents = [];
        var i, x, y;
        for (i = 0; i < values.length; i++) {
            x = graph.left + (values.length === 1 ? 0 : i / (values.length - 1)) * graph.width;
            y = graph.top + (1 - Number(values[i])) * graph.height;
            vertices.push([x, y]);
            tangents.push([0, 0]);
        }
        shape.vertices = vertices;
        shape.inTangents = tangents;
        shape.outTangents = tangents;
        shape.closed = false;
        pathProp.setValue(shape);
        var stroke = vectors.addProperty("ADBE Vector Graphic - Stroke");
        stroke.property("ADBE Vector Stroke Color").setValue(color);
        stroke.property("ADBE Vector Stroke Width").setValue(10);
        try { stroke.property("ADBE Vector Stroke Line Cap").setValue(2); } catch (error) {}
        var trim = vectors.addProperty("ADBE Vector Filter - Trim");
        var end = trim.property("ADBE Vector Trim End");
        end.setValueAtTime(timeOfFrame(8), 0);
        end.setValueAtTime(clampTime(timeOfFrame(drawFrames), duration), 100);
        var transform = layer.property("ADBE Transform Group");
        transform.property("ADBE Anchor Point").setValue([0, 0]);
        transform.property("ADBE Position").setValue([0, 0]);
        return {layer: layer, endPoint: vertices[vertices.length - 1]};
    }

    // 任意の線描をShape Layerとして作る。ブランド線画や矢印の共通primitive。
    function addPolylineShape(comp, name, vertices, color, width, startFrame, endFrame, duration) {
        var layer = comp.layers.addShape();
        layer.name = name;
        layer.comment = SIGNATURE;
        var root = layer.property("ADBE Root Vectors Group");
        var group = root.addProperty("ADBE Vector Group");
        var vectors = group.property("ADBE Vectors Group");
        var pathProp = vectors.addProperty("ADBE Vector Shape - Group").property("ADBE Vector Shape");
        var shape = new Shape();
        var tangents = [], i;
        for (i = 0; i < vertices.length; i++) tangents.push([0, 0]);
        shape.vertices = vertices;
        shape.inTangents = tangents;
        shape.outTangents = tangents;
        shape.closed = false;
        pathProp.setValue(shape);
        var stroke = vectors.addProperty("ADBE Vector Graphic - Stroke");
        stroke.property("ADBE Vector Stroke Color").setValue(color);
        stroke.property("ADBE Vector Stroke Width").setValue(width || 4);
        var trim = vectors.addProperty("ADBE Vector Filter - Trim");
        var end = trim.property("ADBE Vector Trim End");
        end.setValueAtTime(clampTime(timeOfFrame(startFrame || 0), duration), 0);
        end.setValueAtTime(clampTime(timeOfFrame(endFrame || 1), duration), 100);
        layer.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([0, 0]);
        layer.property("ADBE Transform Group").property("ADBE Position").setValue([0, 0]);
        return layer;
    }

    function addTrackingAnimator(layer, fromAmount, toAmount, endFrame) {
        try {
            var animators = layer.property("ADBE Text Properties").property("ADBE Text Animators");
            var animator = animators.addProperty("ADBE Text Animator");
            animator.name = "NMF_TRACKING_CONVERGE";
            var props = animator.property("ADBE Text Animator Properties");
            var tracking = props.addProperty("ADBE Text Tracking Amount");
            tracking.setValueAtTime(0, fromAmount);
            tracking.setValueAtTime(timeOfFrame(endFrame), toAmount);
            var selector = animator.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
            selector.property("ADBE Text Percent Start").setValue(0);
            selector.property("ADBE Text Percent End").setValue(100);
        } catch (error) {
            logWarning(layer.name + ": tracking animator失敗 " + error.toString());
        }
    }

    function makeThumbnailComponent(parent, cut, card, index, duration) {
        var size = cut.params.card_size || [1040, 360];
        var comp = app.project.items.addComp("COMPONENT_" + cut.cut + "_THUMB_" + (index + 1), size[0], size[1], 1, duration, FPS);
        comp.parentFolder = parent;
        comp.comment = SIGNATURE + "|role=component|template=" + cut.template_id;
        var accent = hexColor(card.accent || PALETTE.gold);
        addRectShape(comp, "CARD_BG", [size[0] - 18, size[1] - 18], [size[0] / 2, size[1] / 2], hexColor(PALETTE.ink), 18, duration);
        addRectShape(comp, "CARD_ACCENT", [18, size[1] - 18], [24, size[1] / 2], accent, 2, duration);
        addText(comp, "EYEBROW", card.eyebrow || "FICTIONAL", 30, accent, [size[0] / 2, 72], FONTS.NUMBER, 150);
        addTextBox(comp, "HEADLINE", card.headline, [size[0] - 130, 170], 82, hexColor(PALETTE.off_white), [70, 118], FONTS.BOLD, 30, 96, ParagraphJustification.CENTER_JUSTIFY);
        addText(comp, "FICTION_NOTE", "架空サムネイル", 20, accent, [size[0] - 120, size[1] - 34], FONTS.REGULAR, 50);
        return comp;
    }

    function thumbnailStackMaster(cut, parent, componentFolder) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var comp = makeComp(parent, "MG_" + cut.cut + "_" + cut.template_id, duration, "cut|template=" + cut.template_id + "|cut=" + cut.cut);
        addSolid(comp, "BG_INK", hexColor(PALETTE.ink), comp.width, comp.height, [comp.width / 2, comp.height / 2], duration);
        addText(comp, "FICTION_LABEL", "FICTIONAL THUMBNAILS / 架空再現", 22, hexColor(PALETTE.gold), [1510, 1035], FONTS.NUMBER, 100);
        var i, card, cardComp, layer, t, finalStart;
        for (i = 0; i < p.cards.length; i++) {
            card = p.cards[i];
            cardComp = makeThumbnailComponent(componentFolder, cut, card, i, duration);
            layer = comp.layers.add(cardComp);
            layer.name = "THUMB_" + (i + 1) + "_" + card.headline;
            t = layer.property("ADBE Transform Group");
            t.property("ADBE Position").setValue([Number(card.x) * comp.width, Number(card.y) * comp.height]);
            // 2Dレイヤーの回転はローカライズ非依存のMatch Nameを使う。
            // "ADBE Rotation" はAE環境によってnullになるため使用しない。
            t.property("ADBE Rotate Z").setValue(Number(card.rotation || 0));
            popLayer(layer, Number(card.delay || 0), p.pop_frames || 8, duration);
            finalStart = Math.min(cut.duration_frames - 2, Number(p.final_zoom_start || cut.duration_frames - 40));
            t.property("ADBE Scale").setValueAtTime(clampTime(timeOfFrame(finalStart), duration), [100, 100]);
            t.property("ADBE Scale").setValueAtTime(clampTime(duration, duration), [Number(p.final_zoom || 104), Number(p.final_zoom || 104)]);
        }
        addCompMarker(comp, 0, cut.cut + " / 架空サムネのみ。実在ロゴ禁止");
        addCompMarker(comp, duration - FD, "OUT: C02へハードカット");
        created.push(comp.name);
        return comp;
    }

    function cardFocusMaster(cut, parent, componentFolder) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var comp = makeComp(parent, "MG_" + cut.cut + "_" + cut.template_id, duration, "cut|template=" + cut.template_id + "|cut=" + cut.cut);
        addSolid(comp, "BG_INK", hexColor(PALETTE.ink), comp.width, comp.height, [960, 540], duration);
        var i, ghost, opacity;
        for (i = 0; i < 4; i++) {
            ghost = addRectShape(comp, "SURROUNDING_CARD_" + (i + 1), [560, 220], [310 + (i % 2) * 1300, 250 + Math.floor(i / 2) * 560], [0.20, 0.20, 0.20], 16, duration);
            opacity = ghost.property("ADBE Transform Group").property("ADBE Opacity");
            opacity.setValue(Number(p.surrounding_opacity || 16));
        }
        var card = {eyebrow: p.kicker, headline: p.headline, accent: PALETTE.gold};
        var cardComp = makeThumbnailComponent(componentFolder, cut, card, 0, duration);
        var main = comp.layers.add(cardComp);
        main.name = "FOCUS_CARD_REPLACEABLE";
        main.property("ADBE Transform Group").property("ADBE Scale").setValue([112, 112]);
        slideLayerAt(main, [960, -260], [960, 540], 0, p.drop_frames || 18, duration);
        fadeLayerAt(main, 0, 3, duration);
        addText(comp, "MONO_NOTE", "実サムネ差替え後、指定Fでモノクロ化", 22, hexColor(PALETTE.gold), [960, 1015], FONTS.REGULAR, 40);
        addCompMarker(comp, timeOfFrame(p.monochrome_frame || 78), "実サムネ差替え後ここでモノクロ化");
        created.push(comp.name);
        return comp;
    }

    function barWordMaster(cut, parent) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var comp = makeComp(parent, "MG_" + cut.cut + "_" + cut.template_id, duration, "cut|template=" + cut.template_id + "|cut=" + cut.cut);
        var ink = hexColor(PALETTE.ink), paper = hexColor(PALETTE.off_white), gold = hexColor(PALETTE.gold), red = hexColor(PALETTE.vermilion);
        addSolid(comp, "BG_PAPER", paper, comp.width, comp.height, [960, 540], duration);
        addText(comp, "TITLE", p.title, 54, ink, [960, 125], FONTS.BOLD, 70);
        addSolid(comp, "HEADER_RULE", gold, 1460, 4, [960, 190], duration);
        var i, item, y, width, track, bar, label, start, scale;
        for (i = 0; i < p.bars.length; i++) {
            item = p.bars[i];
            y = 350 + i * 210;
            width = 1050 * Math.max(0, Math.min(100, Number(item.value))) / 100;
            track = addRectShape(comp, "BAR_TRACK_" + (i + 1), [1050, 74], [925, y], [0.78, 0.77, 0.74], 8, duration);
            track.property("ADBE Transform Group").property("ADBE Opacity").setValue(30);
            bar = addRectShape(comp, "BAR_FILL_" + (i + 1), [width, 74], [400 + width / 2, y], item.accent ? red : gold, 8, duration);
            bar.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([-width / 2, 0]);
            bar.property("ADBE Transform Group").property("ADBE Position").setValue([400, y]);
            start = 14 + i * Number(p.stagger_frames || 12);
            scale = bar.property("ADBE Transform Group").property("ADBE Scale");
            scale.setValueAtTime(timeOfFrame(start), [0, 100]);
            scale.setValueAtTime(clampTime(timeOfFrame(start + Number(p.draw_frames || 62)), duration), [100, 100]);
            label = addTextBox(comp, "BAR_LABEL_" + (i + 1), item.label, [300, 90], 38, ink, [75, y - 28], FONTS.BOLD, 20, 48, ParagraphJustification.RIGHT_JUSTIFY);
            fadeLayerAt(label, start, 8, duration);
        }
        var note = addText(comp, "DISCLAIMER", p.note, 25, ink, [1540, 1005], FONTS.REGULAR, 30);
        addLayerMarker(note, 0, "conceptual=true / 棒の長さは演出用");
        created.push(comp.name);
        return comp;
    }

    function makeFlowNode(parent, cut, node, index, duration) {
        var comp = app.project.items.addComp("COMPONENT_" + cut.cut + "_NODE_" + (index + 1), 390, 390, 1, duration, FPS);
        comp.parentFolder = parent;
        comp.comment = SIGNATURE + "|role=component|template=" + cut.template_id;
        addRectShape(comp, "NODE_BG", [370, 370], [195, 195], [0.12, 0.12, 0.12], 24, duration);
        addRectShape(comp, "NODE_RULE", [250, 5], [195, 270], hexColor(PALETTE.gold), 1, duration);
        addText(comp, "ICON", node.icon, 88, hexColor(PALETTE.gold), [195, 110], FONTS.NUMBER, 0);
        addText(comp, "LABEL", node.label, 58, hexColor(PALETTE.off_white), [195, 210], FONTS.BOLD, 60);
        addText(comp, "SUB", node.sub, 24, hexColor(PALETTE.gold), [195, 320], FONTS.NUMBER, 140);
        return comp;
    }

    function flowThreeMaster(cut, parent, componentFolder) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var comp = makeComp(parent, "MG_" + cut.cut + "_" + cut.template_id, duration, "cut|template=" + cut.template_id + "|cut=" + cut.cut);
        addSolid(comp, "BG_INK", hexColor(PALETTE.ink), comp.width, comp.height, [960, 540], duration);
        addText(comp, "TITLE", p.title, 48, hexColor(PALETTE.off_white), [960, 115], FONTS.BOLD, 70);
        var xs = [360, 960, 1560];
        var i, nodeComp, layer, arrow, arrowHead, at;
        for (i = 0; i < p.nodes.length; i++) {
            at = Number(p.reveal_frames[i] || i * 30);
            nodeComp = makeFlowNode(componentFolder, cut, p.nodes[i], i, duration);
            layer = comp.layers.add(nodeComp);
            layer.name = "FLOW_NODE_" + (i + 1) + "_" + p.nodes[i].label;
            layer.property("ADBE Transform Group").property("ADBE Position").setValue([xs[i], 490]);
            popLayer(layer, at, 8, duration);
            if (i < p.nodes.length - 1) {
                arrow = addPolylineShape(comp, "CONNECTOR_" + (i + 1), [[xs[i] + 210, 490], [xs[i + 1] - 220, 490]], hexColor(PALETTE.gold), 5, at + 10, at + 26, duration);
                arrowHead = addText(comp, "ARROW_HEAD_" + (i + 1), "›", 72, hexColor(PALETTE.gold), [xs[i + 1] - 205, 488], FONTS.BOLD, 0);
                fadeLayerAt(arrowHead, at + 23, 4, duration);
            }
        }
        var statement = addTextBox(comp, "STATEMENT", p.statement, [1420, 120], 48, hexColor(PALETTE.off_white), [250, 835], FONTS.BOLD, 55, 64, ParagraphJustification.CENTER_JUSTIFY);
        fadeLayerAt(statement, Number(p.statement_frame || 104), 10, duration);
        addCompMarker(comp, 0, cut.cut + " / conceptual flow / 因果を断定しすぎないこと");
        created.push(comp.name);
        return comp;
    }

    function titleMaster(cut, parent) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var comp = makeComp(parent, "MG_" + cut.cut + "_" + cut.template_id, duration, "cut|template=" + cut.template_id + "|cut=" + cut.cut);
        var ink = hexColor(PALETTE.ink), paper = hexColor(PALETTE.off_white), gold = hexColor(PALETTE.gold);
        addSolid(comp, "BG_INK", ink, comp.width, comp.height, [960, 540], duration);
        addSolid(comp, "ACCENT_LINE", gold, 520, 4, [960, 655], duration);
        var series = addText(comp, "SERIES", p.series, 34, gold, [960, 245], FONTS.REGULAR, 140);
        var episode = addText(comp, "EPISODE", p.episode, 32, paper, [960, 320], FONTS.NUMBER, 180);
        var title = addText(comp, "TITLE", p.title, 82, paper, [960, 500], FONTS.BOLD, 100);
        addTrackingAnimator(title, 150, 0, p.intro_frames || 18);
        var subtitle = addText(comp, "SUBTITLE", p.subtitle, 34, paper, [960, 740], FONTS.REGULAR, 40);
        var layers = [series, episode, title, subtitle];
        var i;
        for (i = 0; i < layers.length; i++) opacityFade(layers[i], p.intro_frames || 18, p.outro_frames || 18, duration);
        var scale = title.property("ADBE Transform Group").property("ADBE Scale");
        scale.setValueAtTime(0, [104, 104]);
        scale.setValueAtTime(timeOfFrame(p.intro_frames || 18), [100, 100]);
        addCompMarker(comp, 0, cut.cut + " / " + cut.template_id);
        addCompMarker(comp, duration - FD, "OUT: particle dissolveは将来プリセット差替え");
        created.push(comp.name);
        return comp;
    }

    function researchStatMaster(cut, parent) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var comp = makeComp(parent, "MG_" + cut.cut + "_" + cut.template_id, duration, "cut|template=" + cut.template_id + "|cut=" + cut.cut);
        var ink = hexColor(PALETTE.ink), paper = hexColor(PALETTE.off_white), gold = hexColor(PALETTE.gold);
        addSolid(comp, "BG_PAPER", paper, comp.width, comp.height, [960, 540], duration);
        addSolid(comp, "RULE_TOP", gold, 1460, 5, [960, 175], duration);
        addSolid(comp, "RULE_BOTTOM", ink, 1460, 2, [960, 890], duration);
        var kicker = addText(comp, "KICKER", p.kicker, 32, gold, [960, 125], FONTS.NUMBER, 220);
        var year = addText(comp, "YEAR", p.year, 138, ink, [590, 430], FONTS.NUMBER, 20);
        var value = addText(comp, "VALUE", p.value, 150, ink, [1250, 430], FONTS.BOLD, 20);
        var caption = addText(comp, "CAPTION", p.caption, 46, ink, [960, 690], FONTS.BOLD, 60);
        var footnote = addText(comp, "FOOTNOTE", p.footnote, 27, ink, [960, 955], FONTS.REGULAR, 15);
        var frames = p.sequence_frames || [0, 18, 38];
        popLayer(kicker, frames[0], 8, duration);
        popLayer(year, frames[1], 10, duration);
        popLayer(value, frames[2], 10, duration);
        // Source Text式で「約0万件」→「約12万件」をフレーム単位でカウントする。
        try {
            var valueSource = value.property("ADBE Text Properties").property("ADBE Text Document");
            valueSource.expression = "t0=" + timeOfFrame(frames[2]) + ";t1=" + timeOfFrame(frames[2] + 22) + ";n=Math.round(linear(Math.min(Math.max(time,t0),t1),t0,t1,0," + Number(p.count_to || 12) + "));\"" + expressionString(p.count_prefix) + "\"+n+\"" + expressionString(p.count_suffix) + "\"";
        } catch (countError) {
            logWarning(cut.cut + ": count-up式設定失敗 " + countError.toString());
        }
        opacityFade(caption, frames[2] + 10, 12, duration);
        opacityFade(footnote, frames[2] + 16, 12, duration);
        addCompMarker(comp, 0, cut.cut + " / factual / 出典値の最終確認必須");
        addCompMarker(comp, timeOfFrame(frames[2]), "raw numeric_value=" + p.numeric_value + " / display=" + p.value);
        addLayerMarker(footnote, 0, cut.manual_check);
        created.push(comp.name);
        return comp;
    }

    function lineCompareMaster(cut, parent) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var comp = makeComp(parent, "MG_" + cut.cut + "_" + cut.template_id, duration, "cut|template=" + cut.template_id + "|cut=" + cut.cut);
        var ink = hexColor(PALETTE.ink), paper = hexColor(PALETTE.off_white), gold = hexColor(PALETTE.gold);
        addSolid(comp, "BG_INK", ink, comp.width, comp.height, [960, 540], duration);
        addText(comp, "TITLE", p.title, 48, paper, [960, 130], FONTS.BOLD, 70);
        var graph = {left: 250, top: 245, width: 1320, height: 590};
        addSolid(comp, "AXIS_X", gold, graph.width + 30, 3, [graph.left + graph.width / 2, graph.top + graph.height], duration);
        addSolid(comp, "AXIS_Y", gold, 3, graph.height + 20, [graph.left, graph.top + graph.height / 2], duration);
        var i, result, series, label;
        for (i = 0; i < p.series.length; i++) {
            series = p.series[i];
            result = addLineShape(comp, "SERIES_" + series.label, series.values, graph, hexColor(series.color), p.draw_frames || 82, duration);
            label = addText(comp, "LABEL_" + series.label, series.label, 42, hexColor(series.color), [result.endPoint[0] + 80, result.endPoint[1]], FONTS.BOLD, 30);
            opacityFade(label, p.draw_frames || 82, 10, duration);
        }
        var note = addText(comp, "DISCLAIMER", p.note || "概念図", 26, paper, [1550, 970], FONTS.REGULAR, 30);
        addLayerMarker(note, 0, "conceptual=true / 実測値ではない");
        addCompMarker(comp, 0, cut.cut + " / " + cut.template_id + " / 概念図");
        created.push(comp.name);
        return comp;
    }

    function blackDeclarationMaster(cut, parent) {
        var p = cut.params;
        var key = String(p.reuse_key || "");
        if (key && SHARED_COMPS[key]) {
            addCompMarker(SHARED_COMPS[key], FD, cut.cut + "も同一masterを参照");
            return SHARED_COMPS[key];
        }
        var duration = cut.duration_frames / FPS;
        var comp = makeComp(parent, "MASTER_DECLARATION_" + (key || cut.cut), duration, "shared|template=" + cut.template_id + "|key=" + key);
        addSolid(comp, "BG_TRUE_BLACK", [0, 0, 0], comp.width, comp.height, [960, 540], duration);
        var textLayer = addTextBox(comp, "DECLARATION", p.text, [1500, 260], 84, hexColor(PALETTE.off_white), [210, 410], FONTS.BOLD, Number(p.tracking || 150), 112, ParagraphJustification.CENTER_JUSTIFY);
        var opacity = textLayer.property("ADBE Transform Group").property("ADBE Opacity");
        var fadeFrames = Number(p.fade_frames || 10);
        var fadeOutFrame = Math.min(cut.duration_frames - fadeFrames, Number(p.fade_out_frame || cut.duration_frames - fadeFrames));
        opacity.setValueAtTime(0, 0);
        opacity.setValueAtTime(timeOfFrame(fadeFrames), 100);
        opacity.setValueAtTime(timeOfFrame(fadeOutFrame), 100);
        opacity.setValueAtTime(clampTime(timeOfFrame(fadeOutFrame + fadeFrames), duration), 0);
        addCompMarker(comp, 0, "shared master key=" + key + " / C20とC40は同一CompItem参照");
        if (key) SHARED_COMPS[key] = comp;
        created.push(comp.name);
        return comp;
    }

    function replaceArrowMaster(cut, parent) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var comp = makeComp(parent, "MG_" + cut.cut + "_" + cut.template_id, duration, "cut|template=" + cut.template_id + "|cut=" + cut.cut);
        var ink = hexColor(PALETTE.ink), paper = hexColor(PALETTE.off_white), gold = hexColor(PALETTE.gold), red = hexColor(PALETTE.vermilion);
        addSolid(comp, "BG_PAPER", paper, comp.width, comp.height, [960, 540], duration);
        addText(comp, "KICKER", p.kicker || "BEFORE / AFTER", 28, gold, [960, 125], FONTS.NUMBER, 180);
        var left = addTextBox(comp, "BEFORE_TEXT", p.left, [580, 170], 72, ink, [170, 365], FONTS.BOLD, 60, 92, ParagraphJustification.CENTER_JUSTIFY);
        var right = addTextBox(comp, "AFTER_TEXT", p.right, [580, 170], 78, ink, [1170, 365], FONTS.BOLD, 60, 96, ParagraphJustification.CENTER_JUSTIFY);
        fadeLayerAt(left, 6, 8, duration);
        fadeLayerAt(right, Number(p.reveal_frame || 70), 8, duration);
        addPolylineShape(comp, "STRIKE", [[220, 525], [745, 385]], red, 12, Number(p.strike_frame || 28), Number(p.strike_frame || 28) + 10, duration);
        addPolylineShape(comp, "ARROW_LINE", [[780, 480], [1120, 480]], gold, 8, Number(p.arrow_frame || 48), Number(p.arrow_frame || 48) + 18, duration);
        var head = addText(comp, "ARROW_HEAD", "›", 92, gold, [1125, 475], FONTS.BOLD, 0);
        fadeLayerAt(head, Number(p.arrow_frame || 48) + 15, 3, duration);
        var statement = addTextBox(comp, "STATEMENT", p.statement, [1500, 150], 42, ink, [210, 760], FONTS.REGULAR, 20, 58, ParagraphJustification.CENTER_JUSTIFY);
        fadeLayerAt(statement, Number(p.reveal_frame || 70) + 12, 10, duration);
        created.push(comp.name);
        return comp;
    }

    function interstitialMaster(cut, parent) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var comp = makeComp(parent, "MG_" + cut.cut + "_" + cut.template_id, duration, "cut|template=" + cut.template_id + "|cut=" + cut.cut);
        addSolid(comp, "BG", hexColor(p.background), comp.width, comp.height, [960, 540], duration);
        addSolid(comp, "ACCENT_RULE", hexColor(p.accent || PALETTE.gold), 360, 5, [960, 655], duration);
        var main = addText(comp, "PRIMARY", p.text, 92, hexColor(p.foreground), [960, 500], FONTS.BOLD, 130);
        opacityFade(main, Number(p.fade_frames || 12), Number(p.fade_frames || 12), duration);
        var secondary = addTextBox(comp, "SECONDARY", p.secondary, [1320, 120], 38, hexColor(p.foreground), [300, 735], FONTS.REGULAR, 30, 54, ParagraphJustification.CENTER_JUSTIFY);
        fadeLayerAt(secondary, Number(p.secondary_frame || 54), 10, duration);
        slideLayerAt(secondary, [comp.width + 200, 735], [300, 735], Number(p.secondary_frame || 54), 14, duration);
        created.push(comp.name);
        return comp;
    }

    function darkStatementMaster(cut, parent, componentFolder) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var comp = makeComp(parent, "MG_" + cut.cut + "_" + cut.template_id, duration, "cut|template=" + cut.template_id + "|cut=" + cut.cut);
        addSolid(comp, "BG_DARK", [0.025, 0.028, 0.03], comp.width, comp.height, [960, 540], duration);
        var main = addTextBox(comp, "STATEMENT", p.text, [1500, 220], 88, hexColor(PALETTE.off_white), [210, 390], FONTS.BOLD, 120, 112, ParagraphJustification.CENTER_JUSTIFY);
        opacityFade(main, Number(p.fade_frames || 12), Number(p.fade_frames || 12), duration);
        var caption = addTextBox(comp, "CAPTION", p.caption, [1200, 90], 31, hexColor(PALETTE.gold), [360, 700], FONTS.REGULAR, 40, 44, ParagraphJustification.CENTER_JUSTIFY);
        fadeLayerAt(caption, Number(p.caption_frame || 58), 10, duration);
        if (p.show_price_tag) {
            var tag = makeTagComponent(componentFolder, cut, {label: "市場価値", price: "¥?"}, 0, duration);
            var tagLayer = comp.layers.add(tag);
            tagLayer.name = "PRICE_TAG_TEASER";
            tagLayer.property("ADBE Transform Group").property("ADBE Position").setValue([1510, 820]);
            tagLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([72, 72]);
            popLayer(tagLayer, Number(p.price_tag_frame || 94), 6, duration);
        }
        created.push(comp.name);
        return comp;
    }

    function buildFeedContent(cut, componentFolder) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var contentHeight = Math.max(2100, 160 + p.cards.length * 610);
        var content = app.project.items.addComp("COMPONENT_" + cut.cut + "_FEED_CONTENT", 720, contentHeight, 1, duration, FPS);
        content.parentFolder = componentFolder;
        content.comment = SIGNATURE + "|role=component|template=" + cut.template_id;
        content.time = 0;
        addSolid(content, "CONTENT_BG", hexColor(PALETTE.off_white), 720, contentHeight, [360, contentHeight / 2], duration);
        var header = addText(content, "SERVICE", p.service + "  /  FICTIONAL UI", 28, hexColor(PALETTE.ink), [360, 65], FONTS.NUMBER, 100);
        var i, card, y, bg, brand, headline, body, color;
        for (i = 0; i < p.cards.length; i++) {
            card = p.cards[i];
            y = 390 + i * 610;
            color = hexColor(card.accent || PALETTE.gold);
            bg = addRectShape(content, "CARD_BG_" + (i + 1), [620, 535], [360, y], [0.94, 0.93, 0.90], 26, duration);
            addRectShape(content, "CARD_IMAGE_" + (i + 1), [560, 230], [360, y - 105], [color[0] * 0.35 + 0.12, color[1] * 0.35 + 0.12, color[2] * 0.35 + 0.12], 14, duration);
            brand = addText(content, "BRAND_" + (i + 1), card.brand + "  /  架空ブランド", 25, color, [360, y + 55], FONTS.NUMBER, 100);
            headline = addText(content, "HEADLINE_" + (i + 1), card.headline, 39, hexColor(PALETTE.ink), [360, y + 125], FONTS.BOLD, 25);
            body = addText(content, "BODY_" + (i + 1), card.body, 25, hexColor(PALETTE.ink), [360, y + 190], FONTS.REGULAR, 5);
        }
        return content;
    }

    function feedMaster(cut, cutFolder, componentFolder) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var content = buildFeedContent(cut, componentFolder);
        var viewport = app.project.items.addComp("COMPONENT_" + cut.cut + "_FEED_VIEWPORT", 720, 900, 1, duration, FPS);
        viewport.parentFolder = componentFolder;
        viewport.comment = SIGNATURE + "|role=component|template=" + cut.template_id;
        viewport.time = 0;
        var feedLayer = viewport.layers.add(content);
        feedLayer.name = "FEED_SCROLL";
        feedLayer.property("ADBE Transform Group").property("ADBE Position").setValueAtTime(0, [360, content.height / 2]);
        feedLayer.property("ADBE Transform Group").property("ADBE Position").setValueAtTime(clampTime(timeOfFrame(p.scroll_frames), duration), [360, content.height / 2 - p.scroll_pixels]);

        var comp = makeComp(cutFolder, "MG_" + cut.cut + "_" + cut.template_id, duration, "cut|template=" + cut.template_id + "|cut=" + cut.cut);
        addSolid(comp, "BG_INK", hexColor(PALETTE.ink), comp.width, comp.height, [960, 540], duration);
        addRectShape(comp, "PHONE_FRAME", [780, 980], [960, 540], hexColor(PALETTE.gold), 70, duration);
        addRectShape(comp, "PHONE_INNER", [738, 938], [960, 540], hexColor(PALETTE.ink), 56, duration);
        var viewportLayer = comp.layers.add(viewport);
        viewportLayer.name = "UI_AD_FEED_RENDER";
        viewportLayer.property("ADBE Transform Group").property("ADBE Position").setValue([960, 540]);
        viewportLayer.property("ADBE Transform Group").property("ADBE Scale").setValue([96, 96]);
        addText(comp, "FICTION_LABEL", "FICTIONAL UI / 架空画面", 22, hexColor(PALETTE.gold), [960, 1030], FONTS.NUMBER, 100);
        addCompMarker(comp, 0, cut.cut + " / HTML版とAEフォールバック版を併設");
        addCompMarker(comp, FD, "このAE版はfallback。正本はgenerated/uiの単一HTML");
        addCompMarker(comp, duration - FD, "OUT: 高速スクロール→急停止→セピアは目視調整");
        created.push(comp.name);
        return comp;
    }

    function makeTagComponent(parent, cut, tag, index, duration) {
        var comp = app.project.items.addComp("COMPONENT_" + cut.cut + "_TAG_" + (index + 1), 320, 128, 1, duration, FPS);
        comp.parentFolder = parent;
        comp.comment = SIGNATURE + "|role=component|template=" + cut.template_id;
        comp.time = 0;
        addRectShape(comp, "TAG_BG", [300, 108], [160, 64], hexColor(PALETTE.off_white), 10, duration);
        addRectShape(comp, "TAG_ACCENT", [12, 108], [16, 64], hexColor(PALETTE.vermilion), 2, duration);
        addText(comp, "TAG_LABEL", tag.label, 34, hexColor(PALETTE.ink), [112, 48], FONTS.BOLD, 20);
        addText(comp, "TAG_PRICE", tag.price, 32, hexColor(PALETTE.vermilion), [240, 82], FONTS.NUMBER, 15);
        return comp;
    }

    function priceTagMaster(cut, cutFolder, componentFolder) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var comp = makeComp(cutFolder, "MG_" + cut.cut + "_" + cut.template_id, duration, "cut|template=" + cut.template_id + "|cut=" + cut.cut);
        addSolid(comp, "REPLACE_WITH_ENVATO_FOOTAGE", [0.12, 0.13, 0.13], comp.width, comp.height, [960, 540], duration);
        addText(comp, "FOOTAGE_PLACEHOLDER", p.background_label, 42, hexColor(PALETTE.off_white), [960, 540], FONTS.BOLD, 60);
        addText(comp, "REPLACE_NOTE", "この2レイヤーをEnvato日常実写へ差し替え", 24, hexColor(PALETTE.gold), [960, 600], FONTS.REGULAR, 20);
        var i, tag, tagComp, layer, x, y, delay, opacity;
        for (i = 0; i < p.tags.length; i++) {
            tag = p.tags[i];
            tagComp = makeTagComponent(componentFolder, cut, tag, i, duration);
            layer = comp.layers.add(tagComp);
            layer.name = "PRICE_TAG_" + (i + 1) + "_" + tag.label;
            x = Number(tag.x) * comp.width;
            y = Number(tag.y) * comp.height;
            layer.property("ADBE Transform Group").property("ADBE Position").setValue([x, y]);
            delay = Number(tag.delay || 0);
            popLayer(layer, delay, p.pop_frames || 6, duration);
            opacity = layer.property("ADBE Transform Group").property("ADBE Opacity");
            opacity.setValueAtTime(clampTime(duration - timeOfFrame(10), duration), 100);
            opacity.setValueAtTime(clampTime(duration, duration), 0);
        }
        addCompMarker(comp, 0, cut.cut + " / 実写差替え・顔回避座標を最終確認");
        var avoidCount = p.avoid_regions && p.avoid_regions.length ? p.avoid_regions.length : 0;
        addCompMarker(comp, FD, "placeholder footage / avoid_regions=" + avoidCount + " / tags=" + p.tags.length);
        addLayerMarker(comp.layer("FOOTAGE_PLACEHOLDER"), 0, cut.manual_check);
        created.push(comp.name);
        return comp;
    }

    function ambientListMaster(cut, parent) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var comp = makeComp(parent, "MG_" + cut.cut + "_" + cut.template_id, duration, "cut|template=" + cut.template_id + "|cut=" + cut.cut);
        addSolid(comp, "REPLACE_WITH_AMBIENT_FOOTAGE", [0.08, 0.085, 0.08], comp.width, comp.height, [960, 540], duration);
        var shade = addRectShape(comp, "LEFT_SHADE", [1280, 1080], [640, 540], [0.02, 0.02, 0.02], 0, duration);
        shade.property("ADBE Transform Group").property("ADBE Opacity").setValue(78);
        addText(comp, "REPLACE_NOTE", p.background_label, 22, hexColor(PALETTE.gold), [1520, 1030], FONTS.REGULAR, 35);
        var heads = [], bodies = [], i, item, y, at, head, body, j, op;
        for (i = 0; i < p.items.length; i++) {
            item = p.items[i];
            y = 235 + i * 300;
            at = Number(p.reveal_frames[i] || i * 100);
            addSolid(comp, "DIVIDER_" + (i + 1), hexColor(PALETTE.gold), 980, 3, [680, y + 155], duration);
            head = addTextBox(comp, "ITEM_HEAD_" + (i + 1), item.head, [250, 100], 52, hexColor(PALETTE.gold), [170, y - 35], FONTS.BOLD, 80, 66, ParagraphJustification.LEFT_JUSTIFY);
            body = addTextBox(comp, "ITEM_BODY_" + (i + 1), item.body, [800, 150], 38, hexColor(PALETTE.off_white), [440, y - 48], FONTS.REGULAR, 25, 54, ParagraphJustification.LEFT_JUSTIFY);
            fadeLayerAt(head, at, 12, duration);
            fadeLayerAt(body, at + 4, 12, duration);
            slideLayerAt(head, [140, y - 35], [170, y - 35], at, 12, duration);
            slideLayerAt(body, [410, y - 48], [440, y - 48], at + 4, 12, duration);
            for (j = 0; j < heads.length; j++) {
                op = heads[j].property("ADBE Transform Group").property("ADBE Opacity");
                op.setValueAtTime(timeOfFrame(at), j === heads.length - 1 ? 100 : Number(p.dim_opacity || 32));
                op.setValueAtTime(clampTime(timeOfFrame(at + 8), duration), Number(p.dim_opacity || 32));
                op = bodies[j].property("ADBE Transform Group").property("ADBE Opacity");
                op.setValueAtTime(timeOfFrame(at), j === bodies.length - 1 ? 100 : Number(p.dim_opacity || 32));
                op.setValueAtTime(clampTime(timeOfFrame(at + 8), duration), Number(p.dim_opacity || 32));
            }
            heads.push(head);
            bodies.push(body);
        }
        addCompMarker(comp, 0, cut.cut + " / 背景実写差替え。文字は左安全域内");
        created.push(comp.name);
        return comp;
    }

    function brandLogoMaster(cut, parent) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var comp = makeComp(parent, "MG_" + cut.cut + "_" + cut.template_id, duration, "cut|template=" + cut.template_id + "|cut=" + cut.cut);
        addSolid(comp, "BG_INK", hexColor(PALETTE.ink), comp.width, comp.height, [960, 540], duration);
        var paths = [
            [[170, 220], [520, 220], [650, 360]], [[1750, 220], [1400, 220], [1270, 360]],
            [[150, 820], [480, 820], [640, 690]], [[1770, 820], [1440, 820], [1280, 690]],
            [[300, 120], [300, 360], [500, 500]], [[1620, 120], [1620, 360], [1420, 500]],
            [[300, 960], [300, 720], [500, 580]], [[1620, 960], [1620, 720], [1420, 580]]
        ];
        var i, count = Math.min(Number(p.line_count || 8), paths.length);
        for (i = 0; i < count; i++) addPolylineShape(comp, "ASSEMBLY_LINE_" + (i + 1), paths[i], hexColor(PALETTE.gold), 3, i * 4, Number(p.draw_frames || 70) + i * 3, duration);
        var logo = addTextBox(comp, "BRAND_LOGO", p.series, [1500, 220], 104, hexColor(PALETTE.off_white), [210, 410], FONTS.BOLD, 135, 128, ParagraphJustification.CENTER_JUSTIFY);
        var episode = addText(comp, "EPISODE", p.episode, 30, hexColor(PALETTE.gold), [960, 350], FONTS.NUMBER, 220);
        var subtitle = addTextBox(comp, "SUBTITLE", p.subtitle, [1100, 90], 34, hexColor(PALETTE.off_white), [410, 700], FONTS.REGULAR, 75, 48, ParagraphJustification.CENTER_JUSTIFY);
        fadeLayerAt(logo, Number(p.logo_frame || 54), 18, duration);
        fadeLayerAt(episode, Number(p.logo_frame || 54) + 6, 12, duration);
        fadeLayerAt(subtitle, Number(p.subtitle_frame || 82), 14, duration);
        addCompMarker(comp, 0, "ブランドマスター試作。最終ロゴSVG確定後に差替え");
        created.push(comp.name);
        return comp;
    }

    function nextEpisodeMaster(cut, parent) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var comp = makeComp(parent, "MG_" + cut.cut + "_" + cut.template_id, duration, "cut|template=" + cut.template_id + "|cut=" + cut.cut);
        addSolid(comp, "BG_INK", hexColor(PALETTE.ink), comp.width, comp.height, [960, 540], duration);
        var i, dot, x, y, at, opacity, position;
        for (i = 0; i < Number(p.particle_count || 14); i++) {
            x = 180 + ((i * 347) % 1560);
            y = 130 + ((i * 191) % 820);
            dot = addRectShape(comp, "PARTICLE_" + (i + 1), [4 + (i % 3) * 3, 4 + (i % 3) * 3], [x, y], hexColor(PALETTE.gold), 8, duration);
            at = (i * 7) % 36;
            opacity = dot.property("ADBE Transform Group").property("ADBE Opacity");
            opacity.setValueAtTime(timeOfFrame(at), 8);
            opacity.setValueAtTime(clampTime(timeOfFrame(at + 24), duration), 65);
            opacity.setValueAtTime(clampTime(timeOfFrame(at + 60), duration), 8);
            position = dot.property("ADBE Transform Group").property("ADBE Position");
            position.setValueAtTime(timeOfFrame(at), [x, y]);
            position.setValueAtTime(clampTime(duration, duration), [x + ((i % 2) ? 28 : -24), y - 45 - (i % 4) * 10]);
        }
        var kicker = addText(comp, "KICKER", (p.kicker || "NEXT EPISODE") + "  " + p.next_episode, 30, hexColor(PALETTE.gold), [960, 190], FONTS.NUMBER, 220);
        var title = addTextBox(comp, "NEXT_TITLE", p.title, [1480, 300], 76, hexColor(PALETTE.off_white), [220, 350], FONTS.BOLD, 75, 102, ParagraphJustification.CENTER_JUSTIFY);
        var question = addTextBox(comp, "QUESTION", p.question, [1200, 90], 32, hexColor(PALETTE.off_white), [360, 775], FONTS.REGULAR, 50, 46, ParagraphJustification.CENTER_JUSTIFY);
        opacityFade(kicker, Number(p.fade_frames || 18), Number(p.fade_frames || 18), duration);
        opacityFade(title, Number(p.fade_frames || 18), Number(p.fade_frames || 18), duration);
        fadeLayerAt(question, Number(p.fade_frames || 18) + 28, 12, duration);
        fadeOutLayerAt(question, Math.max(0, cut.duration_frames - 18), 16, duration);
        created.push(comp.name);
        return comp;
    }

    function endCardMaster(cut, parent) {
        var p = cut.params;
        var duration = cut.duration_frames / FPS;
        var comp = makeComp(parent, "MG_" + cut.cut + "_" + cut.template_id, duration, "cut|template=" + cut.template_id + "|cut=" + cut.cut);
        addSolid(comp, "BG_INK", hexColor(PALETTE.ink), comp.width, comp.height, [960, 540], duration);
        var guide = addRectShape(comp, "GUIDE_YOUTUBE_END_SCREEN_RESERVE", [620, 440], [1480, 540], [0.25, 0.20, 0.12], 16, duration);
        guide.property("ADBE Transform Group").property("ADBE Opacity").setValue(18);
        guide.guideLayer = true;
        var i, card, layer, start, nextStart, fadeLength, opacity, size, fontSet;
        for (i = 0; i < p.cards.length; i++) {
            card = p.cards[i];
            start = i * Number(p.hold_frames || 72);
            nextStart = i < p.cards.length - 1 ? (i + 1) * Number(p.hold_frames || 72) : cut.duration_frames - Number(p.end_fade_frames || 24);
            fadeLength = i < p.cards.length - 1 ? Number(p.crossfade_frames || 18) : Number(p.end_fade_frames || 24);
            size = card.kind === "logo" ? 96 : (card.kind === "credit" ? 48 : 58);
            fontSet = card.kind === "credit" || card.kind === "logo" ? FONTS.NUMBER : FONTS.BOLD;
            layer = addTextBox(comp, "END_" + card.kind.toUpperCase(), card.text, [1120, 240], size, hexColor(PALETTE.off_white), [180, 420], fontSet, card.kind === "logo" ? 160 : 40, 112, ParagraphJustification.CENTER_JUSTIFY);
            opacity = layer.property("ADBE Transform Group").property("ADBE Opacity");
            opacity.setValueAtTime(clampTime(timeOfFrame(start), duration), 0);
            opacity.setValueAtTime(clampTime(timeOfFrame(start + Number(p.crossfade_frames || 18)), duration), 100);
            opacity.setValueAtTime(clampTime(timeOfFrame(nextStart), duration), 100);
            opacity.setValueAtTime(clampTime(timeOfFrame(nextStart + fadeLength), duration), 0);
            addCompMarker(comp, timeOfFrame(start), "END CARD: " + card.kind);
        }
        addCompMarker(comp, clampTime(duration - timeOfFrame(Number(p.end_fade_frames || 24)), duration), "音楽フェード開始目安");
        addCompMarker(comp, 0, "右620×440はYouTube終了画面予約領域（Guide Layer）");
        created.push(comp.name);
        return comp;
    }

    // ExtendScript側のdispatcherも1か所に集約し、if文の増殖を避ける。
    var BUILDERS = {
        "AE_CARD_STACK_THUMBNAIL": thumbnailStackMaster,
        "AE_CARD_FOCUS_DROP": cardFocusMaster,
        "AE_TITLE_EPISODE": titleMaster,
        "DATA_BAR_WORD_GROWTH": barWordMaster,
        "DATA_FLOW_THREE_STEP": flowThreeMaster,
        "DATA_RESEARCH_STAT_CARD": researchStatMaster,
        "DATA_LINE_COMPARE_TWO": lineCompareMaster,
        "AE_BLACK_DECLARATION": blackDeclarationMaster,
        "DATA_REPLACE_ARROW_DIAGRAM": replaceArrowMaster,
        "UI_AD_FEED_SCROLL": feedMaster,
        "AE_INTERSTITIAL_SIMPLE": interstitialMaster,
        "AE_DARK_STATEMENT": darkStatementMaster,
        "AE_PRICE_TAG_MULTIPLY": priceTagMaster,
        "AE_LIST_ON_AMBIENT_PLATE": ambientListMaster,
        "AE_BRAND_LOGO_ASSEMBLY": brandLogoMaster,
        "AE_NEXT_EPISODE_TITLE": nextEpisodeMaster,
        "AE_END_CARD_CREDITS": endCardMaster
    };

    function buildCut(cut, cutFolder, componentFolder) {
        var builder = BUILDERS[cut.template_id];
        if (!builder) {
            logWarning(cut.cut + ": 未実装template " + cut.template_id);
            return null;
        }
        return builder(cut, cutFolder, componentFolder);
    }

    var ownedRoot = null;
    var fatalMessage = "";
    app.beginUndoGroup("NANDAROU MG Factory Build");
    try {
        if (!app.project) app.newProject();
        // 前回成功版を残したまま_BUILDINGへ構築し、成功時だけ入れ替える。
        removeAbandonedBuildingRoot();
        ownedRoot = app.project.items.addFolder(ROOT_NAME + "_BUILDING");
        ownedRoot.comment = SIGNATURE + "|building";
        var cutsFolder = folder(ownedRoot, "01_CUTS");
        var components = folder(ownedRoot, "02_COMPONENTS");
        var assets = folder(ownedRoot, "03_ASSETS_REPLACE_ME");
        ASSET_FOLDER = assets;
        var outputs = folder(ownedRoot, "90_OUTPUT");
        var reelDuration = Math.max(1, PROJECT.duration_seconds);
        var timeline = makeComp(outputs, BUILD.reel_prefix + "_MG_TIMELINE_REEL", reelDuration, "output|timeline_reel");
        addSolid(timeline, "MASTER_BG", hexColor(PALETTE.ink), timeline.width, timeline.height, [960, 540], reelDuration);
        var gapFrames = 12;
        var reviewFrames = 1;
        var i, cut;
        for (i = 0; i < PAYLOAD.cuts.length; i++) reviewFrames += PAYLOAD.cuts[i].duration_frames + gapFrames;
        var review = makeComp(outputs, BUILD.reel_prefix + "_MG_REVIEW_REEL", reviewFrames / FPS, "output|packed_review_reel");
        addSolid(review, "MASTER_BG", hexColor(PALETTE.ink), review.width, review.height, [960, 540], review.duration);
        var child, layer, reviewLayer, reviewLabel, inTime, outTime, cutDuration, reviewStart;
        var reviewCursor = 0;
        for (i = 0; i < PAYLOAD.cuts.length; i++) {
            cut = PAYLOAD.cuts[i];
            child = buildCut(cut, cutsFolder, components);
            if (!child) continue;
            inTime = cut.in_frame / FPS;
            outTime = cut.out_frame / FPS;
            cutDuration = cut.duration_frames / FPS;
            layer = timeline.layers.add(child);
            layer.name = cut.cut + "_" + cut.template_id;
            // 再利用プリコンポはローカル0秒基準なので、親TCへstartTimeで移動する。
            layer.startTime = inTime;
            layer.inPoint = inTime;
            layer.outPoint = outTime;
            layer.label = 10;
            addLayerMarker(layer, inTime, cut.manual_check);

            // 元TCの空白を待たず確認できる、カット詰めレビューリール。
            reviewStart = reviewCursor / FPS;
            reviewLayer = review.layers.add(child);
            reviewLayer.name = cut.cut + "_" + cut.template_id;
            reviewLayer.startTime = reviewStart;
            reviewLayer.inPoint = reviewStart;
            reviewLayer.outPoint = reviewStart + cutDuration;
            reviewLayer.label = 10;
            addLayerMarker(reviewLayer, reviewStart, cut.manual_check);
            reviewLabel = addText(review, "REVIEW_LABEL_" + cut.cut, cut.cut + "  /  " + cut.template_id, 22, hexColor(PALETTE.gold), [330, 1038], FONTS.NUMBER, 60);
            reviewLabel.inPoint = reviewStart;
            reviewLabel.outPoint = reviewStart + cutDuration;
            addCompMarker(review, reviewStart, cut.cut + " / " + cut.tc_in + " - " + cut.tc_out);
            reviewCursor += cut.duration_frames + gapFrames;
            placedCount++;
        }
        removeOwnedRoot();
        ownedRoot.name = ROOT_NAME;
        ownedRoot.comment = SIGNATURE;
        review.openInViewer();
    } catch (fatalError) {
        fatalMessage = fatalError.toString() + " line=" + fatalError.line;
        logWarning("処理中断: " + fatalMessage);
        try { if (ownedRoot) ownedRoot.remove(); } catch (cleanupError) { logWarning("失敗後の掃除にも失敗: " + cleanupError.toString()); }
    } finally {
        app.endUndoGroup();
    }
    if (fatalMessage) {
        alert("MG Factory生成失敗\n" + fatalMessage + "\n\n生成途中の専用フォルダは削除しました。\n詳細はJavaScript Consoleを確認してください。");
    } else {
        alert("MG Factory生成完了\n配置カット: " + placedCount + "\n生成コンポ: " + created.length + "\n警告: " + warnings.length + "\n\n" + BUILD.reel_prefix + "_MG_REVIEW_REELを確認してください。\n詳細はJavaScript Consoleへ出力しています。");
    }
}());
'''


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="MG JSONから再利用可能なAE用JSXを生成")
    parser.add_argument("input", type=Path, help="ep01_mg.json")
    parser.add_argument("--output", type=Path, default=Path("mg_factory/generated/generate_mg_factory.jsx"))
    parser.add_argument("--cuts", help="C10,C15 または C10-C16。省略時は全実装済みテンプレート")
    parser.add_argument("--check", action="store_true", help="JSXを書かず対象・型・必須paramを検証")
    return parser.parse_args()


def selected_cut_numbers(specification: str | None) -> set[str] | None:
    if not specification:
        return None
    values: set[str] = set()
    for token in specification.split(","):
        token = token.strip()
        match = CUT_SPEC_RE.fullmatch(token)
        if not match:
            raise ValueError(f"--cuts形式が不正: {token!r}")
        sp, sn, ep, en = match.groups()
        ep, en = ep or sp, en or sn
        if sp.upper() != ep.upper() or int(sn) > int(en):
            raise ValueError(f"--cuts範囲が不正: {token!r}")
        width = max(len(sn), len(en))
        for number in range(int(sn), int(en) + 1):
            values.add(sp.upper() + str(number).zfill(width))
    return values


def validate_payload(payload: Any, cuts_spec: str | None) -> tuple[dict[str, Any], list[str]]:
    if not isinstance(payload, dict) or not isinstance(payload.get("cuts"), list):
        raise ValueError("MG JSONはcuts配列を持つobjectである必要があります")
    required_root = ("project", "palette", "schema_version")
    for name in required_root:
        if name not in payload:
            raise ValueError(f"MG JSONに{name}がありません")
    project = payload["project"]
    if not isinstance(project, dict):
        raise ValueError("MG JSONのprojectはobjectにしてください")
    if (project.get("width"), project.get("height")) != (1920, 1080):
        raise ValueError(f"MG Factory v0.2は1920×1080専用です: {project.get('width')}×{project.get('height')}")
    if not isinstance(payload["palette"], dict):
        raise ValueError("MG JSONのpaletteはobjectにしてください")
    wanted = selected_cut_numbers(cuts_spec)
    warnings: list[str] = []
    selected = []
    seen: set[str] = set()
    for cut in payload["cuts"]:
        if wanted is not None and cut.get("cut") not in wanted:
            continue
        if wanted is None and cut.get("template_id") not in IMPLEMENTED_TEMPLATES:
            continue
        if cut.get("template_id") not in IMPLEMENTED_TEMPLATES:
            warnings.append(f"{cut.get('cut')}: まだMG Factory未実装 {cut.get('template_id')}")
            continue
        if cut.get("cut") in seen:
            warnings.append(f"{cut.get('cut')}: cut番号が重複しています")
            continue
        seen.add(cut.get("cut"))
        cut_warnings = validate_cut(cut)
        if cut_warnings:
            warnings.extend(cut_warnings)
            continue
        selected.append(cut)
    if wanted is not None:
        found = {cut["cut"] for cut in selected}
        for missing in sorted(wanted - found):
            warnings.append(f"{missing}: 実装済み対象として選択できません")
    if warnings:
        raise ValueError("MGデータ検証エラー:\n- " + "\n- ".join(warnings))
    if not selected:
        raise ValueError("生成対象の実装済みカットがありません")
    result = dict(payload)
    result["cuts"] = selected
    result["project"] = dict(payload["project"])
    project_fps = (
        result["project"].get("fps_numerator", 0) / result["project"].get("fps_denominator", 1)
        if result["project"].get("fps_numerator") and result["project"].get("fps_denominator")
        else result["project"]["fps"]
    )
    result["project"]["duration_seconds"] = max(cut["out_frame"] for cut in selected) / project_fps
    episode = re.sub(r"[^A-Za-z0-9_-]+", "_", str(result["project"].get("episode") or "EP"))
    if wanted is None:
        build_id = episode
    else:
        ordered = sorted((cut["cut"] for cut in selected), key=lambda value: (re.sub(r"\d", "", value), int(re.sub(r"\D", "", value) or 0)))
        build_id = episode + "_TEST_" + "_".join(ordered)
    result["build"] = {
        "scope": "full" if wanted is None else "cuts",
        "id": build_id,
        "root_name": "NANDAROU_MG_FACTORY_" + build_id,
        "reel_prefix": build_id,
    }
    return result, warnings


def js_literal(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def main() -> int:
    args = parse_args()
    try:
        payload = json.loads(args.input.read_text(encoding="utf-8"))
        selected, warnings = validate_payload(payload, args.cuts)
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(f"エラー: {exc}", file=sys.stderr)
        return 1
    print("=== MG Factory JSXビルド ===")
    print("対象: " + ", ".join(cut["cut"] + "/" + cut["template_id"] for cut in selected["cuts"]))
    print(f"警告数: {len(warnings)}")
    for warning in warnings:
        print(f"警告: {warning}")
    if args.check:
        print("checkモード: JSXは書き出していません")
        return 0
    jsx = JSX_TEMPLATE.replace("__MG_PAYLOAD__", js_literal(selected), 1)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(jsx, encoding="utf-8-sig")
    print(f"出力: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
