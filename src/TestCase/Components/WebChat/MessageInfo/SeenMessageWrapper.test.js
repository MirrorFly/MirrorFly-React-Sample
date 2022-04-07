import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import SeenMessageWrapper from '../../../../Components/WebChat/MessageInfo/SeenMessageWrapper';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> SeenMessageWrapper Test case <<<", () => {
    it('Mock has be created Users props undefined', () => {
        const monckData = {
            onChangeCaption: jest.fn(),
            seenMembers: [{ userId: "test", seenTime: "test", }],
        }
        const store = mockStore(undefined);
        wrapper = mount(
            <Provider store={store}>
                <SeenMessageWrapper {...monckData} />
            </Provider>);
    });

});
