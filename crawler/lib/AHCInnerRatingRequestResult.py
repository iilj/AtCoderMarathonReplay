from __future__ import annotations
from pathlib import Path
from typing import Dict

import requests
from requests.models import Response
import json


class AHCInnerRatingRequestResult:
    json_str: str
    ahc_inner_ratings: Dict[str, int]

    def __repr__(self) -> str:
        return (f'<AHCInnerRatingRequestResult ahc_inner_ratings={self.ahc_inner_ratings}>')

    def request(self, slug: str) -> None:
        cache_path = Path(__file__).resolve().parent / 'json' / f'{slug}.json'
        if cache_path.exists():
            self.json_str = cache_path.read_text()
        else:
            url: str = (f'https://data.ac-predictor.com/aperfs/{slug}.json')
            headers = {'accept-language': 'ja,en-US;q=0.9,en;q=0.8'}
            response: Response = requests.get(url, headers=headers)
            assert response.status_code == 200
            self.json_str = response.text
            cache_path.write_text(response.text)
        self.ahc_inner_ratings = json.loads(self.json_str)

    def get_inner_rating(self, user_name: str) -> int:
        if user_name in self.ahc_inner_ratings:
            return self.ahc_inner_ratings.get(user_name)
        else:
            # Center = 1000
            # https://www.dropbox.com/s/ne358pdixfafppm/AHC_rating.pdf?dl=0
            return 1000

    def contains(self, user_name: str) -> bool:
        return (user_name in self.ahc_inner_ratings)

    @classmethod
    def create_from_request(cls, slug: str) -> AHCInnerRatingRequestResult:
        res: AHCInnerRatingRequestResult = cls()
        res.request(slug)
        return res


# $ cd crawler
# $ python -m lib.AHCInnerRatingRequestResult
if __name__ == '__main__':
    airrr: AHCInnerRatingRequestResult = AHCInnerRatingRequestResult.create_from_request('ahc002')
    print(airrr)
    print(airrr.get_inner_rating('abb'))
