---
created_at: 2021-04-29
updated_at: 2021-11-09
tags: ["csharp", "Unity"]
title: MessagePipe入門 序
---
UniTaskやMagicOnionで有名なCysharpの新ライブラリ、[MessagePipe](https://github.com/Cysharp/MessagePipe)を紹介します。（MessagePackじゃありませんよ）

入門と言うほど仰々しいものではありませんが、今回開発に携わらせて頂いた知見を元に、MessagePipelineを紹介していきたいと思います。

## MessagePipe is 何
コンセプトはシンプルなもので、イベントに関するプログラミングを柔軟かつハイパフォーマンスに行うというのが主眼です。
似た機能を持つライブラリとして、[MediatR](https://github.com/jbogard/MediatR/wiki)などが挙げられますが、こちらはDIファースト([DI](https://github.com/modesttree/Zenject#what-is-dependency-injection)を前提に作られており、MS標準の他にもVContainerやZenjectなどに対応している)を掲げており、また他のCysharpライブラリの例に漏れずUnityの対応も厚い、という強みが挙げられます。

そしてパフォーマンスについてですが、GithubのREADMEの最初に示されているように、Subscriberが８つの状態において、C#の素のeventよりも早いという驚異の結果が出ています。
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/289197/9183e8da-5a0d-093b-2186-a710cc8cef9b.png)
柔軟にイベントを扱う方法として、他にもRxなどが挙げられますが、こちらは素のイベントを置き換える勢いでよりカジュアルに使っていけそうですね。

## セットアップ
MessagePipeはDIを前提にして作られているので、使うにはDIコンテナに登録する必要があります。

<details><summary>補足：DIについて</summary>
<div>

（念の為に簡単に説明しておくと、DIは、クラス同士の依存関係を一箇所に集約することで簡潔にし、実装の差し替えを可能にする機能のことです。今回はこれを前提に解説をすすめますが、要望があれば無DIからのハンズオンを記事を書くかもしれません（？）のでコメント欄へお願いします。）

</div></details>


```cs
using MessagePipe;
using Microsoft.Extensions.DependencyInjection;

Host.CreateDefaultBuilder()
    .ConfigureServices((ctx, services) =>
    {
        services.AddMessagePipe(); // AddMessagePipe(options => { }) for configure options
    })
```
以上！これだけです。よくあるサービス登録と違って、これだけであらゆる型の場合をオープンジェネリクスで登録することができます。```ILogger<T>```に近い手法ですね。ちなみにデフォルトではシングルトンで登録されており、optionsで変更することができます。では早速機能を見ていきましょう！
## Pub/Sub
まずは最もシンプルで最も使いそうなPub/Subから。
MessagePipeを使うと、異なるクラス間でイベントを仲介する処理を素のeventよりも柔軟に書くことができます。（同期/非同期、Key付きイベントなど）

例があると分かりやすいので、例えばチャットアプリを作るとしましょう。

```cs
//UIに近いサービスクラス
public class MessageService {

    readonly IPublisher<string> publisher;

    //DIからインスタンスを受け取る
    public MessageService(IPublisher<string> publisher) {
        this.publisher = publisher;
    }

    public void Send(string message) {
        // IPublisher<T>.Publish(T message);
        this.publisher.Publish(message);
    }
}
```
```cs
//例えばMagicOnionのStreamingHubのような、通信の送受信を行うクラス
public class MessageHub: Hub, IDisposable {

    readonly IDisposable disposable;

    //DIからインスタンスを受け取り、イベントハンドラを登録する
    public MessageService(ISubscriber<string> subscriber) {

        var bag = DisposableBag.CreateBuilder();

        //後処理が出来るようSubscriptionを登録しておく
        subscriber.Subscribe(x => BroadcastMessage(x)).AddTo(bag); 

        //Build()でただのIDisposableに変換
        this.disposable = bag.Build();
    }

    void BroadcastMessage(string message) {
        Broadcast("MessageReceive",message);
    }

    void IDisposable.Dispose() {
        disposable.Dispose();
    }
}
```
フレームワーク中立の妄想コードなので、細部には意味はありません！

IPublisher/ISubscriberはDIによって裏で型ごとに繋がっているイメージです。素のeventを使おうとした場合、eventをpublicにして直接参照をしたり、間に仲介役のクラスを使う必要がありクラス同士の結合度合いを高めてしまいますが、MessagePipeでは、DIによって疎結合を保ったまま簡単にクラス間でイベントを渡せるメリットがあります。

もう一つ注目したいのが、```DisposableBag```です。イベントを登録すると、例えば画面遷移したときなどに、必要のなくなったハンドラは解除する場面が多くあります。素のeventであれば、

```cs
messageEvent -= OnMessageReceived;
```
などと、一つずつ解除しなければなりません。また、Subscriberの戻り値自体が```IDisposable```なので、

```cs
    //field
    List<IDisposable> subscriptions = new();
    
    public ctor(...) {
        this.subscriptions.Add(subscriber.Subscribe(x => SomeMethod(x)));
        this.subscriptions.Add(subscriber.Subscribe(x => SomeMethod2(x)));
    }

    IDisposable.Dispose() {
        subscriptions.ForEach(Dispose);
    }
```

などとしてあげることも可能ですが、DisposableBagによって、余計なリストを作らずに、これらを一つにまとめ、一気に解除することが出来るようになるわけです。

## キー付きPub/Sub
これで、MessagePipeを用いて、Messageのイベントのイベントをやり取り出来るようになりましたね。ただ実用を考えると、他にもやるべきことがあります。
例えば、ある種のイベントをサーバーサイドで、ユーザーID毎に空間を分けて（混ざらないように）イベントのやり取りするためには、これでは問題です。

そんな場合でも、僅かな変更で簡単に対応することが出来ます。そう、MessagePipeならね。

それが、２型引数 ```IPublisher<TKey,TMessage>```, ```ISubscriber<TKey,TMessage>```です。
先程のコードに変更を加えてみましょう


```cs
//UIに近いサービスクラス
public class MessageService {

    public Guid ID  {get; set; }

    //(userId, message)を想定
    readonly IPublisher<Guid,string> publisher;
    
    public MessageService(IPublisher<Guid, string> publisher) {
        this.publisher = publisher;
    }

    public void Send(Guid userId, string message) {
        // IPublisher<TKey,TMessage>.Publish(TKey key, TMessage message);
        this.publisher.Publish(userId, message);
    }
}
```
```cs
//例えばMagicOnionのStreamingHubのような、通信の送受信を行うクラス
public class MessageHub: Hub, IDisposable {

    readonly IDisposable disposable;
    
    Guid ID;
    
    public MessageService(ISubscriber<Guid, string> subscriber) {
        var bag = DisposableBag.CreateBuilder();
        
        subscriber.Subscribe(ID, BroadcastMessage).AddTo(bag);

        this.disposable = bag.Build(); //Build()でただのIDisposableに変換
    }

    void BroadcastMessage(string message) {
        //userId == idのユーザーにメッセージを送信
        Broadcast("MessageReceive",message);
    }

    void IDisposable.Dispose() {
        disposable.Dispose();
    }
}
```
このように、```IPublisher```と```ISubscriber```を２型引数バージョンにすることで、キー毎にイベントの伝搬を行えるようになります。
実際にこれを実装しようとすると、結構面倒なことになりますが（実体験）MessagePipeを常用することで、better eventとして、様々な状況にパフォーマンスの心配もなく対応することが出来るようになります。
MessagePipeによるPub/Subの雰囲気はだいぶ掴んで頂けたのではと思いますが、次はもう一つの柔軟性である非同期機能についても見ておきましょう。

## Async Pub/Sub
先程のキー付きPub/Subでユーザー毎のメッセージ送信機能は実現出来るかと思いますが、通信が絡んで来る場合、多くの場合ではレスポンス性を高めるために非同期を使うことになるかと思います。
MessagePipeでは、各```IPublisher```,```ISubscriber```のAsyncバージョンも用意されています。（```IAsyncPublisher```,```IAsyncSubscriber```）

例えば、ネットワークを介してメッセージを送ったあと、成功した場合にロギングをしたいとします。
Async付きのものを使うだけで、イベントハンドラをValueTaskとして非同期に待機することが出来るようになります。

```cs
public async ValueTask Send(Guid userId, string message) {
    // IPublisher<TKey,TMessage>.Publish(TKey key, TMessage message);
    await this.publisher.PublishAsync(userId, message); //待機する
    //すべてのハンドラの終了後にロギングする
    logger.LogDebug("メッセージを送信しました");
}
```
```cs
//MessageService.cs

//ctor
public MessageService(ISubscriber<Guid, string> subscriber) {
    var bag = DisposableBag.CreateBuilder();
    // IAsyncSubscriber<TKey,TMessage>.Subscribe(TKey key, Func<TMessage, CancellationToken ValueTask> handler);
    subscriber.Subscribe(ID, BroadcastMessage).AddTo(bag);
    this.disposable = bag.Build();
}

async ValueTask BroadcastMessage(string message, CancellationToken ct) {
    //userId == idのユーザーにメッセージを送信
    await Broadcast("MessageReceive",message, ct);
}
```
```IAsyncPublisher```は、```IPublisher```と同様、普通のPublishメソッドも生やしており、こちらはFire and forget、つまり待機する必要の無い時にvoidで発行するときに使います。
同期と非同期を併用する場合は、Async Pub/Subに統一してしまうと良いかもしれませんね。

## Filter
I(Async)?Subscriberの```Subscribe```は、引数に```AsyncMessageHandlerFilter<TMessage>[]```型としてフィルターを受け付けています。ここにフィルターを渡すと、ハンドラーの実行<b>前後</b>に、任意の処理を挟むことが出来ます。
例えば、先程のロギング処理は、あのように書くのも良いかもしれませんが、関心を分けるためにフィルターとして挿入するもの有用です。

```cs
//MessageHandlerFilterは、ジェネリクスのままでも、特定の型のフィルターとしても使えます。
public class AsyncLoggingFilter<T> : AsyncMessageHandlerFilter<T>
{
    readonly ILogger<AsyncLoggingFilter<T>> logger;
    //FilterにもDI可能！
    public AsyncLoggingFilter(ILogger<LoggingFilter<T>> logger)
    {
        this.logger = logger;
    }

    public override ValueTask HandleAsync(T message, CancellationToken ct, Func<string, CancellationToken, ValueTask> next)
    {
        try
        {
            //前処理
            logger.LogDebug("メッセージを送信します");
            await next(message, ct); //ハンドラ本体の処理を待機
            //後処理
            logger.LogDebug("メッセージを送信しました");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "error");
        }
    }
}
```

これをSubscribe時に渡すことで、フィルターが有効になります。

```cs
subscriber.Subscribe(handler, new AsyncLoggingFilter<string>());
```
ロギングの場合、個別の場合に登録しなくても動作するのが望ましいと思います。その為に、DIでGlobalに登録すると良いでしょう。

```cs
Host.CreateDefaultBuilder()
    .ConfigureServices((ctx, services) =>
    {
        services.AddMessagePipe(options =>
        {
            //任意のMessageHandlerの実行前後に、AsyncL
            options.AddGlobalMessageHandlerFilter(typeof(AsyncLoggingFilter<string>), -10000 /*優先順位*/);
        });
    });
```
これで任意の```string```型の非同期イベントハンドラの実行前後にロギングするフィルターを登録することが出来ました。

フィルターの登録箇所は、```AddGlobalMessageHandlerFilter<TFilter>```もありますが、オープンジェネリクスを用いる為に、typeofを使った記法をおすすめします。


## 他の機能など
以上でPub/Subに関しては一通り説明出来たかと思います。MessagePipeは他にも、[RequestHandler](https://github.com/Cysharp/MessagePipe#requestresponseall) によって、Mediatorパターンを実装したり、[EventFactory](https://github.com/Cysharp/MessagePipe#eventfactory)によって、型に依らずにグルーピングしたりすることが出来ます。

ここまで読んでいただいてなんですが、
Cysharpの[README](https://github.com/Cysharp/MessagePipe)、@neuecc さんが結構頑張っていらっしゃるので分かりやすいです。情報も更新されていくでしょうし、こちらを読むのをおすすめします。
とは言え、要望や感想などをいただければある程度応えるつもりですのでコメント欄へお願いします。

などと言いつつ、続編を書きました。
[続編](https://qiita.com/WiZLite/items/4b2d1a0ebf6fd433d605)に続く


## 筆者略歴
初めまして。初Qiitaなので挨拶させてください。普段はC#を書いており、UnityやWebの開発をしたりしていますが、最近必要に駆られてTypescriptとReactを若干覚えました（趣味ですがRustも好きです。最近はぼちぼちVulkanと言語処理系の勉強をしてます）
本当は今頃楽しく大学で青春しているはずだったのですが、最大の学びは現場にある。プログラミングは独学第一！という持論がどうしても強く、現在はCysharpでインターンをさせて頂いております。

普段は面倒で記事を書いたりなど発信はほぼしないのですが、今回は鉄を熱いうちに打つ絶好の機会だったので書かせていただきました。

