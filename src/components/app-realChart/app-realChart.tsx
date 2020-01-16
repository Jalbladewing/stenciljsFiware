import { Component, State, Prop, Listen } from '@stencil/core';
import { SocketIoService } from './app-io';
import 'apexcharts';
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
  @State() attributeList: string[];
  @State() attributeSelected: string;
  @State() auxAttributeSelected: string;
  @State() valueList: any[];
  @State() dateList: any[];
  @Prop() type: string;
  @Prop() entityid: string;
  @Prop() filter: string;
  @Prop() service_url: string;

  private modalDialog?: HTMLDivElement;

  constructor() {
    this._socketService;
    this.list = [];
    this.attributeList = [];
    this.attributeSelected = "";
    this.auxAttributeSelected = "";
    this.filter = "";
    this.valueList = [];
    this.dateList = [];
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
        this.list = JSON.parse(JSON.stringify(msg)).entities;
        this.updateGraphValues();
      });
    });
  }

  updateGraphValues()
  {
    if(this.list.length > 0)
    {
      this.list[0].values.map((entityValue) =>{
        if(entityValue.name == this.attributeSelected)
        { 
            this.valueList.push(entityValue.value)
            this.dateList.push(new Date().getTime())
        }
      })
    }
  }

  updateAttributeList()
  {
    if(this.list.length > 0)
    {
      this.attributeList = [];
      for(var i = 0; i < this.list[0].values.length; i++)
      {
        if(i == 0) this.attributeSelected = this.list[0].values[i].name
        this.attributeList.push(this.list[0].values[i].name);
      }
    }
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
    this.valueList = [];
    this.dateList = [];
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

  getAttributeName()
  {
    return this.attributeSelected.charAt(0).toUpperCase() + this.attributeSelected.substring(1, this.attributeSelected.length);
  }

  render() {

    return (
      <div class="wrapContent">

        <div id="myModal" class="modal" ref={el => this.modalDialog = el as HTMLDivElement}>
          <div class="modal-content">
            <div class="modal-header">
              <span class="close" onClick={this.closeModal}>&times;</span>
              <h2>Linear Chart Attribute Selection</h2>
            </div>
            <div class="modal-body">
              <app-comboBox combodata={this.attributeList} comboid="attributeCombo"></app-comboBox>
              <input class='button -blue center' type="submit" value="Submit" onClick={this.submitNewAttribute}/>
            </div>
          </div>
        </div>

    <h1>{this.getAttributeName()}</h1>
        <button class='button -blue center editBtn' onClick={this.modalButtonClick}>Edit</button>
          <apex-chart
            type="line"
            width="100%"
            height="300px"
            series={[{
                name: this.attributeSelected,
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
