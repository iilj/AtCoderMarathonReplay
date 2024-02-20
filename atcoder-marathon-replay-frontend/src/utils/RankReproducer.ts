import Submission from '../interfaces/Submission';
import { BinaryIndexedTree } from './BinaryIndexedTree';

class ContestUserState {
  taskScoreMap: Map<string, number>;
  score: number;
  afterTargetUser: boolean;
  constructor() {
    this.taskScoreMap = new Map<string, number>();
    this.score = 0;
    this.afterTargetUser = false;
  }
  addSubmission(contestSubmission: Submission, inverted: boolean): void {
    const val = contestSubmission.score;
    if (this.taskScoreMap.has(contestSubmission.task)) {
      // 2回目以降の提出
      const curVal = this.taskScoreMap.get(contestSubmission.task) as number;
      if (inverted) {
        // loss 増加
        if (curVal === 0) {
          // 前回も今回も 0 点なら無視する
          if (val === 0) return;
          // loss が増加した場合は curVal < val になるが，
          // 前回の提出 (curVal) が 0 点で今回の提出 (val) が正の得点の場合も curVal < val になるので，
          // curVal === 0 のみ別途判定する
        } else if (curVal < val || val === 0) return;
      } else {
        // score 減少
        if (curVal > val) return;
      }
      this.score += val - curVal;
    } else {
      // 初回提出
      this.score += val;
    }
    this.taskScoreMap.set(contestSubmission.task, val);
  }
}

export interface RankChartData {
  user: string;
  time_unix: number;
  rank: number;
  score: number;
  type: 'update' | 'overtook';
  task: string;
  status: string;
  oldScore?: number;
  overtakeUserName?: string;
  overtakeUserOldScore?: number;
  overtakeUserNewScore?: number;
}

export const getRankSequence = (
  user: string,
  contestSubmissions: Submission[],
  inverted: boolean
): RankChartData[] => {
  if (
    !contestSubmissions.some(
      (contestSubmission: Submission): boolean =>
        contestSubmission.user_name === user
    )
  ) {
    return [] as RankChartData[];
  }
  // assert ユーザがいる

  // 一度目のシミュレート（各ユーザの得点計算のみ）
  const scoreSet = new Set<number>(); // ありうる得点一覧
  scoreSet.add(0);
  let userLength; // ユーザ数
  {
    const userSubmissionsMap = new Map<string, Submission[]>(); // ユーザ名→提出一覧
    contestSubmissions.forEach((contestSubmission: Submission): void => {
      if (userSubmissionsMap.has(contestSubmission.user_name)) {
        userSubmissionsMap
          .get(contestSubmission.user_name)
          ?.push(contestSubmission);
      } else {
        userSubmissionsMap.set(contestSubmission.user_name, [
          contestSubmission,
        ]);
      }
    });
    userLength = userSubmissionsMap.size;

    userSubmissionsMap.forEach((userSubmissions: Submission[]): void => {
      const contestUserState = new ContestUserState();
      userSubmissions.forEach((contestSubmission: Submission): void => {
        contestUserState.addSubmission(contestSubmission, inverted);
        scoreSet.add(contestUserState.score);
      });
    });
  }

  // 得点一覧を生成
  const scores: number[] = Array.from(scoreSet.values());
  void scores.sort((a, b) => a - b);
  if (inverted) {
    // 0, Max, Max-1, ..., 2, 1 の順にする
    scores.reverse();
    scores.pop();
    scores.unshift(0);
  }

  // 座圧用辞書を作成
  const compress = new Map<number, number>(); // 得点→インデックス
  scores.forEach((score: number, index: number): void => {
    compress.set(score, index);
  });

  // 二度目のシミュレート（各段階における順位の計算）
  const bit: BinaryIndexedTree = new BinaryIndexedTree(scores.length); // 各得点に何人いるか
  bit.add(compress.get(0) as number, userLength); // 全員を 0 点として扱う
  let curScore = 0;
  let curIndex = 0;
  let curRank = 1;
  const seq: RankChartData[] = [];
  {
    const userStateMap = new Map<string, ContestUserState>();
    contestSubmissions.forEach((contestSubmission: Submission): void => {
      if (!userStateMap.has(contestSubmission.user_name)) {
        const tmpUserState = new ContestUserState();
        tmpUserState.afterTargetUser = true;
        userStateMap.set(contestSubmission.user_name, tmpUserState);
      }
      const contestUserState = userStateMap.get(
        contestSubmission.user_name
      ) as ContestUserState;
      const oldScore = contestUserState.score;
      // const oldAfterTargetUser = contestUserState.afterTargetUser;
      contestUserState.addSubmission(contestSubmission, inverted);
      // contestUserState.afterTargetUser = false;
      const newScore = contestUserState.score;
      if (newScore !== oldScore) {
        // スコア更新
        const oldIndex = compress.get(oldScore) as number;
        const newIndex = compress.get(newScore) as number;
        bit.add(oldIndex, -1);
        bit.add(newIndex, 1);
        if (contestSubmission.user_name === user) {
          // curScore 以上の得点を取っている人数が順位
          curScore = newScore;
          curIndex = newIndex;
          curRank = bit.query(newIndex, scores.length);
          seq.push({
            user: user,
            type: 'update',
            time_unix: contestSubmission.time_unix,
            rank: curRank,
            score: newScore,
            oldScore: oldScore,
            task: contestSubmission.task,
            status: contestSubmission.status,
          });
        } else {
          if (newIndex < curIndex) {
            // 追い越さなかった
            contestUserState.afterTargetUser = false;
            return;
          } else if (newIndex === curIndex) {
            // 同点になったけど追い越さなかった
            contestUserState.afterTargetUser = true;
            return;
          } else {
            // 追い越したか，あるいは最初から高い順位にいるか
            if (oldIndex > curIndex) {
              // 最初から得点が高い
              contestUserState.afterTargetUser = false;
              return;
            } else if (
              oldIndex === curIndex &&
              !contestUserState.afterTargetUser
            ) {
              // ターゲットユーザよりも先に今の得点を取っていた
              return;
            }
            // assert 追い越した
            // console.log(`${oldScore} -> (${curScore}) -> ${newScore}`);
            seq.push({
              user: user,
              type: 'overtook',
              time_unix: contestSubmission.time_unix,
              rank: ++curRank,
              score: curScore,
              overtakeUserName: contestSubmission.user_name,
              overtakeUserOldScore: oldScore,
              overtakeUserNewScore: newScore,
              task: contestSubmission.task,
              status: contestSubmission.status,
            });
            contestUserState.afterTargetUser = false;
          }
        }
      }
    });
  }
  return seq;
};
