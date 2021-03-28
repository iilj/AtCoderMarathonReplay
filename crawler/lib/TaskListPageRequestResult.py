from __future__ import annotations
from typing import List, Tuple
from lib.TaskListPage import TaskListPage
import requests
from requests.models import Response

TaskDBInsertData = Tuple[str, str, str, str, float, int]


class TaskListPageRequestResult:
    contest: str
    html: str
    task_list_page: TaskListPage
    is_closed: bool

    def __init__(self, contest: str = 'ahc001') -> None:
        self.contest = contest

    def __repr__(self) -> str:
        return (f'<TaskListPageRequestResult contest={self.contest} task_list_page={self.task_list_page}>')

    def get(self) -> None:
        url: str = (f'https://atcoder.jp/contests/{self.contest}/tasks?lang=ja')
        headers = {'accept-language': 'ja,en-US;q=0.9,en;q=0.8'}
        response: Response = requests.get(url, headers=headers)
        if response.status_code == 404:
            self.is_closed = True
        else:
            assert response.status_code == 200
            self.is_closed = False
        self.html = response.text

    def parse(self) -> None:
        self.task_list_page = TaskListPage(self.html)

    @classmethod
    def create_from_request(cls, contest: str = 'ahc001') -> TaskListPageRequestResult:
        res: TaskListPageRequestResult = cls(contest)
        res.get()
        res.parse()
        return res

    def generate_insert_data(self) -> List[TaskDBInsertData]:
        ls: List[TaskDBInsertData] = []
        if self.task_list_page is not None:
            for task in self.task_list_page.tasks:
                data: TaskDBInsertData = (task.contest_slug, task.task_slug, task.label, task.name,
                                          task.time_limit_sec, task.memory_limit_mb)
                ls.append(data)
        return ls


# $ cd crawler
# $ python -m lib.TaskListPageRequestResult
if __name__ == '__main__':
    tlprr: TaskListPageRequestResult = TaskListPageRequestResult.create_from_request('joi2008ho')
    # tlprr.write_as_sample()
    print(tlprr)
