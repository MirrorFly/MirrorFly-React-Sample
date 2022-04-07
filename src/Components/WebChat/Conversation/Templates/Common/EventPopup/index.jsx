import React, { Component } from 'react';

export default class EventPoppup extends Component {

    constructor(props) {
        super();
        this.state = {
        }
    }

    render() {
        return (
            <div className="eventPoppupContainer active">
                <div className="eventPoppup ">
                    <div>
                        <span className="evenetName">{'Status'}</span>
                        <span className="evenetAction">{"close"}</span>
                    </div>
                </div>
            </div>
        )
    }
}
