import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import ShowMediaInDetailPopup from '../../../../Components/WebChat/ContactInfo/ShowMediaInDetailPopup';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> ShowMediaInDetailPopup Test case <<<", () => {
    it('Mock has be created Users', () => {
        const monckData = {
            groupuniqueId: "",
            isAdmin: true,
            members: {
                image: "",
                status: "",
                userId: "919786252605",
                emailId: "",
                username: "",
                userType: "",
                GroupUser: "",
                statusMsg: "",
                fromuser: "",
            }
            // 919786252605
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ShowMediaInDetailPopup {...monckData} />
            </Provider>);
    });

});
