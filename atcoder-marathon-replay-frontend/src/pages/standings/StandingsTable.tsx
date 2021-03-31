import React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import BootstrapTable, {
  ColumnDescription,
  SortOrder,
} from 'react-bootstrap-table-next';
import paginationFactory, {
  PaginationProvider,
} from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSort,
  faSortDown,
  faSortUp,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { TwitterIcon, TwitterShareButton } from 'react-share';
import dataFormat from 'dateformat';
import { PaginationPanel } from '../../components/PaginationPanel';
import { formatScore, formatElapsedSec } from '../../utils';
import Contest from '../../interfaces/Contest';
import Submission from '../../interfaces/Submission';
import Task from '../../interfaces/Task';
import './standings-table.css';

interface UserStandingsTaskEntry {
  score: number;
  score_time: number;
  submit_count: number; // CE 以外の提出回数
  submit_count_ce: number;
}

interface UserStandingsEntry extends UserStandingsTaskEntry {
  user_name: string;
  rank: number;
  tasks: Map<string, UserStandingsTaskEntry>; // 問題ごとの得点
}

const compareUserStandingsTaskEntry = (
  a: UserStandingsTaskEntry,
  b: UserStandingsTaskEntry
): number => {
  // スコアが高いほうが順位が上
  if (a.score != b.score) return b.score - a.score;
  if (a.score > 0) {
    // 正の得点同士なら
    if (a.score_time != b.score_time) return a.score_time - b.score_time;
    return a.submit_count - b.submit_count;
  } else {
    // 0 点同士なら
    return 0;
  }
};

const _sortCaret = (order: 'asc' | 'desc' | undefined): JSX.Element => {
  if (order === 'asc')
    return (
      <FontAwesomeIcon
        style={{
          marginLeft: '6px',
          marginTop: '0.2rem',
          marginBottom: '-0.2rem',
        }}
        icon={faSortUp}
      />
    );
  if (order === 'desc')
    return (
      <FontAwesomeIcon
        style={{
          marginLeft: '6px',
          marginTop: '-0.2rem',
          marginBottom: '0.2rem',
        }}
        icon={faSortDown}
      />
    );
  return <FontAwesomeIcon style={{ marginLeft: '6px' }} icon={faSort} />;
};

interface Props {
  contest?: Contest;
  contestSubmissions: Submission[];
  contestTasks: Task[];
  parsedDatetime: Date;
}

