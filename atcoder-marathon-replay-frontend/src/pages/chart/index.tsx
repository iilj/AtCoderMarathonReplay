import React, { useState } from "react";
import {
  Input,
  Row,
  FormGroup,
  Label,
  Col,
} from "reactstrap";
import { connect, PromiseState } from "react-refetch";
import { RankLineChart } from "./RankLineChart";
import { fetchContests, fetchContestSubmissions } from "../../utils/Data";
import Contest from "../../interfaces/Contest";
import Submission from "../../interfaces/Submission";
import { FormBlock } from "./FormBlock";

interface OuterProps {
  match: {
    params: {
      contest: string;
      user: string;
    }
  }
}

interface InnerProps extends OuterProps {
  readonly contestsFetch: PromiseState<Contest[]>;
  readonly contestSubmissionsFetch: PromiseState<Submission[]>;
}

const InnerChartPage: React.FC<InnerProps> = (props) => {
  const { contestsFetch, contestSubmissionsFetch } = props;
  const contests: Contest[] = contestsFetch.fulfilled ? contestsFetch.value : [];
  const contestSubmissions: Submission[] = contestSubmissionsFetch.fulfilled
    ? contestSubmissionsFetch.value
    : [];

  const paramContest: string = props.match.params.contest ?? "";
  const paramUser: string = props.match.params.user ?? "";
  const [showDots, setShowDots] = useState(true);
  const [showACLabels, setShowACLabels] = useState(true);

  const users = paramUser.split(',').map(_user => _user.trim()).filter(_user => _user !== '');

  const contestMap = contests.reduce((prevMap: Map<string, Contest>, contest: Contest): Map<string, Contest> =>
    prevMap.set(contest.contest_slug, contest)
    , new Map<string, Contest>());
  return (
    <>
      <h2>Description</h2>
      <p><a href="https://atcoder-replay.kakira.dev/" target="_blank" rel="noopener">AtCoder Replay (β)</a>
      がマラソンに対応していなかったので作りました．</p>

      <h2>Let's Replay!</h2>
      <FormBlock paramUsers={paramUser} paramContest={paramContest} contests={contests} />

      <RankLineChart
        users={users}
        contest={contestMap.get(paramContest)}
        contestSubmissions={contestSubmissions}
        showDots={showDots}
        showACLabels={showACLabels} />

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
                  checked={showACLabels}
                  onChange={(e) => setShowACLabels(e.target.checked)}
                />
            Show AC Labels
          </Label>
            </FormGroup>
          </Col>
        </Row>
      </p>

      <h2>補足</h2>
      <p>AHC001 は最終提出のプレテスト得点不明につき，各ユーザの最終提出のスコアは，システス結果 * 50 / 1000 を用いています．</p>
      <p>日立北大2020 は最終提出のプレテスト得点不明につき，各ユーザの最終提出のスコアは，システス結果 * 16 / 200 を用いています．</p>
    </>
  )
};

export const ChartPage = connect<InnerProps>((props) => {
  return ({
    contestsFetch: {
      value: fetchContests(),
    },
    contestSubmissionsFetch: {
      comparison: [props.match.params.contest],
      value: fetchContestSubmissions(props.match.params.contest),
    },
  })
})(InnerChartPage);
