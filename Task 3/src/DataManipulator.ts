import { ServerRespond } from './DataStreamer';

//updated this to match the schema so that the correct item is calculated and returned
export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}

export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]): Row {
    //calculating all the values necessary so we can send back the appropriate value
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;
    const ratio = priceABC / priceDEF;

    //updated this value to .1 from .05 to ensure that only show a "safer set" of diverges from
    //historical set to ensure that the best trading decisions occur
    const tolerence = .1;
    const upperBound = 1 + tolerence;
    const lowerBound = 1 - tolerence;

    //returning the correct list of items, all of which we just calculated
    return {
          price_abc: priceABC,
          price_def: priceDEF,
          ratio,
          timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ?
            serverRespond[0].timestamp : serverRespond[1].timestamp,
          upper_bound: upperBound,
          lower_bound: lowerBound,
          trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
        };
  }
}