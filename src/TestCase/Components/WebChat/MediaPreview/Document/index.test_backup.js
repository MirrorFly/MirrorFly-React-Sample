import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import Document from '../../../../../Components/WebChat/MediaPreview/Document';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> Document Test case <<<", () => {
    it('Mock has be created Users props', () => {
        const monckData = {
            updateMedia: jest.fn(),
        }
        const store = mockStore(undefined);
        wrapper = mount(
            <Provider store={store}>
                <Document {...monckData} />
            </Provider>);
    });

});
