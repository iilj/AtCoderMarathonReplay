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
} from 'recharts';
import Contest from '../../interfaces/Contest';
import {
  getChartLineColor,
  getDatetimeTickFormatter,
  getDatetimeTicks,
  scoreTickFormatter,
} from '../../utils/Chart';
import { RankChartData } from '../../utils/RankReproducer';
import { RankLineChartTooltip } from './RankLineChartTooltip';
import { ScoreLineChartLabel } from './ScoreLineChartLabel';

interface Props {
  sequences: [string, RankChartData[]][];
  contest: Contest;
  showDots: boolean;
  showACLabels: boolean;
}

export const ScoreLineChart: React.FC<Props> = (props) => {
  const { sequences, contest, showDots, showACLabels } = props;

  const scoreUpdateSequences: [
    string,
    RankChartData[]
  ][] = sequences.map(([user, rankChartDataSequence]): [
    string,
    RankChartData[]
  ] => [
    user,
    rankChartDataSequence.filter(
      (rankChartData) => rankChartData.type === 'update'
    ),
  ]);

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
            name="score"
            label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
            tickFormatter={scoreTickFormatter}
          />
          <Tooltip content={<RankLineChartTooltip />} />
          <Legend />
          {scoreUpdateSequences.map(
            (entry: [string, RankChartData[]], index: number) => {
              const [user, seq] = entry;
              const color = getChartLineColor(index);
              return (
                <Line
                  key={user}
                  data={seq}
                  name={user}
                  dataKey="score"
                  type="stepAfter"
                  stroke={color}
                  dot={showDots && { fillOpacity: 0.2, strokeWidth: 1 }}
                >
                  {showACLabels && (
                    <LabelList
                      dataKey="label"
                      position="top"
                      content={
                        <ScoreLineChartLabel
                          color={color}
                          rankChartDataSequence={seq}
                        />
                      }
                    />
                  )}
                </Line>
              );
            }
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
