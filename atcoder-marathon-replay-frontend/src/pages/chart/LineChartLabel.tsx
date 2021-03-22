import React from 'react';
import { RankChartData } from '../../utils/RankReproducer';

interface Props {
  index?: number;
  offset?: number;
  position?: string;
  value?: number;
  viewBox?: {
    height: number;
    width: number;
    x: number;
    y: number;
  };
  x?: number;
  y?: number;
  color: string;
  rankChartDataSequence: RankChartData[];
  getText: (data: RankChartData) => string;
  chartId: string;
}

export const LineChartLabel: React.FC<Props> = (props) => {
  const { index, x, y, color, rankChartDataSequence, getText, chartId } = props;
  if (index === undefined) return <></>;
  if (x === undefined || y === undefined) return <></>;
  const data: RankChartData = rankChartDataSequence[index];
  if (data.type !== 'update') return <></>;
  const fontSize = 14;
  const offset = 10;
  const text = getText(data);
  const colorFillId = `solid-${chartId}-${data.user}-${index}-color`;
  return (
    <g>
      <defs>
        <filter id={colorFillId} x="-0.05" y="-0.07" width="1.1" height="1.1">
          <feFlood floodColor={color} floodOpacity="0.8" />
          <feComposite operator="over" in="SourceGraphic" />
        </filter>
      </defs>
      <text
        filter={`url(#${colorFillId})`}
        x={x}
        y={y - offset}
        fontSize={fontSize}
        fill="none"
      >
        {text}
      </text>
      <text x={x} y={y - offset} fontSize={fontSize} fill="white">
        {text}
      </text>
    </g>
  );
};
