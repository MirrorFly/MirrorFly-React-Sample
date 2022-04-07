import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import { Emoji } from '../../../../Components/WebChat/Common/Emoji';
import WebChatMessagesComposing from '../../../../Components/WebChat/Conversation/WebChatMessagesComposing';
import ContentEditable from '../../../../Components/WebChat/Conversation/Templates/Common/ContentEditable';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> WebChatMessagesComposing Test case <<<", () => {
    it('Mock has be created Users props undefined', () => {
        const monckData = {
            activeChatData: {
                data: {
                    chatId: "919994920726"
                }
            },
            handleSendMsg: jest.fn(),
            loaderStatus: true,
        };
        const store = mockStore(undefined);
        wrapper = mount(
            <Provider store={store}>
                <WebChatMessagesComposing {...monckData} />
            </Provider>);
    });
    it('Mock has be created Users props undefined', () => {
        const monckData = {
            activeChatData: {
                data: {
                    chatId: "919994920723"
                }
            },
            handleSendMsg: jest.fn(),
            userReplayDetails: [
                {
                    roster: {
                        userId: "9994920723"
                    }
                }
            ],
        };
        const store = mockStore({
            jid: "9994920727",
            sendMessgeType: "chat",

            activeChatData: {
                data: {
                    chatId: "919994920725"
                }
            },
            handleSendMsg: jest.fn(),
        });
        wrapper = mount(
            <Provider store={store}>
                <WebChatMessagesComposing {...monckData} />
            </Provider>);
    });

    it("Emoji component warapper", () => {
        const warapperComponent = wrapper.find(Emoji).first();
        warapperComponent.props().onEmojiClick();
    });

    it("ContentEditable component warapper", () => {
        const warapperComponent = wrapper.find(ContentEditable).first();
        warapperComponent.props().handleMessage();
    });

    it("ContentEditable component warapper", () => {
        const warapperComponent = wrapper.find(ContentEditable).first();
        warapperComponent.props().handleSendTextMsg();
    });

    it("ContentEditable component warapper", () => {
        const warapperComponent = wrapper.find(ContentEditable).first();
        warapperComponent.props().handleOnFocus();
    });

    it("ContentEditable component warapper", () => {
        const warapperComponent = wrapper.find(ContentEditable).first();
        warapperComponent.props().setCursorPosition();
    });

    it("ContentEditable component warapper", () => {
        const warapperComponent = wrapper.find(ContentEditable).first();
        warapperComponent.props().setSelectedText();
    });

});
