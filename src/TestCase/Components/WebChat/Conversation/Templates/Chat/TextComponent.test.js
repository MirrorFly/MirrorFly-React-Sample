import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import TextComponent from '../../../../../../Components/WebChat/Conversation/Templates/Chat/TextComponent';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe("LocationComponent Test cover", () => {

    it('Mock has be created props undefined', () => {
        const monckData = undefined;
        const store = mockStore({

        });
        wrapper = mount(
            <Provider store={store}>
                <TextComponent {...monckData} />
            </Provider>);
    });

    it('Mock has be created props postive', () => {
        const monckData = {
            messageObject: {
                msgBody: {
                    file_url: "9199949207271636465415545O1Xe5Ag5x4IB5VVJMhkv.jpg"
                }
            },
        };
        const store = mockStore({

        });
        wrapper = mount(
            <Provider store={store}>
                <TextComponent {...monckData} />
            </Provider>);
    });
});
