import React, { Component } from 'react';
import SDK from '../../SDK';
import Store from '../../../Store';
import { toast } from 'react-toastify';
import { hideModal } from '../../../Actions/PopUp';
import { blockOfflineAction, isAppOnline } from '../../../Helpers/Utility';

export default class ActionPopUp extends Component {
    cancelAction = () => {
        Store.dispatch(hideModal())
    }

    handleAction = () => {
        if (!isAppOnline()) {
            blockOfflineAction()
            return
        }
        const { modalProps: { displayName = "", groupuniqueId = "", userjid = "", action = "" } = {} } = this.props || {};
        if (action === 'groupMakeAdmin') {
            SDK && SDK.makeAsAdmin(groupuniqueId, userjid)
            const toastMessage = `${displayName} is now admin`;
            toast.success(toastMessage, "success");
        } else if (action === "ExitGroup") {
            SDK && SDK.userExitGroup(groupuniqueId, userjid);
            const toastMessage = `You were no longer from the group.`;
            toast.info(toastMessage);
        }
        else {
            SDK && SDK.removeParticipant(groupuniqueId, userjid)
            const toastMessage = `${displayName} is removed from group`
            toast.success(toastMessage);
        }
        this.cancelAction()
    }

    ternaryAvoid = () => {
        const { modalProps: { action = "" } = {} } = this.props || {};
        switch (action) {
            case 'groupMakeAdmin':
                return 'Make group admin'
            case 'ExitGroup':
                return 'Exit'
            case 'DeleteGroup':
                return 'Delete'
            default:
                return 'Remove'
        }
    }

    render() {
        const { modalProps: { title = "", activeclass = "", action = "" } = {} } = this.props || {};
        const labelToDisplay = this.ternaryAvoid();
        return (
            <div className="popup-wrapper">
                <div className={`popup-container ${activeclass}`}>
                    <div className="popup-container-inner">
                        <div className="popup-label">
                            <label>{title}</label>
                        </div>
                        <div className="popup-noteinfo">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={this.cancelAction}
                                data-jest-id={"jestcancelAction"}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={this.handleAction}
                                data-jest-id={"jesthandleAction"}
                                className={`btn-active ${action === 'groupRemoveMember' ? "danger" : ""}`}
                            >
                                {labelToDisplay}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
