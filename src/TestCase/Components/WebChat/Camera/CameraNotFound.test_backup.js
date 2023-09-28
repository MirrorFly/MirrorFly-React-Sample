import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import CameraNotFound from '../../../../Components/WebChat/Camera/CameraNotFound';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> CameraPerMissionDenied Test case <<<", () => {
    it('Mock has be created Users', () => {
        const monckData = {
            handleCameraPopupClose: jest.fn(),
            emojiState: true
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <CameraNotFound {...monckData} />
            </Provider>);
    });

    it('not fount click okay', () => {
        wrapper.find('button[data-jest-id="jesthandleCameraPopupClose"]').simulate('click');
    });

});
