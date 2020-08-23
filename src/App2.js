import React from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom'

import Autologin from './components/auth/Autologin';

import './App2.css';

class App2 extends React.Component {
    render() {
        return <div className="App2" >
            <Router>
                <span className="App2=header" >
                    <h1>Public Notes </h1>
                    <h2><small>by </small>Username</h2>
                </span>
                <Route path="/autologin">
                    <Autologin />
                </Route>
            </Router>
        </div>
    }
}

export default App2;