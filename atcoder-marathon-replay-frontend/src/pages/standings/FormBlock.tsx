import React, { useState, useMemo, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Input, Row, FormGroup, Label, Col } from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dataFormat from 'dateformat';
import Contest from '../../interfaces/Contest';

interface Props {
  paramContest: string;
  contests: Contest[];
  contestMap?: Map<string, Contest>;
  parsedDatetime?: Date;
}

const generatePath = (contest: string, cursorDate: Date): string =>
  `/standings/${contest}/${dataFormat(cursorDate, 'yyyymmdd-HHMMss')}`;
const getContestDropdownLabel = (contest: Contest): string =>
  `${dataFormat(new Date(contest.start_time_unix * 1000), 'yyyy-mm-dd')} ${
    contest.contest_name
  }`;

export const FormBlock: React.FC<Props> = (props) => {
  const { paramContest, contests, contestMap, parsedDatetime } = props;
  const [contest, setContest] = useState(
    paramContest !== ''
      ? paramContest
      : contests.length > 0
      ? contests[0].contest_slug
      : ''
  );
  const [cursorDate, setCursorDate] = useState(
    parsedDatetime !== undefined
      ? parsedDatetime
      : contests.length > 0
      ? new Date(contests[0].end_time_unix * 1000)
      : new Date()
  );
  const standingsPagePath = useMemo(() => generatePath(contest, cursorDate), [
    contest,
    cursorDate,
  ]);

  useEffect(() => {
    let unmounted = false;
    const setDefaultContestValue = () => {
      if (!unmounted && contests.length > 0 && contest === '') {
        setContest(contests[0].contest_slug);
        if (parsedDatetime === undefined) {
          setCursorDate(new Date(contests[0].end_time_unix * 1000));
        }
      }
    };
    void setDefaultContestValue();
    const cleanup = () => {
      unmounted = true;
    };
    return cleanup;
  }, [contests]);

  const _contest: Contest | undefined = contestMap?.get(contest);

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
              onChange={(e): void => {
                setContest(e.target.value);
                const _contest: Contest | undefined = contestMap?.get(
                  e.target.value
                );
                if (_contest !== undefined) {
                  const lb = new Date(_contest.start_time_unix * 1000);
                  const ub = new Date(_contest.end_time_unix * 1000);
                  if (cursorDate < lb || ub < cursorDate) {
                    setCursorDate(ub);
                  }
                }
              }}
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
            {_contest && (
              <div
                className="contest-duration"
                style={{
                  color: '#666',
                  fontSize: 'small',
                  margin: '0.2rem',
                  marginLeft: '1rem',
                }}
              >{`(${dataFormat(
                new Date(_contest.start_time_unix * 1000),
                'yyyy-mm-dd HH:MM:ss'
              )} ~ ${dataFormat(
                new Date(_contest.end_time_unix * 1000),
                'yyyy-mm-dd HH:MM:ss'
              )})`}</div>
            )}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <FormGroup style={{ width: '100%' }}>
            <div>
              <Label for="input-datetime">DATETIME:</Label>
            </div>
            <DatePicker
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm:ss"
              timeFormat="HH:mm"
              selected={cursorDate}
              onChange={(date: Date) => setCursorDate(date)}
              customInput={
                <Input
                  value={dataFormat(cursorDate, 'yyyy-mm-dd HH:MM:ss')}
                  type="text"
                  name="input-datetime"
                  id="input-datetime"
                />
              }
              minDate={
                _contest ? new Date(_contest.start_time_unix * 1000) : undefined
              }
              maxDate={
                _contest ? new Date(_contest.end_time_unix * 1000) : undefined
              }
              filterTime={(date: Date): boolean => {
                if (_contest === undefined) return true;
                return (
                  new Date(_contest.start_time_unix * 1000) <= date &&
                  date <= new Date(_contest.end_time_unix * 1000)
                );
              }}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <Button color="primary" tag={NavLink} to={standingsPagePath} block>
            Replay !
          </Button>
        </Col>
      </Row>
    </>
  );
};
