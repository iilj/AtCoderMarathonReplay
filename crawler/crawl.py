# Author: iilj

# import sys
import time
import sqlite3
from datetime import timedelta
from sqlite3.dbapi2 import Connection, Cursor
from typing import List, Optional, Set, Tuple

from lib.ContestListPage import ContestListPage
from lib.ContestListPageRequestResult import ContestListPageRequestResult
from lib.SubmissionListPageRequestResult import DBInsertData, SubmissionListPageRequestResult
from lib.TaskListPageRequestResult import TaskDBInsertData, TaskListPageRequestResult


def crawl_contest(conn: Connection, cur: Cursor, contest: ContestListPage.Contest) -> None:
    slug: str = contest.contest_slug
    # 開始するページ番号の決定
    cur.execute('SELECT MAX(pagenum) FROM submissions WHERE contest = ?', (slug,))
    pagenum_max_result: Tuple[Optional[int]] = cur.fetchone()
    pagenum_max: Optional[int] = pagenum_max_result[0]

    pagenum: int = 1
    if pagenum_max is not None:
        pagenum = pagenum_max + 1
    # return
    while True:
        # ページ取得
        result: SubmissionListPageRequestResult = SubmissionListPageRequestResult.create_from_request(
            slug, pagenum)
        # print(result)
        # exit()

        count_result: Tuple[Optional[int]]
        exists_in_table: bool
        if result.is_closed:
            print(f' -> Page {result.pagenum}: 404')

            # コンテスト情報挿入
            cur.execute('SELECT COUNT(*) FROM contests WHERE contest_slug = ?', (slug,))
            count_result = cur.fetchone()
            exists_in_table = (count_result[0] == 1)
            if not exists_in_table:
                cur.execute('INSERT INTO contests VALUES (?,?,?,?,?,?,?)',
                            (slug, contest.contest_name, contest.time_unix,
                             int((contest.time + timedelta(minutes=contest.duration_minutes)).timestamp()),
                             1, 1, int(contest.rated)))
            conn.commit()
            break
        else:
            print(f' -> Page {result.pagenum}: size={len(result.submission_list_page.submissions)}, '
                  f'min={result.submission_list_page.submissions[0].time}, max={result.submission_list_page.submissions[-1].time}')

            # コンテスト情報挿入
            cur.execute('SELECT COUNT(*) FROM contests WHERE contest_slug = ?', (slug,))
            count_result = cur.fetchone()
            exists_in_table = (count_result[0] == 1)
            if not exists_in_table:
                cur.execute('INSERT INTO contests VALUES (?,?,?,?,?,?,?)',
                            (slug, result.submission_list_page.contest_title,
                             result.submission_list_page.contest_starttime_unix,
                             result.submission_list_page.contest_endtime_unix, 0, 0, int(contest.rated)))

        # 提出情報挿入
        seq_of_parameters: List[DBInsertData] = result.generate_insert_data()
        try:
            cur.executemany('INSERT INTO submissions VALUES (?,?,?,?,'
                            '?,?,?,?,?,?,?,?,?,?)', seq_of_parameters)
        except sqlite3.Error as e:
            print(e)
            break
        conn.commit()

        # 最後のページなら抜ける
        if result.is_last_page:
            break
        pagenum += 1
        time.sleep(3)
    cur.execute('UPDATE contests SET crawl_completed = 1 WHERE contest_slug = ?', (slug,))
    conn.commit()


def crawl_task(conn: Connection, cur: Cursor, contest: ContestListPage.Contest) -> bool:
    slug: str = contest.contest_slug
    cur.execute('SELECT COUNT(*) FROM tasks WHERE contest_slug = ?', (slug,))
    count_result = cur.fetchone()
    exists_in_table = (count_result[0] > 0)
    if exists_in_table:
        print(f' -> There already exists in table')
        return False

    tlprr: TaskListPageRequestResult = TaskListPageRequestResult.create_from_request(slug)
    if tlprr.is_closed:
        print(f' -> Task list: 404')
        return True
    print(f' -> Task size: {len(tlprr.task_list_page.tasks)}')
    seq_of_parameters: List[TaskDBInsertData] = tlprr.generate_insert_data()
    cur.executemany('INSERT INTO tasks VALUES (?,?,?,'
                    '?,?,?)', seq_of_parameters)
    conn.commit()
    return True


def crawl(conn: Connection, cur: Cursor) -> None:
    clprr: ContestListPageRequestResult = ContestListPageRequestResult.create_from_request()
    print(clprr)
    # slugs: List[str] = [contest.contest_slug for contest in clprr.contest_list_page.contests]
    slugs_crawled: Set[str] = set([row[0]
                                   for row in cur.execute('SELECT contest_slug FROM contests WHERE crawl_completed = 1')])

    for contest in clprr.contest_list_page.contests:
        if contest.contest_slug in slugs_crawled:
            continue
        print(f'[START {contest.contest_slug}]')
        if crawl_task(conn, cur, contest):
            time.sleep(3)
        crawl_contest(conn, cur, contest)
        print(f'[END {contest.contest_slug}]')
        time.sleep(3)


def main() -> None:
    database: str = 'db.db'
    conn: Connection = sqlite3.connect(database)
    cur: Cursor = conn.cursor()
    crawl(conn, cur)
    conn.close()


if __name__ == '__main__':
    # if len(sys.argv) != 2:
    #     print('usage: $ python crawl.py ahc001')
    #     exit()
    # crawl_contest(sys.argv[1])
    main()
