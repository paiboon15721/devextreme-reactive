/* eslint-disable no-alert */
import React from 'react';
import {
  Grid,
  Table,
  TableHeaderRow,
} from '@devexpress/dx-react-grid-material-ui';

import { TableRow, Paper } from 'material-ui';

import {
  generateRows,
  globalSalesValues,
} from '../../demo-data/generator';

export default class Demo extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      columns: [
        { name: 'region', title: 'Region' },
        { name: 'sector', title: 'Sector' },
        { name: 'channel', title: 'Channel' },
        { name: 'customer', title: 'Customer' },
        { name: 'product', title: 'Product' },
        { name: 'amount', title: 'Sale Amount' },
      ],
      rows: generateRows({ columnValues: globalSalesValues, length: 14 }),
    };

    this.tableRowTemplate = ({ children, row }) => (
      <TableRow
        onClick={() => alert(JSON.stringify(row))}
      >
        {children}
      </TableRow>
    );
  }
  render() {
    const { rows, columns } = this.state;

    return (
      <Paper>
        <Grid
          rows={rows}
          columns={columns}
        >
          <Table tableRowTemplate={this.tableRowTemplate} />
          <TableHeaderRow />
        </Grid>
      </Paper>
    );
  }
}
