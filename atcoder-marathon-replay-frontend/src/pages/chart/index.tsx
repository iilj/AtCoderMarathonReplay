import React from 'react';
import useSWR from 'swr';
import { Alert } from 'reactstrap';
import Contest from '../../interfaces/Contest';
import Submission from '../../interfaces/Submission';
import { fetchContests, fetchContestSubmissions } from '../../utils/Data';
import { FormBlock } from './FormBlock';
import { ChartBlock } from './ChartBlock';

interface Props {
  match: {
    params: {
      contest: string;
      user: string;
    };
  };
}

export const ChartPage: React.FC<Props> = (props) => {
  const paramContest: string = props.match.params.contest ?? '';
  const paramUser: string = props.match.params.user ?? '';

  const { data: contests, error: contestsError } = useSWR<Contest[], Error>(
    '/contests/contests',
    fetchContests
  );

  const { data: contestSubmissions, error: contestSubmissionsError } = useSWR<
    Submission[],
    Error
  >(
    paramUser.length > 0 && paramContest.length > 0
      ? `/submissions/${paramContest}`
      : null,
    () => {
      return fetchContestSubmissions(paramContest);
    }
  );

  const users = paramUser
    .split(',')
    .map((_user) => _user.trim())
    .filter((_user) => _user !== '');

  const contestMap = contests?.reduce(
    (prevMap: Map<string, Contest>, contest: Contest): Map<string, Contest> =>
      prevMap.set(contest.contest_slug, contest),
    new Map<string, Contest>()
  );
  return (
    <>
      <h2>Description</h2>
      <p>
        AtCoder
        で行われたマラソンコンテストにおける順位および得点の推移をグラフに表示します．
      </p>
      <p>
        <a
          href="https://atcoder-replay.kakira.dev/"
          target="_blank"
          rel="noreferrer"
        >
          AtCoder Replay (β)
        </a>{' '}
        がマラソンに対応していなかったので作りました．
      </p>

      <h2>Let&apos;s Replay!</h2>
      {contestsError ? (
        <Alert
          color="danger"
          style={{
            marginTop: '50px',
            marginBottom: '50px',
          }}
        >
          Failed to fetch contest list.
        </Alert>
      ) : contests === undefined ? (
        <div
          style={{
            width: '100%',
            height: '500px',
            textAlign: 'center',
            marginTop: '100px',
            marginBottom: '100px',
          }}
        >
          Fetch contest data...
        </div>
      ) : (
        <FormBlock
          paramUsers={paramUser}
          paramContest={paramContest}
          contests={contests}
        />
      )}

      {paramUser.length === 0 ? (
        <div style={{ height: '50px' }}></div>
      ) : contestSubmissionsError ? (
        <Alert
          color="danger"
          style={{
            marginTop: '50px',
            marginBottom: '50px',
          }}
        >
          Failed to fetch contest submission list.
        </Alert>
      ) : contestSubmissions === undefined ? (
        <div
          style={{
            width: '100%',
            height: '500px',
            textAlign: 'center',
            marginTop: '100px',
            marginBottom: '100px',
          }}
        >
          Fetch contest submissions data...
        </div>
      ) : (
        <ChartBlock
          users={users}
          contest={contestMap?.get(paramContest)}
          contestSubmissions={contestSubmissions}
        />
      )}

      <h2>補足</h2>
      <p>
        以下のコンテストの問題に対する提出は，各ユーザの最終提出のプレテスト得点が不明であるため，システムテストの得点に下記の倍率を掛けた値を用いています．
      </p>
      <ul>
        <li>ahc001: 50 / 1000</li>
        <li>hokudai-hitachi2020: 16 / 200</li>
        <li>hokudai-hitachi2019-2: 30 / 100</li>
        <li>hokudai-hitachi2019-1: 30 / 100</li>
        <li>hokudai-hitachi2018: 15 / 100</li>
        <li>hokudai-hitachi2017-2: 30 / 150</li>
        <li>hokudai-hitachi2017-1: 30 / 150</li>
      </ul>
    </>
  );
};
