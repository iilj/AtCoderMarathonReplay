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
import { ordinalSuffixOf } from '../../utils';
import {
  getChartLineColor,
  getDatetimeTickFormatter,
  getDatetimeTicks,
} from '../../utils/Chart';
import { RankChartData } from '../../utils/RankReproducer';
import { LineChartLabel } from './LineChartLabel';
import { LineChartTooltip } from './LineChartTooltip';

interface Props {
  sequences: [string, RankChartData[]][];
  contest: Contest;
  showDots: boolean;
  showACLabels: boolean;
}

export const RankLineChart: React.FC<Props> = (props) => {
  const { sequences, contest, showDots, showACLabels } = props;

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
            name="rank"
            label={{ value: 'Rank', angle: -90, position: 'insideLeft' }}
            reversed
          />
          <Tooltip content={<LineChartTooltip />} />
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
