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
  @State() listo: any[];
  @State() lista: any[];
  @Prop() type: string;
  @Prop() id: string;
  @Prop() service_url: string;

  constructor() {
    this._socketService;
    this.list = [];
    this.listo = [];
    this.lista = [];
  }

  componentWillLoad() {
    fetch('http://'+ this.service_url +':3000/subscription?entity=' + this.type + '&id=' + this.id)
      .then((response: Response) => response.json())
      .then(response => {
        this.list = JSON.parse(JSON.stringify(response)).entities
        this.list[0].values.map((entityValue) =>{
            console.log(entityValue.name)
            console.log(entityValue.value)
         if(entityValue.name == "temperature")
         { 
             this.listo.push(parseInt(entityValue.value))
             console.log(this.listo)
             this.lista.push(new Date())
         }
        })
        
      });
  }

  /**
   * inital socket usage
   */
  componentDidLoad() {    
    this._socketService.onSocketReady(() => {
      this._socketService.onSocket(this.type + "-" + this.id, (msg: string) => {
        this.list = JSON.parse(JSON.stringify(msg)).entities
        this.list[0].values.map((entityValue) =>{
            if(entityValue.name == "temperature")
            { 
                this.listo.push(entityValue.value)
                this.lista.push(new Date())
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
            width="600px"
            series={[{
                name: 'sales',
                data: this.listo
            }]}
            options={{
                xaxis: {
                    categories: this.lista,
                    //type: "datetime",
                    //range: 777600000
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
