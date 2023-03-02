import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import DeletedMessage from '../../../../../../Components/WebChat/Conversation/Templates/Common/DeletedMessage';
import DropDownAction from '../../../../../../Components/WebChat/Conversation/Templates/Common/DropDownAction';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>>DeletedMessage Test cover<<<", () => {

    it('Mock has be created props undefined', () => {
        const monckData = undefined;
        const store = mockStore({

        });
        wrapper = mount(
            <Provider store={store}>
                <DeletedMessage {...monckData} />
            </Provider>);
    });

    it('Mock has be created Users', () => {
        const monckData = {
            messageAction: jest.fn(),
        };
        const store = mockStore({
            featureStateData:{}
        });
        wrapper = mount(
            <Provider store={store}>
                <DeletedMessage {...monckData} />
            </Provider>);
    });

    it('span click dropOpen', () => {
        wrapper.find('span[data-jest-id="jestHandleDropDown"]').simulate('click');
    });
});
