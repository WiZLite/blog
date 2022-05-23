---
title: WebAssemblyが読み書き出来るようになる記事 〜①環境構築/スタックポインタ編〜
tags: [Wasm]
updated_at: 2022-05-24
---

## きっかけ
最近、WebAssemblyをターゲットにしたコンパイラを作りたいな、と思い鋭意製作中なのですが、パーサーを書いた後あたりから思うように進まない！

https://github.com/WiZLite/wisp

思うに、進まないのは最終的な出力のイメージが足りず、必要な関数やデータが分からなくなるんじゃないかな、と。

ということで、今回からWebAssemblyのテキスト形式を読み書き出来る！ 何ならもうこれでプログラミング出来る（嘘）と言えるようになるまで、Wasmの命令や構文について勉強していきたいと思います！

## 今回勉強すること
WebAssemblyはスタックマシーンで、計算に徹していることもあり比較的シンプルで簡単なほうかと思います。

例えば、２つの32ビット整数を足す関数なら、以下のように、引数２つをスタックに乗せて、`i32.add`を呼べば終了です。
```wasm
(module
  (func (export "addTwo") (param i32 i32) (result i32)
    local.get 0
    local.get 1
    i32.add))
```

しかし、実際のプログラミングでこんな簡単な関数を書くことは殆ど無いでしょう。例えば、以下のRustのコードのように、構造体の参照を引数に関数呼び出しをする場合はどうなっているのでしょうか？
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
この疑問をこの記事で解消します。

今回は、ブラウザ上でテキスト形式を書いて直ぐに動作を試すことが出来る、[wat2wasm demo](https://webassembly.github.io/wabt/demo/wat2wasm/)を使っていきます。

## 既存言語のコンパイラのWasm出力を確かめるのが早い
ドキュメントで情報を探すよりも、実際にコンパイラの出力を見るのが一番早そうです。
今回は、Rustコンパイラを使っていきます。

オンラインでWASMをコンパイルできる環境はあるのですが、出力が古すぎたり、Rustが使えなかったりするので、ローカルのツールを揃えます。

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

```rust
// src/lib.rs
pub struct Point {
  x: f32,
  y: f32
}

#[no_mangle]
#[inline(never)]
pub extern "C" fn magnitude(p: &Point) -> f32 {
  (p.x * p.x + p.y * p.y).sqrt()
}

#[no_mangle]
pub extern "C" fn get_magnitude(x: f32, y: f32) -> f32 {
  magnitude(&Point { x, y })
}
```

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
（出力略）
$ cd 適当なディレクトリ
$ git clone --recursive https://github.com/WebAssembly/wabt.git
$ cd wabt
$ make
...
```
あとはツール類が`wabt/bin`に出力されているので、必要なものをパスが通っているディレクトリに配置しておきます。下準備は完了です。では変換します。

```shell
$ wasm2wat target/wasm32-unknown-unknown/release/hello.wasm
```

結果が標準出力に流れてきます。
```wasm
(module
  (type (;0;) (func (param i32) (result f32)))
  (type (;1;) (func (param f32 f32) (result f32)))
  (func $magnitude (type 0) (param i32) (result f32)
    (local f32)
    local.get 0
    f32.load
    local.tee 1
    local.get 1
    f32.mul
    local.get 0
    f32.load offset=4
    local.tee 1
    local.get 1
    f32.mul
    f32.add
    f32.sqrt)
  (func $get_magnitude (type 1) (param f32 f32) (result f32)
    (local i32)
    global.get $__stack_pointer
    i32.const 16
    i32.sub
    local.tee 2
    global.set $__stack_pointer
    local.get 2
    local.get 1
    f32.store offset=12
    local.get 2
    local.get 0
    f32.store offset=8
    local.get 2
    i32.const 8
    i32.add
    call $magnitude
    local.set 0
    local.get 2
    i32.const 16
    i32.add
    global.set $__stack_pointer
    local.get 0)
  (table (;0;) 1 1 funcref)
  (memory (;0;) 16)
  (global $__stack_pointer (mut i32) (i32.const 1048576))
  (global (;1;) i32 (i32.const 1048576))
  (global (;2;) i32 (i32.const 1048576))
  (export "memory" (memory 0))
  (export "magnitude" (func $magnitude))
  (export "get_magnitude" (func $get_magnitude))
  (export "__data_end" (global 1))
  (export "__heap_base" (global 2)))
```
なるほど。呼び出し側である`$get_magnitude`の中身を見てわかるように、構造体の参照を渡す際は、スタックに配置するのではなく、実際は`f32.store`によって、メモリに書き込んでいることがわかりました。
offsetの指定によって、構造体中のフィールドを指定しているのですね。

読み込み側は、memoryにおける構造体の位置を、`i32`として受け取り、`f32.load`によってロードできると。
```wasm
i32.load（スタックポインタのアドレス）
f32.load ;; xの読み込み
;; または、f32.load offset=4 ;; yの読み込み
```

## 実際に手書きする。
ここまでわかってしまえば、あとは書ければ完全理解です。
[wat2wasm demo](https://webassembly.github.io/wabt/demo/wat2wasm/)　で再現してみましょう。

ちなみに、最初の `memory`に注意です。
(memory 1) の１は、WASMにおける１ページ = 64kB　のことで、最低でも64KBのメモリを要求する、という意味です。

このメモリがないと、f32.load f32.store などのやり取りができず、Wasmのレイヤーでバリデーションエラーとなります。

```wasm
;; WASM
(module
  (memory 1)
  (global $stack (mut i32) (i32.const 0))
  (func $magnitude (param i32) (result f32)
    (local $a f32) ;; 一時変数。なくても良いがわかりやすさのために、変数名をつけておく
    local.get 0 ;; Pointのアドレスをロード
    f32.load ;; Point.x
    local.tee $a ;; a = Point.x（teeなのでスタックはそのまま）
    local.get $a ;; a をもう一つスタックに乗せる
    f32.mul ;; a * a （結果がスタックに乗る）
    local.get 0 ;; Pointのアドレスをロード
    f32.load offset=4 ;; Point.y
    local.tee $a ;; aを使い回す
    local.get $a ;; 同じ
    f32.mul ;; a * a （結果がスタックに乗る）
    f32.add ;; 足す
    f32.sqrt)
  (func (export "getMagnitude") (result f32)
    ;; $stack を線形メモリと考えれば簡単
    global.get $stack
    f32.const 10.0
    f32.store ;; stack[0..4] = 10.0
    global.get $stack
    f32.const 20.0
    f32.store offset=4 ;; stack[4..8] = 20.0 
    global.get $stack
    call $magnitude ;; magnitude(&p) こういうこと
    )
)
```
```js
// JS
const wasmInstance =
      new WebAssembly.Instance(wasmModule, {});
const { getMagnitude } = wasmInstance.exports;
console.log(getMagnitude());
```

√(10 * 10 + 20 * 20) = 22.36067977.. が期待されます。

さて結果や如何に...

![image](https://user-images.githubusercontent.com/7351910/169850820-2c309b6d-e6ff-4919-8a44-6c7376b32f3d.png)

JS LOG
22.360679626464844

正解です！完全理解。

## まとめ
今回は、構造体のポインタ渡しが、WebAssemblyにおいてはどういう表現になるのかを解明しました。

ツールも揃えたので、次回はより中身に集中したいですね。
次回は制御構文に関して見ていければと思っています。

## PS
Githubのリンク貼って気づきましたが、このブログ、OGPの表示にまだ対応指定ないので、映えない！分かりづらい！ということで、そのうち時間のあるときにOGPの表示対応したいな〜と思ったのでした。
