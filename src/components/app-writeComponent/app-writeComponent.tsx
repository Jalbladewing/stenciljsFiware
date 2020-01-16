import { Component, State, Prop, Listen } from '@stencil/core';


@Component({
  tag: 'app-writeComponent',
  styleUrl: 'app-writeComponent.css',
  shadow: true
})
export class AppWriteComponent {

  @State() filter: string;
  @State() typelist: string[];
  @State() selectedType: string;
  @State() attributeList: string[];
  @State() attributeSelected: string;
  @State() attributeHasSelected: string;
  @State() operationList: string[];
  @State() operationSelected: string;
  @State() htmlRender: string;
  @Prop() page_url: string;
  @Prop() service_url: string;

  constructor() {
    this.htmlRender = this.page_url
    this.typelist = [];
    this.attributeList = [];
    this.operationList = ["==", "!=", "<", ">", "<=", ">="];
    this.attributeHasSelected = "";
    this.attributeSelected = "";
    this.operationSelected = "";
  }

  handleSubmit(e) {
    e.preventDefault()
    var selected =  this.selectedType;
    if(this.selectedType == "All")selected = "";
    if(this.filter == undefined) this.filter = "";
    var fullFilter = this.attributeHasSelected + ";" + this.attributeSelected + this.operationSelected + this.filter;

    if(fullFilter == ";") fullFilter = "";

    var renderType = this.page_url.split('type="');
    var afterType = renderType[1].substring(renderType[1].indexOf('"') + 1, renderType[1].length);
    this.htmlRender = renderType[0] + 'type="' + selected + '"' + afterType;

    var renderFilter = this.htmlRender.split('filter="');
    var afterFilter = renderFilter[1].substring(renderFilter[1].indexOf('"') + 1, renderFilter[1].length);
    this.htmlRender = renderFilter[0] + 'filter="' + fullFilter + '"' + afterFilter;
    // send data to our backend
  }

  handleChange(event) {
    this.filter = event.target.value;
  }

  componentWillLoad() {
    this.htmlRender = this.page_url

    fetch('http://'+ this.service_url +':3000/typeList')
    .then((response: Response) => response.json())
    .then(response => {
      this.typelist = [];
      this.typelist.push("All");
      response.forEach(element => {
        this.typelist.push(element);
      });
      if(this.typelist.length > 0)
      {
        this.selectedType = this.typelist[0];
        var selected =  this.selectedType;
        if(this.selectedType == "All") selected = "";

        var renderType = this.page_url.split('type="');
        var afterType = renderType[1].substring(renderType[1].indexOf('"') + 1, renderType[1].length);
        this.htmlRender = renderType[0] + 'type="' + selected + '"' + afterType;
        this.updateAttributeList();
      } 
      
    });
  }

  updateAttributeList()
  {
    var selected =  this.selectedType;
    if(this.selectedType == "All") selected = "";
    fetch('http://'+ this.service_url +':3000/attributeList?type=' + selected)
    .then((response: Response) => response.json())
    .then(response => {
      this.attributeList = response;
    });
  }

  clearFields()
  {
    this.attributeHasSelected = "";
    this.attributeSelected = "";
    this.operationSelected = "";
    this.filter = "";
  }

  @Listen('entitySelected')
  entitySelected(event: CustomEvent) {
    switch(event.detail.split(":")[0])
    {
      case "typeCombo":
        this.selectedType = event.detail.split(":")[1];
        this.updateAttributeList();
        this.clearFields();
        return;
      case "attributeHasCombo":
        this.attributeHasSelected = event.detail.split(":")[1];
        return;
      case "attributeCombo":
        this.attributeSelected = event.detail.split(":")[1];
        return;
      case "operationCombo":
        this.operationSelected = event.detail.split(":")[1];
        return;
    }
  }


  render() {

    return (
        <div>
             <form class="filterHeader" onSubmit={(e) => this.handleSubmit(e)}>
               <table>
                 <tr>
                    <th>
                      <div>
                        <h2 class="inputLabel">Entity Types</h2>
                          <table>
                            <tr>
                              <th>
                                <app-comboBox combodata={this.typelist} comboid="typeCombo" selectedData={this.selectedType}></app-comboBox>
                              </th>
                            </tr>
                          </table>
                      </div>
                    </th>
                    {this.selectedType=="All"?<th>
                      <div>
                        <h2 class="inputLabel">Has Attribute</h2>
                          <table>
                            <tr>
                              <th>
                                  <app-comboBox combodata={this.attributeList} comboid="attributeHasCombo" componentWidth="200" selectedData={this.attributeHasSelected}></app-comboBox>
                              </th>
                            </tr>
                          </table>
                      </div>
                    </th>:<th></th>}
                    <th>
                      <div>
                        <h2 class="inputLabel">Filter</h2>
                        <table>
                          <tr>
                            <th>
                                <app-comboBox combodata={this.attributeList} comboid="attributeCombo" componentWidth="200" selectedData={this.attributeSelected}></app-comboBox>
                            </th>
                            <th>
                                <app-comboBox combodata={this.operationList} comboid="operationCombo" componentWidth="70" selectedData={this.operationSelected}></app-comboBox>
                            </th>
                            <th>
                                <input class="input" type="text" value={this.filter} onInput={(event) => this.handleChange(event)} />
                            </th>
                            <th>
                            <input class='button -blue center' type="submit" value="Submit" />
                            </th>
                            <th>
                              <input class='button -orange center' type="button" value="Clear" onClick={this.clearFields.bind(this)}/>
                            </th>
                          </tr>
                        </table>
                      </div>
                    </th>
                 </tr>
               </table>
                
                

                
            </form>
            <h1 innerHTML={this.htmlRender} />
        </div>
    );
  }
}
