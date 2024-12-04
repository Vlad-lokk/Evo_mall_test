/* @odoo-module */

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { useRecordObserver } from "@web/model/relational_model/utils";

import { formatDate } from "@web/core/l10n/dates";
import { Component, useState, onWillStart } from "@odoo/owl";

const { DateTime } = luxon;

export class LeaveStatsComponentCustom extends Component {
    setup() {
        this.orm = useService("orm");

        this.state = useState({
            leaves: [],
            departmentLeaves: [],
        });

        this.date = this.props.record.data.date_from || DateTime.now();
        this.department = this.props.record.data.department_id;
        this.employee = this.props.record.data.employee_id;

        onWillStart(async () => {
            await this.loadDepartmentLeaves(this.date, this.department, this.employee);
        });

        useRecordObserver(async (record) => {
            const dateFrom = record.data.date_from || DateTime.now();
            const dateChanged = this.date !== dateFrom;
            const employee = record.data.employee_id;
            const department = record.data.department_id;


            const proms = [];

            if (
                dateChanged ||
                (department && (this.department && this.department[0]) !== department[0])
            ) {
                proms.push(this.loadDepartmentLeaves(dateFrom, department, employee));
            }
            await Promise.all(proms);

            this.date = dateFrom;
            this.employee = employee;
            this.department = department;
        });
    }

    async loadDepartmentLeaves(date, department, employee) {
        if (!(department && employee && date)) {
            this.state.departmentLeaves = [];
            return;
        }
        const fieldsInfo = await this.orm.call("hr.leave", "fields_get", ["state"]);
        const stateSelection = fieldsInfo.state.selection;
        const departmentLeaves = await this.orm.searchRead(
            "hr.leave",
            [
                ["department_id", "=", department[0]],
                ["employee_id", "=", employee[0]],
                ["holiday_type", "=", "employee"],
            ],
            ["employee_id","department_id", "date_from", "date_to", "number_of_days", "state","holiday_status_id"]
        );
        console.log('department');
        console.log(departmentLeaves);

        this.state.departmentLeaves = departmentLeaves.map((leave) => {
            const stateName = stateSelection.find((item) => item[0] === leave.state)?.[1] || leave.state;
            return Object.assign({}, leave, {
                dateFrom: formatDate(DateTime.fromSQL(leave.date_from, { zone: "utc" }).toLocal()),
                dateTo: formatDate(DateTime.fromSQL(leave.date_to, { zone: "utc" }).toLocal()),
                sameEmployee: leave.employee_id[0] === employee[0],
                state: stateName,
            });
        });
    }

}

LeaveStatsComponentCustom.template = "evo_mall_test.LeaveStatsComponentCustom";

export const leaveStatsComponentCustom = {
    component: LeaveStatsComponentCustom,
};
registry.category("view_widgets").add("hr_leave_stats_custom", leaveStatsComponentCustom);
