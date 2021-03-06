import React from 'react';
import PropTypes from 'prop-types';
import {
  Getter,
  Template,
  PluginContainer,
  TemplatePlaceholder,
  TemplateConnector,
  TemplateRenderer,
} from '@devexpress/dx-react-core';
import {
  tableColumnsWithGrouping,
  tableRowsWithGrouping,
  isGroupTableCell,
  isGroupIndentTableCell,
  isGroupTableRow,
} from '@devexpress/dx-grid-core';

const getGroupIndentTableCellTemplateArgs = ({ params }) => ({
  ...params,
  row: params.tableRow.row,
  column: params.tableColumn.column,
});

const getGroupTableCellTemplateArgs = (
  params,
  { expandedGroups },
  { toggleGroupExpanded },
) => {
  const { compoundKey } = params.tableRow.row;
  return {
    ...params,
    row: params.tableRow.row,
    column: params.tableColumn.column,
    isExpanded: expandedGroups.has(compoundKey),
    toggleGroupExpanded: () => toggleGroupExpanded({ groupKey: compoundKey }),
  };
};

const getValueFormatterArgs = params => ({
  column: params.column,
  value: params.row.value,
});

const getGroupTableRowTemplateArgs = params => ({
  ...params,
  row: params.tableRow.row,
});

const pluginDependencies = [
  { pluginName: 'GroupingState' },
  { pluginName: 'Table' },
  { pluginName: 'DataTypeProvider', optional: true },
];

const tableBodyRowsComputed = ({ tableBodyRows, isGroupRow }) =>
  tableRowsWithGrouping(tableBodyRows, isGroupRow);

const createShowWhenGrouped = (columns) => {
  const cache = columns.reduce((acc, column) => {
    acc[column.name] = column.showWhenGrouped;
    return acc;
  }, {});

  return columnName => cache[columnName] || false;
};

export class TableGroupRow extends React.PureComponent {
  render() {
    const {
      groupCellTemplate,
      groupRowTemplate,
      groupIndentCellTemplate,
      groupIndentColumnWidth,
      showColumnWhenGrouped,
    } = this.props;

    const tableColumnsComputed = ({
      columns, tableColumns, grouping, draftGrouping,
    }) =>
      tableColumnsWithGrouping(
        tableColumns,
        grouping,
        draftGrouping,
        groupIndentColumnWidth,
        showColumnWhenGrouped || createShowWhenGrouped(columns),
      );

    return (
      <PluginContainer
        pluginName="TableGroupRow"
        dependencies={pluginDependencies}
      >
        <Getter name="tableColumns" computed={tableColumnsComputed} />
        <Getter name="tableBodyRows" computed={tableBodyRowsComputed} />

        <Template
          name="tableCell"
          predicate={({ tableRow, tableColumn }) => isGroupTableCell(tableRow, tableColumn)}
        >
          {params => (
            <TemplateConnector>
              {(getters, actions) => {
                const templateArgs = getGroupTableCellTemplateArgs(params, getters, actions);
                return (
                  <TemplatePlaceholder
                    name="valueFormatter"
                    params={getValueFormatterArgs(templateArgs)}
                  >
                    {content => (
                      <TemplateRenderer
                        template={groupCellTemplate}
                        params={templateArgs}
                      >
                        {content}
                      </TemplateRenderer>
                    )}
                  </TemplatePlaceholder>
                );
              }}
            </TemplateConnector>
          )}
        </Template>
        {groupIndentCellTemplate && (
          <Template
            name="tableCell"
            predicate={({ tableRow, tableColumn }) => isGroupIndentTableCell(tableRow, tableColumn)}
          >
            {params => (
              <TemplateRenderer
                template={groupIndentCellTemplate}
                params={getGroupIndentTableCellTemplateArgs({ params })}
              />
            )}
          </Template>
        )}
        <Template
          name="tableRow"
          predicate={({ tableRow }) => isGroupTableRow(tableRow)}
        >
          {params => (
            <TemplateRenderer
              template={groupRowTemplate}
              params={getGroupTableRowTemplateArgs(params)}
            />
          )}
        </Template>
      </PluginContainer>
    );
  }
}

TableGroupRow.propTypes = {
  groupCellTemplate: PropTypes.func.isRequired,
  groupRowTemplate: PropTypes.func.isRequired,
  groupIndentCellTemplate: PropTypes.func,
  groupIndentColumnWidth: PropTypes.number.isRequired,
  showColumnWhenGrouped: PropTypes.func,
};

TableGroupRow.defaultProps = {
  groupIndentCellTemplate: null,
  showColumnWhenGrouped: undefined,
};
