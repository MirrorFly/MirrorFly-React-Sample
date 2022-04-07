import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import ForwardMessage from '../../../../../../Components/WebChat/Conversation/Templates/Common/ForwardMessage';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>>ForwardMessage Test cover<<<", () => {

    it('Mock has be created props undefined', () => {
        const monckData = undefined;
        const store = mockStore({

        });
        wrapper = mount(
            <Provider store={store}>
                <ForwardMessage {...monckData} />
            </Provider>);
    });

    it('Mock has be created Users', () => {
        const monckData = {
            messageAction: jest.fn(),
        };
        const store = mockStore({

        });
        wrapper = mount(
            <Provider store={store}>
                <ForwardMessage {...monckData} />
            </Provider>);
    });

    it('input click dropOpen', () => {
        wrapper.find('input[data-jest-id="jestHandleChange"]').simulate('change');
    });

    it('Mock has be created Users', () => {
        const monckData = {
            forwardMessageId:"9994920727",
            msgid:"9994920727"
        };
        const store = mockStore({
            forwardMessageId:"9994920727",
            msgid:"9994920727"
        });
        wrapper = mount(
            <Provider store={store}>
                <ForwardMessage {...monckData} />
            </Provider>);
    });

});
