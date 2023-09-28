import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import DocumentComponent from '../../../../../../Components/WebChat/Conversation/Templates/Chat/DocumentComponent';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe("DocumentComponent Test cover", () => {

    it('Mock has be created props undefined', () => {
        const monckData = undefined;
        const store = mockStore({

        });
        wrapper = mount(
            <Provider store={store}>
                <DocumentComponent {...monckData} />
            </Provider>);
    });

    it('Mock has be created props postive', () => {
        const monckData = {

        };
        const store = mockStore({

        });
        wrapper = mount(
            <Provider store={store}>
                <DocumentComponent {...monckData} />
            </Provider>);
    });
});
