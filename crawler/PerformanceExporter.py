# Author: iilj

import os
import json
import math
import sqlite3
from sqlite3.dbapi2 import Connection, Cursor
from typing import Dict, List, Optional

from lib.AHCResultCSV import AHCScoresCSV


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


def toRealRating(correctedRating: float) -> float:
    if correctedRating >= 400:
        return correctedRating
    return 400 * (1 - math.log(400 / correctedRating))


def toInnerRating(realRating: float, comp: int = 1) -> float:
    return realRating + 1200.0 * (math.sqrt(1 - math.pow(0.81, comp)) / (1 - math.pow(0.9, comp)) - 1) / (math.sqrt(19) - 1)


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


def inner_perfs_history_to_innter_rating(inner_perfs_history: List[int]) -> float:
    # ????????????????????????????????????????????????
    numer: float = 0  # ??????
    denom: float = 0  # ??????
    coef: float = 1.0
    for inner_perf in reversed(inner_perfs_history):  # ????????????????????????
        coef *= 0.9
        numer += coef * inner_perf
        denom += coef
    assert (denom > 0)
    inner_rating: float = numer / denom
    return inner_rating


def trace_innter_perf() -> Dict[str, List[int]]:
    """???????????????????????????????????????????????????????????????????????? JSON ??????????????????

    CSV ???????????????????????????????????????

    CSV ?????????????????? DB ???????????????????????????????????????????????????????????????????????????????????????
    ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
    ?????????????????? CSV ??????????????????????????????????????????????????????

    Returns:
        Dict[str, List[int]]: [description]
    """
    # DB ??????
    database: str = 'db.db'
    conn: Connection = sqlite3.connect(database)
    cur: Cursor = conn.cursor()

    contest_slugs: List[str] = ['ahc001', 'ahc002', 'ahc003', 'ahc004', 'ahc005']
    # user_inner_perfs[user_name] := [innter_perf, ...]
    user_inner_perfs: Dict[str, List[int]] = {}

    for contest_slug in contest_slugs:
        prepared.clear()
        rank_memo.clear()
        fn: str = f'./lib/result_{contest_slug}.csv'
        csv: Optional[AHCScoresCSV] = None
        users: List[str]
        if os.path.exists(fn):
            csv = AHCScoresCSV(fn)
            users = [entry.name for entry in csv.entries.values()]
        else:
            users = get_users(cur, contest_slug)

        # ??????????????????????????????????????????Center=1200???????????????
        inner_ratings: List[int] = []
        for user_name in users:
            if user_name in user_inner_perfs:
                inner_ratings.append(inner_perfs_history_to_innter_rating(user_inner_perfs[user_name]))
            else:
                inner_ratings.append(1200)
        inner_ratings.sort()

        # ?????????????????????
        perfs = [get_inner_perf(i+1, inner_ratings) for i in range(len(inner_ratings))]
        borders = get_borders(inner_ratings)
        # AHC001 ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
        # https://www.dropbox.com/s/ne358pdixfafppm/AHC_rating.pdf?dl=0
        if contest_slug == 'ahc001':
            prepared.clear()
            rank_memo.clear()
            borders = get_borders(perfs)
            perfs = [get_inner_perf(i+1, perfs) for i in range(len(perfs))]
        # print(perfs)
        print(borders)

        # ??????????????????????????????????????????
        if csv is not None:
            for entry in csv.entries.values():
                user_name = entry.name
                inner_perf: int = perfs[entry.rank - 1]
                if (not user_name in user_inner_perfs):
                    user_inner_perfs[user_name] = [inner_perf]
                else:
                    user_inner_perfs[user_name].append(inner_perf)

        # ???????????? JSON ???????????????
        data = {
            'borders': borders,
            'perfs': perfs
        }
        with open(f'../atcoder-marathon-replay-frontend/public/perfs/{contest_slug}.json', mode='wt', encoding='utf-8') as f:
            json.dump(data, f, separators=(',', ':'))

    conn.close()
    return user_inner_perfs


def main() -> None:
    trace_innter_perf()


if __name__ == '__main__':
    main()
