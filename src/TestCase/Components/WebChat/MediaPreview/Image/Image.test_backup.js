import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import Image from '../../../../../Components/WebChat/MediaPreview/Image/Image';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> Image Test case <<<", () => {
    it('Mock has be created Users props', () => {
        Object.defineProperty(global, 'FileReader', {
            writable: true,
            value: jest.fn().mockImplementation(() => ({
                readAsDataURL: jest.fn(),
                onLoad: jest.fn()
            })),
        })
        const monckData = {
            onChangeCaption: jest.fn(),
            updateMedia: jest.fn(),
        }
        const store = mockStore(undefined);
        wrapper = mount(
            <Provider store={store}>
                <Image {...monckData} />
            </Provider>);
    });

});
