import React from 'react';
import "./PageLoader.scss";
import { loader } from '../../../assets/images';

class PageLoader extends React.Component {

    render() {
        return (
            <div className='page_loader'>
                <img className="page_loader_img" src={loader} alt="loader" />
            </div>
        )
    }
}

export default PageLoader;
