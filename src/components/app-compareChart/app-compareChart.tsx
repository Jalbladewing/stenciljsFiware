import { Component, State, Prop } from '@stencil/core';
import { SocketIoService } from './app-io';
import 'stencil-apexcharts';

@Component({
  tag: 'app-compareChart',
  styleUrl: 'app-compareChart.css',
  shadow: true
})
export class AppCompareChart {
  
  /**
   * socket io instance 
   */
  _socketService: SocketIoService = SocketIoService.getInstance();

  @State() list: any[];
  @State() roomData: any;
  @State() maxData: any;
  @Prop() type: string;
  @Prop() entityid: string;
  @Prop() service_url: string;
  @Prop() entity_to_compare: string;
  @Prop() data_to_compare: string;

  constructor() {
    this._socketService;
    this.list = [];
    this.roomData = 0;
    this.maxData = 0;
  }

  componentWillLoad() {
    fetch('http://'+ this.service_url +':3000/subscription?entity=' + this.type + '&id=' + this.entityid)
      .then((response: Response) => response.json())
      .then(response => {
        this.list = JSON.parse(JSON.stringify(response)).entities
        this.updateGraphValues();
      });
  }

  /**
   * inital socket usage
   */
  componentDidLoad() {    
    this._socketService.onSocketReady(() => {
      this._socketService.onSocket(this.type + "-" + this.entityid, (msg: string) => {
        this.list = JSON.parse(JSON.stringify(msg)).entities
        this.updateGraphValues();
      });
    });
  }

  updateGraphValues()
  {
    this.maxData = 0;
    this.list.map((entity) =>
    {
            entity.values.map((entityValue) =>{
                if(entityValue.name == this.data_to_compare)
                { 
                    if(entity.name == this.entity_to_compare) this.roomData = entityValue.value;
                    if(this.maxData < entityValue.value) this.maxData = entityValue.value;
                }
            });  
    }
    );
  }

  valueToPercent (value) {
    return (value * 100) / this.maxData
  }

  render() {

    return (
        <div>
          <apex-chart
            type="radialBar"
            width="600px"
            options={{
                plotOptions: {
                    radialBar: {
                      startAngle: -135,
                      endAngle: 225,
                       hollow: {
                        margin: 0,
                        size: '70%',
                        background: '#fff',
                        image: undefined,
                        imageOffsetX: 0,
                        imageOffsetY: 0,
                        position: 'front',
                        dropShadow: {
                          enabled: true,
                          top: 3,
                          left: 0,
                          blur: 4,
                          opacity: 0.24
                        }
                      },
                      track: {
                        background: '#fff',
                        strokeWidth: '67%',
                        margin: 0, // margin is in pixels
                        dropShadow: {
                          enabled: true,
                          top: -3,
                          left: 0,
                          blur: 4,
                          opacity: 0.35
                        }
                      },
            
                      dataLabels: {
                        showOn: 'always',
                        name: {
                          offsetY: -10,
                          show: true,
                          color: '#888',
                          fontSize: '17px'
                        },
                        value: {
                          formatter: function(val) {
                            return parseInt(val);
                          },
                          color: '#111',
                          fontSize: '36px',
                          show: true,
                        }
                      }
                    }
                  },
                series: [this.valueToPercent(this.roomData)],
                labels: ['Percent of ' + this.data_to_compare],
                stroke: {
                    lineCap: 'round'
                  },
                fill: {
                    type: 'gradient',
                    gradient: {
                      shade: 'dark',
                      type: 'horizontal',
                      shadeIntensity: 0.5,
                      gradientToColors: ['#ABE5A1'],
                      inverseColors: true,
                      opacityFrom: 1,
                      opacityTo: 1,
                      stops: [0, 100]
                    }
                  },
                  
            }} />
        </div>
      );
  }
}
