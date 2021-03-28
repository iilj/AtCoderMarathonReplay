import React from 'react';
import BootstrapTable, {
  ColumnDescription,
  SortOrder,
} from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import Contest from '../../interfaces/Contest';
import Submission from '../../interfaces/Submission';
import './standings-table.css';
import { formatScore, formatElapsedSec } from '../../utils';
import Task from '../../interfaces/Task';

interface UserStandingsTaskEntry {
  score: number;
  score_time: number;
  submit_count: number; // CE 以外の提出回数
  submit_count_ce: number;
}

interface UserStandingsEntry {
  user_name: string;
  score: number;
  score_time: number;
  submit_count: number; // CE 以外の提出回数
  submit_count_ce: number;
  rank: number;
  tasks: Map<string, UserStandingsTaskEntry>; // 問題ごとの得点
}

interface Props {
  contest?: Contest;
  contestSubmissions: Submission[];
  contestTasks: Task[];
}

export const StandingsTable: React.FC<Props> = (props) => {
  const { contest, contestSubmissions, contestTasks } = props;

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
  userStandingsEntries.sort(
    (a: UserStandingsEntry, b: UserStandingsEntry): number => {
      // スコアが高いほうが順位が上
      if (a.score != b.score) return b.score - a.score;
      if (a.score > 0) {
        // 正の得点同士なら
        if (a.score_time != b.score_time) return a.score_time - b.score_time;
        return a.submit_count - b.submit_count;
      } else {
        // 0 点同士なら
        // WA が順位表上は上位になり，CE だけの人は後ろに回される
        // const is_wa_a = a.submit_count > 0;
        // const is_wa_b = b.submit_count > 0;
        // if (is_wa_a == is_wa_b) return 0;
        // if (is_wa_a) return -1;
        // return 1;
        return 0;
      }
    }
  );
  // TODO: 同じ順位に対応する
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
      sortFunc: function sortFunc(a: number, b: number, order: SortOrder) {
        if (order === 'desc') {
          return a - b;
        } else {
          return b - a;
        }
      },
    },
    {
      dataField: 'user_name',
      text: 'User',
      sort: true,
      classes: 'standings-username',
      headerClasses: 'standings-username-head',
      filter: textFilter(),
      formatter: function _formatter(cell: string) {
        return (
          <>
            <a href={`https://atcoder.jp/users/${cell}`} className="username">
              <span className="user">{cell}</span>
            </a>
          </>
        );
      },
      sortFunc: function sortFunc(a: string, b: string, order: SortOrder) {
        // console.log(order, a > b);
        if (order === 'desc') {
          return a > b ? 1 : -1;
        } else {
          return b < a ? -1 : 1;
        }
      },
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
      sortFunc: function sortFunc(
        _a: number,
        _b: number,
        order: SortOrder,
        _dataField: string,
        rowA: UserStandingsEntry,
        rowB: UserStandingsEntry
      ) {
        if (order === 'desc') {
          if (rowA.score != rowB.score) return rowB.score - rowA.score;
          if (rowA.score > 0) {
            // 正の得点同士なら
            if (rowA.score_time != rowB.score_time)
              return rowA.score_time - rowB.score_time;
            return rowA.submit_count - rowB.submit_count;
          } else {
            // 0 点同士なら
            return 0;
          }
        } else {
          if (rowA.score != rowB.score) return rowA.score - rowB.score;
          if (rowA.score > 0) {
            // 正の得点同士なら
            if (rowA.score_time != rowB.score_time)
              return rowB.score_time - rowA.score_time;
            return rowB.submit_count - rowA.submit_count;
          } else {
            // 0 点同士なら
            return 0;
          }
        }
      },
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
                >
                  {column.text}
                </a>
                {components.sortElement}
              </>
            );
          },
          sortFunc: function sortFunc(
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
              if (entryA.score != entryB.score)
                return entryB.score - entryA.score;
              if (entryA.score > 0) {
                // 正の得点同士なら
                if (entryA.score_time != entryB.score_time)
                  return entryA.score_time - entryB.score_time;
                return entryA.submit_count - entryB.submit_count;
              } else {
                // 0 点同士なら
                return 0;
              }
            } else {
              if (entryA.score != entryB.score)
                return entryA.score - entryB.score;
              if (entryA.score > 0) {
                // 正の得点同士なら
                if (entryA.score_time != entryB.score_time)
                  return entryB.score_time - entryA.score_time;
                return entryB.submit_count - entryA.submit_count;
              } else {
                // 0 点同士なら
                return 0;
              }
            }
          },
        };
      }
    ),
  ];

  return (
    <BootstrapTable
      bootstrap4
      classes="th-center th-middle td-center td-middle table-standings"
      rowStyle={{ fontSize: '14px' }}
      striped
      keyField="user_name"
      data={userStandingsEntries}
      columns={columns}
      pagination={paginationFactory({
        sizePerPage: 20,
        sizePerPageList: [10, 20, 50, 100, 1000],
      })}
      filter={filterFactory()}
      wrapperClasses="table-responsive"
    />
  );
};
