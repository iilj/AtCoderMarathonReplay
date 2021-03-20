import React from 'react';
import { ordinalSuffixOf } from '../../utils';
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
}

export const RankLineChartLabel: React.FC<Props> = (props) => {
  const { index, x, y, color, rankChartDataSequence } = props;
  if (index === undefined) return <></>;
  if (x === undefined || y === undefined) return <></>;
  const data: RankChartData = rankChartDataSequence[index];
  if (data.type !== 'update') return <></>;
  const fontSize = 14;
  const offset = 10;
  const text = `${data.rank}${ordinalSuffixOf(data.rank)}`;
  const fillId = `solid-${data.user}-${index}`;
  return (
    <g>
      <defs>
        <filter x="-0.05" y="-0.07" width="1.1" height="1.1" id={fillId}>
          <feFlood floodColor={color} />
          <feComposite in="SourceGraphic" operator="xor" />
        </filter>
      </defs>
      <text
        filter={`url(#${fillId})`}
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
