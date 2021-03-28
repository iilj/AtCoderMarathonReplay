import re
from typing import List, Match, Optional, Pattern
from bs4 import BeautifulSoup
from bs4.element import Tag


class TaskListPage:
    class Task:
        label: str
        contest_slug: str
        task_slug: str
        name: str
        time_limit_sec: float
        memory_limit_mb: int

        task_href_pattern: Pattern[str] = re.compile(r'/contests/([^/]+)/tasks/([^/]+)')
        time_limit_sec_pattern: Pattern[str] = re.compile(r'([\.\d]+) sec')
        memory_limit_mb_pattern: Pattern[str] = re.compile(r'(\d+) MB')

        def __init__(self, table_row: Tag) -> None:
            table_data_list: List[Tag] = table_row.select('td')

            self.label = table_data_list[0].get_text()
            self.name = table_data_list[1].get_text()

            task_tag: Tag = table_data_list[1].find('a')
            task_href_match: Optional[Match[str]] = self.task_href_pattern.search(task_tag['href'])
            assert task_href_match is not None
            self.contest_slug = task_href_match.group(1)
            self.task_slug = task_href_match.group(2)

            time_limit_sec_str: str = table_data_list[2].get_text()
            time_limit_sec_str = time_limit_sec_str.strip()
            time_limit_sec_match:  Optional[Match[str]] = self.time_limit_sec_pattern.search(
                time_limit_sec_str)
            if time_limit_sec_match is not None:
                self.time_limit_sec = float(time_limit_sec_match.group(1))
            else:
                if time_limit_sec_str == '0 msec':
                    self.time_limit_sec = 0.
                elif time_limit_sec_str == '-1 msec':
                    self.time_limit_sec = -1.
                else:
                    assert False

            memory_limit_mb_str: str = table_data_list[3].get_text()
            memory_limit_mb_match:  Optional[Match[str]] = self.memory_limit_mb_pattern.search(
                memory_limit_mb_str)
            if memory_limit_mb_match is not None:
                self.memory_limit_mb = int(memory_limit_mb_match.group(1))
            else:
                assert memory_limit_mb_str.strip() == '0 KB'
                self.memory_limit_mb = 0

        def __repr__(self) -> str:
            return ('<Task '
                    f'label={self.label}, name={self.name}, contest_slug={self.contest_slug}, task_slug={self.task_slug} '
                    f'time_limit_sec={self.time_limit_sec}, memory_limit_mb={self.memory_limit_mb}>')

    tasks: List[Task]

    def __init__(self, html: str) -> None:
        """HTML をパースして問題一覧を初期化する．

        Args:
            html (str): 問題一覧ページの HTML 文字列．
        """
        soup: BeautifulSoup = BeautifulSoup(html, "html.parser")
        table_rows: List[Tag] = soup.select('div.table-responsive table.table tbody tr')
        self.tasks = [TaskListPage.Task(table_row) for table_row in table_rows]

    def __repr__(self) -> str:
        return (f'<TaskListPage tasks={self.tasks}>')
