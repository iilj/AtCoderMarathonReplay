import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Collapse,
  Nav,
  Navbar,
  NavLink,
  NavbarBrand,
  NavbarToggler,
  NavItem,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faSortAmountDown,
} from '@fortawesome/free-solid-svg-icons';

export const NavigationBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <Navbar color="light" light expand="md" fixed="top">
      <NavbarBrand tag={Link} to={'/'}>
        AtCoder Marathon Replay
      </NavbarBrand>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="mr-auto" navbar>
          <NavItem>
            <NavLink tag={Link} to="/chart/">
              <FontAwesomeIcon
                style={{ marginRight: '4px' }}
                icon={faChartLine}
              />
              Chart
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink tag={Link} to="/standings/">
              <FontAwesomeIcon
                style={{ marginRight: '4px' }}
                icon={faSortAmountDown}
              />
              Standings
            </NavLink>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  );
};
