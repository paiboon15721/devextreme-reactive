import React from 'react';
import { mount } from 'enzyme';
import { setupConsole } from '@devexpress/dx-testing';
import { PluginHost } from '@devexpress/dx-react-core';
import {
  tableColumnsWithEditing,
  isHeadingEditCommandsTableCell,
  isDataEditCommandsTableCell,
  isEditCommandsTableCell,
  isAddedTableRow,
  isEditTableRow,
  getMessagesFormatter,
} from '@devexpress/dx-grid-core';
import { TableEditColumn } from './table-edit-column';
import { pluginDepsToComponents, getComputedState } from './test-utils';

jest.mock('@devexpress/dx-grid-core', () => ({
  tableColumnsWithEditing: jest.fn(),
  isHeadingEditCommandsTableCell: jest.fn(),
  isDataEditCommandsTableCell: jest.fn(),
  isEditCommandsTableCell: jest.fn(),
  isAddedTableRow: jest.fn(),
  isEditTableRow: jest.fn(),
  getMessagesFormatter: jest.fn(),
}));

const defaultDeps = {
  getter: {
    tableColumns: [{ type: 'undefined' }],
  },
  action: {
    addRow: jest.fn(),
    cancelAddedRows: jest.fn(),
    commitAddedRows: jest.fn(),
    startEditRows: jest.fn(),
    stopEditRows: jest.fn(),
    cancelChangedRows: jest.fn(),
    commitChangedRows: jest.fn(),
    deleteRows: jest.fn(),
    commitDeletedRows: jest.fn(),
  },
  template: {
    tableCell: {
      tableRow: { type: 'undefined', rowId: 1, row: 'row' },
      tableColumn: { type: 'undefined', column: 'column' },
      style: {},
    },
  },
  plugins: ['EditingState', 'Table'],
};

const defaultProps = {
  cellTemplate: () => null,
  headingCellTemplate: () => null,
  commandTemplate: () => null,
};

describe('TableHeaderRow', () => {
  let resetConsole;
  beforeAll(() => {
    resetConsole = setupConsole({ ignore: ['validateDOMNesting'] });
  });
  afterAll(() => {
    resetConsole();
  });

  beforeEach(() => {
    tableColumnsWithEditing.mockImplementation(() => 'tableColumnsWithEditing');
    isHeadingEditCommandsTableCell.mockImplementation(() => false);
    isDataEditCommandsTableCell.mockImplementation(() => false);
    isEditCommandsTableCell.mockImplementation(() => false);
    isAddedTableRow.mockImplementation(() => false);
    isEditTableRow.mockImplementation(() => false);
    getMessagesFormatter.mockImplementation(messages => key => (messages[key] || key));
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('table layout getters', () => {
    it('should extend tableColumns', () => {
      const tree = mount((
        <PluginHost>
          {pluginDepsToComponents(defaultDeps)}
          <TableEditColumn
            {...defaultProps}
            width={120}
          />
        </PluginHost>
      ));

      expect(getComputedState(tree).getters.tableColumns)
        .toBe('tableColumnsWithEditing');
      expect(tableColumnsWithEditing)
        .toBeCalledWith(defaultDeps.getter.tableColumns, 120);
    });
  });

  it('should render edit commands cell on edit-commands column and header row intersection', () => {
    isHeadingEditCommandsTableCell.mockImplementation(() => true);
    const headingCellTemplate = jest.fn(() => null);
    mount((
      <PluginHost>
        {pluginDepsToComponents(defaultDeps)}
        <TableEditColumn
          {...defaultProps}
          headingCellTemplate={headingCellTemplate}
        />
      </PluginHost>
    ));

    expect(isHeadingEditCommandsTableCell)
      .toBeCalledWith(
        defaultDeps.template.tableCell.tableRow,
        defaultDeps.template.tableCell.tableColumn,
      );
    expect(headingCellTemplate)
      .toBeCalledWith(expect.objectContaining({
        ...defaultDeps.template.tableCell,
      }));
  });

  it('should render edit commands cell on edit-commands column and added row intersection', () => {
    isEditCommandsTableCell.mockImplementation(() => true);
    const cellTemplate = jest.fn(() => null);
    mount((
      <PluginHost>
        {pluginDepsToComponents(defaultDeps)}
        <TableEditColumn
          {...defaultProps}
          cellTemplate={cellTemplate}
        />
      </PluginHost>
    ));

    expect(isEditCommandsTableCell)
      .toBeCalledWith(
        defaultDeps.template.tableCell.tableRow,
        defaultDeps.template.tableCell.tableColumn,
      );
    expect(cellTemplate)
      .toBeCalledWith(expect.objectContaining({
        ...defaultDeps.template.tableCell,
        row: defaultDeps.template.tableCell.tableRow.row,
        isEditing: false,
      }));
  });
  it('should pass getMessage function to heading command cell template', () => {
    isHeadingEditCommandsTableCell.mockImplementation(() => true);
    const headingCellTemplate = jest.fn(() => null);
    mount((
      <PluginHost>
        {pluginDepsToComponents(defaultDeps)}
        <TableEditColumn
          {...defaultProps}
          messages={{
            addCommand: 'Add',
          }}
          headingCellTemplate={headingCellTemplate}
        />
      </PluginHost>
    ));
    const { getMessage } = headingCellTemplate.mock.calls[0][0];

    expect(getMessage('addCommand')).toBe('Add');
  });

  it('should pass getMessage function to command cell template', () => {
    isEditCommandsTableCell.mockImplementation(() => true);
    const cellTemplate = jest.fn(() => null);

    mount((
      <PluginHost>
        {pluginDepsToComponents(defaultDeps)}
        <TableEditColumn
          {...defaultProps}
          messages={{
            editCommand: 'Edit',
          }}
          cellTemplate={cellTemplate}
        />
      </PluginHost>
    ));
    const { getMessage } = cellTemplate.mock.calls[0][0];
    expect(getMessage('editCommand')).toBe('Edit');
  });
});
