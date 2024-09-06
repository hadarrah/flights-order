import {Filters} from "../common/types";


export class DestinationFilter {

  static addFilter(mainQuery: string, params: (number | string)[], filters: Filters): string {
    const { destination } = filters;
    if (destination !== undefined) {
      mainQuery += ' AND destination = ?';
      params.push(destination);
    }
    return mainQuery;
  }
}