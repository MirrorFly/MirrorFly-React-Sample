import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import Caption from '../../../../Components/WebChat/MediaPreview/Caption';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> Caption Test case <<<", () => {
    it('Mock has be created Users props undefined', () => {
        const monckData = {
            onChangeCaption: jest.fn(),
        }
        const store = mockStore(undefined);
        wrapper = mount(
            <Provider store={store}>
                <Caption {...monckData} />
            </Provider>);
    });

    it('Mock has be created Users props undefined', () => {
        const monckData = {
            onChangeCaption: jest.fn(),
        }
        const store = mockStore({

        });
        wrapper = mount(
            <Provider store={store}>
                <Caption {...monckData} />
            </Provider>);
    });

});
