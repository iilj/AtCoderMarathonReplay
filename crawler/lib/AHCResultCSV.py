import csv
from typing import Dict, List, Set, Union


class AHCProvisionalScores:
    name2score: Dict[str, int]

    def __init__(self, fn: str = 'result_ahc001.csv') -> None:
        self.name2score = {}
        with open(fn, encoding='utf_8') as f:
            reader: csv.DictReader = csv.DictReader(f)
            for row in reader:
                name: str = row['Name']
                score: int = int(row['Provisional Score'])
                self.name2score[name] = score
        # print(self.name2score)

    def fix_data(
        self,
        data: List[Dict[str, Union[str, int, float]]],
        last_submission_id_set: Set[int]
    ) -> List[Dict[str, Union[str, int, float]]]:
        # {
        #     'submission_id': submission_id,
        #     'task': task,
        #     'time_unix': row[2],
        #     'user_name': user_name,
        #     'score': row[4] if row[6] == 1 else row[4] / row[6],
        #     'status': row[5]
        # }

        # ユーザごとの最大スコア推移を出す
        user_score_list_map: Dict[str, List[int]] = {}
        for d in data:
            assert isinstance(d['score'], int)
            assert isinstance(d['user_name'], str)
            if d['user_name'] in user_score_list_map:
                ma: int = max(d['score'], user_score_list_map[d['user_name']][-1])
                user_score_list_map[d['user_name']].append(ma)
            else:
                user_score_list_map[d['user_name']] = [d['score']]
        for d in data:
            if not (d['submission_id'] in last_submission_id_set):
                continue
            # assert d['submission_id'] in last_submission_id_set
            assert isinstance(d['user_name'], str)
            if not (d['user_name'] in self.name2score):
                continue
            # assert d['user_name'] in self.name2score
            assert d['user_name'] in user_score_list_map
            provisional_score: int = self.name2score[d['user_name']]
            if len(user_score_list_map[d['user_name']]) == 1 or provisional_score > user_score_list_map[d['user_name']][-2]:
                d['score'] = provisional_score
            else:
                d['score'] = -1
        return data


def main() -> None:
    scoredict = AHCProvisionalScores()


if __name__ == '__main__':
    main()
