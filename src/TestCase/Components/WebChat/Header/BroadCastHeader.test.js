import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import BroadCastHeader from '../../../../Components/WebChat/Header/BroadCastHeader';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> BroadCastHeader Test case <<<", () => {
    it('Mock has be created Users props undefined', () => {
        const monckData = undefined
        const store = mockStore(undefined);
        wrapper = mount(
            <Provider store={store}>
                <BroadCastHeader {...monckData} />
            </Provider>);
    });

    it('Mock has be created Users props undefined', () => {
        const monckData = {
            groupMemberDetails: [
                { displayName: "test", name: "test", username: "test", jid: "test" }
            ]
        }
        const store = mockStore({
            groupMemberDetails: [
                { displayName: "test", name: "test", username: "test", jid: "test" }
            ]
        });
        wrapper = mount(
            <Provider store={store}>
                <BroadCastHeader {...monckData} />
            </Provider>);
    });


});
