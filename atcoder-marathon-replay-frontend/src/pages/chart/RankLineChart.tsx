import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  LabelList,
  ReferenceArea,
} from 'recharts';
import Contest from '../../interfaces/Contest';
import Perfs from '../../interfaces/Perfs';
import { ordinalSuffixOf } from '../../utils';
import {
  getChartLineColor,
  getDatetimeTickFormatter,
  getDatetimeTicks,
  getRankTicks,
} from '../../utils/Chart';
import { RankChartData } from '../../utils/RankReproducer';
import { getRatingColorCode, RatingColors } from '../../utils/RatingColor';
import { LineChartLabel } from './LineChartLabel';
import { LineChartTooltip } from './LineChartTooltip';

interface Props {
  sequences: [string, RankChartData[]][];
  contest: Contest;
  showDots: boolean;
  showACLabels: boolean;
  perfs?: Perfs;
}

export const RankLineChart: React.FC<Props> = (props) => {
  const { sequences, contest, showDots, showACLabels, perfs } = props;

  const maxRank = sequences.reduce(
    (ma: number, curValue: [string, RankChartData[]]): number => {
      return curValue[1].reduce(
        (ma_: number, curValue_: RankChartData): number => {
          return Math.max(ma_, curValue_.rank);
        },
        ma
      );
    },
    1
  );

  const rankTicks = getRankTicks(maxRank);
  const maxRankForChart = rankTicks[rankTicks.length - 1];
  console.log(rankTicks);

  return (
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
          {perfs &&
            [...perfs.borders, 0].map((top, index) => {
              const bottom: number =
                index === 0
                  ? maxRankForChart
                  : Math.min(maxRankForChart, perfs.borders[index - 1]);
              if (bottom < top) return null;
              const color: string = getRatingColorCode(RatingColors[index + 1]);
              return (
                <ReferenceArea
                  x1={contest.start_time_unix}
                  x2={contest.end_time_unix}
                  y1={bottom}
                  y2={top}
                  fill={color}
                  key={index}
                  isFront={false}
                  opacity={0.3}
                />
              );
            })}
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="time_unix"
            name="unixtime"
            domain={[contest.start_time_unix, contest.end_time_unix]}
            tickFormatter={getDatetimeTickFormatter(contest)}
            ticks={getDatetimeTicks(contest)}
          >
            <Label value="Datetime" offset={0} position="insideBottom" />
          </XAxis>
          <YAxis
            type="number"
            name="rank"
            label={{ value: 'Rank', angle: -90, position: 'insideLeft' }}
            reversed
            domain={[0, maxRankForChart]}
            ticks={rankTicks}
          />
          <Tooltip content={<LineChartTooltip perfs={perfs} />} />
          <Legend />
          {sequences.map((entry: [string, RankChartData[]], index: number) => {
            const [user, seq] = entry;
            const color = getChartLineColor(index);
            return (
              <Line
                key={user}
                data={seq}
                name={user}
                dataKey="rank"
                type="stepAfter"
                stroke={color}
                dot={showDots && { fillOpacity: 0.2, strokeWidth: 1 }}
              >
                {showACLabels && (
                  <LabelList
                    dataKey="label"
                    position="top"
                    content={
                      <LineChartLabel
                        color={color}
                        rankChartDataSequence={seq}
                        getText={(data: RankChartData): string =>
                          `${data.rank}${ordinalSuffixOf(data.rank)}`
                        }
                        chartId="rank"
                      />
                    }
                  />
                )}
              </Line>
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
