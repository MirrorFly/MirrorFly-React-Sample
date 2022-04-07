import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import { IconScroltToDown } from '../../../../../assets/images';

const hasOverflow = el => el.clientHeight < el.scrollHeight
const isScrolledDown = (el, threshold) => {
    const bottom = el.scrollTop + el.clientHeight
    return bottom >= el.scrollHeight - threshold
}
const isScrolledUp = el => el.scrollTop === 0
const scrollDown = el => el.scrollTop = el.scrollHeight - el.clientHeight
const scrollDownBy = (amount, el) => el.scrollTop += amount

const ScrollContainner = (Component, { isScrolledDownThreshold = 150 } = {}) => {
    class ScroolInner extends React.PureComponent {
        constructor(props) {
            super(props)
            this.isScrolledDown = true
            this.scrollContainner = null
            this.scrollHeight = null
            this.isScrolledUp = null
            window.addEventListener('resize', () => {
                this.updateHeigth()
            });
            this.state = {
                isVisibleScroll:false,
                msgCount : false
            }
        }

        scrollDownIfNeeded() {
            if (this.isScrolledDown && this.scrollContainner && hasOverflow(this.scrollContainner)) {
                scrollDown(this.scrollContainner)
            }
        }

        handleScroll(event) {
            const { target } = event
            if (target.offsetHeight + target.scrollTop === target.scrollHeight) {
                this.props.onScrolledBottom()
            }
            this.isScrolledDown = isScrolledDown(this.scrollContainner, isScrolledDownThreshold)
            if (isScrolledUp(this.scrollContainner)) {
                this.scrollHeight = this.scrollContainner.scrollHeight
                this.props.onScrolledTop && this.props.onScrolledTop(event)
            }
            if (target.offsetHeight + target.scrollTop >= target.scrollHeight - 150) {
                this.setState({
                    isVisibleScroll: false
                });
                } else {
                this.setState({
                    isVisibleScroll: true
                });
                }
        }

        updateHeigth = () => {
            const containerId = this.props.containnerId || 'message-containner';
            const container = document.getElementById(containerId);
            if (!container) return;
            const header = document.querySelector('.conversation-header')
            const containerChildren = Array.from(document.querySelectorAll('.chatconversation-container > *:not(.msg-content), .emojiPicker-container')).reduce(function getSum(total, num) {
                return total + Math.round(num.clientHeight);
              }, 0);
            const windowHeights = window.innerHeight;
            const finalHeigth = windowHeights - header.clientHeight - containerChildren
            container.style.height = finalHeigth + "px";
            container.style['overflow-y'] = 'auto';
            container.setAttribute('visibleheight', finalHeigth)
        }

        componentDidMount() {
            this.updateHeigth()
            this.scrollDownIfNeeded()

            // When message type container goes to new line need update the chat content view
            // height
            const mesgTypingEle = document.getElementById('typingContainer');
            if(mesgTypingEle){
                new ResizeObserver(() => {
                    this.scrollDownIfNeeded();
                    this.updateHeigth();
                    this.isScrolledDown && this.scrollContainner && scrollDownBy(20, this.scrollContainner);
                }).observe(mesgTypingEle);
            }
        }

        componentWillUnmount(){
            clearTimeout(this.timer)
        }

        componentDidUpdate(prevProps) {
            this.isScrolledUp = isScrolledUp(this.scrollContainner)
            if(prevProps.replyMessageData.id !== this.props.replyMessageData.id) {
                this.timer = setTimeout(() => {
                    this.scrollContainner && this.scrollDownIfNeeded()
                }, 1000);
                return
            }

            if(prevProps.conversationState.popUpId !== this.props.conversationState.popUpId) {
                this.updateHeigth();
                this.scrollDownIfNeeded();
                return
            }

            if(prevProps.scrollBottomChatHistory.id !== this.props.scrollBottomChatHistory.id && !this.isScrolledDown){
                scrollDown(this.scrollContainner);
            }

            if (this.isScrolledUp && this.scrollHeight !== null) {
                const difference = this.scrollContainner.scrollHeight - this.scrollHeight
                this.scrollHeight = null
                scrollDownBy(difference, this.scrollContainner)
             }
            else {
                this.scrollDownIfNeeded()
            }
        }
        render() {
            const { containerId = 'message-containner' , scrollToBottom } = this.props;
            return (
                <Fragment>
                    <div
                        onScroll={e => this.handleScroll(e)}
                        ref={el => this.scrollContainner = ReactDOM.findDOMNode(el)}
                        id={containerId}
                        className={containerId} >
                        <div className="extraSpace"></div>
                        <div>
                        <Component
                            {...this.props}
                        />
                        </div>
                        <span id="InBottom" className="InBottom"></span>
                        <div className="more-messages" onClick={scrollToBottom}>
                            {this.state.msgCount && <span className="count-unread">
                                <span>100+</span>
                            </span>
                            }
                            {this.state.isVisibleScroll && <IconScroltToDown /> }
                        </div>
                        </div>
                </Fragment>
            )
        }
    }
    const mapStateToProps = state => {
        return {
            replyMessageData: state.replyMessageData,
            conversationState:state.conversationState,
            scrollBottomChatHistory: state.scrollBottomChatHistory
        }
    }
    return connect(mapStateToProps, null)(ScroolInner);
}

export default ScrollContainner
