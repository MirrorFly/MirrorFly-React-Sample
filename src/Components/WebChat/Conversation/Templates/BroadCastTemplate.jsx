import React, { Component, Fragment } from 'react';
import { convertDateFormat, groupBy, groupByTime } from '../../../../Helpers/Chat/ChatHelper';
import DeletedMessage from './Common/DeletedMessage';
import CreateTemplate from './index';
import autoscroll from './Scroll';
class BroadCastTemplate extends Component {

    iterateArrayOfTemplate = (chatmessages) => {
        if (!chatmessages) return null;
        const { vCardData: { data } = {}, jid, chatType,
            deliveredType, viewOriginalMessage, requestReplyMessage, messageAction, addionalnfo } = this.props
        return chatmessages.map(msg => {
            const { msgid, messageContent, recallstatus } = msg;
            const { message_type = null } = messageContent || {}
            return recallstatus === '0' ? <CreateTemplate
                message_type={message_type}
                key={msgid}
                viewOriginalMessage={viewOriginalMessage}
                requestReplyMessage={requestReplyMessage}
                deliveredType={deliveredType}
                messageAction={messageAction}
                closeMessageOption={this.props.closeMessageOption}
                messageContent={messageContent}
                vCardData={data}
                messageObject={msg}
                addionalnfo={addionalnfo}
                messageInfoOptions={false}
                jid={jid}
                chatType={chatType}
            /> : <DeletedMessage
                    key={msgid}
                    messageAction={messageAction}
                    vCardData={data}
                    chatType={chatType}
                    messageObject={msg}
                />;
        })
    }

    messageToDisplay = (singleMessages) => {
        return singleMessages.map(splitedMessage => {
            return this.iterateArrayOfTemplate(splitedMessage)
        })
    }

    dateBlock = (messageInDate, date) => {
        const singleMessages = groupByTime(messageInDate, (singleImage) => new Date(singleImage.msgdate).getTime());
        return (
            <Fragment key={date}>
                <div className="chatDate"><span>{date && convertDateFormat(date)}</span></div>
                {this.messageToDisplay(singleMessages)}
            </Fragment>
        )
    }

    constructMessageTemplate = () => {
        const { chatmessages: { id, data } } = this.props
        if (!id) return null
        const updatedMessage = groupBy(data, (date) => date.msgdate.split(/[\s]/)[0])
        return Object.keys(updatedMessage).map((messageInDate) => {
            const { [messageInDate]: splitBlockByDate } = updatedMessage;
            return this.dateBlock(splitBlockByDate, messageInDate)
        })
    }

    render() {
        const templates = this.constructMessageTemplate()
        return (
            <Fragment>
                {templates || null}
            </Fragment>
        )
    }
}
export default autoscroll(BroadCastTemplate, { isScrolledDownThreshold: 100 })
