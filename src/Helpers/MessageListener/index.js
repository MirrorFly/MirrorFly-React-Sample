import MessageType from './MessageType'
export default function EmitEvent(response) {
    return typeof MessageType[response.messageType] === 'function' ? MessageType[response.messageType](response) : ''
}
