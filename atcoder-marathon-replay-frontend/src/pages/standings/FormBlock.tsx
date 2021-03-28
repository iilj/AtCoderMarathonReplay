import React, { useState, useMemo, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Input, Row, FormGroup, Label, Col } from 'reactstrap';
import Contest from '../../interfaces/Contest';
import { dateToString } from '../../utils';

interface Props {
  paramContest: string;
  contests: Contest[];
}

const generatePath = (contest: string): string => `/standings/${contest}`;
const getContestDropdownLabel = (contest: Contest): string =>
  `${dateToString(new Date(contest.start_time_unix * 1000), 'YYYY-MM-DD')} ${
    contest.contest_name
  }`;

export const FormBlock: React.FC<Props> = (props) => {
  const { paramContest, contests } = props;
  const [contest, setContest] = useState(
    paramContest !== ''
      ? paramContest
      : contests.length > 0
      ? contests[0].contest_slug
      : ''
  );
  const chartPagePath = useMemo(() => generatePath(contest), [contest]);

  useEffect(() => {
    let unmounted = false;
    const setDefaultContestValue = () => {
      if (!unmounted && contests.length > 0 && contest === '')
        setContest(contests[0].contest_slug);
    };
    void setDefaultContestValue();
    const cleanup = () => {
      unmounted = true;
    };
    return cleanup;
  }, [contests]);

  return (
    <>
      <Row>
        <Col sm={12}>
          <FormGroup style={{ width: '100%' }}>
            <Label for="input-contest">CONTEST:</Label>
            <Input
              type="select"
              name="input-contest"
              id="input-contest"
              value={contest}
              onChange={(e): void => setContest(e.target.value)}
            >
              {contests.map((_contest: Contest) => {
                return (
                  <option
                    value={_contest.contest_slug}
                    key={_contest.contest_slug}
                  >
                    {getContestDropdownLabel(_contest)}
                  </option>
                );
              })}
            </Input>
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <Button color="primary" tag={NavLink} to={chartPagePath} block>
            Replay !
          </Button>
        </Col>
      </Row>
    </>
  );
};
