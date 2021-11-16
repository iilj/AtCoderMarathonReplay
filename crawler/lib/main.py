
import re
import json
from datetime import timedelta
from typing import Dict, List, Pattern, Union
from ContestListPageRequestResult import ContestListPageRequestResult
from AHCResultCSV import AHCScoresCSV


def crawl() -> None:
    pattern: Pattern[str] = re.compile(r'^(ahc\d\d\d|rcl-contest-2021-long|future-contest-2022-qual)$')
    clprr: ContestListPageRequestResult = ContestListPageRequestResult.create_from_request()
    contests: List[Dict[str, Union[int, str]]] = []
    for contest in clprr.contest_list_page.contests:
        if pattern.match(contest.contest_slug):
            # print(contest, contest.time + timedelta(minutes=contest.duration_minutes))
            end_time = int((contest.time + timedelta(minutes=contest.duration_minutes)).timestamp())
            contests.append({'name': contest.contest_name, 'endtime': end_time, 'slug': contest.contest_slug})

            # [{"EndTime": 1569678000, "NewRating": 28, "OldRating": 0, "Place": 3230,
            #   "ContestName": "AtCoder Beginner Contest 142",
            #   "StandingsUrl": "https://atcoder.jp/contests/abc142/standings?watching=abb",
            #   "StandingsU": "/contests/abc142/standings?watching=abb", "low": 0, "high": 10000},
            csv: AHCScoresCSV = AHCScoresCSV(f'./csv/result_{contest.contest_slug}.csv')
            obj: Dict[str, Dict[str, Union[int, str]]] = {name: {
                'EndTime': end_time,
                'NewRating': entry.new_rating_beta,
                'OldRating': entry.old_rating_beta,
                'Place': entry.rank,
                'ContestName': contest.contest_name,
                'StandingsUrl': f'https://atcoder.jp/contests/{contest.contest_slug}/standings?watching={name}',
                'StandingsU': f'/contests/{contest.contest_slug}/standings?watching={name}',
                'low': 0,
                'high': 10000,
                'performance': entry.performance,
                'change': entry.change,
                'slug': contest.contest_slug
            } for name, entry in csv.entries.items()}
            with open(f'../atcoder-marathon-rating-history-frontend/public/json/results/{contest.contest_slug}.json',
                      mode='wt', encoding='utf-8') as f:
                json.dump(obj, f, separators=(',', ':'))
    contests.reverse()
    with open(f'../atcoder-marathon-rating-history-frontend/public/json/contests/contests.json',
              mode='wt', encoding='utf-8') as f:
        json.dump(contests, f, separators=(',', ':'))


def main() -> None:
    crawl()


if __name__ == '__main__':
    main()
