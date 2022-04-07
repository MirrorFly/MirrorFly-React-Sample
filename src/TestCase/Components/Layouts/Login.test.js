import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import Login from '../../../Components/Layouts/Login';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>>CusApiKey Users Page Test cover<<<", () => {
    it('Mock has be created Users', () => {
        const monckData = {
            domainonBlur: jest.fn(),//click
            userRoleId: 1,
            onRemoveDomain: jest.fn(),//click
            domaiUrlChange: jest.fn(),//click
            stateManage: {
                domainUrl: [
                    {
                        domain: "www.com",
                        domainvalidate: true
                    }
                ]
            },//click function
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <Login {...monckData} />
            </Provider>);
    });

});
