import React from 'react';
import Note from './Note'
import './NotesList.css';

function NotesList(props) {
    console.log("Notes: ", props.notes);
    // return <div>
    //     <h3>NotesList</h3>
    //     {JSON.stringify(props.notes.map(note => note.getString()))}
    // </div>
    return (props.notes.map(note => <Note note={note} key={note.asNodeRef()} onClick={props.onSelect}/>));
}

export default NotesList;