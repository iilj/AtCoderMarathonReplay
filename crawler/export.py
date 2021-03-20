# Author: iilj

import sys
import json
import sqlite3
from sqlite3.dbapi2 import Connection, Cursor
from typing import Dict, List, Set, Tuple, Union


def main(contest: str = 'ahc001') -> None:
    database: str = 'db.db'
    conn: Connection = sqlite3.connect(database)
    cur: Cursor = conn.cursor()

    data: List[Dict[str, Union[str, int, float]]] = []
    user_last_submission_id_map: Dict[Tuple[str, str], int] = {}  # [user_name, task] => submission_id
    for row in cur.execute('SELECT submission_id, task, time_unix, user_name, score, status '
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
            'score': row[4],
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
        for d in data:
            if d['submission_id'] in last_submission_id_set:
                if isinstance(d['score'], int) and d['score'] != -1:
                    d['score'] *= 50 / 1000
    # for hokudai-hitachi2020
    if contest == 'hokudai-hitachi2020':
        for d in data:
            if d['submission_id'] in last_submission_id_set:
                if isinstance(d['score'], int) and d['score'] != -1:
                    d['score'] *= 16 / 200
    conn.close()
    with open(f'{contest}.json', mode='wt', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('usage: > python export.py ahc001')
        exit()
    main(sys.argv[1])
