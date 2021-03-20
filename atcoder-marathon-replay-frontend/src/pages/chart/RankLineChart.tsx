import React from "react";
import { TwitterIcon, TwitterShareButton } from "react-share";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, LabelList } from 'recharts';
import Contest from "../../interfaces/Contest";
import Submission from "../../interfaces/Submission";
import { dateToString } from "../../utils";
import { getRankSequence, RankChartData } from "../../utils/RankReproducer";
import { RankLineChartLabel } from "./RankLineChartLabel";
import { RankLineChartTooltip } from "./RankLineChartTooltip";

interface Props {
  users: string[];
  contest?: Contest;
  contestSubmissions: Submission[];
  showDots: boolean;
  showACLabels: boolean;
}

const getTicks = (contest: Contest): number[] => {
  const contestDurationHours = (contest.end_time_unix - contest.start_time_unix) / 3600;
  let interval_sec = 3600;
  if (contestDurationHours <= 12) {
    interval_sec = 3600; // 12 時間以内なら 1 時間ごとに
  } else if (contestDurationHours <= 24) {
    interval_sec = 3600 * 2; // 24 時間以内なら 2 時間ごとに
  } else if (contestDurationHours <= 24 * 3) {
    interval_sec = 3600 * 6; // 3 日以内なら 6 時間ごとに
  } else {
    interval_sec = 3600 * 24; // 1 日ごと
  }
  const ret: number[] = [contest.start_time_unix];
  for (let cur = contest.start_time_unix - ((contest.start_time_unix + 3600 * 9) % interval_sec) + interval_sec;
    cur < contest.end_time_unix; cur += interval_sec) {
    ret.push(cur);
  }
  ret.push(contest.end_time_unix);
  return ret;
};

const getTickFormatter = (contest: Contest): ((time_unix: number) => string) => {
  const contestDurationHours = (contest.end_time_unix - contest.start_time_unix) / 3600;
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
  return ((time_unix: number) => dateToString(new Date(time_unix * 1000), format));
};

const chartLineColors = ['#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', '#8C564B', '#E377C2', '#7D7F7F', '#BCBD22', '#17BECF'];

export const RankLineChart: React.FC<Props> = (props) => {
  const { users, contest, contestSubmissions, showDots, showACLabels } = props;
  if (!contest || users.length === 0) {
    return (
      <div style={{ height: '50px' }}></div>
    );
  }
  if (contestSubmissions.length === 0) {
    return (
      <div style={{ width: '100%', height: '500px', textAlign: 'center', marginTop: '100px', marginBottom: '100px' }}>Fetch data...</div>
    );
  }

  const sequences: [string, RankChartData[]][] = users.map(user => [user, getRankSequence(user, contestSubmissions)]);
  if (sequences.every(entry => entry[1].length === 0)) {
    return (
      <div style={{ width: '100%', height: '500px', textAlign: 'center', marginTop: '100px', marginBottom: '100px' }}>Invalid UserName</div>
    );
  }

  let maxRankText = '';
  if (sequences.length === 1) {
    const [maxtime, maxrank] = sequences[0][1].reduce(
      (prev: [number, number], rankChartdata: RankChartData): [number, number] => {
        if (rankChartdata.type !== 'update') return prev;
        const prevRank = prev[1];
        if (prevRank < rankChartdata.rank) return prev;
        return [rankChartdata.time_unix, rankChartdata.rank];
      }, [-1, contestSubmissions.length] as [number, number]);
    maxRankText = `\n最大瞬間風速は ${maxrank} 位 (${dateToString(new Date(maxtime * 1000), 'MM/DD hh:mm')}) だよ！`;
  }
  const tweetTitle = `${users.join(',')}'s replay of ${contest.contest_name}
${maxRankText}
AtCoder Marathon Replay`;

  return (
    <>
      <h4 style={{ textAlign: 'center', marginTop: '50px', marginBottom: '-30px' }}>Replay of {contest.contest_name}</h4>
      <div style={{ width: '100%', height: '500px', marginTop: '50px' }}>
        <ResponsiveContainer>
          <LineChart
            width={1000}
            height={500}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="time_unix" name="unixtime" domain={[contest.start_time_unix, contest.end_time_unix]}
              tickFormatter={getTickFormatter(contest)} ticks={getTicks(contest)}>
              <Label value="Datetime" offset={0} position="insideBottom" />
            </XAxis>
            <YAxis type="number" name="rank" label={{ value: 'Rank', angle: -90, position: 'insideLeft' }} reversed />
            <Tooltip
              content={
                <RankLineChartTooltip />
              }
            />
            <Legend />
            {
              sequences.map((entry: [string, RankChartData[]], index: number) => {
                const [user, seq] = entry;
                return (
                  <Line
                    key={user}
                    data={seq}
                    name={user} dataKey="rank" type='stepAfter'
                    stroke={chartLineColors[index % chartLineColors.length]}
                    dot={showDots && { fillOpacity: 0.2, strokeWidth: 1 }}>
                    {showACLabels && (
                      <LabelList dataKey="label" position="top" content={
                        <RankLineChartLabel
                          color={chartLineColors[index % chartLineColors.length]}
                          rankChartDataSequence={seq} />
                      } />
                    )}
                  </Line>
                );
              })
            }
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ textAlign: 'center' }}>
        <TwitterShareButton url={window.location.href} title={tweetTitle}>
          <TwitterIcon size={40} round />
        </TwitterShareButton>
      </div>
    </>
  );
};