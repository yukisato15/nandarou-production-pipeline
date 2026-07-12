#!/usr/bin/env python3
"""MG JSONから、画面収録可能な決定論的HTML UIプレビューを生成する。"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


HTML_TEMPLATE = r'''<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>__TITLE__</title>
<style>
:root { --ink:#1A1A1A; --paper:#EAE6DF; --gold:#C9A063; --red:#B8352E; }
* { box-sizing:border-box; }
html,body { margin:0; width:100%; height:100%; overflow:hidden; background:#080908; font-family:"Source Han Sans JP","Noto Sans CJK JP","Hiragino Sans",sans-serif; }
#mount { position:fixed; inset:0; overflow:hidden; }
#stage { position:absolute; width:1920px; height:1080px; left:50%; top:50%; transform-origin:center; overflow:hidden; background:var(--ink); color:var(--paper); }
#stage::before { content:""; position:absolute; inset:0; opacity:.12; background-image:linear-gradient(rgba(234,230,223,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(234,230,223,.05) 1px,transparent 1px); background-size:80px 80px; }
.structure-line { position:absolute; background:var(--gold); opacity:.55; }
.structure-line.a { left:170px; top:185px; width:460px; height:2px; }
.structure-line.b { right:170px; bottom:185px; width:460px; height:2px; }
.side-note { position:absolute; left:170px; bottom:150px; font:24px/1.5 ui-monospace,SFMono-Regular,monospace; color:var(--gold); letter-spacing:.12em; }
#phone { position:absolute; left:960px; top:540px; width:760px; height:980px; margin:-490px 0 0 -380px; border:4px solid var(--gold); border-radius:72px; padding:28px 20px; background:#111311; box-shadow:0 30px 100px rgba(0,0,0,.65); transform-origin:center; overflow:hidden; }
#phone::before { content:""; position:absolute; width:180px; height:18px; border-radius:20px; left:50%; top:12px; transform:translateX(-50%); background:var(--gold); opacity:.65; }
#viewport { position:absolute; left:20px; right:20px; top:42px; bottom:24px; border-radius:48px; overflow:hidden; background:var(--paper); color:var(--ink); }
#header { position:absolute; z-index:3; left:0; right:0; top:0; height:82px; display:flex; align-items:center; justify-content:space-between; padding:0 42px; background:#EAE6DF; border-bottom:2px solid rgba(26,26,26,.18); }
#service { font:700 27px/1 ui-monospace,SFMono-Regular,monospace; letter-spacing:.13em; }
.fiction { font-size:20px; color:#6f6b64; letter-spacing:.08em; }
#feed { position:absolute; left:0; right:0; top:82px; padding:24px 30px 140px; will-change:transform; }
.card { position:relative; height:520px; margin:0 0 30px; border:2px solid rgba(26,26,26,.20); border-radius:26px; overflow:hidden; background:#f4f1ea; box-shadow:0 16px 36px rgba(26,26,26,.12); }
.visual { height:240px; margin:24px; border-radius:18px; overflow:hidden; position:relative; background:linear-gradient(145deg,var(--accent),#242724 75%); }
.visual::before,.visual::after { content:""; position:absolute; border:2px solid rgba(234,230,223,.55); border-radius:50%; }
.visual::before { width:280px; height:280px; left:-55px; top:-75px; }
.visual::after { width:160px; height:160px; right:50px; bottom:-70px; }
.visual-grid { position:absolute; inset:0; opacity:.22; background-image:linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px); background-size:38px 38px; }
.copy { padding:0 34px; }
.brand { color:var(--accent); font:700 22px/1.2 ui-monospace,SFMono-Regular,monospace; letter-spacing:.15em; }
.headline { margin:18px 0 12px; font-size:43px; line-height:1.25; font-weight:700; letter-spacing:.04em; }
.bodycopy { font-size:25px; line-height:1.55; color:#4b4945; }
.cta { position:absolute; right:32px; bottom:24px; padding:11px 24px; color:#fff; background:var(--accent); border-radius:999px; font-size:20px; letter-spacing:.06em; }
#sepia { pointer-events:none; position:absolute; inset:0; z-index:6; background:#6d4d29; mix-blend-mode:color; opacity:0; }
#notice { position:absolute; z-index:7; right:34px; top:100px; width:14px; height:14px; background:var(--red); border-radius:50%; box-shadow:0 0 0 8px rgba(184,53,46,.16); }
#controls { position:fixed; z-index:20; left:20px; bottom:20px; display:flex; gap:12px; align-items:center; padding:12px 16px; border-radius:12px; background:rgba(0,0,0,.76); color:#fff; font:14px/1.2 ui-monospace,SFMono-Regular,monospace; }
#controls button { border:1px solid #777; border-radius:8px; background:#222; color:#fff; padding:8px 12px; cursor:pointer; }
body.capture #controls { display:none; }
</style>
</head>
<body>
<div id="mount"><div id="stage">
  <div class="structure-line a"></div><div class="structure-line b"></div>
  <div class="side-note">AD FEED / FICTIONAL<br>STRUCTURE STUDY</div>
  <div id="phone"><div id="viewport">
    <div id="header"><div id="service"></div><div class="fiction">FICTIONAL UI / 架空画面</div></div>
    <div id="feed"></div><div id="notice"></div><div id="sepia"></div>
  </div></div>
</div></div>
<div id="controls"><button id="play">PLAY</button><button id="reset">RESET</button><span id="readout">F 0</span></div>
<script id="mg-data" type="application/json">__DATA__</script>
<script>
(function(){
  "use strict";
  var DATA=JSON.parse(document.getElementById("mg-data").textContent);
  var params=DATA.params, frame=0, playing=false, startedAt=0, startedFrame=0, raf=0;
  var stage=document.getElementById("stage"), phone=document.getElementById("phone"), feed=document.getElementById("feed");
  var sepia=document.getElementById("sepia"), notice=document.getElementById("notice"), readout=document.getElementById("readout");
  var query=new URLSearchParams(location.search);
  if(query.get("capture")==="1") document.body.classList.add("capture");
  document.getElementById("service").textContent=params.service;

  function esc(value){return String(value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  var cards=params.cards.concat(params.cards.slice(0,2));
  feed.innerHTML=cards.map(function(card,index){return '<article class="card" style="--accent:'+esc(card.accent)+'"><div class="visual"><div class="visual-grid"></div></div><div class="copy"><div class="brand">'+esc(card.brand)+' / FICTIONAL</div><div class="headline">'+esc(card.headline)+'</div><div class="bodycopy">'+esc(card.body)+'</div></div><div class="cta">詳しく見る</div></article>';}).join("");

  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function mix(a,b,t){return a+(b-a)*t;}
  function ease(t){t=clamp(t,0,1);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  function segment(f,a,b,va,vb){return mix(va,vb,ease((f-a)/(b-a)));}
  function stateAt(f){
    var d=DATA.durationFrames, y=0;
    if(f<77)y=0;
    else if(f<102)y=segment(f,77,101,0,-550);
    else if(f<155)y=-550;
    else if(f<180)y=segment(f,155,179,-550,-params.scroll_pixels);
    else if(f<d-72)y=-params.scroll_pixels;
    else if(f<d-18)y=segment(f,d-72,d-18,-params.scroll_pixels,-params.scroll_pixels-470);
    else y=-params.scroll_pixels-470+Math.sin((f-(d-18))*Math.PI/7)*4*(1-(f-(d-18))/18);
    return {feedY:y,phoneScale:f<18?mix(1.02,1,ease(f/18)):1,phoneOpacity:f<8?mix(.7,1,f/8):1,sepia:f>d-18?clamp((f-(d-18))/18,0,1):0,notice:f<6?1:0};
  }
  function renderFrame(value){
    frame=clamp(Math.round(value),0,DATA.durationFrames-1);
    var s=stateAt(frame);
    feed.style.transform="translate3d(0,"+s.feedY+"px,0)";
    phone.style.transform="scale("+s.phoneScale+")"; phone.style.opacity=s.phoneOpacity;
    sepia.style.opacity=s.sepia; notice.style.opacity=s.notice;
    readout.textContent="F "+frame+" / "+(frame/DATA.fps).toFixed(3)+"s";
  }
  function tick(now){
    if(!playing)return;
    var elapsed=(now-startedAt)/1000;
    var next=startedFrame+Math.floor(elapsed*DATA.fpsNumerator/DATA.fpsDenominator);
    if(next>=DATA.durationFrames){
      if(query.get("loop")==="1"){startedAt=now;startedFrame=0;next=0;}else{playing=false;next=DATA.durationFrames-1;}
    }
    renderFrame(next); if(playing)raf=requestAnimationFrame(tick);
  }
  function play(){if(playing)return;playing=true;startedFrame=frame;startedAt=performance.now();raf=requestAnimationFrame(tick);document.getElementById("play").textContent="PAUSE";}
  function pause(){playing=false;cancelAnimationFrame(raf);document.getElementById("play").textContent="PLAY";}
  function reset(){pause();renderFrame(0);}
  function fit(){var scale=Math.min(innerWidth/1920,innerHeight/1080);stage.style.transform="translate(-50%,-50%) scale("+scale+")";}
  window.addEventListener("resize",fit); fit(); renderFrame(Number(query.get("frame")||0));
  document.getElementById("play").onclick=function(){playing?pause():play();}; document.getElementById("reset").onclick=reset;
  window.addEventListener("keydown",function(e){if(e.code==="Space"){e.preventDefault();playing?pause():play();}else if(e.key==="ArrowRight"){pause();renderFrame(frame+(e.shiftKey?10:1));}else if(e.key==="ArrowLeft"){pause();renderFrame(frame-(e.shiftKey?10:1));}else if(e.key==="Home"){reset();}else if(e.key.toLowerCase()==="h"){document.body.classList.toggle("capture");}});
  window.MGPreview={play:play,pause:pause,reset:reset,seek:function(seconds){pause();renderFrame(seconds*DATA.fps);},setFrame:function(f){pause();renderFrame(f);},getFrame:function(){return frame;},getState:function(){return stateAt(frame);}};
  if(query.get("autoplay")==="1")play();
}());
</script>
</body></html>
'''


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="MG JSONから単一HTML UIプレビューを生成")
    parser.add_argument("input", type=Path)
    parser.add_argument("--output-dir", type=Path, default=Path("mg_factory/generated/ui"))
    parser.add_argument("--cuts", default="C26", help="カンマ区切り。現在はUI_AD_FEED_SCROLLのみ")
    parser.add_argument("--check", action="store_true")
    return parser.parse_args()


def build_data(payload: dict[str, Any], cut: dict[str, Any]) -> dict[str, Any]:
    project = payload["project"]
    fps_num = project.get("fps_numerator") or round(project["fps"] * 1000)
    fps_den = project.get("fps_denominator") or 1000
    return {
        "schemaVersion": 1,
        "cut": cut["cut"],
        "template": cut["template_id"],
        "width": project["width"],
        "height": project["height"],
        "fps": fps_num / fps_den,
        "fpsNumerator": fps_num,
        "fpsDenominator": fps_den,
        "durationFrames": cut["duration_frames"],
        "palette": payload["palette"],
        "params": cut["params"],
    }


def validate(cut: dict[str, Any]) -> list[str]:
    warnings: list[str] = []
    if cut.get("template_id") != "UI_AD_FEED_SCROLL":
        warnings.append(f"{cut.get('cut')}: HTML renderer未実装 {cut.get('template_id')}")
        return warnings
    cards = cut.get("params", {}).get("cards", [])
    if len(cards) < 3:
        warnings.append(f"{cut['cut']}: cardsは3件以上推奨")
    for index, card in enumerate(cards, 1):
        for key in ("brand", "headline", "body", "accent"):
            if not card.get(key):
                warnings.append(f"{cut['cut']}: card{index}に{key}がありません")
        if not card.get("is_fictional"):
            warnings.append(f"{cut['cut']}: card{index}はis_fictional=true必須")
    return warnings


def main() -> int:
    args = parse_args()
    try:
        payload = json.loads(args.input.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"エラー: {exc}", file=sys.stderr)
        return 1
    wanted = {value.strip().upper() for value in args.cuts.split(",") if value.strip()}
    cuts = [cut for cut in payload.get("cuts", []) if cut.get("cut", "").upper() in wanted]
    if not cuts:
        print("エラー: 対象カットがありません", file=sys.stderr)
        return 1
    all_warnings = [warning for cut in cuts for warning in validate(cut)]
    print("=== HTML UIプレビュー生成 ===")
    print("対象: " + ", ".join(cut["cut"] for cut in cuts))
    print(f"警告数: {len(all_warnings)}")
    for warning in all_warnings:
        print(f"警告: {warning}")
    if args.check:
        print("checkモード: HTMLは書き出していません")
        return 0
    args.output_dir.mkdir(parents=True, exist_ok=True)
    built = 0
    for cut in cuts:
        if cut.get("template_id") != "UI_AD_FEED_SCROLL":
            continue
        data_text = json.dumps(build_data(payload, cut), ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
        html = HTML_TEMPLATE.replace("__TITLE__", f"{cut['cut']} {cut['template_id']}").replace("__DATA__", data_text)
        output = args.output_dir / f"{cut['cut']}_{cut['template_id']}.html"
        output.write_text(html, encoding="utf-8")
        print(f"出力: {output}")
        built += 1
    return 0 if built else 1


if __name__ == "__main__":
    raise SystemExit(main())
