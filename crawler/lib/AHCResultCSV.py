import csv
from typing import Dict, List, Set, Union


class AHCRankEntry:
    rank: int
    name: str
    score: int
    provisional_rank: int
    provisional_score: int
    performance: int
    old_rating_beta: int
    change: int
    new_rating_beta: int

    def __init__(
        self,
        rank: int,
        name: str,
        score: int,
        provisional_rank: int,
        provisional_score: int,
        performance: int,
        old_rating_beta: int,
        change: int,
        new_rating_beta: int,
    ) -> None:
        self.rank = rank
        self.name = name
        self.score = score
        self.provisional_rank = provisional_rank
        self.provisional_score = provisional_score
        self.performance = performance
        self.old_rating_beta = old_rating_beta
        self.change = change
        self.new_rating_beta = new_rating_beta

    def __repr__(self) -> str:
        return (f'<AHCRankEntry rank={self.rank} name={self.name} score={self.score} '
                f'provisional_rank={self.provisional_rank} provisional_score={self.provisional_score} '
                f'performance={self.performance} old_rating_beta={self.old_rating_beta} '
                f'change={self.change} new_rating_beta={self.new_rating_beta}>')


class AHCScoresCSV:
    name2provisionalscore: Dict[str, int]
    entries: Dict[str, AHCRankEntry]

    def __init__(self, fn: str = 'result_ahc001.csv') -> None:
        self.name2provisionalscore = {}
        self.entries = {}
        with open(fn, encoding='utf_8') as f:
            reader: csv.DictReader = csv.DictReader(f)
            for row in reader:
                rank: int = int(row['Rank'])
                name: str = row['Name']
                # score: int = int(row['Provisional Score'])
                score: int = int(row['Score'])
                provisional_rank: int = int(row['Provisional Rank']) if ('Provisional Rank' in row) else -1
                provisional_score: int = int(row['Provisional Score']) if ('Provisional Score' in row) else -1
                performance: int = int(row['Performance'])
                old_rating_beta: int = int(row['Old Rating(β)'])
                change: int = int(row['Change'])
                new_rating_beta: int = int(row['New Rating(β)'])

                if provisional_score != -1:
                    self.name2provisionalscore[name] = provisional_score
                self.entries[name] = AHCRankEntry(
                    rank,
                    name,
                    score,
                    provisional_rank,
                    provisional_score,
                    performance,
                    old_rating_beta,
                    change,
                    new_rating_beta
                )
        # print(self.name2score)
        # print(self.entries)

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
            if not (d['user_name'] in self.name2provisionalscore):
                continue
            # assert d['user_name'] in self.name2score
            assert d['user_name'] in user_score_list_map
            provisional_score: int = self.name2provisionalscore[d['user_name']]
            if len(user_score_list_map[d['user_name']]) == 1 or provisional_score > user_score_list_map[d['user_name']][-2]:
                d['score'] = provisional_score
            else:
                d['score'] = -1
        return data


def main() -> None:
    scoredict = AHCScoresCSV()


if __name__ == '__main__':
    main()
