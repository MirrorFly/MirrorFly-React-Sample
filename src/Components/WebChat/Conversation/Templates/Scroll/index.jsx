import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux'
import { IconScroltToDown } from '../../../../../assets/images';
import { getActiveConversationChatId, getChatMessageHistoryById } from '../../../../../Helpers/Chat/ChatHelper';
import Store from '../../../../../Store';
import { ChatMessageHistoryDataAction } from '../../../../../Actions/ChatHistory';
import SDK from '../../../../SDK';
import { GroupNotificationCount, ReduceUnreadMsgCount, UnreadUserObj } from '../../../../../Actions/UnreadCount';

const hasOverflow = el => el.clientHeight < el.scrollHeight
const isScrolledDown = (el, threshold) => {
    const bottom = el.scrollTop + el.clientHeight
    return bottom >= el.scrollHeight - threshold
}
const isScrolledUp = el => el.scrollTop === 0
const scrollDown = el => el.scrollTop = el.scrollHeight - el.clientHeight
const scrollDownBy = (amount, el) => el.scrollTop += amount

const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

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
                isVisibleScroll: false,
                msgCount: false,
                containerScrolling: false,
            }
            
            this.handleScroll = debounce(this.handleScroll.bind(this), 200);
        }

        scrollDownIfNeeded = async() => {
            if (this.isScrolledDown && this.scrollContainner && hasOverflow(this.scrollContainner)) {
                    const { UnreadUserObjData } = this.props;
                    let startMsgAction = this.props.starMsgPageType;
                    const activeConversationId = await getActiveConversationChatId();
                    if (!UnreadUserObjData[activeConversationId] || (UnreadUserObjData[activeConversationId] && (UnreadUserObjData[activeConversationId]?.count <= 0 || UnreadUserObjData[activeConversationId].fetchDirection != "down"))) {
                       if(startMsgAction && startMsgAction.callOriginStrMsg) return;
                       scrollDown(this.scrollContainner);
                       if(UnreadUserObjData[activeConversationId] && UnreadUserObjData[activeConversationId]?.count !=0){
                        Store.dispatch(UnreadUserObj({ count: parseInt(0), fromUserId: activeConversationId}));
                        Store.dispatch(ReduceUnreadMsgCount({ count: parseInt(0), fromUserId: activeConversationId, fullyViewedChat: true}));
                       }
                    } 
            }
        }

        handleScroll = async (event) => {
            const { target } = event;
            if (target.offsetHeight + target.scrollTop === target.scrollHeight) {
                this.props.onScrolledBottom()
            }

            this.isScrolledDown = isScrolledDown(this.scrollContainner, isScrolledDownThreshold);
            if (this.isScrolledDown) {
                const { UnreadUserObjData } = this.props;
                const groupNotificationMsgCount = this.props.groupNotificationMsgCount;
                let startMsgAction = this.props.starMsgPageType;
                const activeConversationId = await getActiveConversationChatId();
                const getChatMsgs = getChatMessageHistoryById(activeConversationId);
                if(startMsgAction && startMsgAction.callOriginStrMsg) return;
                if (UnreadUserObjData[activeConversationId] && UnreadUserObjData[activeConversationId]?.count > 0 && !this.state.containerScrolling) {
                    this.setState({ containerScrolling: true })
                    target.removeEventListener('scroll', this.handleScroll);
                    const { count, fetchLastMsgId, chatJid } = await UnreadUserObjData[activeConversationId];
                    let msgFetchingSet = UnreadUserObjData[activeConversationId]?.msgFetchedSet + 1; 
                    let notificationCount = groupNotificationMsgCount[activeConversationId] && groupNotificationMsgCount[activeConversationId][msgFetchingSet] || 0;
                    let fetchLimit = notificationCount > 0 ? 21 + notificationCount : 21;
                    if (count == 0 || (getChatMsgs.length == 0)) return;
                    const chatMessageRes = await SDK.getChatMessages({ toJid: chatJid, position: "down", lastMessageId: fetchLastMsgId, limit: fetchLimit });
                    if (chatMessageRes.statusCode == 200) {
                        delete chatMessageRes.statusCode;
                        delete chatMessageRes.message;
                        let notificationreduce = chatMessageRes?.data?.length - notificationCount;
                        let updateUnreadCount = count - notificationreduce;
                        let reduceCount = updateUnreadCount > 0 ? updateUnreadCount : 0;
                        Store.dispatch(ChatMessageHistoryDataAction(chatMessageRes));
                        Store.dispatch(GroupNotificationCount({
                            fromUserId : activeConversationId,
                            setNumber : msgFetchingSet,
                            notificationCount: 0
                          }));
                        Store.dispatch(UnreadUserObj({ count: parseInt(reduceCount), fromUserId: activeConversationId, fetchLastMsgId: chatMessageRes?.data[0]?.msgId, fullyViewedChat: reduceCount == 0 ? true : false, msgFetchedSet: msgFetchingSet }));
                        Store.dispatch(ReduceUnreadMsgCount({ count: parseInt(reduceCount), fromUserId: activeConversationId }));
                        setTimeout(() => {
                            target.addEventListener('scroll', this.handleScroll);
                            this.setState({ containerScrolling: false });
                        }, 600);

                    }
                }
            }
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
            this.setState({containerScrolling : true}) 
            this.updateHeigth()
            this.scrollDownIfNeeded()
            setTimeout(()=>{
                this.setState({containerScrolling : false}) 
            },200)
            // When message type container goes to new line need update the chat content view
            // height
            const mesgTypingEle = document.getElementById('typingContainer');
            if (mesgTypingEle) {
                new ResizeObserver(() => {
                    this.scrollDownIfNeeded();
                    this.updateHeigth();
                    this.isScrolledDown && this.scrollContainner && scrollDownBy(20, this.scrollContainner);
                }).observe(mesgTypingEle);
            }
        }

        componentWillUnmount() {
            clearTimeout(this.timer)
        }

        componentDidUpdate(prevProps) {
            this.isScrolledUp = isScrolledUp(this.scrollContainner)
            if (prevProps.replyMessageData.id !== this.props.replyMessageData.id) {
                this.timer = setTimeout(() => {
                    this.scrollContainner && this.scrollDownIfNeeded()
                }, 1000);
                return
            }

            if (prevProps.conversationState.popUpId !== this.props.conversationState.popUpId) {
                this.updateHeigth();
                this.scrollDownIfNeeded();
                return
            }

            if (prevProps.scrollBottomChatHistory.id !== this.props.scrollBottomChatHistory.id && !this.isScrolledDown) {
                scrollDown(this.scrollContainner);
            }

            if (this.isScrolledUp && this.scrollHeight !== null) {
                const difference = this.scrollContainner.scrollHeight - this.scrollHeight
                this.scrollHeight = null
                scrollDownBy(difference, this.scrollContainner)
            }
            else {
                setTimeout(() => {
                    this.scrollDownIfNeeded()
                }, 50)
               
            }
        }
        render() {
            const { containerId = 'message-containner' } = this.props;
            const { UnreadUserObjData } = this.props;
            const activeConversationId = getActiveConversationChatId();
            let msgCounts = UnreadUserObjData[activeConversationId] && UnreadUserObjData[activeConversationId]?.count
            return (
                <Fragment>
                    <div
                        onScroll={e => setTimeout(() =>{this.handleScroll(e)}, 200) }
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
                        {(this.state.isVisibleScroll || (msgCounts > 0)) &&
                            <div className="more-messages" onClick={(e) => this.props.scrollToBottom(e)}>
                                {this.state.msgCount && <span className="count-unread">
                                    <span>100+</span>
                                </span>
                                }
                                <IconScroltToDown />
                            </div>
                        }
                    </div>
                </Fragment>
            )
        }
    }
    const mapStateToProps = state => {
        return {
            replyMessageData: state.replyMessageData,
            conversationState: state.conversationState,
            scrollBottomChatHistory: state.scrollBottomChatHistory,
            UnreadUserObjData: state.UnreadUserObjData,
            starMsgPageType: state.starMsgPageType,
            groupNotificationMsgCount: state.groupNotificationMsgCount
        }
    }
    return connect(mapStateToProps, null)(ScroolInner);
}

export default ScrollContainner
