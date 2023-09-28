import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import DeliveredMessageWrapper from '../../../../Components/WebChat/MessageInfo/DeliveredMessageWrapper';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> DeliveredMessageWrapper Test case <<<", () => {
    it('Mock has be created Users props undefined', () => {
        const monckData = {
            onChangeCaption: jest.fn(),
            deliveredMemberList: [{ userId: "test", deliveredTime: "test", }],
        }
        const store = mockStore(undefined);
        wrapper = mount(
            <Provider store={store}>
                <DeliveredMessageWrapper {...monckData} />
            </Provider>);
    });

});
