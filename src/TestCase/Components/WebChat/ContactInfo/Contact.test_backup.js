import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import Contact from '../../../../Components/WebChat/ContactInfo/Contact';
import ContactInfoCheckBox from '../../../../Components/WebChat/ContactInfo/ContactInfoCheckBox';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> TakeCameraPicture Test case <<<", () => {
    it('Mock has be created Users', () => {
        const monckData = {
            photoTaken: true,
            loader: false,
            handleCameraShow: jest.fn(),
            handleCameraPopupClose: jest.fn(),
            prepareContactToRemove: jest.fn(),
            prepareContactToAdd: jest.fn(),
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {},
            featureStateData: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <Contact {...monckData} />
            </Provider>);
    });

    it("ContactInfoCheckBox component warapper", () => {
        const onEnter = wrapper.find(ContactInfoCheckBox).first();
        onEnter.props().handleChange();
    });

    it('Mock has be created Users isBlocked true create', () => {
        const monckData = {
            photoTaken: true,
            isBlocked: true,
            isChanged: -1,
            handleCameraShow: jest.fn(),
            handleCameraPopupClose: jest.fn(),
            prepareContactToRemove: jest.fn(),
            prepareContactToAdd: jest.fn(),
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {},
            featureStateData: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <Contact {...monckData} />
            </Provider>);
    });

    it("ContactInfoCheckBox component warapper", () => {
        const onEnter = wrapper.find(ContactInfoCheckBox).first();
        onEnter.props().handleChange();
    });

    it('Mock has be created Users isChanged value change', () => {
        const monckData = {
            photoTaken: true,
            isBlocked: true,
            maxMemberReached: true,
            isChanged: 2,
            handleCameraShow: jest.fn(),
            handleCameraPopupClose: jest.fn(),
            prepareContactToRemove: jest.fn(),
            prepareContactToAdd: jest.fn(),
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {},
            featureStateData: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <Contact {...monckData} />
            </Provider>);
    });

    it("ContactInfoCheckBox component warapper", () => {
        const onEnter = wrapper.find(ContactInfoCheckBox).first();
        onEnter.props().handleChange();
    });

    it("popUpToggleAction component warapper", () => {
        const onEnter = wrapper.find(ContactInfoCheckBox).first();
        onEnter.props().popUpToggleAction();
    });

});
