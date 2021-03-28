import React from 'react';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { Container } from 'reactstrap';
import { SWRConfig } from 'swr';
import { NavigationBar } from './components/NavigationBar';
import { ChartPage } from './pages/chart';
import { StandingsPage } from './pages/standings';

const App: React.FC = () => {
  return (
    <div className="App">
      <SWRConfig value={{ revalidateOnFocus: false }}>
        <Router>
          <NavigationBar />
          <Container
            style={{ width: '100%', maxWidth: '90%', marginTop: '80px' }}
          >
            <Switch>
              <Route
                exact
                path="/chart/:contest/:user"
                component={ChartPage as React.FC}
              />
              <Route
                exact
                path="/chart/:contest/"
                component={ChartPage as React.FC}
              />
              <Route
                exact
                path="/standings/:contest/:datetime"
                component={StandingsPage as React.FC}
              />
              <Route
                exact
                path="/standings/:contest/"
                component={StandingsPage as React.FC}
              />
              <Route exact path="/chart/" component={ChartPage as React.FC} />
              <Route
                exact
                path="/standings/"
                component={StandingsPage as React.FC}
              />
              <Redirect path="/" to="/chart/" />
            </Switch>
          </Container>
          <footer
            className="footer"
            style={{
              marginTop: '30px',
              padding: '30px',
              backgroundColor: '#efefef',
            }}
          >
            <div className="container">
              連絡先:{' '}
              <a href="https://twitter.com/iiljj">si (@iiljj) / Twitter</a>
              {', '}
              <a href="https://github.com/iilj">iilj (iilj) / GitHub</a>
            </div>
          </footer>
        </Router>
      </SWRConfig>
    </div>
  );
};

export default App;
