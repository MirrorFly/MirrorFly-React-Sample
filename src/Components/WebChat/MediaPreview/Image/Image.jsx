import React, { Component } from 'react';
import {loader} from '../../../../assets/images';

export default class Image extends Component{

    constructor(){
        super();
        this.state = {
            imgSrc: loader
        }
    }

    shouldComponentUpdate(nextProps, nextState){
        return (this.state.imgSrc === nextState.imgSrc) ? false : true;
    }

    render(){
        var reader = new FileReader();
        reader&&reader.readAsDataURL(this.props.media);
        reader.onloadend = function (e) {
            this.setState({imgSrc: reader.result});
        }.bind(this);
        return(
            <div className='thumb-img'>
                <img src={this.state.imgSrc} alt="thumb-preview"/>
            </div>
        )
    }

}
