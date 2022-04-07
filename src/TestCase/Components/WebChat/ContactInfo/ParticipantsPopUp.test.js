import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import ParticipantsPopUp from '../../../../Components/WebChat/ContactInfo/ParticipantsPopUp';
import RecentSearch from '../../../../Components/WebChat/RecentChat/RecentSearch';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>> TakeCameraPicture Test case <<<", () => {
    it('Mock has be created Users', () => {
        const monckData = {
            groupuniqueId: "",
            isLoading: false,
            popUpData: {
                modalProps: {
                    groupMembers: ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1",]
                }
            }
            // 919786252605
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ParticipantsPopUp {...monckData} />
            </Provider>);
    });

    it('jestaddUsersInGroup click', () => {
        wrapper.find('i[data-jest-id="jestaddUsersInGroup"]').simulate('click');
    });

    it('Mock has be created Users', () => {
        const monckData = {
            groupuniqueId: "",
            isLoading: false,
            popUpData: {
                modalProps: {
                    groupMembers: ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1",]
                }
            }
            // 919786252605
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {}
        });
        wrapper = mount(
            <Provider store={store}>
                <ParticipantsPopUp {...monckData} />
            </Provider>);
    });

    it('jestaddUsersInGroup click', () => {
        wrapper.find('i[data-jest-id="jestaddUsersInGroup"]').simulate('click');
    });

    it("RecentSearch component warapper", () => {
        const onEnter = wrapper.find(RecentSearch).first();
        onEnter.props().search();
    });

    it("RecentSearch component warapper", () => {
        const onEnter = wrapper.find(RecentSearch).first();
        onEnter.props().search("oo");
    });
    it("RecentSearch component warapper", () => {
        const onEnter = wrapper.find(RecentSearch).first();
        onEnter.props().search("33");
    });
    it("RecentSearch component warapper", () => {
        const onEnter = wrapper.find(RecentSearch).first();
        onEnter.props().search("ooop");
    });
    it("RecentSearch component warapper", () => {
        const onEnter = wrapper.find(RecentSearch).first();
        onEnter.props().search("kfkf");
    });


});
