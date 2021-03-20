# Author: iilj

import sys
import time
import sqlite3
from sqlite3.dbapi2 import Connection, Cursor
from typing import List, Optional, Tuple

from lib.SubmissionListPageRequestResult import DBInsertData, SubmissionListPageRequestResult


def main(contest: str = 'ahc001') -> None:
    database: str = 'db.db'
    conn: Connection = sqlite3.connect(database)
    cur: Cursor = conn.cursor()

    # 開始するページ番号の決定
    cur.execute('SELECT MAX(pagenum) FROM submissions WHERE contest = ?', (contest,))
    pagenum_max_result: Tuple[Optional[int]] = cur.fetchone()
    pagenum_max: Optional[int] = pagenum_max_result[0]

    pagenum: int = 1
    if pagenum_max is not None:
        pagenum = pagenum_max + 1
    # return
    while True:
        # ページ取得
        result: SubmissionListPageRequestResult = SubmissionListPageRequestResult.create_from_request(
            contest, pagenum)
        print(f'Page {result.pagenum}: size={len(result.submission_list_page.submissions)}, '
              f'min={result.submission_list_page.submissions[0].time}, max={result.submission_list_page.submissions[-1].time}')

        # コンテスト情報挿入
        cur.execute('SELECT COUNT(*) FROM contests WHERE contest_slug = ?', (contest,))
        count_result: Tuple[Optional[int]] = cur.fetchone()
        exists_in_table: bool = (count_result[0] == 1)
        if not exists_in_table:
            cur.execute('INSERT INTO contests VALUES (?,?,?,?)',
                        (contest, result.submission_list_page.contest_title,
                         result.submission_list_page.contest_starttime_unix,
                         result.submission_list_page.contest_endtime_unix))

        # 提出情報挿入
        seq_of_parameters: List[DBInsertData] = result.generate_insert_data()
        try:
            cur.executemany('INSERT INTO submissions VALUES (?,?,?,?,'
                            '?,?,?,?,?,?,?,?,?)', seq_of_parameters)
        except sqlite3.Error as e:
            print(e)
            break
        conn.commit()

        # 最後のページなら抜ける
        if result.is_last_page:
            break
        pagenum += 1
        time.sleep(15)
    conn.close()


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('usage: > python crawl.py ahc001')
        exit()
    main(sys.argv[1])
