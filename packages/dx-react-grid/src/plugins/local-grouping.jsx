import React from 'react';
import PropTypes from 'prop-types';
import { Getter, PluginContainer } from '@devexpress/dx-react-core';
import {
  groupRowChecker,
  groupRowLevelKeyGetter,
  groupedRows,
  expandedGroupRows,
} from '@devexpress/dx-grid-core';

const pluginDependencies = [
  { pluginName: 'GroupingState' },
];

const expandedGroupedRowsComputed = ({ rows, grouping, expandedGroups }) =>
  expandedGroupRows(rows, grouping, expandedGroups);

export class LocalGrouping extends React.PureComponent {
  render() {
    const { getColumnIdentity } = this.props;

    const groupedRowsComputed = ({ rows, grouping, getCellValue }) =>
      groupedRows(rows, grouping, getCellValue, getColumnIdentity);

    return (
      <PluginContainer
        pluginName="LocalGrouping"
        dependencies={pluginDependencies}
      >
        <Getter name="isGroupRow" value={groupRowChecker} />
        <Getter name="getRowLevelKey" value={groupRowLevelKeyGetter} />
        <Getter name="rows" computed={groupedRowsComputed} />
        <Getter name="rows" computed={expandedGroupedRowsComputed} />
      </PluginContainer>
    );
  }
}

LocalGrouping.propTypes = {
  getColumnIdentity: PropTypes.func,
};

LocalGrouping.defaultProps = {
  getColumnIdentity: undefined,
};
