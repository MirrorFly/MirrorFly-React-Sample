import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import TakeCameraPicture from '../../../../Components/WebChat/Camera/TakeCameraPicture';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> TakeCameraPicture Test case <<<", () => {
    it('Mock has be created Users', () => {
        const monckData = {
            photoTaken: true,
            loader: false,
            handleCameraShow: jest.fn(),
            handleCameraPopupClose: jest.fn(),

        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <TakeCameraPicture {...monckData} />
            </Provider>);
    });
    it('TakeCameraPicture find permission denied', () => {
        wrapper.find('i[data-jest-id="jesthandleCameraPopupClose"]').simulate('click');
    });

    it('TakeCameraPicture find permission denied', () => {
        wrapper.find('span[data-jest-id="jesthandleCameraShow"]').simulate('click');
    });
});
