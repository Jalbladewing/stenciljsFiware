import { Component, State, Prop } from '@stencil/core';
import { SocketIoService } from './app-io';
import 'stencil-apexcharts';

@Component({
  tag: 'app-realChart',
  styleUrl: 'app-realChart.css',
  shadow: true
})
export class AppRealChart {
  
  /**
   * socket io instance 
   */
  _socketService: SocketIoService = SocketIoService.getInstance();

  @State() list: any[];
  @State() valueList: any[];
  @State() dateList: any[];
  @Prop() type: string;
  @Prop() entityid: string;
  @Prop() service_url: string;
  @Prop() data_to_compare: string;

  constructor() {
    this._socketService;
    this.list = [];
    this.valueList = [];
    this.dateList = [];
  }

  componentWillLoad() {
    fetch('http://'+ this.service_url +':3000/subscription?entity=' + this.type + '&id=' + this.entityid)
      .then((response: Response) => response.json())
      .then(response => {
        this.list = JSON.parse(JSON.stringify(response)).entities
        this.list[0].values.map((entityValue) =>{
            console.log(entityValue.name)
            console.log(entityValue.value)
         if(entityValue.name == this.data_to_compare)
         { 
             this.valueList.push(parseInt(entityValue.value))
             console.log(this.valueList)
             this.dateList.push(new Date().getTime())
         }
        })
        
      });
  }

  /**
   * inital socket usage
   */
  componentDidLoad() {    
    this._socketService.onSocketReady(() => {
      this._socketService.onSocket(this.type + "-" + this.entityid, (msg: string) => {
        this.list = JSON.parse(JSON.stringify(msg)).entities
        this.list[0].values.map((entityValue) =>{
            if(entityValue.name == this.data_to_compare)
            { 
                this.valueList.push(entityValue.value)
                this.dateList.push(new Date().getTime())
            }
           })
      });
    });
  }

  render() {

    return (
        <div>
          <apex-chart
            type="line"
            width="100%"
            height="300px"
            series={[{
                name: this.data_to_compare,
                data: this.valueList
            }]}
            options={{
                xaxis: {
                    categories: this.dateList,
                    type: "datetime",
                    range: 3000,
                    labels: {
                      datetimeFormatter: {
                        year: 'yyyy',
                        month: 'MMM \'yy',
                        day: 'dd MMM',
                        hour: 'HH:mm'
                      }
                    }
                },
                chart: {
                    animations: {
                      enabled: true,
                      easing: 'linear',
                      dynamicAnimation: {
                        enabled: true,
                        speed: 500
                      },
                    zoom: {
                        enabled: false
                      }
                    },
                    toolbar: {
                      show: false
                    }
                },
                stroke: {
                    curve: 'smooth'
                  }
            }} />
        </div>
      );
  }
}
