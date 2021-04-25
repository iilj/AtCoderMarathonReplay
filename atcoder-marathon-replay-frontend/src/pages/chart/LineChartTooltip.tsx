import React from 'react';
import dataFormat from 'dateformat';
import { RankChartData } from '../../utils/RankReproducer';
import Perfs from '../../interfaces/Perfs';
import { getRatingColorClass } from '../../utils/RatingColor';

interface RankLineChartTooltipPayloadContainer {
  color: string;
  dataKey: string; // rank
  fill: string;
  name: string; // atcoder user name
  stroke: string;
  strokeWidth: number;
  value: number;
  payload: RankChartData;
}

interface Props {
  active?: boolean;
  payload?: RankLineChartTooltipPayloadContainer[];
  label?: number;
  perfs?: Perfs;
}

export const LineChartTooltip: React.FC<Props> = (props) => {
  const { active, payload, label, perfs } = props;
  if (!active || payload === undefined || label === undefined) return <></>;
  return (
    <div
      className="recharts-default-tooltip"
      style={{
        margin: '0px',
        padding: '10px',
        backgroundColor: 'rgb(255, 255, 255)',
        border: '1px solid rgb(204, 204, 204)',
        whiteSpace: 'nowrap',
      }}
    >
      <p className="recharts-tooltip-label" style={{ margin: '0px' }}>
        {dataFormat(new Date(label * 1000), 'yyyy-mm-dd HH:MM:ss')}
      </p>
      {payload
        .map((payloadContainer: RankLineChartTooltipPayloadContainer) => {
          const curPayload: RankChartData = payloadContainer.payload;
          if (
            payloadContainer.name !== curPayload.user ||
            label !== curPayload.time_unix
          ) {
            return undefined;
          }
          return (
            <div key={payloadContainer.name}>
              <hr style={{ marginTop: '0.3em', marginBottom: '0.3em' }} />
              <div
                style={{ color: payloadContainer.stroke }}
              >{`User: ${payloadContainer.name}`}</div>
              <ul
                className="recharts-tooltip-item-list"
                style={{ padding: '0px', margin: '0px' }}
              >
                <li
                  className="recharts-tooltip-item"
                  style={{
                    display: 'block',
                    paddingTop: '4px',
                    paddingBottom: '4px',
                    color: 'rgb(136, 132, 216)',
                  }}
                >
                  <span className="recharts-tooltip-item-name">Rank</span>
                  <span className="recharts-tooltip-item-separator"> : </span>
                  <span className="recharts-tooltip-item-value">
                    {curPayload.rank}
                  </span>
                  <span className="recharts-tooltip-item-unit" />
                </li>
                {perfs && (
                  <li
                    className="recharts-tooltip-item"
                    style={{
                      display: 'block',
                      paddingTop: '0px',
                      paddingBottom: '4px',
                      color: 'rgb(136, 132, 216)',
                    }}
                  >
                    <span className="recharts-tooltip-item-name">
                      Performance
                    </span>
                    <span className="recharts-tooltip-item-separator"> : </span>
                    <span
                      className={`recharts-tooltip-item-value ${getRatingColorClass(
                        perfs.perfs[curPayload.rank - 1]
                      )}`}
                    >
                      {perfs.perfs[curPayload.rank - 1]}
                    </span>
                    <span className="recharts-tooltip-item-unit" />
                  </li>
                )}
              </ul>
              <div style={{ fontSize: 10 }}>
                {curPayload.type === 'update' ? (
                  <>
                    <div>得点を更新しました:</div>
                    <div>
                      <span style={{ color: payloadContainer.stroke }}>
                        {curPayload.oldScore}
                      </span>
                      {' → '}
                      <span style={{ color: payloadContainer.stroke }}>
                        {curPayload.score}
                      </span>
                    </div>
                    <div>{`(${curPayload.task} ${curPayload.status})`}</div>
                  </>
                ) : (
                  <>
                    <div>{`${
                      curPayload.overtakeUserName ?? ''
                    } さんに追い抜かれました:`}</div>
                    <div>
                      {`${payloadContainer.name}: `}
                      <span style={{ color: payloadContainer.stroke }}>
                        {curPayload.score}
                      </span>
                    </div>
                    <div>{`${curPayload.overtakeUserName ?? ''}: ${
                      curPayload.overtakeUserOldScore ?? ''
                    } → ${curPayload.overtakeUserNewScore ?? ''}`}</div>
                    <div
                      style={{ marginLeft: '1em' }}
                    >{`(${curPayload.task} ${curPayload.status})`}</div>
                  </>
                )}
              </div>
            </div>
          );
        })
        .filter((element) => element !== undefined)}
    </div>
  );
};
