import React from 'react';
import auth from 'solid-auth-client';
import { fetchDocument } from 'tripledoc';
import { foaf } from 'rdf-namespaces';

import InputBox from './components/InputBox'
import NotesList from './components/NotesList'
import LoginDialog from './components/LoginDialog'

import './App.css';

async function getName(webId) {
  /* 1. Fetch the Document at `webId`: */
  const webIdDoc = await fetchDocument(webId);
  /* 2. Read the Subject representing the current user's profile: */
  const profile = webIdDoc.getSubject(webId);
  /* 3. Get their foaf:name: */
  return profile.getString(foaf.name)
}

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  onLogin(identityProvider) {
    auth.login(identityProvider)
      .then(() => {
        console.log("Got login");
        this.setState({
          loggedIn: true,
          loggingIn: false
        })        
      });
  }

  logout() {
    auth.logout()
      .then(() => {
        this.setState({webId: null});
      });
  }

  attempts = 20
  render() {
    // if (this.attempts-- < 0) {
    //   return <div>Too many attempts</div>
    // }
    console.log("render()", this.state);
    if ((!this.state.webId && !this.state.loggingIn && !this.state.loggedIn)
      || (this.state.loggedIn && !this.state.webId)) {
      auth.currentSession()
        .then((session) => {
          if (session) {
            this.setState({
              webId: session.webId,
              loggingIn: null
            });
            console.log("Getting user name")
            getName(session.webId).then(name => this.setState({"username": name}));    
          } else {
            this.setState({
              loggingIn: true
            });
          }
          return <div>Opening login dialog</div>
        });
      return <div>Loading Authorisation</div>
    }
    if (this.state.loggingIn && !this.state.webId) {
      return <LoginDialog onLogin={this.onLogin} />
    }
    return (
      <div className="App" >
        <header className="App-header">
          <h1>Public Notes</h1>
        </header>
        <div className="username">{this.state.username}</div>
        <InputBox />
        <button>Add note</button>
        <NotesList></NotesList>
        <button className="logout" onClick={() => this.logout()}>Log out</button>
      </div>
    );
  }
}

export default App;
