import { Component } from 'react';
import { createPortal } from 'react-dom';
export default class Modal extends Component {
    constructor(props = {}) {
        super(props);
        const { containerId, divclass = null } = props
        this.modalRoot = document && document.getElementById && document.getElementById(containerId);
        this.element = document && document.createElement && document.createElement('div');
        divclass && this.element.classList.add(divclass)
    }
    componentDidMount() {
        this.modalRoot && this.modalRoot.appendChild(this.element);
    }
    componentWillUnmount() {
        this.modalRoot && this.modalRoot.removeChild(this.element);
    }
    render() {
        return createPortal(this.props.children, this.element);
    }
}
