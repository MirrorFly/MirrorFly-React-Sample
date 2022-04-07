import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import GoogleMapMarker from '../../../../../../Components/WebChat/Conversation/Templates/Common/GoogleMapMarker';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe("GoogleMapMarker Test cover", () => {

    it('Mock has be created props undefined', () => {
        const monckData = undefined;
        const store = mockStore({

        });
        wrapper = mount(
            <Provider store={store}>
                <GoogleMapMarker {...monckData} />
            </Provider>);
    });


    it('pass props value', () => {
        const monckData = {
            latitude :"8.0", longitude : "8.0"
        };
        const store = mockStore({

        });
        wrapper = mount(
            <Provider store={store}>
                <GoogleMapMarker {...monckData} />
            </Provider>);
    });

});
