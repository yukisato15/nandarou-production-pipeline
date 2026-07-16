#target aftereffects

/*
 * 『なんだろう』解体 S2〜S6テロップ自動配置
 * build_jsx.pyがJSONをこのファイルへ直接埋め込んでいます。
 * 実行: ファイル > スクリプト > スクリプトファイルを実行
 */
(function () {
    var DATA = [{"cut":"C01","part":"P0","tc_in":"00:00:00.000","tc_out":"00:00:10.000","telops":[{"style":"S6","text":"サムネ文言そのもの\r(日本、終わる 等)","motion":"1枚ごとにスケール105→100%のドン付き出現 [maxchar:10]","layout":{"pos":"center","offset":[0,0],"maxchar":10,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C02","part":"P0","tc_in":"00:00:10.000","tc_out":"00:00:16.000","telops":[{"style":"S1","text":"こういうサムネ、つい押してしまったこと、ないでしょうか","motion":"下部字幕フェードイン8F","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C03","part":"P0","tc_in":"00:00:16.000","tc_out":"00:00:22.000","telops":[{"style":"S1","text":"白状すると、この動画のサムネも、同じ手口で作っています","motion":"字幕フェードイン。「同じ手口」のみ字間+100に広げる","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C04","part":"P0","tc_in":"00:00:22.000","tc_out":"00:00:29.000","telops":[{"style":"S1","text":"ぼくは15年、地方のケーブルテレビで、ニュースやドキュメンタリーを撮ってきました","motion":"字幕フェードイン/「15年」は数字だけ先に出す [pos:right] [offset:300,-380]","layout":{"pos":"right","offset":[300,-380],"maxchar":null,"pos_explicit":true,"offset_explicit":true}},{"style":"S5","text":"15年","motion":"自動分割（要確認）: 画面隅に小さく「15年」S5 / 字幕フェードイン/「15年」は数字だけ先に出す [pos:right] [offset:300,-380]","layout":{"pos":"right","offset":[300,-380],"maxchar":null,"pos_explicit":true,"offset_explicit":true}}]},{"cut":"C05","part":"P0","tc_in":"00:00:29.000","tc_out":"00:00:34.000","telops":[{"style":"S1","text":"それで、YouTubeを始めてみて——正直、驚いたんです","motion":"字幕フェードイン。「——」で0.5秒の間に合わせ字幕も2段階表示","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C06","part":"P0","tc_in":"00:00:34.000","tc_out":"00:00:47.000","telops":[{"style":"S2","text":"狂っている、\rとすら思いました。","motion":"★文:画面が一瞬暗転し中央に1文字ずつ2Fずらしでフェードイン。他の文はS1下部字幕 [pos:bottom]","layout":{"pos":"bottom","offset":[0,0],"maxchar":13,"pos_explicit":true,"offset_explicit":false}}]},{"cut":"C07","part":"P0","tc_in":"00:00:47.000","tc_out":"00:00:53.000","telops":[{"style":"S1","text":"地方の小さな局ですら、ここまで不安を煽ったり、炎上で数字を取りにいったりは、しなかったからです","motion":"字幕フェードイン","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C08","part":"P0","tc_in":"00:00:53.000","tc_out":"00:01:00.000","telops":[{"style":"S2","text":"なぜ、\rこうなってしまったんだろう\r。","motion":"中央・1問ずつフェードイン→アウト。字間広め","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C09","part":"P0","tc_in":"00:01:00.000","tc_out":"00:01:06.000","telops":[{"style":"S2","text":"このチャンネルは、\rその記録です。","motion":"★文:中央、ゆっくりフェードイン、3秒保持","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C10","part":"P0","tc_in":"00:01:06.000","tc_out":"00:01:12.000","telops":[{"style":"S2","text":"ぜんぶ、売り物になっていく","motion":"タイトル:字間が広い状態から通常へ収束しつつフェードイン","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}},{"style":"S1","text":"ナレ全文","motion":"自動分割（要確認）: S1字幕でナレ全文 / タイトル:字間が広い状態から通常へ収束しつつフェードイン","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C11","part":"P1","tc_in":"00:01:12.000","tc_out":"00:01:22.000","telops":[{"style":"S2","text":"不安は、\r商品ではありません。\rエサです。","motion":"★文:下1/3中央。「エサです。」だけ2F遅れて出現+金茶#C9A063 [pos:bottom]","layout":{"pos":"bottom","offset":[0,0],"maxchar":13,"pos_explicit":true,"offset_explicit":false}}]},{"cut":"C12","part":"P1","tc_in":"00:01:22.000","tc_out":"00:01:31.000","telops":[{"style":"S1","text":"字幕全文。「伸びます」に合わせグラフ内テロップも同期","motion":"字幕フェード/グラフラベルはカウントアップ","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C13","part":"P1","tc_in":"00:01:31.000","tc_out":"00:01:44.000","telops":[{"style":"S2","text":"売られているのは、\rあなたの「注意」です。","motion":"★文:中央。「注意」のみ金茶+鍵括弧を1.2倍","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C14","part":"P1","tc_in":"00:01:44.000","tc_out":"00:02:04.000","telops":[{"style":"S2","text":"感情は、編集で作れます。","motion":"★文:デモ終了直後に中央、静かにフェード","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}},{"style":"S1","text":"同じ映像です","motion":"自動分割（要確認）: デモ内に「同じ映像です」の小テロップS1 / ★文:デモ終了直後に中央、静かにフェード","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C15","part":"P1","tc_in":"00:02:04.000","tc_out":"00:02:18.000","telops":[{"style":"S5","text":"「MIT 2018」「約\r12万件」を画面主役に","motion":"数字カウントアップ+スタンプ着地 [maxchar:12]","layout":{"pos":"center","offset":[0,0],"maxchar":12,"pos_explicit":false,"offset_explicit":false}},{"style":"S1","text":"併走","motion":"自動分割（要確認）: S1字幕併走 / 数字カウントアップ+スタンプ着地 [maxchar:12]","layout":{"pos":"center","offset":[0,0],"maxchar":12,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C16","part":"P1","tc_in":"00:02:18.000","tc_out":"00:02:32.000","telops":[{"style":"S2","text":"ウソのほうが、速く、\r遠くまで広がっていました。","motion":"★文:グラフ下に固定表示のまま4秒保持","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}},{"style":"S5","text":"ウソ / 本当","motion":"自動分割（要確認）: 線ラベル「ウソ」「本当」S5 / ★文:グラフ下に固定表示のまま4秒保持","layout":{"pos":"center","offset":[0,120],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C17","part":"P1","tc_in":"00:02:32.000","tc_out":"00:02:41.000","telops":[{"style":"S1","text":"字幕全文。「つい」3箇所のみ金茶","motion":"字幕フェード。「つい」は出現を2Fずつ遅らせ律動を作る","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C18","part":"P1","tc_in":"00:02:41.000","tc_out":"00:02:48.000","telops":[{"style":"S2","text":"あなたの弱さでは\rありません。人間の、\r仕様です。","motion":"★文:中央2段。上段→下段の順に3秒かけて","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C19","part":"P1","tc_in":"00:02:48.000","tc_out":"00:02:54.000","telops":[{"style":"S1","text":"字幕全文","motion":"字幕フェード","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C20","part":"P1","tc_in":"00:02:54.000","tc_out":"00:03:03.000","telops":[{"style":"S4","text":"友達は、\rお金で\r買えます。","motion":"黒画面中央に静かにフェードイン、2.5秒保持、フェードアウト","layout":{"pos":"center","offset":[0,0],"maxchar":7,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C21","part":"P1","tc_in":"00:03:03.000","tc_out":"00:03:10.000","telops":[{"style":"S1","text":"字幕全文","motion":"字幕フェード","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C22","part":"P2","tc_in":"00:03:10.000","tc_out":"00:03:22.000","telops":[{"style":"S1","text":"字幕全文","motion":"字幕フェード/年代表記はタイプ風に [pos:right] [offset:300,-380]","layout":{"pos":"right","offset":[300,-380],"maxchar":null,"pos_explicit":true,"offset_explicit":true}},{"style":"S5","text":"1920s NEW YORK","motion":"自動分割（要確認）: 画面隅に小さく「1920s NEW YORK」S5(欧文) / 字幕フェード/年代表記はタイプ風に [pos:right] [offset:300,-380]","layout":{"pos":"right","offset":[300,-380],"maxchar":null,"pos_explicit":true,"offset_explicit":true}}]},{"cut":"C23","part":"P2","tc_in":"00:03:22.000","tc_out":"00:03:31.000","telops":[{"style":"S3","text":"「女性にも、たばこを吸わせたい」。","motion":"引用:中央、鍵括弧大きめ、ゆっくりフェード","layout":{"pos":"center","offset":[0,0],"maxchar":20,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C24","part":"P2","tc_in":"00:03:31.000","tc_out":"00:03:47.000","telops":[{"style":"S3","text":"——これは、「自由のたいまつ」だ、と。","motion":"引用:火の横に静かにフェード、新聞明朝の趣","layout":{"pos":"center","offset":[0,0],"maxchar":20,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C25","part":"P2","tc_in":"00:03:47.000","tc_out":"00:03:54.000","telops":[{"style":"S2","text":"「それを買うと、\rどんな自分になれるか」を\r売る。","motion":"★文:図解と同期して中央下、フェード [pos:bottom]","layout":{"pos":"bottom","offset":[0,0],"maxchar":13,"pos_explicit":true,"offset_explicit":false}}]},{"cut":"C26","part":"P2","tc_in":"00:03:54.000","tc_out":"00:04:10.000","telops":[{"style":"S1","text":"字幕全文。「まったく同じ文法です」のみ金茶","motion":"字幕フェード","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C27","part":"P2","tc_in":"00:04:10.000","tc_out":"00:04:18.000","telops":[{"style":"S5","text":"PROPAGANDA","motion":"タイトル:型押しが光でなぞられるモーション","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}},{"style":"S1","text":"要確認","motion":"自動分割（要確認）: S1字幕 / タイトル:型押しが光でなぞられるモーション","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C28","part":"P2","tc_in":"00:04:18.000","tc_out":"00:04:25.000","telops":[{"style":"S1","text":"字幕全文","motion":"字幕フェード","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C29","part":"P2","tc_in":"00:04:25.000","tc_out":"00:04:36.000","telops":[{"style":"S3","text":"「ウソも、繰り返せば、本当になる」。","motion":"引用:中央。1回表示→一瞬消え→もう1回表示(\"繰り返し\"を画で実装)","layout":{"pos":"center","offset":[0,0],"maxchar":20,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C30","part":"P2","tc_in":"00:04:36.000","tc_out":"00:04:46.000","telops":[{"style":"S2","text":"複雑なことを、\r単純な対立にする。/敵を、\r名指しする。\r/何度も繰り返す。","motion":"3行が上から順にスタンプ的に出現(各1拍)","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C31","part":"P2","tc_in":"00:04:46.000","tc_out":"00:04:56.000","telops":[{"style":"S2","text":"変わったのは、\r「届け方」です。","motion":"★文:変遷の最後(スマホ)に重ねて中央","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C32","part":"P2","tc_in":"00:04:56.000","tc_out":"00:05:08.000","telops":[{"style":"S1","text":"字幕全文","motion":"字幕フェード","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C33","part":"P2","tc_in":"00:05:08.000","tc_out":"00:05:16.000","telops":[{"style":"S2","text":"あなた専用に調整して、\r届けてくる。","motion":"★文:スマホ画面内に表示される演出(画面の中の言葉)","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C34","part":"P2","tc_in":"00:05:16.000","tc_out":"00:05:30.000","telops":[{"style":"S5","text":"「2016」「何千万人分\r」を画面内で強調","motion":"数字スタンプ+字幕フェード [maxchar:12]","layout":{"pos":"center","offset":[0,0],"maxchar":12,"pos_explicit":false,"offset_explicit":false}},{"style":"S1","text":"要確認","motion":"自動分割（要確認）: S1字幕 / 数字スタンプ+字幕フェード [maxchar:12]","layout":{"pos":"center","offset":[0,0],"maxchar":12,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C35","part":"P2","tc_in":"00:05:30.000","tc_out":"00:05:40.000","telops":[{"style":"S1","text":"字幕全文。「不安」「怒り」のみ左右の画面色と同色","motion":"字幕フェード+2語のみ色同期","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C36","part":"P2","tc_in":"00:05:40.000","tc_out":"00:05:56.000","telops":[{"style":"S2","text":"その手口が実際に\r使われたことは、事実です。","motion":"★文:紙面の上に静かに固定表示","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}},{"style":"S5","text":"2018","motion":"自動分割（要確認）: S5「2018」 / ★文:紙面の上に静かに固定表示","layout":{"pos":"center","offset":[0,120],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C37","part":"P2","tc_in":"00:05:56.000","tc_out":"00:06:16.000","telops":[{"style":"S1","text":"字幕全文のみ(装飾一切なし)。文もS1のまま(この区間だけ強調を封印)","motion":"字幕フェードのみ","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C38","part":"P2","tc_in":"00:06:16.000","tc_out":"00:06:26.000","telops":[{"style":"S2","text":"「画面の向こうから、\r一人ひとりに届く動画」","motion":"★文:中央、5秒かけてゆっくり","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C39","part":"P3","tc_in":"00:06:26.000","tc_out":"00:06:36.000","telops":[{"style":"S1","text":"字幕全文","motion":"字幕フェード","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C40","part":"P3","tc_in":"00:06:36.000","tc_out":"00:06:44.000","telops":[{"style":"S4","text":"友達は、\rお金で\r買えます。","motion":"C20と同一モーション(同一性が演出)","layout":{"pos":"center","offset":[0,0],"maxchar":7,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C41","part":"P3","tc_in":"00:06:44.000","tc_out":"00:06:54.000","telops":[{"style":"S1","text":"字幕全文","motion":"字幕フェード","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C42","part":"P3","tc_in":"00:06:54.000","tc_out":"00:06:59.000","telops":[{"style":"S2","text":"笑顔にも、\r値段がついたことが\rあります。","motion":"中央フェード","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C43","part":"P3","tc_in":"00:06:59.000","tc_out":"00:07:12.000","telops":[{"style":"S5","text":"スマイル ¥0","motion":"メニュー:実在の券売機的な無機質さで。★文:静かに中央下 [pos:bottom]","layout":{"pos":"bottom","offset":[0,0],"maxchar":null,"pos_explicit":true,"offset_explicit":false}},{"style":"S2","text":"人の感情が、\r商品として提示されている。","motion":"メニュー:実在の券売機的な無機質さで。★文:静かに中央下 [pos:bottom]","layout":{"pos":"bottom","offset":[0,0],"maxchar":13,"pos_explicit":true,"offset_explicit":false}}]},{"cut":"C44","part":"P3","tc_in":"00:07:12.000","tc_out":"00:07:22.000","telops":[{"style":"S1","text":"字幕全文。「市場価値」のみ鍵括弧を大きく","motion":"字幕フェード","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C45","part":"P3","tc_in":"00:07:22.000","tc_out":"00:07:29.000","telops":[{"style":"S2","text":"人間に、市場価値。","motion":"中央。3秒静止(モーションを止めることがモーション)","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C46","part":"P3","tc_in":"00:07:29.000","tc_out":"00:07:46.000","telops":[{"style":"S2","text":"ぜんぶ、\r売り物になっていくんです。","motion":"★文:値札が消える直前に中央表示→値札と一緒に消える","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C47","part":"P4","tc_in":"00:07:46.000","tc_out":"00:07:52.000","telops":[{"style":"S1","text":"字幕全文","motion":"字幕フェード","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C48","part":"P4","tc_in":"00:07:52.000","tc_out":"00:08:10.000","telops":[{"style":"S2","text":"三行(ひとつ。/ふたつ。\r/みっつ。\r)を画面左に縦積み","motion":"1項ずつフェードイン、既出項は少し暗く残す","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C49","part":"P4","tc_in":"00:08:10.000","tc_out":"00:08:22.000","telops":[{"style":"S1","text":"字幕全文。「怖かったんです」のみわずかに大きく(+4px)","motion":"字幕フェード","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C50","part":"P4","tc_in":"00:08:22.000","tc_out":"00:08:30.000","telops":[{"style":"S2","text":"怖がらなくて済むように、\rすることです。","motion":"★文:中央、ゆっくり","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C51","part":"P4","tc_in":"00:08:30.000","tc_out":"00:08:50.000","telops":[{"style":"S2","text":"たぶん、その感覚のほうが、\r正しい。","motion":"★文:中央、4秒保持。他はS1字幕","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C52","part":"P5","tc_in":"00:08:50.000","tc_out":"00:09:02.000","telops":[{"style":"S2","text":"『なんだろう』解体","motion":"ロゴ:線画の分解図が組み上がってから文字がフェード","layout":{"pos":"center","offset":[0,0],"maxchar":13,"pos_explicit":false,"offset_explicit":false}},{"style":"S1","text":"要確認","motion":"自動分割（要確認）: S1字幕 / ロゴ:線画の分解図が組み上がってから文字がフェード","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C53","part":"P5","tc_in":"00:09:02.000","tc_out":"00:09:16.000","telops":[{"style":"S1","text":"字幕全文。「線引きごと、公開します」のみ金茶","motion":"字幕フェード","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C54","part":"P5","tc_in":"00:09:16.000","tc_out":"00:09:30.000","telops":[{"style":"S4","text":"あなたの怒りは\r、\r誰の収益に\rなっているのか","motion":"黒地中央、静かにフェード、3秒保持","layout":{"pos":"center","offset":[0,0],"maxchar":7,"pos_explicit":false,"offset_explicit":false}}]},{"cut":"C55","part":"P5","tc_in":"00:09:30.000","tc_out":"00:09:45.000","telops":[{"style":"S5","text":"Score: Unsaid Works→ロゴ","motion":"順次フェード(日本語の問いで始まり英語レーベル名で終わる設計)","layout":{"pos":"center","offset":[0,0],"maxchar":null,"pos_explicit":false,"offset_explicit":false}}]}];
    var FPS = 23.976;
    var warnings = [];
    var placed = 0;
    var skipped = 0;

    // フォントのPostScript名はこのFONTSだけを直せば全styleへ反映される。
    var FONTS = {
        EMPHASIS_BOLD: ["SourceHanSans-Bold", "NotoSansCJKjp-Medium"],
        QUOTE_REGULAR: ["ShipporiMincho-Regular"],
        SANS_JP_MEDIUM: ["NotoSansCJKjp-Medium"],
        SANS_JP_HEAVY: ["SourceHanSans-Bold"],
        LATIN_NUMBER: ["Oswald-Regular"]
    };

    var STYLES = {
        S2: {fonts: FONTS.EMPHASIS_BOLD, size: 78, longSize: 64, tracking: 100, color: [0.918, 0.902, 0.875], label: 2},
        S3: {fonts: FONTS.QUOTE_REGULAR, size: 60, tracking: 75, color: [0.918, 0.902, 0.875], label: 10},
        S4: {fonts: FONTS.EMPHASIS_BOLD, size: 84, tracking: 150, color: [0.918, 0.902, 0.875], label: 1},
        S5: {fonts: FONTS.SANS_JP_MEDIUM, digitFonts: FONTS.LATIN_NUMBER, size: 40, digitSize: 120, tracking: 0, color: [1, 1, 1], label: 11},
        S6: {fonts: FONTS.SANS_JP_HEAVY, size: 120, tracking: -50, color: [1, 1, 1], label: 9}
    };

    // タグのpos名を1920x1080上の基準座標へ対応させる。
    var POSITIONS = {
        center: [960, 540],
        left: [480, 540],
        right: [1440, 540],
        top: [960, 300],
        bottom: [960, 780]
    };

    function logWarning(message) {
        warnings.push(message);
        $.writeln("[NANDAROU WARNING] " + message);
    }

    function tcToSeconds(tc) {
        var p = tc.split(":");
        return Number(p[0]) * 3600 + Number(p[1]) * 60 + Number(p[2]);
    }

    function frameTime(frames) {
        return frames / FPS;
    }

    function fontExists(postScriptName) {
        try {
            return app.fonts && app.fonts.getFontsByPostScriptName(postScriptName).length > 0;
        } catch (error) {
            return false;
        }
    }

    function defaultFont() {
        // AE 25.1以降では日本語用システム既定フォントを取得できる。
        try {
            if (app.fonts && app.fonts.getDefaultFontForCTScript && typeof CTScript !== "undefined") {
                return app.fonts.getDefaultFontForCTScript(CTScript.CT_JAPANESE_SCRIPT).postScriptName;
            }
        } catch (error) {}
        return "Helvetica";
    }

    function chooseFont(candidates, context, layerDefaultFont) {
        var i;
        for (i = 0; i < candidates.length; i++) {
            if (fontExists(candidates[i])) return candidates[i];
        }
        var fallback = layerDefaultFont || defaultFont();
        logWarning(context + ": フォントが見つからないため " + fallback + " を使用");
        return fallback;
    }

    function getOrCreateComp() {
        var active = app.project.activeItem;
        var maxOut = 540;
        var i;
        for (i = 0; i < DATA.length; i++) maxOut = Math.max(maxOut, tcToSeconds(DATA[i].tc_out));
        if (active && active instanceof CompItem) {
            if (active.duration < maxOut) {
                logWarning("アクティブコンポ尺を最終TC " + DATA[DATA.length - 1].tc_out + " まで延長しました");
                active.duration = maxOut;
            }
            return active;
        }
        logWarning("アクティブコンポがないためEP01_Telopsを新規作成しました");
        return app.project.items.addComp("EP01_Telops", 1920, 1080, 1, maxOut, FPS);
    }

    function setTemporalEase(property, keyIndex, easeIn, easeOut) {
        try {
            property.setTemporalEaseAtKey(keyIndex, [new KeyframeEase(0, easeIn)], [new KeyframeEase(0, easeOut)]);
        } catch (error) {}
    }

    function addOpacityFade(layer, fadeInFrames, fadeOutFrames) {
        var opacity = layer.property("ADBE Transform Group").property("ADBE Opacity");
        var fadeInEnd = Math.min(layer.outPoint, layer.inPoint + frameTime(fadeInFrames));
        var fadeOutStart = Math.max(fadeInEnd, layer.outPoint - frameTime(fadeOutFrames));
        opacity.setValueAtTime(layer.inPoint, 0);
        opacity.setValueAtTime(fadeInEnd, 100);
        opacity.setValueAtTime(fadeOutStart, 100);
        opacity.setValueAtTime(layer.outPoint, 0);
    }

    function addS2CharacterFade(layer, text) {
        // Animatorの不透明度を0にし、Range SelectorのOffsetを動かして文字単位で開示する。
        var animators = layer.property("ADBE Text Properties").property("ADBE Text Animators");
        var animator = animators.addProperty("ADBE Text Animator");
        animator.name = "S2_2F_Per_Character";
        var props = animator.property("ADBE Text Animator Properties");
        props.addProperty("ADBE Text Opacity").setValue(0);
        var selector = animator.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
        var offset = selector.property("ADBE Text Percent Offset");
        var characterCount = text.replace(/[\r\n]/g, "").length;
        var revealEnd = Math.min(layer.outPoint - frameTime(6), layer.inPoint + Math.max(1, characterCount) * frameTime(2));
        // Offset 0では全文字がOpacity 0の範囲内、100で範囲が文字列の
        // 後方へ抜けるため、左から右へ順番に表示される。
        offset.setValueAtTime(layer.inPoint, 0);
        offset.setValueAtTime(Math.max(layer.inPoint, revealEnd), 100);

        // カット尻6Fはレイヤー全体をフェードアウト。
        var opacity = layer.property("ADBE Transform Group").property("ADBE Opacity");
        opacity.setValueAtTime(Math.max(layer.inPoint, layer.outPoint - frameTime(6)), 100);
        opacity.setValueAtTime(layer.outPoint, 0);
    }

    function addS6Motion(layer) {
        var transform = layer.property("ADBE Transform Group");
        var scale = transform.property("ADBE Scale");
        scale.setValueAtTime(layer.inPoint, [110, 110]);
        scale.setValueAtTime(Math.min(layer.outPoint, layer.inPoint + frameTime(5)), [100, 100]);
        if (scale.numKeys >= 2) setTemporalEase(scale, 2, 75, 75);
        var position = transform.property("ADBE Position");
        position.expression = "time < inPoint + thisComp.frameDuration * 2 ? wiggle(12, 8) : value";
    }

    function addMarker(layer, comment) {
        var marker = new MarkerValue(comment || "（モーション指定なし）");
        layer.property("ADBE Marker").setValueAtTime(layer.inPoint, marker);
    }

    function styleS5Digits(sourceProp, doc, digitFont, digitSize) {
        // AE 2025のCharacterRange APIで数字だけフォントとサイズを変更する。
        var i = 0;
        var start;
        while (i < doc.text.length) {
            if (/[0-9０-９¥￥%％,.]/.test(doc.text.charAt(i))) {
                start = i;
                while (i < doc.text.length && /[0-9０-９¥￥%％,.]/.test(doc.text.charAt(i))) i++;
                try {
                    doc.characterRange(start, i).font = digitFont;
                    doc.characterRange(start, i).fontSize = digitSize;
                } catch (error) {
                    logWarning("S5数字部分の個別書式を適用できませんでした: " + error.toString());
                }
            } else {
                i++;
            }
        }
        sourceProp.setValue(doc);
    }

    function createLayer(comp, item, telop) {
        var cfg = STYLES[telop.style];
        var layer = comp.layers.addText(telop.text);
        var source = layer.property("ADBE Text Properties").property("ADBE Text Document");
        var doc = source.value;
        var layerDefaultFont = doc.font;
        var font = chooseFont(cfg.fonts, item.cut + "_" + telop.style, layerDefaultFont);
        var inTime = tcToSeconds(item.tc_in);
        var outTime = tcToSeconds(item.tc_out);

        doc.resetCharStyle();
        doc.resetParagraphStyle();
        doc.text = telop.text;
        doc.font = font;
        // S2は表示本文が26字を超えたときだけ64pxへ縮小する。
        doc.fontSize = telop.style === "S2" && telop.text.replace(/[\r\n]/g, "").length > 26 ? cfg.longSize : cfg.size;
        doc.fillColor = cfg.color;
        doc.applyFill = true;
        doc.tracking = cfg.tracking;
        doc.justification = ParagraphJustification.CENTER_JUSTIFY;
        if (telop.style === "S6") {
            doc.applyStroke = true;
            doc.strokeColor = [1, 0.843, 0];
            doc.strokeWidth = 6;
            doc.strokeOverFill = false;
        }
        source.setValue(doc);

        if (telop.style === "S5") {
            var digitFont = chooseFont(cfg.digitFonts, item.cut + "_S5数字", layerDefaultFont);
            doc = source.value;
            styleS5Digits(source, doc, digitFont, cfg.digitSize);
        }

        layer.name = item.cut + "_" + telop.style + "_" + telop.text.substring(0, 8).replace(/[\r\n]/g, " ");
        layer.label = cfg.label;
        // startTimeは動かさず、レイヤーの使用区間だけをトリミングする。
        layer.inPoint = inTime;
        layer.outPoint = outTime;
        var basePosition = POSITIONS[telop.layout.pos] || POSITIONS.center;
        layer.property("ADBE Transform Group").property("ADBE Position").setValue([
            basePosition[0] + telop.layout.offset[0],
            basePosition[1] + telop.layout.offset[1]
        ]);
        addMarker(layer, telop.motion);

        if (telop.style === "S2") addS2CharacterFade(layer, telop.text);
        else if (telop.style === "S3") addOpacityFade(layer, 12, 12);
        else if (telop.style === "S4") addOpacityFade(layer, 10, 10);
        else if (telop.style === "S6") addS6Motion(layer);
        // S5は仕様どおり静的配置。カウントアップなどはマーカーを見て手動調整する。

        // 自動改行・縮小はせず、セーフ幅を超えた事実だけを編集者へ知らせる。
        try {
            var bounds = layer.sourceRectAtTime(inTime, false);
            if (bounds.width > 1760) {
                logWarning(layer.name + ": テキスト幅 " + Math.round(bounds.width) + "px が1760pxを超過");
            }
        } catch (measureError) {
            logWarning(layer.name + ": テキスト幅を測定できませんでした: " + measureError.toString());
        }
        return layer;
    }

    app.beginUndoGroup("『なんだろう』テロップ自動配置");
    try {
        if (!app.project) app.newProject();
        var comp = getOrCreateComp();
        var i, j, item, telop;
        for (i = 0; i < DATA.length; i++) {
            item = DATA[i];
            for (j = 0; j < item.telops.length; j++) {
                telop = item.telops[j];
                if (telop.style === "S1") {
                    skipped++;
                    continue;
                }
                if (!STYLES[telop.style]) {
                    skipped++;
                    logWarning(item.cut + ": 未対応style " + telop.style);
                    continue;
                }
                try {
                    createLayer(comp, item, telop);
                    placed++;
                } catch (layerError) {
                    skipped++;
                    logWarning(item.cut + "_" + telop.style + ": 配置失敗: " + layerError.toString());
                }
            }
        }
    } catch (fatalError) {
        logWarning("処理中断: " + fatalError.toString());
    } finally {
        app.endUndoGroup();
    }
    alert("テロップ配置完了\n配置: " + placed + "レイヤー\nスキップ: " + skipped + "件\n警告: " + warnings.length + "件\n\n詳細は JavaScript Console を確認してください。");
}());
