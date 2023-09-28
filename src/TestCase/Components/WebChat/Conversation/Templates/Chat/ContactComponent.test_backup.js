import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import ContactComponent from '../../../../../../Components/WebChat/Conversation/Templates/Chat/ContactComponent';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe("ContactComponent Test cover", () => {

    it('Mock has be created props undefined', () => {
        const monckData = undefined;
        const store = mockStore({

        });
        wrapper = mount(
            <Provider store={store}>
                <ContactComponent {...monckData} />
            </Provider>);
    });
});
