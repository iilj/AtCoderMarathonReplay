from __future__ import annotations
from lib.ContestListPage import ContestListPage
from typing import List, Tuple
import requests
from requests.models import Response


class ContestListPageRequestResult:
    html: str
    contest_list_page: ContestListPage

    def __repr__(self) -> str:
        return (f'<ContestListPageRequestResult contest_list_page={self.contest_list_page}>')

    def get(self) -> None:
        # url: str = (f'https://atcoder.jp/contests/archive?ratedType=0&category=1200&keyword=')
        url: str = (f'https://atcoder.jp/contests/archive?ratedType=4&category=0&keyword=')
        headers = {'accept-language': 'ja,en-US;q=0.9,en;q=0.8'}
        response: Response = requests.get(url, headers=headers)
        assert response.status_code == 200
        self.html = response.text

    def parse(self) -> None:
        self.contest_list_page = ContestListPage(self.html)

    def write_as_sample(self) -> None:
        with open('sample_contests.html', mode='w') as f:
            f.write(self.html)

    @classmethod
    def create_from_request(cls) -> ContestListPageRequestResult:
        res: ContestListPageRequestResult = cls()
        res.get()
        res.parse()
        return res


# $ cd crawler
# $ python -m lib.ContestListPageRequestResult
if __name__ == '__main__':
    clprr: ContestListPageRequestResult = ContestListPageRequestResult.create_from_request()
    clprr.write_as_sample()
    print(clprr)
