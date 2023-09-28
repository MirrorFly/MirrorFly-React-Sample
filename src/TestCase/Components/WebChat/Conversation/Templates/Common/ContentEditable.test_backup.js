import * as React from 'react';
import { Provider } from 'react-redux';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import ContentEditable from '../../../../../../Components/WebChat/Conversation/Templates/Common/ContentEditable';

configure({ adapter: new Adapter() });
const mockStore = configureMockStore();
let wrapper;

describe(">>>ContentEditable Page Test cover<<<", () => {
    document.body.innerHTML =
        '<div>' +
        '  <div id="contenteditable" >poorvika.com</div>' +
        '  <button id="button" />' +
        '</div>';

    it('Mock has be created Users', () => {
        const monckData = {
            domainonBlur: jest.fn(),//click
            userRoleId: 1,
            onRemoveDomain: jest.fn(),//click
            domaiUrlChange: jest.fn(),//click
            stateManage: {
                domainUrl: [
                    {
                        domain: "www.com",
                        domainvalidate: true
                    }
                ]
            },//click function
            handleMessage: jest.fn(),
            onInputListener: jest.fn(),
            onKeyDownListner: jest.fn(),
            handleSendTextMsg: jest.fn(),
            handleEmptyContent: jest.fn(),
        };
        const store = mockStore({
            CusPage: {},
            cusTeams: {},
            handleMessage: jest.fn(),
            onInputListener: jest.fn(),
            onKeyDownListner: jest.fn(),
            handleSendTextMsg: jest.fn(),
        });
        wrapper = mount(
            <Provider store={store}>
                <ContentEditable {...monckData} />
            </Provider>);
    });

    it('contented edit blur click', () => {
        wrapper.find('div[data-jest-id="jestContentEditable"]').simulate('blur');
    });

    it('contented focus click', () => {
        wrapper.find('div[data-jest-id="jestContentEditable"]').simulate('focus');
    });

    it('contented mouseUp click', () => {
        wrapper.find('div[data-jest-id="jestContentEditable"]').simulate('mouseUp');
    });

    it('contented oninput click', () => {
        wrapper.find('div[data-jest-id="jestContentEditable"]').simulate('input');
    });

    it('contented paste click', () => {
        wrapper.find('div[data-jest-id="jestContentEditable"]').simulate('paste');
    });

    it('contented keyDown click else log', () => {
        wrapper.find('div[data-jest-id="jestContentEditable"]').simulate('keyDown', { preventDefault: jest.fn(), which: 67, shiftKey: false, target: { name: 'email', value: 'admin@gmail.com' } });
    });

    it('contented keyDown click', () => {
        wrapper.find('div[data-jest-id="jestContentEditable"]').simulate('keyDown', { preventDefault: jest.fn(), which: 13, shiftKey: false, target: { name: 'email', value: 'admin@gmail.com' } });
    });

});
