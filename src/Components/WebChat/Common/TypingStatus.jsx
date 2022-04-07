import React from 'react';
import { useSelector } from 'react-redux';
import LastSeen from '../Header/LastSeen';
import { useGetTypingStatus } from '../../../CustomHooks/chat';

const TypingStatus = (props) => {
    const { fromUserId, chatType, jid, contactNames } = props
    const { typingData: { id: typingId, data = [] } = {} } = useSelector(store => store);

    const { isTyping, displayName } = useGetTypingStatus({typingId, typingData: data, fromUserId, chatType});

    return (
        <> {isTyping ? <span className="txtTyping">{displayName}</span> :
            <>
                {chatType === 'chat' && <LastSeen jid={jid} />}
                {chatType === 'groupchat' && <h6>{contactNames}</h6>}
            </>
          }
        </>
    );
}

export default TypingStatus;
