import React from 'react';
import { fetchContests, fetchContestSubmissions } from '../../utils/Data';
import Contest from '../../interfaces/Contest';
import Submission from '../../interfaces/Submission';
import { FormBlock } from './FormBlock';
import { ChartBlock } from './ChartBlock';
import useSWR from 'swr';
import { Alert } from 'reactstrap';

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

  const contestSubmissionsSWRResponse = useSWR<Submission[], Error>(
    paramUser.length > 0 && paramContest.length > 0
      ? `/submissions/${paramContest}`
      : null,
    () => {
      return fetchContestSubmissions(paramContest);
    }
  );
  const contestSubmissions: Submission[] | undefined =
    contestSubmissionsSWRResponse.data;
  const contestSubmissionsError: Error | undefined =
    contestSubmissionsSWRResponse.error;

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
        AHC001
        は最終提出のプレテスト得点不明につき，各ユーザの最終提出のスコアは，システス結果
        * 50 / 1000 を用いています．
      </p>
      <p>
        日立北大2020
        は最終提出のプレテスト得点不明につき，各ユーザの最終提出のスコアは，システス結果
        * 16 / 200 を用いています．
      </p>
    </>
  );
};
