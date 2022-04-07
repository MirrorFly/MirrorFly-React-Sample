import React, { Component } from 'react';
import Store from '../../../Store';
import {showConfrence} from '../../../Actions/CallAction';
import './NetworkError.scss'
import logo from '../../../assets/images/logo.png'


export default class NetworkError extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    backToHome = () => {
        Store.dispatch(showConfrence({
            showComponent: false,
            showCalleComponent:false
        }))
    }

    render() {
        return (
            <div className="NetworkError">
                <div className="wrapper">
                    <h1>Oops...</h1>
                    <p><p>Sorry Couldn't start the call because of network error. Please check your internet connection and try again</p></p>
                    <div className="buttons" onClick={this.backToHome}><a >Back To Home </a></div>
                </div>
                <div className="space">
                    <div className="blackhole">
                        <img src={logo}  alt="logo"/>
                    </div>
                </div>
            </div>
        );
    }
}






