import React from 'react';
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { Container, Navbar, NavbarBrand } from 'reactstrap';
import { ChartPage } from "./pages/chart";

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar color="light" light expand="lg" fixed="top">
          <NavbarBrand>AtCoder Marathon Replay</NavbarBrand>
        </Navbar>
        <Container style={{ width: '100%', maxWidth: '90%', marginTop: '80px' }}>
          <Switch>
            <Route exact path="/chart/:contest/:user" component={ChartPage} />
            <Route exact path="/chart/" component={ChartPage} />
            <Redirect path="/" to="/chart/" />
          </Switch>
        </Container>
        <footer className="footer" style={{ marginTop: '30px', padding: '30px', backgroundColor: '#efefef' }}>
          <div className="container">連絡先: <a href="https://twitter.com/iiljj">si (@iiljj) / Twitter</a></div></footer>
      </Router>
    </div >
  );
}

export default App;
