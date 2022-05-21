# Author: iilj

import os
import json
import math
import sqlite3
from sqlite3.dbapi2 import Connection, Cursor
from typing import Dict, List, Optional, Tuple
from lib.AHCInnerRatingRequestResult import AHCInnerRatingRequestResult


def get_users(cur: Cursor, contest: str = 'ahc001') -> List[str]:
    users: List[str] = []
    for row in cur.execute('SELECT DISTINCT user_name '
                           'FROM submissions WHERE contest = ? AND time_unix >= ('
                           '    SELECT start_time_unix FROM contests WHERE contest_slug = ?'
                           ') AND time_unix < ('
                           '    SELECT end_time_unix FROM contests WHERE contest_slug = ?'
                           ')', (contest, contest, contest)):
        user_name: str = row[0]
        if user_name != 'wata_admin':
            users.append(user_name)
    return users


prepared: Dict[float, float] = {}


def perf2ExpectedAcceptedCount(m: float, ratings: List[int]) -> float:
    expectedAcceptedCount: float
    if m in prepared:
        expectedAcceptedCount = prepared[m]
    else:
        expectedAcceptedCount = 0
        for rating in ratings:
            expectedAcceptedCount += 1 / (1 + pow(6, (m - rating) / 400))
        prepared[m] = expectedAcceptedCount
    return expectedAcceptedCount


def perf2Ranking(x: float, ratings: List[int]) -> float:
    return perf2ExpectedAcceptedCount(x, ratings) + 0.5


def get_borders(ratings: List[int]) -> List[float]:
    return [perf2Ranking(perf, ratings) for perf in range(400, 2800+1, 400)]


rank_memo: Dict[float, float] = {}


def get_rated_rank(X: float, ratings: List[int]) -> float:
    if X in rank_memo:
        return rank_memo[X]
    ret: float = 0.5
    for rating in ratings:
        ret += 1.0 / (1.0 + pow(6.0, (X - rating) / 400.0))
    rank_memo[X] = ret
    return ret


def get_inner_perf(rated_rank: int, ratings: List[int]) -> int:
    upper: float = 6144.0
    lower: float = -2048.0
    while upper - lower > 0.5:
        mid: float = (upper + lower) / 2
        if (rated_rank > get_rated_rank(mid, ratings)):
            upper = mid
        else:
            lower = mid
    return round((upper + lower) / 2)


def get_contests(cur: Cursor) -> List[Tuple[str, int, bool]]:
    """コンテスト slng 一覧を返す．

    Args:
        cur (Cursor): [description]

    Returns:
        List[str]: コンテスト slng 一覧
    """
    contests: List[str] = []
    for row in cur.execute('SELECT contest_slug, start_time_unix, rated FROM contests '
                           'ORDER BY end_time_unix ASC, contest_slug ASC'):
        contests.append((row[0], row[1], bool(row[2])))
    return contests


def trace_innter_perf() -> Dict[str, int]:
    """内部レートを計算しながら JSON を出力する．

    Returns:
        Dict[str, int]: ユーザ名→内部レーティング
    """
    # DB 接続
    database: str = 'db.db'
    conn: Connection = sqlite3.connect(database)
    cur: Cursor = conn.cursor()

    # contest_slugs: List[str] = ['ahc001', 'ahc002', 'ahc003', 'ahc004', 'ahc005']
    contests: List[Tuple[str, int, bool]] = get_contests(cur)

    inner_ratings_dict: Dict[str, int] = {}

    for contest_slug, start_time_unix, rated in contests:
        prepared.clear()
        rank_memo.clear()

        users: List[str] = get_users(cur, contest_slug)
        if rated and (contest_slug != 'ahc001'):
            # Center ではない値を使う
            airrr = AHCInnerRatingRequestResult.create_from_request(contest_slug)
            for user_name, inner_rating in airrr.ahc_inner_ratings.items():
                inner_ratings_dict[user_name] = inner_rating

        # この回の参加者の内部レート（Center=1000）をつくる
        inner_ratings: List[int] = []
        for user_name in users:
            if user_name in inner_ratings_dict:
                inner_ratings.append(inner_ratings_dict[user_name])
            else:
                inner_ratings.append(1000)
        inner_ratings.sort()

        # パフォ計算する
        perfs = [get_inner_perf(i+1, inner_ratings) for i in range(len(inner_ratings))]
        borders = get_borders(inner_ratings)
        # AHC001 までのコンテストは，得られた内部パフォーマンスを内部レート的に用いて，
        # 内部パフォーマンスを再計算する
        # https://www.dropbox.com/s/ne358pdixfafppm/AHC_rating.pdf?dl=0
        if start_time_unix <= 1614999600:
            prepared.clear()
            rank_memo.clear()
            borders = get_borders(perfs)
            perfs = [get_inner_perf(i+1, perfs) for i in range(len(perfs))]
        # print(perfs)
        print(f'{contest_slug} -> {borders}')

        # データを JSON に出力する
        data = {
            'borders': borders,
            'perfs': perfs
        }
        with open(f'../atcoder-marathon-replay-frontend/public/perfs/{contest_slug}.json', mode='wt', encoding='utf-8') as f:
            json.dump(data, f, separators=(',', ':'))

    conn.close()
    return inner_ratings_dict


def main() -> None:
    trace_innter_perf()


if __name__ == '__main__':
    main()
