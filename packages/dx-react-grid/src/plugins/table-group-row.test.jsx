import React from 'react';
import { mount } from 'enzyme';
import { setupConsole } from '@devexpress/dx-testing';
import { PluginHost } from '@devexpress/dx-react-core';
import {
  GROUP_ADD_MODE,
  tableColumnsWithGrouping,
  tableRowsWithGrouping,
  isGroupTableCell,
  isGroupIndentTableCell,
  isGroupTableRow,
} from '@devexpress/dx-grid-core';
import { DataTypeProvider } from './data-type-provider';
import { TableGroupRow } from './table-group-row';
import { pluginDepsToComponents, getComputedState } from './test-utils';

jest.mock('@devexpress/dx-grid-core', () => ({
  tableColumnsWithGrouping: jest.fn(),
  tableRowsWithGrouping: jest.fn(),
  isGroupTableCell: jest.fn(),
  isGroupIndentTableCell: jest.fn(),
  isGroupTableRow: jest.fn(),
}));

const defaultDeps = {
  getter: {
    tableColumns: [{ type: 'undefined', id: 1, column: 'column' }],
    tableBodyRows: [{ type: 'undefined', id: 1, row: 'row' }],
    grouping: [{ columnName: 'a' }],
    draftGrouping: [{ columnName: 'a' }, { columnName: 'b', draft: GROUP_ADD_MODE }],
    expandedGroups: new Map(),
    isGroupRow: () => false,
  },
  action: {
    toggleGroupExpanded: jest.fn(),
  },
  template: {
    tableCell: {
      tableRow: { type: 'undefined', id: 1, row: 'row' },
      tableColumn: { type: 'undefined', id: 1, column: 'column' },
      style: {},
    },
    tableRow: {
      tableRow: { type: 'undefined', id: 1, row: 'row' },
      style: {},
    },
  },
  plugins: ['GroupingState', 'Table'],
};

const defaultProps = {
  groupCellTemplate: () => null,
  groupIndentCellTemplate: () => null,
  groupRowTemplate: () => null,
  groupIndentColumnWidth: 100,
  showColumnWhenGrouped: jest.fn(),
};

