import { Component, State, Prop, Listen } from '@stencil/core';
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
  @State() attributeList: string[];
  @State() attributeSelected: string;
  @State() auxAttributeSelected: string;
  @State() roomData: any;
  @State() maxData: any;
  @Prop() type: string;
  @Prop() entityid: string;
  @Prop() filter: string;
  @Prop() service_url: string;
  @Prop() entity_to_compare: string;

  private modalDialog?: HTMLDivElement;

  constructor() {
    this._socketService;
    this.list = [];
    this.attributeList = [];
    this.attributeSelected = "";
    this.auxAttributeSelected = "";
    this.filter = "";
    this.roomData = 0;
    this.maxData = 0;
    this.modalButtonClick = this.modalButtonClick.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.submitNewAttribute = this.submitNewAttribute.bind(this);
  }

  componentWillLoad() {
    fetch('http://'+ this.service_url +':3000/subscription?entity=' + this.type + '&id=' + this.entityid + '&queryFilter=' + this.filter)
      .then((response: Response) => response.json())
      .then(response => {
        this.list = JSON.parse(JSON.stringify(response)).entities
        this.updateAttributeList();
        this.updateGraphValues();
      });
  }

  /**
   * inital socket usage
   */
  componentDidLoad() {    
    this._socketService.onSocketReady(() => {
      this._socketService.onSocket(this.type + "-" + this.entityid + "-" + this.filter, (msg: string) => {
        this.list = JSON.parse(JSON.stringify(msg)).entities
        this.updateGraphValues();
      });
    });
  }

  updateGraphValues()
  {
    this.maxData = 0.0;
    this.list.map((entity) =>
    {
            entity.values.map((entityValue) =>{
                if(entityValue.name == this.attributeSelected)
                { 
                    if(entity.name == this.entity_to_compare) this.roomData = entityValue.value;
                    if(parseFloat(this.maxData) < parseFloat(entityValue.value))
                    { console.log("PRev Max: " + this.maxData); console.log("PRev Value: " + entityValue.value); this.maxData = entityValue.value;}
                }
            });  
    }
    );
  }

  updateAttributeList()
  {
    if(this.list.length > 0)
    {
      this.attributeList = [];
      for(var i = 0; i < this.list.length; i++)
      {
        if(this.list[i].name == this.entity_to_compare)
        {
          for(var j = 0; j < this.list[i].values.length; j++)
          {
            if(j == 0) this.attributeSelected = this.list[i].values[j].name
            this.attributeList.push(this.list[i].values[j].name);
          }
          break;
        }
      }
    }
  }

  valueToPercent (value) {
    console.log("Value: " + value);
    console.log("Max: " + this.maxData);
    return (value * 100) / this.maxData
  }

  modalButtonClick()
  {
      this.modalDialog.style.display = "block";
  }

  closeModal()
  {
    this.modalDialog.style.display = "none";
  }

  submitNewAttribute()
  {
    this.attributeSelected = this.auxAttributeSelected;
    this.closeModal();
    this.updateGraphValues();
  }

  @Listen('entitySelected')
  entitySelected(event: CustomEvent) {
    switch(event.detail.split(":")[0])
    {
      case "attributeCombo":
        this.auxAttributeSelected = event.detail.split(":")[1];
        return;
    }
  }

  render() {

    return (
        <div class="wrapContent">

          <div id="myModal" class="modal" ref={el => this.modalDialog = el as HTMLDivElement}>
            <div class="modal-content">
              <div class="modal-header">
                <span class="close" onClick={this.closeModal}>&times;</span>
                <h2>Radial Chart Attribute Selection</h2>
              </div>
              <div class="modal-body">
                <app-comboBox combodata={this.attributeList} comboid="attributeCombo"></app-comboBox>
                <input class='button -blue center' type="submit" value="Submit" onClick={this.submitNewAttribute}/>
              </div>
            </div>
          </div>

          <button class='button -blue center editBtn' onClick={this.modalButtonClick}>Edit</button>
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
                labels: ['Percent of ' + this.attributeSelected],
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
