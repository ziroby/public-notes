import React from 'react';

import './InputBox.css';

class InputBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: '' };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    handleSubmit(event) {
        this.props.addNote(this.state.value);
        this.setState({
            value: ''
        });
        event.preventDefault();
    }

    render() {
        return <form className="InputBox" onSubmit={this.handleSubmit}>
        <label htmlFor="note">User Name:&nbsp;
        <input type="text" id="note" name="note" value={this.state.value} onChange={this.handleChange}/>
        </label>
        <br/>
        <input type="submit" value="Submit" />
    </form>
  }
}

export default InputBox;