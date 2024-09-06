import {Filters} from "../common/types";


export class OriginFilter {

  static addFilter(mainQuery: string, params: (number | string)[], filters: Filters): string {
    const { origin } = filters;
    if (origin !== undefined) {
      mainQuery += ' AND origin = ?';
      params.push(origin);
    }
    return mainQuery;
  }
}