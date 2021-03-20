from __future__ import annotations
from typing import List, Tuple
import requests
from requests.models import Response

from lib.SubmissionListPage import SubmissionListPage, SubmissionStatus

DBInsertData = Tuple[int, str, str, int,
                     int, str, str, int, int, int, SubmissionStatus, int, int]


class SubmissionListPageRequestResult:
    contest: str
    pagenum: int
    html: str
    submission_list_page: SubmissionListPage
    is_last_page: bool

    def __init__(self, contest: str = 'ahc001', pagenum: int = 1) -> None:
        self.contest = contest
        self.pagenum = pagenum

    def __repr__(self) -> str:
        return (f'<SubmissionListPageRequestResult contest={self.contest} pagenum={self.pagenum} '
                f'is_last_page={self.is_last_page} submission_list_page={self.submission_list_page}>')

    def get(self) -> None:
        url: str = (f'https://atcoder.jp/contests/{self.contest}/submissions?'
                    f'f.LanguageName=&f.Status=&f.Task=&f.User=&orderBy=created&page={self.pagenum}')
        response: Response = requests.get(url)
        assert response.status_code == 200
        self.html = response.text

    def read_sample_html(self) -> None:
        with open('sample.html') as f:
            self.html = f.read()

    def write_as_sample(self) -> None:
        with open('sample.html', mode='w') as f:
            f.write(self.html)

    def parse(self) -> None:
        self.submission_list_page = SubmissionListPage(self.html)
        self.is_last_page = any(
            submission.time >= self.submission_list_page.contest_endtime for submission in self.submission_list_page.submissions)

    @classmethod
    def create_from_request(cls, contest: str = 'ahc001', pagenum: int = 1) -> SubmissionListPageRequestResult:
        res: SubmissionListPageRequestResult = cls(contest, pagenum)
        res.get()
        res.parse()
        return res

    @classmethod
    def create_from_sample(cls, contest: str = 'ahc001', pagenum: int = 1) -> SubmissionListPageRequestResult:
        res: SubmissionListPageRequestResult = cls(contest, pagenum)
        res.read_sample_html()
        res.parse()
        return res

    def generate_insert_data(self) -> List[DBInsertData]:
        ls: List[DBInsertData] = []
        for submission in self.submission_list_page.submissions:
            if submission.time < self.submission_list_page.contest_endtime:
                data: DBInsertData = (submission.submission_id, submission.contest, submission.task, self.pagenum,
                                      submission.time_unix, submission.user_name, submission.lang_name, submission.lang_id,
                                      submission.score, submission.source_length, submission.status,
                                      submission.time_consumption, submission.memory_consumption)
                ls.append(data)
        return ls