describe('TableGroupRow', () => {
  let resetConsole;
  beforeAll(() => {
    resetConsole = setupConsole({ ignore: ['validateDOMNesting'] });
  });
  afterAll(() => {
    resetConsole();
    jest.resetAllMocks();
  });

  beforeEach(() => {
    tableColumnsWithGrouping.mockImplementation(() => 'tableColumnsWithGrouping');
    tableRowsWithGrouping.mockImplementation(() => 'tableRowsWithGrouping');
    isGroupTableCell.mockImplementation(() => false);
    isGroupIndentTableCell.mockImplementation(() => false);
    isGroupTableRow.mockImplementation(() => false);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('table layout getters extending', () => {
    it('should extend tableBodyRows', () => {
      const tree = mount((
        <PluginHost>
          {pluginDepsToComponents(defaultDeps)}
          <TableGroupRow
            {...defaultProps}
          />
        </PluginHost>
      ));

      expect(getComputedState(tree).getters.tableBodyRows)
        .toBe('tableRowsWithGrouping');
      expect(tableRowsWithGrouping)
        .toBeCalledWith(defaultDeps.getter.tableBodyRows, defaultDeps.getter.isGroupRow);
    });

    it('should extend tableColumns', () => {
      const tree = mount((

        <PluginHost>
          {pluginDepsToComponents(defaultDeps)}
          <TableGroupRow
            {...defaultProps}
          />
        </PluginHost>
      ));

      expect(getComputedState(tree).getters.tableColumns)
        .toBe('tableColumnsWithGrouping');
      expect(tableColumnsWithGrouping)
        .toBeCalledWith(
          defaultDeps.getter.tableColumns,
          defaultDeps.getter.grouping,
          defaultDeps.getter.draftGrouping,
          defaultProps.groupIndentColumnWidth,
          defaultProps.showColumnWhenGrouped,
        );
    });
  });

  describe('hide grouping column', () => {
    it('should all columns be hidden', () => {
      const deps = {
        getter: {
          columns: [
            { name: 'A' },
            { name: 'B' },
          ],
        },
      };

      const tree = mount((
        <PluginHost>
          {pluginDepsToComponents(defaultDeps, deps)}
          <TableGroupRow
            {...defaultProps}
            showColumnWhenGrouped={null}
          />
        </PluginHost>
      ));

      expect(getComputedState(tree).getters.tableColumns)
        .toBe('tableColumnsWithGrouping');
      const showColumnWhenGrouped = tableColumnsWithGrouping.mock.calls[0][4];
      expect(showColumnWhenGrouped('A')).toBe(false);
      expect(showColumnWhenGrouped('B')).toBe(false);
    });

    it('should keep column in table if column value specified', () => {
      const deps = {
        getter: {
          columns: [
            { name: 'A', showWhenGrouped: true },
            { name: 'B' },
          ],
        },
      };

      const tree = mount((
        <PluginHost>
          {pluginDepsToComponents(defaultDeps, deps)}
          <TableGroupRow
            {...defaultProps}
            showColumnWhenGrouped={null}
          />
        </PluginHost>
      ));

      expect(getComputedState(tree).getters.tableColumns)
        .toBe('tableColumnsWithGrouping');
      const showColumnWhenGrouped = tableColumnsWithGrouping.mock.calls[0][4];
      expect(showColumnWhenGrouped('A')).toBe(true);
      expect(showColumnWhenGrouped('B')).toBe(false);
    });

    it('should keep column in table if custom func specified', () => {
      const deps = {
        getter: {
          columns: [
            { name: 'A', showWhenGrouped: true },
            { name: 'B' },
          ],
        },
      };

      const tree = mount((
        <PluginHost>
          {pluginDepsToComponents(defaultDeps, deps)}
          <TableGroupRow
            {...defaultProps}
            showColumnWhenGrouped={(columnName) => {
              if (columnName === 'B') {
                return true;
              } return false;
            }}
          />
        </PluginHost>
      ));

      expect(getComputedState(tree).getters.tableColumns)
        .toBe('tableColumnsWithGrouping');
      const showColumnWhenGrouped = tableColumnsWithGrouping.mock.calls[0][4];
      expect(showColumnWhenGrouped('A')).toBe(false);
      expect(showColumnWhenGrouped('B')).toBe(true);
    });
  });

  it('should render groupIndent cell on select group column and foreign group row intersection', () => {
    isGroupIndentTableCell.mockImplementation(() => true);
    const groupIndentCellTemplate = jest.fn(() => null);

    mount((
      <PluginHost>
        {pluginDepsToComponents(defaultDeps)}
        <TableGroupRow
          {...defaultProps}
          groupIndentCellTemplate={groupIndentCellTemplate}
        />
      </PluginHost>
    ));

    expect(isGroupIndentTableCell)
      .toBeCalledWith(
        defaultDeps.template.tableCell.tableRow,
        defaultDeps.template.tableCell.tableColumn,
      );
    expect(groupIndentCellTemplate)
      .toBeCalledWith(expect.objectContaining({
        ...defaultDeps.template.tableCell,
        row: defaultDeps.template.tableCell.tableRow.row,
        column: defaultDeps.template.tableCell.tableColumn.column,
      }));
  });

  describe('groupCellTemplate', () => {
    it('should render group cell on select group column and group row intersection', () => {
      isGroupTableCell.mockImplementation(() => true);
      const groupCellTemplate = jest.fn(() => null);

      mount((
        <PluginHost>
          {pluginDepsToComponents(defaultDeps)}
          <TableGroupRow
            {...defaultProps}
            groupCellTemplate={groupCellTemplate}
          />
        </PluginHost>
      ));

      expect(isGroupTableCell)
        .toBeCalledWith(
          defaultDeps.template.tableCell.tableRow,
          defaultDeps.template.tableCell.tableColumn,
        );
      expect(groupCellTemplate)
        .toBeCalledWith(expect.objectContaining({
          ...defaultDeps.template.tableCell,
          row: defaultDeps.template.tableCell.tableRow.row,
          column: defaultDeps.template.tableCell.tableColumn.column,
        }));
    });

    it('should provide correct cell params', () => {
      isGroupTableCell.mockImplementation(() => true);
      const groupCellTemplate = jest.fn(() => null);

      const deps = {
        getter: {
          expandedGroups: new Set(),
        },
        template: {
          tableCell: {
            tableRow: { row: { compoundKey: '1' } },
            tableColumn: {},
          },
        },
      };
      jest.spyOn(deps.getter.expandedGroups, 'has').mockReturnValue('hasTest');

      mount((
        <PluginHost>
          {pluginDepsToComponents(defaultDeps, deps)}
          <TableGroupRow
            {...defaultProps}
            groupCellTemplate={groupCellTemplate}
          />
        </PluginHost>
      ));
      expect(groupCellTemplate)
        .toBeCalledWith(expect.objectContaining({
          isExpanded: 'hasTest',
          toggleGroupExpanded: expect.any(Function),
        }));
      expect(deps.getter.expandedGroups.has)
        .toBeCalledWith('1');

      groupCellTemplate.mock.calls[0][0].toggleGroupExpanded();
      expect(defaultDeps.action.toggleGroupExpanded.mock.calls[0][0])
        .toEqual({ groupKey: '1' });
    });
  });

  it('can render custom formatted data in group row cell', () => {
    isGroupTableCell.mockImplementation(() => true);
    const groupCellTemplate = jest.fn(() => null);
    const valueFormatter = jest.fn(() => <span />);
    const deps = {
      template: {
        tableCell: {
          tableRow: {
            type: 'undefined', id: 1, value: 'row', row: { key: '1' },
          },
          tableColumn: { type: 'undefined', id: 1, column: { name: 'column', dataType: 'column' } },
          style: {},
        },
      },
    };

    mount((
      <PluginHost>
        <DataTypeProvider
          type="column"
          formatterTemplate={valueFormatter}
        />
        {pluginDepsToComponents(defaultDeps, deps)}
        <TableGroupRow
          {...defaultProps}
          groupCellTemplate={groupCellTemplate}
        />
      </PluginHost>
    ));

    expect(valueFormatter)
      .toHaveBeenCalledWith({
        column: deps.template.tableCell.tableColumn.column,
        value: deps.template.tableCell.tableRow.row.value,
      });
    expect(groupCellTemplate.mock.calls[0][0])
      .toHaveProperty('children');
  });

  it('should render row by using groupRowTemplate', () => {
    isGroupTableRow.mockImplementation(() => true);
    const groupRowTemplate = jest.fn(() => null);

    mount((
      <PluginHost>
        {pluginDepsToComponents(defaultDeps)}
        <TableGroupRow
          {...defaultProps}
          groupRowTemplate={groupRowTemplate}
        />
      </PluginHost>
    ));

    expect(isGroupTableRow).toBeCalledWith(defaultDeps.template.tableRow.tableRow);
    expect(groupRowTemplate).toBeCalledWith(expect.objectContaining({
      ...defaultDeps.template.tableRow,
      row: defaultDeps.template.tableRow.tableRow.row,
    }));
  });
});
