import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import ContactInfoCheckBox from '../../../../Components/WebChat/ContactInfo/ContactInfoCheckBox';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> ContactInfoCheckBox Test case <<<", () => {
    it('Mock has be created Users', () => {
        const monckData = {
            isBlocked: true,
            loader: false,
            handleChange: jest.fn(),
            popUpToggleAction: jest.fn(),

        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ContactInfoCheckBox {...monckData} />
            </Provider>);
    });

    it('popUpToggleAction click', () => {
        wrapper.find('span[data-jest-id="jestpopUpToggleAction"]').simulate('click');
    });

});
