import React from 'react';
import auth from 'solid-auth-client';
import { fetchDocument, createDocument } from 'tripledoc';
import { space, rdf, solid, schema, foaf } from 'rdf-namespaces';

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

async function getNotesList(webId) {
  /* 1. Fetch the Document at `webId`: */
  const webIdDoc = await fetchDocument(webId);
  /* 2. Read the Subject representing the current user's profile: */
  const profile = webIdDoc.getSubject(webId);

  /* 3. Check if a Document tracking our notes already exists. */
  const publicTypeIndexRef = profile.getRef(solid.publicTypeIndex);
  const publicTypeIndex = await fetchDocument(publicTypeIndexRef);
  const notesListEntry = publicTypeIndex.findSubject(solid.forClass, schema.TextDigitalDocument);

  /* 4. If it doesn't exist, create it. */
  if (notesListEntry === null) {
    // We will define this function later:
    return initialiseNotesList(profile, publicTypeIndex);
  }

  /* 5. If it does exist, fetch that Document. */
  const notesListRef = notesListEntry.getRef(solid.instance);
  return await fetchDocument(notesListRef);
}

async function initialiseNotesList(profile, typeIndex) {
  // Get the root URL of the user's Pod:
  const storage = profile.getRef(space.storage);

  // Decide at what URL within the user's Pod the new Document should be stored:
  const notesListRef = storage + 'public/notes.ttl';
  // Create the new Document:
  const notesList = createDocument(notesListRef);
  await notesList.save();

  // Store a reference to that Document in the public Type Index for `schema:TextDigitalDocument`:
  const typeRegistration = typeIndex.addSubject();
  typeRegistration.addRef(rdf.type, solid.TypeRegistration)
  typeRegistration.addRef(solid.instance, notesList.asRef())
  typeRegistration.addRef(solid.forClass, schema.TextDigitalDocument)
  await typeIndex.save([typeRegistration]);

  // And finally, return our newly created (currently empty) notes Document:
  return notesList;
}

export function getNotes(notesList) {
  return notesList.getSubjectsOfType(schema.TextDigitalDocument);
}

async function addNoteToPod(note, notesList) {

  // Initialise the new Subject:
  const newNote = notesList.addSubject();

  // Indicate that the Subject is a schema:TextDigitalDocument:
  newNote.addRef(rdf.type, schema.TextDigitalDocument);

  // Set the Subject's `schema:text` to the actual note contents:
  newNote.addString(schema.text, note);

  // Store the date the note was created (i.e. now):
  newNote.addDateTime(schema.dateCreated, new Date(Date.now()))

  const success = await notesList.save([newNote]);
  return success;
}

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  addNote(note) {
    addNoteToPod(note, this.state.noteList).then(() => {
      getNotesList(this.state.webId).then(noteList => {
        this.setState({
          "notes": getNotes(noteList)
        });
      });
    });
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
        this.setState({ webId: null });
      });
  }

  render() {
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
            getName(session.webId).then(name => this.setState({ "username": name }));
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
    if (this.state.webId && !this.state.noteList) {
      getNotesList(this.state.webId)
        .then(noteList => {
          this.setState({
            "noteList": noteList,
            "notes": getNotes(noteList)
          });
        });
      return <div>Loading Notes List</div>
    }
    return (
      <div className="App" >
        <header className="App-header">
          <h1>Public Notes</h1>
        </header>
        <div className="username">{this.state.username}</div>
        <InputBox addNote={(note) => this.addNote(note)}/>
        <NotesList notes={this.state.notes}></NotesList>
        <button className="logout" onClick={() => this.logout()}>Log out</button>
      </div>
    );
  }
}

export default App;
