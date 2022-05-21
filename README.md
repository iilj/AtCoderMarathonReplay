AtCoder Marathon Replay
=====

[![Build and Deploy](https://github.com/iilj/AtCoderMarathonReplay/actions/workflows/main.yml/badge.svg)](https://github.com/iilj/AtCoderMarathonReplay/actions/workflows/main.yml)

## 公開先

[AtCoder Marathon Replay](https://iilj.github.io/AtCoderMarathonReplay/)

## 概要

AtCoder で行われたマラソンコンテストにおける順位および得点の推移をグラフに表示します．

[AtCoder Replay \(β\)](https://atcoder-replay.kakira.dev/) がマラソンに対応していなかったので作りました．

### 補足

以下のコンテストの問題に対する各ユーザの最終提出は，プレテスト得点が不明であるため，システムテストの得点に下記の倍率を掛けた値を用いています．
- ~~ahc001: 50 / 1000~~ → [result\_ahc001\.csv](https://www.dropbox.com/s/rqrlprp0zoyi4di/result_ahc001.csv?dl=0) から Provisional Score を取り込みました．
- hokudai-hitachi2020: 16 / 200
- hokudai-hitachi2019-2: 30 / 100
- hokudai-hitachi2019-1: 30 / 100
- hokudai-hitachi2018: 15 / 100
- hokudai-hitachi2017-2: 30 / 150
- hokudai-hitachi2017-1: 30 / 150


## atcoder-marathon-replay-frontend

TypeScript + React 製のフロントエンドです．


### セットアップ

```sh
$ cd atcoder-marathon-replay-frontend
$ yarn
```


### ローカルサーバ起動

```sh
$ cd atcoder-marathon-replay-frontend
$ yarn start
```


### ビルド

atcoder-marathon-replay-frontend/build/ 以下に最適化込みでビルドしたものが吐かれます．

```sh
$ cd atcoder-marathon-replay-frontend
$ yarn build
```


## crawler

Python 製の，コンテスト提出一覧クローラです．かなり適当です．適当に SQLite の DB に情報を突っ込んだり出したりしています．


### セットアップ

```sh
$ cd crawler
$ pip install beautifulsoup4
$ sqlite3 db.db
> .read db_create.sql
```


### クロール

AHC クラスのコンテストの提出一覧をクロールします．

```sh
$ cd crawler
$ python crawl.py
```


### 提出一覧エクスポート

AHC クラスのコンテストの提出一覧を，フロントエンドの public ディレクトリ内に json 形式でエクスポートします．

```sh
$ cd crawler
$ python export.py
```


### パフォーマンス情報エクスポート

コンテストごとの，色境界の順位情報，および順位→パフォーマンスのマッピング情報を，フロントエンドの public ディレクトリ内に json 形式でエクスポートします．

```sh
$ cd crawler
$ python PerformanceExporter.py
```


## 連絡先

- Twitter: [si \(@iiljj\)](https://twitter.com/iiljj)
- GitHub: [iilj \(iilj\)](https://github.com/iilj)
