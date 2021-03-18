import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { DataService } from './data.service';
import { Chart } from 'chart.js';
import { NumberSymbol } from '@angular/common';

export class dataGroup {
  xHour: Array<number>;
  yHour: Array<number>;
  xMin: Array<number>;
  yMin: Array<number>;
  xDay: Array<number>;
  yDay: Array<number>;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'bitcoin-app';
  cryptos: any;
  nowCoin: any;
  startTime: number;
  show: boolean = false;
  public style: string = 'normal';
  divSelector: Array<boolean> = [true, false, false];

  
  xHour = [];
  yHour = [];
  xMin = [];
  yMin = [];
  xDay = [];
  yDay = [];

  a: number;
  b: number;
  c: number;
  

  xVars = [0,0,0];
  yVars = [0,0,0];
  x: number;
  y: number;
  rat: any;

  timePre: number;
  pricePre: number;
  
 
  

  
  constructor(private _data: DataService) {}


  ngOnInit() {
    this._data.getBTC()
    .subscribe(res => {
      this.nowCoin = res;
      this.rat = this.nowCoin.USD;
    })

    
    this._data.getHourPrices()
      .subscribe(res => {
        this.cryptos = res;
        console.log(this.cryptos);
        this.startTime = this.cryptos.Data.Data[0].time;
        for (var i = 0; i < this.cryptos.Data.Data.length; i++){
            this.xHour.push(this.convertTime(this.cryptos.Data.Data[i].time, 2));
            this.yHour.push(this.cryptos.Data.Data[i].open);
        } 
      })
      this._data.getMinutePrices()
      .subscribe(res => {
        this.cryptos = res;
        console.log(this.cryptos);
        this.startTime = this.cryptos.Data.Data[0].time;
        for (var i = 0; i < this.cryptos.Data.Data.length; i++){
            this.xMin.push(this.convertTime(this.cryptos.Data.Data[i].time, 3));
            this.yMin.push(this.cryptos.Data.Data[i].open);
        } 
      })
      this._data.getDayPrices()
      .subscribe(res => {
        this.cryptos = res;
        console.log(this.cryptos);
        this.startTime = this.cryptos.Data.Data[0].time;
        for (var i = 0; i < this.cryptos.Data.Data.length; i++){
            this.xDay.push(this.convertTime(this.cryptos.Data.Data[i].time, 1));
            this.yDay.push(this.cryptos.Data.Data[i].open);
        } 
      })

    }

     //period: 1 = day, 2 = hour, 3 = min
  convertTime(time, period) { 
    time = time - this.startTime;
    if(period == 1 ){
      time = time/86400;
    } 
    else if(period == 2){
      time = time/3600;
    }
    else{
      time = time/60;
    }
    return time;
  }

  onClick(sel){
    this.divSelector = [false, false, false];
    this.divSelector[sel] = true;
    this.dataReset();
  }

  dataReset(){
    this.xVars = [];
    this.yVars = [];
  }

  public onSeriesClick(e){
    this.x = e.category;
    this.y = e.value;
    if(this.xVars.length == 3){
      this.dataReset();
    }
    this.xVars.push(e.category);
    this.yVars.push(e.value);
    
    console.log(this.xVars, this.yVars);
  }

  //--------------------------------------------------- MATH BELOW--------------------------------------------------

  pricePredict(){
    //defs
    
    //starting x
    let x1 = this.xVars[0];
    let x2 = this.xVars[1];
    let x3 = this.xVars[2];

    // //starting y
    let y1 = this.yVars[0];
    let y2 = this.yVars[1];
    let y3 = this.yVars[2];


    //determinants
    let d = 0;
    let da = 0;
    let db = 0;
    let dc = 0;

    //matrix
    let mata = [
      y1 , x1 , 1,
      y2 , x2 , 1,
      y3 , x3 , 1
    ];
    let matb = [
      x1*x1 , y1 , 1,
      x2*x2 , y2 , 1,
      x3*x3 , y3 , 1,
    ];
    let matc = [
      x1*x1 , x1, y1,
      x2*x2 , x2, y2,
      x3*x3 , x3, y3
    ];
    let mato = [
      x1*x1 , x1 , 1,
      x2*x2 , x2 , 1,
      x3*x3 , x3 , 1
    ];

    //new d
    d = this.calcDeterminant(mato);
    da = this.calcDeterminant(mata)/d;
    db = this.calcDeterminant(matb)/d;
    dc = this.calcDeterminant(matc)/d;

    console.log(da,db,dc);

    this.timePre = -1 * db/(2*da);
    this.pricePre = (da*this.timePre*this.timePre) + (db*this.timePre) + dc;

    this.a = da;
    this.b = db;
    this.c = dc;



  }

  calcDeterminant(arr){
    let num = 0;
    num = (arr[0] * arr[4] * arr[8]) + (arr[1] * arr[5] * arr[6]) + (arr[2] * arr[3] * arr[7]);
    num = num - ((arr[2] * arr[4] * arr[6]) + (arr[0] * arr[5] * arr[7]) + (arr[1] * arr[3] * arr[8]));
    return num;
  }

}






// //    this.context = (<HTMLCanvasElement>this.myCanvas.nativeElement).getContext('2d');
// this.chart = new Chart(this.myCanvas.nativeElement.getContext('2d'), {
//   type: 'line',
//   data: {
//     labels: xVars,
//     datasets: [
//       {
//         data: yVars,
//         borderColor: '#3cba9F',
//         fill: false
//       },
//     ]
//   },
//   options: {
//     legend: {
//       display: false
//     },
//     scales: {
//       xAxes: [{
//         display: true
//       }],
//       yAxes: [{
//         display: true
//       }]
//     }
//   }
// })