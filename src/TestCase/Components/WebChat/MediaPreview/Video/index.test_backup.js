import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import Video from '../../../../../Components/WebChat/MediaPreview/Video';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> Video Test case <<<", () => {
    it('Mock has be created Users props', () => {
        Object.defineProperty(global, 'FileReader', {
            writable: true,
            value: jest.fn().mockImplementation(() => ({
                readAsDataURL: jest.fn(),
                onLoad: jest.fn(),
                readAsArrayBuffer: jest.fn(),
            })),
        })
        Object.defineProperty(URL, 'createObjectURL', {
            writable: true,
            value: jest.fn()
        })
        const monckData = {
            onChangeCaption: jest.fn(),
            updateMedia: jest.fn(),
        }
        const store = mockStore(undefined);
        wrapper = mount(
            <Provider store={store}>
                <Video {...monckData} />
            </Provider>);
    });

});
