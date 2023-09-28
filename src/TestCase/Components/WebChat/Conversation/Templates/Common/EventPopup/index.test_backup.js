import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import EventPopup from '../../../../../../../Components/WebChat/Conversation/Templates/Common/EventPopup';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>>EventPopup Page Test cover<<<", () => {

    it('Mock has be created Users', () => {
        const monckData = {

        };
        const store = mockStore({

        });
        wrapper = mount(
            <Provider store={store}>
                <EventPopup {...monckData} />
            </Provider>);
    });

});
