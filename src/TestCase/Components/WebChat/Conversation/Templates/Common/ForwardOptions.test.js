import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import ForwardOptions from '../../../../../../Components/WebChat/Conversation/Templates/Common/ForwardOptions';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>>ForwardOptions Test cover<<<", () => {

    it('Mock has be created props undefined', () => {
        const monckData = undefined;
        const store = mockStore({

        });
        wrapper = mount(
            <Provider store={store}>
                <ForwardOptions {...monckData} />
            </Provider>);
    });

    it('Mock has be created Users', () => {
        const monckData = {
            messageAction: jest.fn(),
            msgActionType: "Forward",
        };
        const store = mockStore({

        });
        wrapper = mount(
            <Provider store={store}>
                <ForwardOptions {...monckData} />
            </Provider>);
    });

    it('Mock has be props change', () => {
        const monckData = {
            closeMessageOption: jest.fn(),
            msgActionType: "Forward",

        };
        const store = mockStore({
            forwardMessageData: {
                id: "12345",
                totalMessage: 0
            }
        });
        wrapper = mount(
            <Provider store={store}>
                <ForwardOptions {...monckData} />
            </Provider>);
    });

    it('showForwardPopUp open', () => {
        wrapper.find('li[data-jest-id="jestShowForwardPopUp"]').simulate('click');
    });

});
