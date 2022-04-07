import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import CameraPerMissionDenied from '../../../../Components/WebChat/Camera/CameraPerMissionDenied';

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
                <CameraPerMissionDenied {...monckData} />
            </Provider>);
    });
    it('TakeCameraPicture find permission denied', () => {
        wrapper.find('button[data-id="jestHandleCameraPopupClose"]').simulate('click');
    });
});
