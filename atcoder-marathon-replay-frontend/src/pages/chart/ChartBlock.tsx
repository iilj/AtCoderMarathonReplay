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
} from 'reactstrap';
import Contest from '../../interfaces/Contest';
import Submission from '../../interfaces/Submission';
import { dateToString } from '../../utils';
import { getRankSequence, RankChartData } from '../../utils/RankReproducer';
import { RankLineChart } from './RankLineChart';
import { ScoreLineChart } from './ScoreLineChart';

enum ChartTab {
  'rank' = 0,
  'score' = 1,
}

interface Props {
  users: string[];
  contest?: Contest;
  contestSubmissions: Submission[];
}

export const ChartBlock: React.FC<Props> = (props) => {
  const { users, contest, contestSubmissions } = props;

  const [showDots, setShowDots] = useState<boolean>(true);
  const [showScoreUpdateLabels, setShowScoreUpdateLabels] = useState<boolean>(
    true
  );
  const [activeTab, setActiveTab] = useState<ChartTab>(ChartTab.rank);

  if (!contest || users.length === 0) {
    return <div style={{ height: '50px' }}></div>;
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
    getRankSequence(user, contestSubmissions),
  ]);
  if (sequences.every((entry) => entry[1].length === 0)) {
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
        Invalid UserName
      </div>
    );
  }

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
    maxRankText = `\n最大瞬間風速は ${maxrank} 位 (${dateToString(
      new Date(maxtime * 1000),
      'MM/DD hh:mm'
    )}) だよ！`;
  }
  const tweetTitle = `${users.join(',')}'s replay of ${contest.contest_name}
  ${maxRankText}
  AtCoder Marathon Replay`;

  return (
    <>
      <Row style={{ marginTop: '30px' }}>
        <Col sm={12}>
          <ButtonGroup className="table-tab">
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
          id="UncontrolledTooltipExample"
        >
          <TwitterIcon size={40} round />
        </TwitterShareButton>
        <UncontrolledTooltip
          placement="top"
          target="UncontrolledTooltipExample"
        >
          {(tweetTitle + ' ' + window.location.href).replaceAll('\n', ' ')}
        </UncontrolledTooltip>
      </div>

      <h2>Display Options</h2>
      <p>
        <Row>
          <Col sm={12}>
            <FormGroup style={{ width: '100%' }} check>
              <Label check>
                <Input
                  type="checkbox"
                  checked={showDots}
                  onChange={(e) => setShowDots(e.target.checked)}
                />
                Show Dots
              </Label>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <FormGroup style={{ width: '100%' }} check>
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
      </p>
    </>
  );
};
