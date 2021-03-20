# Author: iilj

import sys
import json
import sqlite3
from sqlite3.dbapi2 import Connection, Cursor
from typing import Dict, List, Union


def main() -> None:
    database: str = 'db.db'
    conn: Connection = sqlite3.connect(database)
    cur: Cursor = conn.cursor()

    data: List[Dict[str, Union[str, int]]] = []
    for row in cur.execute('SELECT contest_slug, contest_name, start_time_unix, end_time_unix FROM contests '
                           'ORDER BY end_time_unix DESC'):
        data.append({
            'contest_slug': row[0],
            'contest_name': row[1],
            'start_time_unix': row[2],
            'end_time_unix': row[3],
        })
    conn.close()
    with open('../atcoder-marathon-replay-frontend/public/contests/contests.json', mode='wt', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'))


if __name__ == '__main__':
    if len(sys.argv) != 1:
        print('usage: $ python export_contests.py')
        exit()
    main()
