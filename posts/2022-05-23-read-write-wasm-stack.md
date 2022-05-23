---
title: WebAssemblyが読み書き出来るようになる記事 〜①スタックポインタ編〜
tags: [Wasm]
---

## きっかけ
最近、WebAssemblyをターゲットにしたコンパイラを作りたいな、と思い、鋭意製作中なのですが、パーサーを書いた後あたりから、思うように進まない！

https://github.com/WiZLite/wisp

思うに、進まないのは、最終的な出力のイメージが足りないから、必要な関数やデータが分からなくなるんじゃないかな、と。

ということで、今回から、WebAssemblyのテキスト形式を、読み書き出来るぜ！ 何ならもうこれでプログラミング出来るわ（嘘）、と思えるようになるまで、Wasmの命令や構文について勉強していきたいと思います！

## 今回勉強すること
WebAssemblyは、スタックマシーンで、計算に徹していることもあり、比較的シンプルで簡単なほうかと思います。

例えば、２つの32ビット整数を足す関数なら、以下のように、引数２つをスタックに乗せて、`i32.add`を呼べば終了です。
```clojure
(module
  (func (export "addTwo") (param i32 i32) (result i32)
    local.get 0
    local.get 1
    i32.add))
```

しかし、実際のプログラミングで、こんな簡単な関数を書くことは殆ど無いでしょう。例えば、以下のRustのコードのように、構造体の参照を使って計算をするためには、どのようにすれば良いのでしょうか？
```rust
pub struct Point {
  x: f32,
  y: f32
}

#[no_mangle]
pub extern "C" fn magnitude(p: &Point) -> f32 {
  (p.x * p.x + p.y * p.y).sqrt()
}
```
この疑問を、この記事で解消します。

今回は、ブラウザ上で、テキスト形式を書いて直ぐに動作を試すことが出来る、[wat2wasm demo](https://webassembly.github.io/wabt/demo/wat2wasm/)を使っていきます。

## 既存言語のコンパイラのWasm出力を確かめるのが早い
ドキュメントで情報を探すよりも、実際にコンパイラの出力を見るのが一番早そうです。
今回は、Rustコンパイラを使っていきます。

まずは、Wasmを出力するための最小構成を用意します。
```
$ rustup target add wasm32-unknown-unknown
$ cargo new hello --lib
```
```toml
# Cargo.toml
[package]
name = "hello"
version = "0.1.0"
edition = "2021"

[dependencies]

[lib]
crate-type = ["cdylib"]
```

これで、以下のコマンドでWasmファイルを出力出来るようになるはずです。
```
$ cargo build --target wasm32-unknown-unknown --release
（出力略）
$ ls target/wasm32-unknown-unknown/release 
build           deps            examples        hello.d         hello.wasm      incremental
```

バイナリのまま読めるならそれで良いのですが、私は読めないので、Wat形式に変換します。
そのためのツールがここにあります。（他にも様々な機能がある）
https://github.com/WebAssembly/wabt

ビルドしてパスを通して使えるようになるのですが、ビルドに必要な依存があったので、インストールしておきます。

Macの場合は以下でインストール出来ます。（brew便利すぎる）
```
$ brew install cmake
$ brew install ninja
```
```
$ cd 適当なディレクトリ
$ git clone https://github.com/WebAssembly/wabt.git
$ cd wabt
$ make
...
CMake Error at CMakeLists.txt:567 (message):
  Can't find third_party/gtest.  Run git submodule update --init, or disable
  with CMake -DBUILD_TESTS=OFF.
```
ここで、エラーが出されます。サブモジュールが必要なようなので、メッセージに従います。
```
$ git submodule update --init, or disable
```


## WIPです
会社のお昼休憩が終わってしまうので、続きを後で書きます。
（完璧じゃなくても直ぐにリリースの精神で、一応公開しておく（本当はデプロイ阻止が面倒なだけ））

## PS
Githubのリンク貼って気づきましたが、このブログ、OGPの表示にまだ対応指定ないので、映えない！分かりづらい！

ということで、そのうち時間のあるときにOGPの表示対応したいな〜と思ったのでした。
