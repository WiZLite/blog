---
title: 読点が多い自分日本語の字句解析
tag: ["自然言語", "Japanese"]
---

こんにちは。今回は珍しく技術以外のことを話します。読点（、）の話です。

お気づきかもしれませんが、私の文章は読点が多いです。

実は結構自覚はしているのですが、どうしても無意識に多くなります。
特に最近はブログを書き始めて、書いた記事を修正する作業の半数が読点消しになっている気がするので、治すモチベーションが上がっています。

さて、まずはGoogle検索！

読点 多い 原因 で調べてみたら、途中で手が止まりました。

<img width="725" alt="image" src="https://user-images.githubusercontent.com/7351910/169946220-ef4301dc-d8c3-4a00-ad02-e8a399efeca9.png">

...思っているよりも世の人々は読点が多いという特徴を気にしているようです。

## 分析方法
自分の文章を見て傾向を分析するのが手っ取り早そうです。

今は意識をしてしまっているので丁度良いサンプルが作れませんが、Gitでブログを管理している人には、それにうってつけの特典がついてきます。コミットログです。

https://github.com/WiZLite/blog/commit/bab7099949a7af8172df92d231dd825553af44f5

最後に書いた記事の修正コミットを見てみます。

8行目。動詞の連用形の後に点を打っていた
<img width="946" alt="image" src="https://user-images.githubusercontent.com/7351910/169948121-fe11bea4-be73-47d3-8609-1a2ad57fcba3.png">

12行目。係助詞の「は」の後に点を打っていた
<img width="738" alt="image" src="https://user-images.githubusercontent.com/7351910/169948329-f221abd3-3a50-4df3-897f-99e8037287e4.png">

14行目。格助詞の「から」の後に点を打っていた
<img width="893" alt="image" src="https://user-images.githubusercontent.com/7351910/169948509-3f235de3-3eff-4855-aac5-6dd40092da05.png">

16,17行目。係助詞の「は」の後に点を打っていた
<img width="671" alt="image" src="https://user-images.githubusercontent.com/7351910/169948653-773b7868-bc05-4079-8b84-c734d955085b.png">

28行目。格助詞の「で」の後と、係助詞の「は」の後に点を打っていた
<img width="1163" alt="image" src="https://user-images.githubusercontent.com/7351910/169948832-a2a6bc24-1329-4c98-98ff-d0ace67ac115.png">

40行目。格助詞の「を」の後に点を打っていた
<img width="218" alt="image" src="https://user-images.githubusercontent.com/7351910/169949137-5f7cc79f-b81c-4fed-a6e1-e483bd57b4ec.png">

### 分析結果
正否は置いておいて、私の場合、助詞の後に読点を打つ傾向が強いようです。

## WIP
書き途中。お昼休みが終わってしまったので今夜書きます。
