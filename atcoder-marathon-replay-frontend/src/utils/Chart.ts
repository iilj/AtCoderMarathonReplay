import { dateToString } from '.';
import Contest from '../interfaces/Contest';

export const getDatetimeTicks = (contest: Contest): number[] => {
  const contestDurationHours =
    (contest.end_time_unix - contest.start_time_unix) / 3600;
  let interval_sec = 3600;
  if (contestDurationHours <= 6) {
    interval_sec = 1800; // 6 時間以内なら 0.5 時間ごとに
  } else if (contestDurationHours <= 12) {
    interval_sec = 3600; // 12 時間以内なら 1 時間ごとに
  } else if (contestDurationHours <= 24) {
    interval_sec = 3600 * 2; // 24 時間以内なら 2 時間ごとに
  } else if (contestDurationHours <= 24 * 3) {
    interval_sec = 3600 * 6; // 3 日以内なら 6 時間ごとに
  } else {
    interval_sec = 3600 * 24; // 1 日ごと
  }
  const ret: number[] = [contest.start_time_unix];
  for (
    let cur =
      contest.start_time_unix -
      ((contest.start_time_unix + 3600 * 9) % interval_sec) +
      interval_sec;
    cur < contest.end_time_unix;
    cur += interval_sec
  ) {
    ret.push(cur);
  }
  ret.push(contest.end_time_unix);
  return ret;
};

export const getDatetimeTickFormatter = (
  contest: Contest
): ((time_unix: number) => string) => {
  const contestDurationHours =
    (contest.end_time_unix - contest.start_time_unix) / 3600;
  let format = '';
  if (contestDurationHours <= 12) {
    format = 'hh:mm'; // 12 時間以内なら 1 時間ごとに
  } else if (contestDurationHours <= 24) {
    format = 'hh:mm'; // 24 時間以内なら 2 時間ごとに
  } else if (contestDurationHours <= 24 * 3) {
    format = 'MM/DD hh:mm'; // 3 日以内なら 6 時間ごとに
  } else {
    format = 'MM/DD'; // 1 日ごと
  }
  return (time_unix: number) =>
    dateToString(new Date(time_unix * 1000), format);
};

export const scoreTickFormatter = (score: number): string => {
  let curScore = score;
  let digitlen = 0;
  while (curScore >= 10) {
    curScore /= 10;
    digitlen++;
  }
  return `${curScore.toFixed(1)}e${digitlen}`;
};

export const chartLineColors = [
  '#1F77B4',
  '#FF7F0E',
  '#2CA02C',
  '#D62728',
  '#9467BD',
  '#8C564B',
  '#E377C2',
  '#7D7F7F',
  '#BCBD22',
  '#17BECF',
];
export const getChartLineColor = (index: number): string =>
  chartLineColors[index % chartLineColors.length];
