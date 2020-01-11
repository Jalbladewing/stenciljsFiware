import { Component, State, Prop, Listen } from '@stencil/core';


@Component({
  tag: 'app-writeComponent',
  styleUrl: 'app-writeComponent.css',
  shadow: true
})
export class AppWriteComponent {

  @State() filter: string;
  @State() typelist: string[];
  @State() htmlRender: string;
  @State() selectedType: string;
  @Prop() page_url: string;
  @Prop() service_url: string;

  constructor() {
    this.htmlRender = this.page_url
    this.typelist = [];
  }

  handleSubmit(e) {
    e.preventDefault()
    if(this.filter == undefined) this.filter = "";

    var renderType = this.page_url.split('type="');
    var afterType = renderType[1].substring(renderType[1].indexOf('"') + 1, renderType[1].length);
    this.htmlRender = renderType[0] + 'type="' + this.selectedType + '"' + afterType;

    var renderFilter = this.htmlRender.split('filter="');
    var afterFilter = renderFilter[1].substring(renderFilter[1].indexOf('"') + 1, renderFilter[1].length);
    this.htmlRender = renderFilter[0] + 'filter="' + this.filter + '"' + afterFilter;
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
      this.typelist = response;
    });
  }

  @Listen('entitySelected')
  entitySelected(event: CustomEvent) {
    this.selectedType = event.detail;

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
                                <app-comboBox combodata={this.typelist}></app-comboBox>
                              </th>
                            </tr>
                          </table>
                      </div>
                    </th>
                    <th>
                      <div>
                        <h2 class="inputLabel">Filter</h2>
                        <table>
                          <tr>
                            <th>
                            <input class="input" type="text" value={this.filter} placeholder="location==Almeria;temperature<25..." onInput={(event) => this.handleChange(event)} />
                            </th>
                            <th>
                            <input class='button -blue center' type="submit" value="Submit" />
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
