import React, { Component } from 'react';
import {capitalizeFirstLetter} from '../../Helpers/Utility';
import { callDurationTimestamp } from '../../Actions/CallAction';
import Store from '../../Store';
import { getCallDuration } from '../../Helpers/Call/Call';
import {
    CALL_STATUS_RECONNECT, CALL_STATUS_CONNECTING, CALL_STATUS_CONNECTED,
    CALL_STATUS_DISCONNECTED, CALL_STATUS_CALLING, CALL_STATUS_ENGAGED, CALL_STATUS_BUSY,
    CALL_STATUS_RINGING, CALL_STATUS_HOLD, CALL_HOLD_STATUS_MESSAGE, CALL_STATUS_ATTENDED
} from '../../Helpers/Call/Constant';
class Timer extends Component {

    constructor(props){
        super(props);
        this.state = {
            timerOn: false,
            timerStart: props.callDurationTimestamp || 0,
            timerTime: 0
        }
    }

    componentDidMount = () => {
        if((this.props.callStatus && this.props.callStatus.toLowerCase() === CALL_STATUS_CONNECTED) || this.props.callDurationTimestamp){
            this.startTimer();
        }
    }

    componentDidUpdate(prevProps){
        if(prevProps.callStatus && this.props.callStatus && prevProps.callStatus !== this.props.callStatus &&
            (prevProps.callStatus.toLowerCase() === CALL_STATUS_CALLING || prevProps.callStatus.toLowerCase() === CALL_STATUS_ATTENDED || prevProps.callStatus.toLowerCase() === CALL_STATUS_RINGING || prevProps.callStatus.toLowerCase() === CALL_STATUS_CONNECTING) &&
            this.props.callStatus.toLowerCase() === CALL_STATUS_CONNECTED
        ){
            this.startTimer();
        }
    }

    componentWillUnmount = () => {
        this.stopTimer();
    }

    startTimer = () => {
        this.setState({
          timerOn: true,
          timerTime: this.state.timerTime,
          timerStart: (this.props.callDurationTimestamp || Date.now()) - this.state.timerTime
        },() => {
            Store.dispatch(callDurationTimestamp(this.state.timerStart));
        });
        this.timer = setInterval(() => {
          this.setState({
            timerTime: Date.now() - this.state.timerStart
          });
        }, 10);
    };

    stopTimer = () => {
        clearInterval(this.timer);
    };

    render(){
        let content = null;
        if( this.props.callStatus &&
            [CALL_STATUS_RECONNECT, CALL_STATUS_CONNECTING, CALL_STATUS_DISCONNECTED,
                CALL_STATUS_CALLING, CALL_STATUS_ENGAGED, CALL_STATUS_RINGING, CALL_STATUS_BUSY, CALL_STATUS_HOLD].indexOf(this.props.callStatus.toLowerCase()) > -1){
            let callStatusText = this.props.callStatus && this.props.callStatus.toLowerCase();
            if(this.props.callStatus.toLowerCase() === CALL_STATUS_HOLD){
                callStatusText = CALL_HOLD_STATUS_MESSAGE.toLowerCase();
            }
            content = `${capitalizeFirstLetter(callStatusText)}${this.props.callStatus &&
                (this.props.callStatus.toLowerCase() !== CALL_STATUS_DISCONNECTED &&
                this.props.callStatus.toLowerCase() !== CALL_STATUS_HOLD) ? '...' : ''}`;
        }
        else{
            const { timerTime } = this.state;
            content = getCallDuration(timerTime);
        }
        return(
            <>
                {content}
            </>
        );
    }

}

export default Timer;
