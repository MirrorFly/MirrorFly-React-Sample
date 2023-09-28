import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import BlockUnBlockOption from '../../../../Components/WebChat/ContactInfo/BlockUnBlockOption';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> BlockUnBlockOption Test case <<<", () => {

    it('Mock has be created Users', () => {
        const monckData = {
            logoutStatus: jest.fn(),
            isBlocked: true,
            isClearChatEnabled: true,
            isDeleteChatEnabled: true,
            isBlockEnabled: true,
            isReportEnabled: true
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <BlockUnBlockOption {...monckData} />
            </Provider>);
    });

    it('popUpToggleAction click', () => {
        wrapper.find('div[data-jest-id="jestpopUpToggleAction"]').simulate('click');
    });

    it('Mock has be created Users modalProps undefined', () => {
        const monckData = {
            logoutStatus: jest.fn(),
            isBlocked: false,
            isClearChatEnabled:  false,
            isDeleteChatEnabled: false,
            isBlockEnabled: false,
            isReportEnabled: false
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <BlockUnBlockOption {...monckData} />
            </Provider>);
    });

    it('popUpToggleAction click', () => {
        wrapper.find('div[data-jest-id="jestpopUpToggleAction"]').simulate('click');
    });

    it('ClearPopupAction click', () => {
        wrapper.find('div[data-jest-id="jestClearPopupAction"]').simulate('click');
    });

    it('deletePopupAction click', () => {
        wrapper.find('div[data-jest-id="jestdeletePopupAction"]').simulate('click');
    });

    it('SingleReportAction click', () => {
        wrapper.find('div[data-jest-id="jestSingleReportAction"]').simulate('click');
    });


});
