import React from 'react';
import useSWR from 'swr';
import { Alert } from 'reactstrap';
import { FormBlock } from './FormBlock';
import { StandingsTable } from './StandingsTable';
import {
  fetchContests,
  fetchContestSubmissions,
  fetchContestTasks,
} from '../../utils/Data';
import Contest from '../../interfaces/Contest';
import Submission from '../../interfaces/Submission';
import Task from '../../interfaces/Task';

interface Props {
  match: {
    params: {
      contest: string;
      datetime: string;
    };
  };
}

const datetimeRegExp = /^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)[+-](\d\d)(\d\d)$/;
const parseParamDatetime = (paramDatetime: string): Date | undefined => {
  const datetimeRegExpMatch = datetimeRegExp.exec(paramDatetime);
  if (datetimeRegExpMatch === null) return undefined;
  return new Date(paramDatetime);
};

export const StandingsPage: React.FC<Props> = (props) => {
  const paramContest: string = props.match.params.contest ?? '';
  const paramDatetime: string = props.match.params.datetime ?? '';
  const parsedDatetime = parseParamDatetime(paramDatetime);

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
      <p>
        順位推移をリプレイする場合は，ページ上部ナビゲーションバーの「Chart」から．
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
          paramContest={paramContest}
          contests={contests}
          contestMap={contestMap}
          parsedDatetime={parsedDatetime}
        />
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
      ) : parsedDatetime === undefined ? (
        <Alert
          color="danger"
          style={{
            marginTop: '50px',
            marginBottom: '50px',
          }}
        >
          Invalid datetime format.
        </Alert>
      ) : (
        <StandingsTable
          contest={contestMap?.get(paramContest)}
          contestSubmissions={contestSubmissions}
          contestTasks={contestTasks}
          parsedDatetime={parsedDatetime}
        />
      )}
    </>
  );
};
