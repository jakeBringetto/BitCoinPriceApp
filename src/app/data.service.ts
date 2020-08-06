import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import  'rxjs/add/operator/map';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  result: any;

  constructor(private _http: HttpClient) { }

  getBTC(){
    return this._http.get("https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD")
    .map(result => this.result = result);
  }

  getHourPrices(){
    return this._http.get("https://min-api.cryptocompare.com/data/v2/histohour?fsym=BTC&tsym=USD&limit=2000")
    .map(result => this.result = result);
  }

  getMinutePrices() {
    return this._http.get('https://min-api.cryptocompare.com/data/v2/histominute?fsym=BTC&tsym=GBP&limit=2000')
    .map(result => this.result = result)
  }

  getDayPrices() {
    return this._http.get('https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=2000')
    .map(result => this.result = result)
  }
}
