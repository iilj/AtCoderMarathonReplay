# Author: iilj

import json
import math
import sqlite3
from sqlite3.dbapi2 import Connection, Cursor
from typing import Dict, List

from lib.AHCResultCSV import AHCProvisionalScores


def get_users(cur: Cursor, contest: str = 'ahc001') -> List[str]:
    users: List[str] = []
    for row in cur.execute('SELECT DISTINCT user_name '
                           'FROM submissions WHERE contest = ? AND time_unix >= ('
                           '    SELECT start_time_unix FROM contests WHERE contest_slug = ?'
                           ') AND time_unix < ('
                           '    SELECT end_time_unix FROM contests WHERE contest_slug = ?'
                           ')', (contest, contest, contest)):
        user_name: str = row[0]
        users.append(user_name)
    return users


def toRealRating(correctedRating: float) -> float:
    if correctedRating >= 400:
        return correctedRating
    return 400 * (1 - math.log(400 / correctedRating))


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


def main(contest_slug: str = 'ahc001') -> None:
    # 前回までのレートを読み込む
    scoredict = AHCProvisionalScores('./lib/result_ahc001.csv')

    # 今回の提出者リストを作る
    database: str = 'db.db'
    conn: Connection = sqlite3.connect(database)
    cur: Cursor = conn.cursor()

    users: List[str] = get_users(cur, contest_slug)
    # print(users)
    print(len(users))

    conn.close()

    # 今回の提出者のレート（Center=1200）をつくる
    ratings: List[int] = []
    for user_name in users:
        if user_name in scoredict.entries:
            ratings.append(toRealRating(scoredict.entries[user_name].new_rating_beta))
        else:
            ratings.append(1200)
    # print(ratings)

    # パフォ計算する
    perfs = [get_inner_perf(i+1, ratings) for i in range(len(ratings))]
    borders = get_borders(ratings)
    if contest_slug == 'ahc001':
        prepared.clear()
        rank_memo.clear()
        borders = get_borders(perfs)
        perfs = [get_inner_perf(i+1, perfs) for i in range(len(ratings))]
    # print(perfs)
    # print(borders)

    data = {
        'borders': borders,
        'perfs': perfs
    }

    with open(f'../atcoder-marathon-replay-frontend/public/perfs/{contest_slug}.json', mode='wt', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'))


if __name__ == '__main__':
    main('ahc002')
