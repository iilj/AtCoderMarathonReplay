import React from 'react';
import useSWR from 'swr';
import { Alert } from 'reactstrap';
import Contest from '../../interfaces/Contest';
import Submission from '../../interfaces/Submission';
import {
  fetchContests,
  fetchContestSubmissions,
  fetchContestTasks,
} from '../../utils/Data';
import { FormBlock } from './FormBlock';
import { StandingsTable } from './StandingsTable';
import Task from '../../interfaces/Task';

interface Props {
  match: {
    params: {
      contest: string;
    };
  };
}

export const StandingsPage: React.FC<Props> = (props) => {
  const paramContest: string = props.match.params.contest ?? '';

  const { data: contests, error: contestsError } = useSWR<Contest[], Error>(
    '/contests/contests',
    fetchContests
  );

  const { data: contestTasks, error: contestTasksError } = useSWR<
    Task[],
    Error
  >(paramContest.length > 0 ? `/tasks/${paramContest}` : null, () => {
    return fetchContestTasks(paramContest);
  });

  const { data: contestSubmissions, error: contestSubmissionsError } = useSWR<
    Submission[],
    Error
  >(paramContest.length > 0 ? `/submissions/${paramContest}` : null, () => {
    return fetchContestSubmissions(paramContest);
  });

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
        で行われたマラソンコンテストの，コンテスト中のある時点での順位表を表示します．
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
        <FormBlock paramContest={paramContest} contests={contests} />
      )}

      {contestSubmissionsError ? (
        <Alert
          color="danger"
          style={{
            marginTop: '50px',
            marginBottom: '50px',
          }}
        >
          Failed to fetch contest submission list.
        </Alert>
      ) : contestTasksError ? (
        <Alert
          color="danger"
          style={{
            marginTop: '50px',
            marginBottom: '50px',
          }}
        >
          Failed to fetch contest task list.
        </Alert>
      ) : paramContest !== '' &&
        (contestSubmissions === undefined || contestTasks === undefined) ? (
        <div
          style={{
            width: '100%',
            height: '500px',
            textAlign: 'center',
            marginTop: '100px',
            marginBottom: '100px',
          }}
        >
          Fetch contest submissions/tasks data...
        </div>
      ) : contestSubmissions === undefined || contestTasks === undefined ? (
        <div style={{ height: '50px' }}></div>
      ) : (
        <StandingsTable
          contest={contestMap?.get(paramContest)}
          contestSubmissions={contestSubmissions}
          contestTasks={contestTasks}
        />
      )}

      <h2>補足</h2>
      <p>
        以下のコンテストの問題に対する各ユーザの最終提出は，プレテスト得点が不明であるため，システムテストの得点に下記の倍率を掛けた値を用いています．
      </p>
      <ul>
        <li>
          <del>ahc001: 50 / 1000</del> →{' '}
          <a href="https://www.dropbox.com/s/rqrlprp0zoyi4di/result_ahc001.csv?dl=0">
            result_ahc001.csv
          </a>{' '}
          から Provisional Score を取り込みました．
        </li>
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
