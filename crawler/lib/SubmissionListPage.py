from typing import Dict, List, Match, Optional, Pattern
from bs4 import BeautifulSoup
from bs4.element import Tag
from urllib.parse import ParseResult, urlparse, parse_qs
import re
from datetime import datetime

from typing import Literal

SubmissionStatus = Literal[
    "AC", "WA", "IE", "OLE", "RE", "TLE", "MLE", "CE", "WJ", "WR"
]


class SubmissionListPage:
    """提出一覧ページの1つを表すクラス．コンストラクタ内で HTML をパースする．"""

    class Submission:
        """提出インスタンス"""

        time: datetime
        time_unix: int
        contest: str
        task: str
        user_name: str
        lang_name: str
        lang_id: int
        score: int
        magnification: int
        submission_id: int
        source_length: int
        status: SubmissionStatus
        time_consumption: int
        memory_consumption: int

        task_href_pattern: Pattern[str] = re.compile(r"/contests/([^/]+)/tasks/([^/]+)")
        user_href_pattern: Pattern[str] = re.compile(r"/users/([^/]+)")
        score_href_pattern: Pattern[str] = re.compile(r"(-?\d+)\.(\d+)")

        def __init__(self, table_row: Tag) -> None:
            """提出一覧ページ内のテーブルのある行タグから，提出インスタンスを初期化する．

            Args:
                table_row (Tag): 行タグ
            """
            table_data_list: List[Tag] = table_row.select("td")

            time_str: str = table_data_list[0].get_text()
            self.time = datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S+0900")
            self.time_unix = int(self.time.timestamp())

            task_tag: Tag = table_data_list[1].find("a")
            task_href_match: Optional[Match[str]] = self.task_href_pattern.search(
                task_tag["href"]
            )
            assert task_href_match is not None
            self.contest = task_href_match.group(1)
            self.task = task_href_match.group(2)

            user_name_tag: Tag = table_data_list[2].find("a")
            # self.user_name = user_name_tag.get_text()
            user_href_match: Optional[Match[str]] = self.user_href_pattern.search(
                user_name_tag["href"]
            )
            assert user_href_match is not None
            self.user_name = user_href_match.group(1)

            lnag_tag: Tag = table_data_list[3].find("a")
            self.lang_name = lnag_tag.get_text()
            lang_url_parse_result: ParseResult = urlparse(lnag_tag["href"])
            lang_url_query_dict: Dict[str, List[str]] = parse_qs(
                lang_url_parse_result.query
            )
            self.lang_id = int(lang_url_query_dict["f.Language"][0])

            score_str: str = table_data_list[4].get_text()
            score_href_match: Optional[Match[str]] = self.score_href_pattern.search(
                score_str
            )
            if score_href_match is not None:
                score_fst: int = int(score_href_match.group(1))
                score_snd_str: str = score_href_match.group(2)
                score_snd: int = int(score_snd_str)
                self.magnification = pow(10, len(score_snd_str))
                if score_fst >= 0:
                    self.score = score_fst * self.magnification + score_snd
                else:
                    self.score = score_fst * self.magnification - score_snd
            else:
                self.score: int = int(table_data_list[4].get_text())
                self.magnification = 1
            self.submission_id = int(table_data_list[4]["data-id"])

            source_length_str: str = table_data_list[5].get_text()
            self.source_length = int(source_length_str.split(" ")[0])

            status_span: Tag = table_data_list[6].find("span")
            self.status = self.__str_to_status(status_span.get_text())

            if (
                self.status != "CE"
                and self.status != "IE"
                and self.status != "WJ"
                and self.status != "WR"
            ):
                time_consumption_str: str = table_data_list[7].get_text()
                self.time_consumption = int(time_consumption_str.split(" ")[0])

                memory_consumption_str: str = table_data_list[8].get_text()
                self.memory_consumption = int(memory_consumption_str.split(" ")[0])
            else:
                self.time_consumption = -1
                self.memory_consumption = -1

        def __repr__(self) -> str:
            return (
                "<Submission "
                f"time={self.time}, user={self.user_name}, contest={self.contest}, task={self.task}, "
                f"lang={self.lang_name}, lang_id={self.lang_id}, score={self.score}, magnification={self.magnification}, "
                f"submission_id={self.submission_id}, source_length={self.source_length}, status={self.status}, "
                f"time_consumption={self.time_consumption}, memory_consumption={self.memory_consumption}>"
            )

        def __str_to_status(self, status_str: str) -> SubmissionStatus:
            if status_str == "AC":
                return "AC"
            if status_str == "WA":
                return "WA"
            if status_str == "IE":
                return "IE"
            if status_str == "OLE":
                return "OLE"
            if status_str == "RE":
                return "RE"
            if status_str == "TLE":
                return "TLE"
            if status_str == "MLE":
                return "MLE"
            if status_str == "CE":
                return "CE"
            if status_str == "WJ":
                return "WJ"
            if status_str == "WR":
                return "WR"
            msg: str = f"Invalid submission status: {status_str}"
            raise Exception(msg)

    pattern_starttime: Pattern[str] = re.compile(
        r'var startTime = moment\("(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)\+09:00"\);'
    )
    pattern_endtime: Pattern[str] = re.compile(
        r'var endTime = moment\("(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)\+09:00"\);'
    )
    contest_starttime: datetime
    contest_starttime_unix: int
    contest_endtime: datetime
    contest_endtime_unix: int
    contest_title: str
    submissions: List[Submission]

    def __init__(self, html: str) -> None:
        """HTML をパースして提出一覧を初期化する．

        Args:
            html (str): 提出一覧ページの HTML 文字列．
        """
        # get contest start/end time
        self.contest_starttime = self.__extract_datetime(html, self.pattern_starttime)
        self.contest_starttime_unix = int(self.contest_starttime.timestamp())
        self.contest_endtime = self.__extract_datetime(html, self.pattern_endtime)
        self.contest_endtime_unix = int(self.contest_endtime.timestamp())

        # get submissions
        soup: BeautifulSoup = BeautifulSoup(html, "html.parser")
        table_rows: List[Tag] = soup.select("div.table-responsive table.table tbody tr")
        self.submissions = [
            SubmissionListPage.Submission(table_row) for table_row in table_rows
        ]

        # get contest title
        contset_title_tag: Tag = soup.select(
            "#navbar-collapse ul.nav.navbar-nav li a.contest-title"
        )[0]
        self.contest_title = contset_title_tag.get_text()

    def __extract_datetime(self, html: str, pattern: Pattern[str]) -> datetime:
        result: Optional[Match[str]] = pattern.search(html)
        assert result is not None
        year: int = int(result.group(1))
        month: int = int(result.group(2))
        day: int = int(result.group(3))
        hour: int = int(result.group(4))
        minute: int = int(result.group(5))
        second: int = int(result.group(6))
        return datetime(year, month, day, hour, minute, second)

    def __repr__(self) -> str:
        return (
            f"<SubmissionListPage contest_title={self.contest_title} "
            f"contest_starttime={self.contest_starttime} contest_endtime={self.contest_endtime} "
            f"submissions={self.submissions}>"
        )
