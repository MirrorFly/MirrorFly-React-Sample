import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import ImageComponent from '../../../../../../Components/WebChat/Conversation/Templates/Chat/ImageComponent';
import ChatMessageTemplate from '../../../../../../Components/WebChat/Conversation/Templates/Chat/ChatMessageTemplate';
import VideoComponent from '../../../../../../Components/WebChat/Conversation/Templates/Chat/VideoComponent';
import AudioComponent from '../../../../../../Components/WebChat/Conversation/Templates/Chat/AudioComponent';
import LocationComponent from '../../../../../../Components/WebChat/Conversation/Templates/Chat/LocationComponent';
import DocumentComponent from '../../../../../../Components/WebChat/Conversation/Templates/Chat/DocumentComponent';
import ContactComponent from '../../../../../../Components/WebChat/Conversation/Templates/Chat/ContactComponent';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;
const store = mockStore({
    featureStateData: {}
});

describe("LocationComponent Test cover", () => {

    it('Mock has be created props undefined', () => {
        const monckData = undefined
     
        wrapper = mount(
            <Provider store={store}>
                <ChatMessageTemplate {...monckData} />
            </Provider>);
    });

    it('Mock has be created props postive', () => {
        const monckData = {
            messageObject: {
                msgBody: {
                    file_url: "9199949207271636465415545O1Xe5Ag5x4IB5VVJMhkv.jpg"
                }
            }, messageContent: {
                msgBody: {
                    file_url: "9199949207271636465415545O1Xe5Ag5x4IB5VVJMhkv.jpg"
                },
                replyTo: "121322323",
            },
            requestReplyMessage: jest.fn(),
        };
        
        wrapper = mount(
            <Provider store={store}>
                <ChatMessageTemplate {...monckData} />
            </Provider>);
    });

    it('Mock has be created props postive message_type:"image"', () => {
        const monckData = {
            messageObject: {
                msgBody: {
                    file_url: "9199949207271636465415545O1Xe5Ag5x4IB5VVJMhkv.jpg"
                }
            }, messageContent: {
                msgBody: {
                    file_url: "9199949207271636465415545O1Xe5Ag5x4IB5VVJMhkv.jpg"
                },
                replyTo: "121322323"
            },
            message_type: "image",
            requestReplyMessage: jest.fn(),
        };
        
        wrapper = mount(
            <Provider store={store}>
                <ChatMessageTemplate {...monckData} />
            </Provider>);
    });

    it("ImageComponent wrapper handleMediaShow", () => {
        const wrapperImage = wrapper.find(ImageComponent).first();
        wrapperImage.props().handleMediaShow();
    })

    it("ImageComponent wrapper imgFileDownloadOnclick", () => {
        const wrapperImage = wrapper.find(ImageComponent).first();
        wrapperImage.props().imgFileDownloadOnclick({ target: { id: "imageId" } });
    })

    it('Mock has be created props postive message_type:"video"', () => {
        const monckData = {
            messageObject: {
                msgBody: {
                    file_url: "9199949207271636465415545O1Xe5Ag5x4IB5VVJMhkv.jpg"
                }
            }, messageContent: {
                msgBody: {
                    file_url: "9199949207271636465415545O1Xe5Ag5x4IB5VVJMhkv.jpg"
                },
                replyTo: "121322323"
            },
            message_type: "video",
            requestReplyMessage: jest.fn(),
        };
        
        wrapper = mount(
            <Provider store={store}>
                <ChatMessageTemplate {...monckData} />
            </Provider>);
    });

    it("VideoComponent wrapper handleMediaShow", () => {
        const wrapperImage = wrapper.find(VideoComponent).first();
        wrapperImage.props().handleMediaShow();
    })

    it('Mock has be created props postive message_type:"audio"', () => {
        const monckData = {
            messageObject: {
                msgBody: {
                    file_url: "9199949207271636465415545O1Xe5Ag5x4IB5VVJMhkv.jpg"
                }
            }, messageContent: {
                msgBody: {
                    file_url: "9199949207271636465415545O1Xe5Ag5x4IB5VVJMhkv.jpg"
                },
                replyTo: "121322323"
            },
            message_type: "audio",
            requestReplyMessage: jest.fn(),
        };
        
        wrapper = mount(
            <Provider store={store}>
                <ChatMessageTemplate {...monckData} />
            </Provider>);
    });

    it("VideoComponent wrapper handleMediaShow", () => {
        const wrapperImage = wrapper.find(AudioComponent).first();
        wrapperImage.props().audioFileDownloadOnclick({ target: { id: "imageId" } });
    });

    it('Mock has be created props postive message_type:"location"', () => {
        const monckData = {
            messageObject: {
                msgBody: {
                    file_url: "9199949207271636465415545O1Xe5Ag5x4IB5VVJMhkv.jpg"
                }
            }, messageContent: {
                msgBody: {
                    file_url: "9199949207271636465415545O1Xe5Ag5x4IB5VVJMhkv.jpg"
                },
                replyTo: "121322323"
            },
            message_type: "location",
            requestReplyMessage: jest.fn(),
        };
        
        wrapper = mount(
            <Provider store={store}>
                <ChatMessageTemplate {...monckData} />
            </Provider>);
    });

    it("LocationComponent wrapper handleMediaShow", () => {
        wrapper.find(LocationComponent).first();
    });

    it('Mock has be created props postive message_type:"file"', () => {
        const monckData = {
            messageObject: {
                msgBody: {
                    file_url: "9199949207271636465415545O1Xe5Ag5x4IB5VVJMhkv.jpg"
                }
            }, messageContent: {
                msgBody: {
                    file_url: "9199949207271636465415545O1Xe5Ag5x4IB5VVJMhkv.jpg"
                },
                replyTo: "121322323"
            },
            message_type: "file",
            requestReplyMessage: jest.fn(),
        };
        
        wrapper = mount(
            <Provider store={store}>
                <ChatMessageTemplate {...monckData} />
            </Provider>);
    });

    it("LocationComponent wrapper handleMediaShow", () => {
        wrapper.find(DocumentComponent).first().props().downloadAction();
    });

    it('Mock has be created props postive message_type:"contact"', () => {
        const monckData = {
            messageContent: {
                msgBody: {
                    file_url: "9199949207271636465415545O1Xe5Ag5x4IB5VVJMhkv.jpg"
                },
                replyTo: "121322323"
            },
            message_type: "contact",
            requestReplyMessage: jest.fn(),
        };
        
        wrapper = mount(
            <Provider store={store}>
                <ChatMessageTemplate {...monckData} />
            </Provider>);
    });

    it("isContactMessage wrapper handleMediaShow", () => {
        wrapper.find(ContactComponent).first().props().toggleContactPopup();
    });
});
