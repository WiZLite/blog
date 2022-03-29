---
created_at: 2022-05-03
updated_at: 2022-05-06
tags: [csharp, Unity]
title: MessagePipe入門 破
---
前回の[MessagePipe入門](https://qiita.com/WiZLite/items/93d36660d09bdbbd43f4)では、初投稿にも関わらず反響をいただけたので、味をしめた私は、続編を書くことを決定しました。
MessagePipeは布教したいですし、こうなったら主要な機能は一通り解説しておきたいですね。
今回は、前回残したEventFactoryと、RequestHandler機能を主にご紹介したいと思います。

## EventFactory
その名の通り、（MessagePipeによる）eventを作るものです。
通常のPub/Subでは、DIにより、型でワイヤリングされていますが、```EventFactory```からイベントの個別のインスタンスを作り出すことが出来ます。

```cs
IDisposablePublisher<int> countPublisher;
public ISubscriber<int> OnCount { get; }

ctor(EventFactory eventFactory) {
    //戻り値がタプルなので、分割代入が便利。
    (countPublisher, OnCount) = eventFactory.CreateEvent<int>();
    //CreateEventAsyncもあります。
}
```

使い方は様々だと思いますが、このような状況であっても、MessagePipeに統一することが可能であるということを覚えておけば良いのではないかな～と思っています。

## Request/Response
これは、Mediatorパターンの実装に有効な機能なようです。

実は筆者、デザインパターンに明るくなく、Mediatorパターンについては知識が浅かったりします。また、GoFデザパタに関しては、実際に必要となる状況に当たり、実装を通して理解した概念に後から名前を付け、他のエンジニアとの会話を楽にするものだと思うぐらいがちょうど良いと思っていますので、Mediatorの説明は他の方におまかせしたいと思います。

とは言え、用途は検討がつきます。
またですが、メッセージアプリを作りたいとしましょう。

まず、MessagePipeにおける```Request/Responce```機能の実装とは、以下のように```IRequestHandler<TMessage,TResponse>```を実装することです。

```cs
public class MessageHandler: IRequestHandler<MessageRequest,MessageResponce> {
    //コンストラクタ
    public MessageHandler(...) {
        ...
        //いろいろなものを使って色々やりたいとする。
        //（ユーザー情報のリポジトリに接続、グループの情報を取得する等...
    }

    MessageResponce IRequestHandler.Invoke(MessageRequest req) {

        if(user.isNantoka) {
            ... //色々
            var responce = ...; //色々あった。
            return response;
        }
        throw new Exception("Somthing wrong has happened");
    }
}
```

次に、MessageをAPIから送るコントローラーが有るとしましょう。
（※妄想フレームワークです）

```cs
public class MessageController: ControllerBase {

    IRequestHandler<MessageRequest, MessageResponse> handler
    //型情報から先程のMessageHandlerのインスタンスを受け取ることが出来る。
    public MessageController(IRequestHandler<MessageRequest,MessageResponse> handler) {
        this.handler = handler;
    }
    [Get]
    public async ValueTask<MessageResponse> SendMessage(MessageRequest req) {
        var response = handler.Invoke(req);
        return response;
    }
}
```

この例は```SendMessage```がコールされたときに、送られたメッセージをハンドリングしてレスポンスを返すというケースで、```MessageHandler```があることにより、API側はそれを呼んで返すだけ、となっています。

メッセージのやり取りを経由するシンプルなサーバーであっても、ユーザー情報や、グループの情報など、多くの依存やビジネスロジックが絡んでくるかと思います。それらを隠蔽しつつ、「リクエストからレスポンス」と単純なインターフェースへ統一出来ることには価値があるのでは思います。なるほど、これがMediatorパターンか（多分違う）

## Request/Response All, Asyncについて
非同期版のAsyncについてはPub/Subの場合とほとんど同じ流れでいけます。名前にAsyncが付き、Requestの戻り値は```ValueTask<TResponse>```になります。

ですが、RequestAllHandlerというものがあり、これについては言及しておいた方が良さそうです。

複数のハンドラを実行したい場合、```I(Async)?RequestAllHandler```としてインスタンスを受け取ることで、DIに登録されているすべてのハンドラを実行することが出来ます。

インターフェースは以下のようになっています。

```cs
public interface IRequestAllHandler<in TRequest, out TResponse>
{
    TResponse[] InvokeAll(TRequest request);
    IEnumerable<TResponse> InvokeAllLazy(TRequest request);
}

public interface IAsyncRequestAllHandler<in TRequest, TResponse>
{
    ValueTask<TResponse[]> InvokeAllAsync(TRequest request, CancellationToken cancellationToken = default);
    ValueTask<TResponse[]> InvokeAllAsync(TRequest request, AsyncPublishStrategy publishStrategy, CancellationToken cancellationToken = default);
    IAsyncEnumerable<TResponse> InvokeAllLazyAsync(TRequest request, CancellationToken cancellationToken = default);
}
```



IRequestHandler自体の実装は変わりませんが、複数のインスタンスが必要なので、以下のようなハンドラもあったとしましょう。


```cs
///送られてきたメッセージを別のサーバーに転送する
public class MessageTransferHandler: IRequestHandler<MessageRequest,MessageResponce> {
    //詳細略
}
```

例の用途はともかくとして、このようなケースはあるはずでしょう。
これらを、使用側で、IRequestAllHandlerとして受けます。

```cs
ctor(IRequestAllHandler<MessageRequest,MessageResponse> handlers) {
    this.handlers = handlers;
}
```

呼び出し箇所で、```InvokeAll```または、```InvokeAllLazy```を呼び出すことが出来ます。Lazyの方はその名の通り遅延実行でforeachで回すまで実行されません｡ちなみにAsyncの方だと、レアキャラの（？）AsyncEnumerableを使うことが出来ます！

```cs
MessageResponse[] responses = handlers.InvokeAll(request);
//or
IEnumerable<MessageResponse> responses = handlers.InvokeAllLazy(request);
```

同じインターフェースの実装を複数DIに登録するパターンに慣れない方もいるかも知れません（私がそうでした）
複数を登録した場合にどうなるのか、気になって調べてみたところ（これはDIの実装に依るのですが）私の知る限りではMSのDIとVContainerは最後に登録されたものが渡されるようです。結果は未定義では無いということですね。RequestAllHandlerに関しては、実行順序はおそらく関知するところでは無いのでしょう。

## Filter
Pub/Subと同様、RequestHandlerにもFilterを挟むことが出来ます｡
文字列のリクエストをすべて反転させてしまうはた迷惑なフィルターなら以下のように作れるでしょう。

```cs
using System.Linq;

public class ReverseStringFilter: RequestHandlerFilter<string,string> {
    public override string Invoke(string request, Func<string,string> next) {
        return string.Concat(request.Reverse());
    }
}
```
Async版。ValueTaskとCancellationTokenが加わる。

```cs
public class AsyncStringReverseFilter : AsyncRequestHandlerFilter<string, string>
{
    public override async ValueTask<string> InvokeAsync(string request, CancellationToken cancellationToken, Func<string, CancellationToken, ValueTask<string>> next)
    {
        return string.Concat(request.Reverse());
    }
}

```
RequestHandlerのFilterは、アトリビュートが基本となります。

```cs
[RequestHandlerFilter(typeof(ReverseStringFilter))]
public class StringMessageHandler: IRequestHandler<string,string> {
    //略
}
```
Asyncの場合は、
```[AsyncRequestHandler]```をつかいます。

今回はここまでです。
MessagePipeの主要な機能として、他にもRedisを使ったPub/Subなどが出来ます！
続編は書く、鴨！です。鴨。 

ここまで読んでいただきありがとうございました。