export const StandingsTable: React.FC<Props> = (props) => {
  const { contest, contestSubmissions, contestTasks, parsedDatetime } = props;

  if (contest === undefined) {
    return <div style={{ height: '50px' }}></div>;
  }
  if (contestSubmissions.length === 0 || contestTasks.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: '500px',
          textAlign: 'center',
          marginTop: '100px',
          marginBottom: '100px',
        }}
      >
        Fetch data...
      </div>
    );
  }

  // generate standings
  const userStandingsEntriesMap = new Map<string, UserStandingsEntry>();
  contestSubmissions.forEach((contestSubmission: Submission): void => {
    // filter by datetime
    const curDatetime = new Date(contestSubmission.time_unix * 1000);
    if (curDatetime > parsedDatetime) return;

    // initialize/get entry
    let userStandingsEntry: UserStandingsEntry;
    if (userStandingsEntriesMap.has(contestSubmission.user_name)) {
      userStandingsEntry = userStandingsEntriesMap.get(
        contestSubmission.user_name
      ) as UserStandingsEntry;
    } else {
      userStandingsEntry = {
        user_name: contestSubmission.user_name,
        score: 0,
        score_time: 0,
        submit_count: 0,
        submit_count_ce: 0,
        rank: -1,
        tasks: contestTasks.reduce(
          (prevMap: Map<string, UserStandingsTaskEntry>, curTask: Task) =>
            prevMap.set(curTask.task_slug, {
              score: 0,
              score_time: 0,
              submit_count: 0,
              submit_count_ce: 0,
            }),
          new Map<string, UserStandingsTaskEntry>()
        ),
      } as UserStandingsEntry;
      userStandingsEntriesMap.set(
        contestSubmission.user_name,
        userStandingsEntry
      );
    }
    // update entry
    const targetTaskEntry = userStandingsEntry.tasks.get(
      contestSubmission.task
    ) as UserStandingsTaskEntry;
    if (contestSubmission.status == 'CE') {
      userStandingsEntry.submit_count_ce++;
      targetTaskEntry.submit_count_ce++;
    } else {
      userStandingsEntry.submit_count++;
      targetTaskEntry.submit_count++;
    }
    if (contestSubmission.score > targetTaskEntry.score) {
      userStandingsEntry.score +=
        contestSubmission.score - targetTaskEntry.score;
      userStandingsEntry.score_time = contestSubmission.time_unix;
      targetTaskEntry.score = contestSubmission.score;
      targetTaskEntry.score_time = contestSubmission.time_unix;
    }
  });
  const userStandingsEntries: UserStandingsEntry[] = Array.from(
    userStandingsEntriesMap.values()
  );
  userStandingsEntries.sort(compareUserStandingsTaskEntry);
  userStandingsEntries.reduce((prev, userStandingsEntry, index) => {
    if (prev === -1) {
      userStandingsEntry.rank = index + 1;
      return 0;
    } else if (
      userStandingsEntry.score === userStandingsEntries[prev].score &&
      (userStandingsEntry.score === 0 ||
        (userStandingsEntry.score_time ===
          userStandingsEntries[prev].score_time &&
          userStandingsEntry.submit_count ===
            userStandingsEntries[prev].submit_count))
    ) {
      userStandingsEntry.rank = prev + 1;
      return prev;
    } else {
      userStandingsEntry.rank = index + 1;
      return index;
    }
  }, -1);

  const columns: ColumnDescription[] = [
    {
      dataField: 'rank',
      text: 'Rank',
      sort: true,
      classes: 'standings-rank',
      headerClasses: 'standings-rank-head',
      sortFunc: function _sortFunc(a: number, b: number, order: SortOrder) {
        if (order === 'desc') {
          return a - b;
        } else {
          return b - a;
        }
      },
      sortCaret: _sortCaret,
    },
    {
      dataField: 'user_name',
      text: 'User',
      sort: true,
      classes: 'standings-username',
      headerClasses: 'standings-username-head',
      filter: textFilter(),
      formatter: function _formatter(
        cell: string,
        _row: UserStandingsEntry,
        _rowIndex: number,
        _contest: Contest
      ) {
        const btnId = `standings-user-btn-submission-${cell}`;
        return (
          <>
            <a
              href={`https://atcoder.jp/users/${cell}`}
              className="username"
              target="_blank"
              rel="noreferrer noopener"
            >
              <span className="user">{cell}</span>
            </a>
            <span className="standings-user-btn">
              <a
                href={`https://atcoder.jp/contests/${_contest.contest_slug}/submissions?f.User=${cell}`}
                id={btnId}
              >
                <FontAwesomeIcon icon={faSearch} />
              </a>
              <UncontrolledTooltip placement="top" target={btnId}>
                {`view ${cell}'s submissions`}
              </UncontrolledTooltip>
            </span>
          </>
        );
      },
      formatExtraData: contest,
      sortFunc: function _sortFunc(a: string, b: string, order: SortOrder) {
        if (order === 'desc') {
          return a > b ? 1 : -1;
        } else {
          return b < a ? -1 : 1;
        }
      },
      sortCaret: _sortCaret,
    },
    {
      dataField: 'score',
      text: 'Score',
      sort: true,
      classes: 'standings-result',
      headerClasses: 'standings-result-head',
      formatter: function _formatter(
        cell: number,
        row: UserStandingsEntry,
        _rowIndex: number,
        _contest: Contest
      ) {
        return (
          <>
            <p>
              {cell > 0 && (
                <span className="standings-score">{formatScore(cell)}</span>
              )}
              {cell <= 0 ? (
                <span>(0)</span>
              ) : row.submit_count >= 2 ? (
                <span className="standings-wa">{` (${
                  row.submit_count - 1
                })`}</span>
              ) : (
                <></>
              )}
            </p>
            <p>
              {row.score_time > 0 &&
                formatElapsedSec(row.score_time - _contest.start_time_unix)}
            </p>
          </>
        );
      },
      formatExtraData: contest,
      sortFunc: function _sortFunc(
        _a: number,
        _b: number,
        order: SortOrder,
        _dataField: string,
        rowA: UserStandingsEntry,
        rowB: UserStandingsEntry
      ) {
        if (order === 'desc') {
          return compareUserStandingsTaskEntry(rowA, rowB);
        } else {
          return compareUserStandingsTaskEntry(rowB, rowA);
        }
      },
      sortCaret: _sortCaret,
    },
    ...contestTasks.map(
      (task: Task): ColumnDescription => {
        return {
          dataField: `tasks_${task.task_slug}`,
          isDummyField: true,
          text: task.label,
          sort: true,
          classes: 'standings-result',
          headerClasses: 'standings-result-head',
          formatter: function _formatter(
            _cell: null,
            row: UserStandingsEntry,
            _rowIndex: number,
            formatExtraData: { task: Task; contest: Contest }
          ) {
            const { task, contest: _contest } = formatExtraData;
            const userTaskEntry = row.tasks.get(
              task.task_slug
            ) as UserStandingsTaskEntry;
            return (
              <>
                <p>
                  {userTaskEntry.score > 0 && (
                    <span className="standings-ac">
                      {formatScore(userTaskEntry.score)}
                    </span>
                  )}
                  {userTaskEntry.submit_count === 0 &&
                  userTaskEntry.submit_count_ce > 0 &&
                  userTaskEntry.score <= 0 ? (
                    <span>(0)</span>
                  ) : userTaskEntry.submit_count >= 1 &&
                    userTaskEntry.score <= 0 ? (
                    <span className="standings-wa">{` (${userTaskEntry.submit_count})`}</span>
                  ) : userTaskEntry.submit_count >= 2 ? (
                    <span className="standings-wa">{` (${
                      userTaskEntry.submit_count - 1
                    })`}</span>
                  ) : (
                    <></>
                  )}
                </p>
                <p>
                  {userTaskEntry.score_time > 0 &&
                    formatElapsedSec(
                      userTaskEntry.score_time - _contest.start_time_unix
                    )}
                </p>
              </>
            );
          },
          formatExtraData: { task, contest },
          headerFormatter: function _formatter(
            column: ColumnDescription,
            _colIndex: number,
            components: { sortElement: JSX.Element; filterElement: JSX.Element }
          ) {
            return (
              <>
                <a
                  href={`https://atcoder.jp/contests/${task.contest_slug}/tasks/${task.task_slug}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {column.text}
                </a>
                {components.sortElement}
              </>
            );
          },
          sortFunc: function _sortFunc(
            _a: null,
            _b: null,
            order: SortOrder,
            _dataField: string,
            rowA: UserStandingsEntry,
            rowB: UserStandingsEntry
          ) {
            const entryA = rowA.tasks.get(
              task.task_slug
            ) as UserStandingsTaskEntry;
            const entryB = rowB.tasks.get(
              task.task_slug
            ) as UserStandingsTaskEntry;
            if (order === 'desc') {
              return compareUserStandingsTaskEntry(entryA, entryB);
            } else {
              return compareUserStandingsTaskEntry(entryB, entryA);
            }
          },
          sortCaret: _sortCaret,
        };
      }
    ), // end map
  ];

  let maxRankText = '';
  if (userStandingsEntries.length > 0) {
    maxRankText = `\n1位は ${
      userStandingsEntries[0].user_name
    } さん (${formatScore(userStandingsEntries[0].score)} 点) だよ！`;
  }

  const tweetTitle =
    `Replay of ${contest.contest_name} at ${dataFormat(
      parsedDatetime,
      'yyyy-mm-dd HH:MM:sso'
    )}\n` +
    `${maxRankText}\n` +
    `AtCoder Marathon Replay`;

  return (
    <>
      <hr />
      <h4
        style={{
          textAlign: 'center',
          marginTop: '30px',
        }}
      >
        Replay of {contest.contest_name}
      </h4>
      <h5
        style={{
          textAlign: 'center',
        }}
      >
        at {dataFormat(parsedDatetime, 'yyyy-mm-dd(ddd) HH:MM:sso')} (
        {formatElapsedSec(
          Math.floor(parsedDatetime.getTime() / 1000) - contest.start_time_unix
        )}{' '}
        elapsed)
      </h5>
      <PaginationProvider
        pagination={paginationFactory({
          custom: true,
          sizePerPage: 20,
          sizePerPageList: [10, 20, 50, 100, 1000],
          totalSize: userStandingsEntries.length,
        })}
      >
        {({ paginationProps, paginationTableProps }) => {
          paginationTableProps.keyField = 'user_name';
          paginationTableProps.data = userStandingsEntries;
          paginationTableProps.columns = columns;
          return (
            <div>
              <PaginationPanel renderSizePerPage={true} {...paginationProps} />
              <BootstrapTable
                bootstrap4
                classes="th-center th-middle td-center td-middle table-standings"
                striped
                // keyField="user_name"
                // data={userStandingsEntries}
                // columns={columns}
                filter={filterFactory()}
                wrapperClasses="table-responsive"
                {...paginationTableProps}
              />
              <PaginationPanel renderSizePerPage={false} {...paginationProps} />
            </div>
          );
        }}
      </PaginationProvider>
      <div style={{ textAlign: 'center' }}>
        <TwitterShareButton
          url={window.location.href}
          title={tweetTitle}
          id="standings-table-share-button"
        >
          <TwitterIcon size={40} round />
        </TwitterShareButton>
        <UncontrolledTooltip
          placement="top"
          target="standings-table-share-button"
        >
          {(tweetTitle + ' ' + window.location.href).replaceAll('\n', ' ')}
        </UncontrolledTooltip>
      </div>
      <hr />
    </>
  );
};
