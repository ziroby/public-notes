import React from 'react';

import './Note.css';

function Note(props) {

  return (
    <div className={"Note"}>
        {props.note.getString()}
    </div>
  );
}

export default Note;