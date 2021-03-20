AtCoder Marathon Replay
=====

[![Build and Deploy](https://github.com/iilj/AtCoderMarathonReplay/actions/workflows/main.yml/badge.svg)](https://github.com/iilj/AtCoderMarathonReplay/actions/workflows/main.yml)

## 公開先

[AtCoder Marathon Replay](https://iilj.github.io/AtCoderMarathonReplay/)

## 概要

AtCoder で行われたマラソンコンテストにおける順位および得点の推移をグラフに表示します．

[AtCoder Replay \(β\)](https://atcoder-replay.kakira.dev/) がマラソンに対応していなかったので作りました．

### 補足

- AHC001 は最終提出のプレテスト得点不明につき，各ユーザの最終提出のスコアは，システス結果 * 50 / 1000 を用いています．
- 日立北大2020 は最終提出のプレテスト得点不明につき，各ユーザの最終提出のスコアは，システス結果 * 16 / 200 を用いています．

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

コンテスト中の提出一覧をクロールします．

```sh
$ cd crawler
$ python crawl.py ahc001
```

### 提出一覧エクスポート

フロントエンドの public ディレクトリ内にエクスポートします．

```sh
$ cd crawler
$ python export.py ahc001
```

### コンテスト一覧エクスポート

フロントエンドの public ディレクトリ内にエクスポートします．

```sh
$ cd crawler
$ python export_contests.py
```

## 連絡先

- Twitter: [si \(@iiljj\)](https://twitter.com/iiljj)
- GitHub: [iilj \(iilj\)](https://github.com/iilj)
