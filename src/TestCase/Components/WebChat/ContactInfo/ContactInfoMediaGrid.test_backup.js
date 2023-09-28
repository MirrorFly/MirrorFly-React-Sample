import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import ContactInfoMediaGrid from '../../../../Components/WebChat/ContactInfo/ContactInfoMediaGrid';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> ContactInfoMediaGrid Test case <<<", () => {
    it('Mock has be created Users', () => {
        const monckData = {
            isBlocked: true,
            loader: false,
            handleChange: jest.fn(),
            handleContactMedia: jest.fn(),

        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ContactInfoMediaGrid {...monckData} />
            </Provider>);
    });

});
