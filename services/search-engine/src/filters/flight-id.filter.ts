import {Filters} from "../common/types";


export class FlightIdFilter {

  static addFilter(mainQuery: string, params: (number | string)[], filters: Filters): string {
    const { flight_id } = filters;
    if (flight_id !== undefined) {
      mainQuery += ' AND flight_id = ?';
      params.push(flight_id);
    }
    return mainQuery;
  }
}