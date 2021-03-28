import React, { useState, useMemo, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { Button, Input, Row, FormGroup, Label, Col } from 'reactstrap';
import dataFormat from 'dateformat';
import Contest from '../../interfaces/Contest';

interface Props {
  paramUsers: string;
  paramContest: string;
  contests: Contest[];
}

const generatePath = (contest: string, user: string): string =>
  `/chart/${contest}/${user}`;
const getContestDropdownLabel = (contest: Contest): string =>
  `${dataFormat(new Date(contest.start_time_unix * 1000), 'yyyy-mm-dd')} ${
    contest.contest_name
  }`;

export const FormBlock: React.FC<Props> = (props) => {
  const { paramUsers, paramContest, contests } = props;
  const [contest, setContest] = useState(
    paramContest !== ''
      ? paramContest
      : contests.length > 0
      ? contests[0].contest_slug
      : ''
  );
  const [user, setUser] = useState(paramUsers);
  const chartPagePath = useMemo(() => generatePath(contest, user), [
    contest,
    user,
  ]);
  const history = useHistory();

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
          <FormGroup style={{ width: '100%' }}>
            <Label for="input-user">ATCODER ID (COMMA SEPARATED):</Label>
            <Input
              value={user}
              type="text"
              name="input-user"
              id="input-user"
              placeholder={user ? user : 'user1,user2,...'}
              onChange={(e): void => setUser(e.target.value)}
              onKeyPress={(e): void => {
                if (e.key === 'Enter') {
                  history.push(chartPagePath);
                }
              }}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <Button color="primary" tag={NavLink} to={chartPagePath} block>
            Replay!
          </Button>
        </Col>
      </Row>
    </>
  );
};
