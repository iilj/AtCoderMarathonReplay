import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Collapse,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
} from 'reactstrap';

export const NavigationBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <Navbar color="light" light expand="lg" fixed="top">
      <NavbarBrand tag={Link} to={'/'}>
        AtCoder Marathon Replay
      </NavbarBrand>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="mr-auto" navbar>
          <NavItem>
            <NavLink to="/chart/">Chart</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/standings/">Standings</NavLink>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  );
};
