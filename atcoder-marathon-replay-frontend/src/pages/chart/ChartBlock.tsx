import React, { useState } from 'react';
import { TwitterIcon, TwitterShareButton } from 'react-share';
import {
  Input,
  Row,
  FormGroup,
  Label,
  Col,
  ButtonGroup,
  Button,
  UncontrolledTooltip,
  Alert,
} from 'reactstrap';
import dataFormat from 'dateformat';
import Contest from '../../interfaces/Contest';
import Submission from '../../interfaces/Submission';
import { getRankSequence, RankChartData } from '../../utils/RankReproducer';
import { RankLineChart } from './RankLineChart';
import { ScoreLineChart } from './ScoreLineChart';
import Perfs from '../../interfaces/Perfs';

enum ChartTab {
  'rank' = 0,
  'score' = 1,
}

interface Props {
  users: string[];
  contest?: Contest;
  contestSubmissions: Submission[];
  perfs?: Perfs;
}

const decreasingOrderContestSlugs = [
  'ahc017',
  'ahc018',
  'toyota-hc-2023spring',
  'ahc019',
  'ahc025',
  'ahc027',
  'ahc030',
  'ahc031',
  'ahc033',
  'ahc036',
  'ahc038',
  'ahc040',
  'ahc045',
  'ahc048',
  'ahc051',
];

export const ChartBlock: React.FC<Props> = (props) => {
  const { users, contest, contestSubmissions, perfs } = props;

  const [showDots, setShowDots] = useState<boolean>(true);
  const [showScoreUpdateLabels, setShowScoreUpdateLabels] = useState<boolean>(
    true
  );
  const [activeTab, setActiveTab] = useState<ChartTab>(ChartTab.rank);

  if (!contest) {
    return <div style={{ height: '50px' }}></div>;
  }
  if (users.length === 0) {
    return (
      <Alert
        color="danger"
        style={{
          marginTop: '50px',
          marginBottom: '50px',
        }}
      >
        UserName is empty or invalid.
      </Alert>
    );
  }
  if (contestSubmissions.length === 0) {
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

  const sequences: [string, RankChartData[]][] = users.map((user) => [
    user,
    getRankSequence(
      user,
      contestSubmissions,
      decreasingOrderContestSlugs.includes(contest.contest_slug)
    ),
  ]);
  if (sequences.every((entry) => entry[1].length === 0)) {
    return (
      <>
        {sequences
          .map((entry) => entry[0])
          .map((invalidUser: string) => {
            return (
              <Alert
                key={invalidUser}
                color="danger"
                style={{
                  marginTop: '10px',
                  marginBottom: '20px',
                }}
              >
                {`UserName ${invalidUser} is not in the data.`}
              </Alert>
            );
          })}
      </>
    );
  }
  const invalidUsers: string[] = sequences
    .filter((entry) => entry[1].length === 0)
    .map((entry) => entry[0]);

  let maxRankText = '';
  if (sequences.length === 1) {
    const [maxtime, maxrank] = sequences[0][1].reduce(
      (
        prev: [number, number],
        rankChartdata: RankChartData
      ): [number, number] => {
        if (rankChartdata.type !== 'update') return prev;
        const prevRank = prev[1];
        if (prevRank < rankChartdata.rank) return prev;
        return [rankChartdata.time_unix, rankChartdata.rank];
      },
      [-1, contestSubmissions.length] as [number, number]
    );
    maxRankText = `\n最大瞬間風速は ${maxrank} 位 (${dataFormat(
      new Date(maxtime * 1000),
      'mm/dd HH:MM'
    )}) だよ！`;
  }
  const tweetTitle =
    `${users.join(',')}'s replay of ${contest.contest_name}\n` +
    `${maxRankText}\n` +
    `AtCoder Marathon Replay`;

  return (
    <>
      {invalidUsers.length > 0 &&
        invalidUsers.map((invalidUser: string) => {
          return (
            <Alert
              key={invalidUser}
              color="danger"
              style={{
                marginTop: '10px',
                marginBottom: '20px',
              }}
            >
              {`UserName ${invalidUser} is not in the data.`}
            </Alert>
          );
        })}
      <Row style={{ marginTop: '30px' }}>
        <Col>
          <ButtonGroup className="form-check-inline">
            <Button
              color="secondary"
              onClick={() => {
                setActiveTab(ChartTab.rank);
              }}
              active={activeTab === ChartTab.rank}
            >
              Rank
            </Button>
            <Button
              color="secondary"
              onClick={() => {
                setActiveTab(ChartTab.score);
              }}
              active={activeTab === ChartTab.score}
            >
              Score
            </Button>
          </ButtonGroup>
          <FormGroup check inline>
            <Label check>
              <Input
                type="checkbox"
                checked={showDots}
                onChange={(e) => setShowDots(e.target.checked)}
              />
              Show Dots
            </Label>
          </FormGroup>
          <FormGroup check inline>
            <Label check>
              <Input
                type="checkbox"
                checked={showScoreUpdateLabels}
                onChange={(e) => setShowScoreUpdateLabels(e.target.checked)}
              />
              Show Score Update Labels
            </Label>
          </FormGroup>
        </Col>
      </Row>

      <h4
        style={{
          textAlign: 'center',
          marginTop: '30px',
          marginBottom: '-30px',
        }}
      >
        Replay of {contest.contest_name}
      </h4>
      {activeTab === ChartTab.rank && (
        <RankLineChart
          sequences={sequences}
          contest={contest}
          showDots={showDots}
          showACLabels={showScoreUpdateLabels}
          perfs={perfs}
        />
      )}
      {activeTab === ChartTab.score && (
        <ScoreLineChart
          sequences={sequences}
          contest={contest}
          showDots={showDots}
          showACLabels={showScoreUpdateLabels}
        />
      )}

      <div style={{ textAlign: 'center' }}>
        <TwitterShareButton
          url={window.location.href}
          title={tweetTitle}
          id="chart-share-button"
        >
          <TwitterIcon size={40} round />
        </TwitterShareButton>
        <UncontrolledTooltip placement="top" target="chart-share-button">
          {(tweetTitle + ' ' + window.location.href).replaceAll('\n', ' ')}
        </UncontrolledTooltip>
      </div>
    </>
  );
};
