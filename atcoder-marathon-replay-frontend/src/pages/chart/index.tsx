import React from 'react';
import useSWR from 'swr';
import { Alert } from 'reactstrap';
import { FormBlock } from './FormBlock';
import { ChartBlock } from './ChartBlock';
import {
  fetchContests,
  fetchContestSubmissions,
  fetchPerfs,
} from '../../utils/Data';
import Contest from '../../interfaces/Contest';
import Submission from '../../interfaces/Submission';
import Perfs from '../../interfaces/Perfs';

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

  const { data: perfs, error: perfsError } = useSWR<Perfs | undefined, Error>(
    paramUser.length > 0 && paramContest.length > 0 && contests !== undefined
      ? `/perfs/${paramContest}`
      : null,
    () => {
      const tmpContest: Contest | undefined = contests?.find(
        (value) => value.contest_slug === paramContest
      );
      return fetchPerfs(paramContest, tmpContest);
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
      <p>
        順位表をリプレイする場合は，ページ上部ナビゲーションバーの「Standings」から．
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
          perfs={perfsError ? undefined : perfs}
        />
      )}
    </>
  );
};
