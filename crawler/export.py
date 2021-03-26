# Author: iilj

import sys
import json
import sqlite3
from sqlite3.dbapi2 import Connection, Cursor
from typing import Dict, List, Set, Tuple, Union
from lib.AHCResultCSV import AHCProvisionalScores


score_fix_ratio: Dict[str, Dict[str, float]] = {
    # 'ahc001': {
    #     'ahc001_a': 50 / 1000
    # },
    'hokudai-hitachi2020': {
        'hokudai_hitachi2020_a': 16 / 200,
        'hokudai_hitachi2020_b': 16 / 200,
    },
    'hokudai-hitachi2019-2': {
        'hokudai_hitachi2019_2_a': 30 / 100
    },
    'hokudai-hitachi2019-1': {
        'hokudai_hitachi2019_1_a': 30 / 100,
        'hokudai_hitachi2019_1_b': 30 / 100,
    },
    'hokudai-hitachi2018': {
        'hokudai_hitachi2018_a': 15 / 100,
        'hokudai_hitachi2018_b': 15 / 100,
        'hokudai_hitachi2018_c': 15 / 100,
    },
    'hokudai-hitachi2017-2': {
        'hitachi2017_2_a': 30 / 150
    },
    'hokudai-hitachi2017-1': {
        'hitachi2017_1_a': 30 / 150
    }
}


def export_submissions(cur: Cursor, contest: str = 'ahc001') -> None:
    data: List[Dict[str, Union[str, int, float]]] = []
    user_last_submission_id_map: Dict[Tuple[str, str], int] = {}  # [user_name, task] => submission_id
    for row in cur.execute('SELECT submission_id, task, time_unix, user_name, score, status, magnification '
                           'FROM submissions WHERE contest = ? AND time_unix >= ('
                           '    SELECT start_time_unix FROM contests WHERE contest_slug = ?'
                           ') AND time_unix < ('
                           '    SELECT end_time_unix FROM contests WHERE contest_slug = ?'
                           ')'
                           'ORDER BY submission_id ASC', (contest, contest, contest)):
        submission_id: int = row[0]
        task: str = row[1]
        user_name: str = row[3]
        data.append({
            'submission_id': submission_id,
            'task': task,
            'time_unix': row[2],
            'user_name': user_name,
            'score': row[4] if row[6] == 1 else row[4] / row[6],
            'status': row[5]
        })
        key: Tuple[str, str] = (user_name, task)
        if not (key in user_last_submission_id_map):
            user_last_submission_id_map[key] = submission_id
        else:
            if submission_id > user_last_submission_id_map[key]:
                user_last_submission_id_map[key] = submission_id
    last_submission_id_set: Set[int] = set(user_last_submission_id_map.values())
    # for ahc001
    if contest == 'ahc001':
        provisional_score_mapper = AHCProvisionalScores('./lib/result_ahc001.csv')
        data = provisional_score_mapper.fix_data(data, last_submission_id_set)
    # for hokudai-hitachi2020, etc
    elif contest in score_fix_ratio:
        problems: Dict[str, float] = score_fix_ratio[contest]
        for d in data:  # for all submissions
            if not (d['submission_id'] in last_submission_id_set):
                continue
            # assert d['submission_id'] in last_submission_id_set
            assert isinstance(d['task'], str)
            if not (d['task'] in problems):
                continue
            # assert d['task'] in problems
            ratio: float = problems[d['task']]
            if isinstance(d['score'], int) or isinstance(d['score'], float):
                d['score'] *= ratio
    with open(f'../atcoder-marathon-replay-frontend/public/submissions/{contest}.json', mode='wt', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'))


def export_contests(cur: Cursor) -> List[Dict[str, Union[str, int]]]:
    data: List[Dict[str, Union[str, int]]] = []
    for row in cur.execute('SELECT contest_slug, contest_name, start_time_unix, end_time_unix FROM contests '
                           'WHERE crawl_completed = 1 AND closed = 0 '
                           'ORDER BY end_time_unix DESC, contest_slug DESC'):
        data.append({
            'contest_slug': row[0],
            'contest_name': row[1],
            'start_time_unix': row[2],
            'end_time_unix': row[3],
        })
    with open('../atcoder-marathon-replay-frontend/public/contests/contests.json', mode='wt', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'))
    return data


def main() -> None:
    database: str = 'db.db'
    conn: Connection = sqlite3.connect(database)
    cur: Cursor = conn.cursor()

    print('export contests list')
    contests: List[Dict[str, Union[str, int]]] = export_contests(cur)
    # print(contests)

    for contest in contests:
        assert isinstance(contest['contest_slug'], str)
        contest_slug: str = contest['contest_slug']
        print(f'export submissions of {contest_slug} ({contest["contest_name"]})')
        export_submissions(cur, contest_slug)

    conn.close()


if __name__ == '__main__':
    # if len(sys.argv) != 2:
    #     print('usage: $ python export.py ahc001')
    #     exit()
    # export_submissions(sys.argv[1])
    main()
