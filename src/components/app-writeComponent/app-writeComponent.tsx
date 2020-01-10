import { Component, State, Prop, Listen } from '@stencil/core';


@Component({
  tag: 'app-writeComponent',
  styleUrl: 'app-writeComponent.css',
  shadow: true
})
export class AppWriteComponent {

  @State() type: string;
  @State() entitylist: string[];
  @State() htmlRender: string;
  @State() selectedType: string;
  @Prop() page_url: string;
  @Prop() service_url: string;

  constructor() {
    this.htmlRender = this.page_url
    this.entitylist = [];
  }

  handleSubmit(e) {
    e.preventDefault()
    var test = this.page_url.split('type="');
    var test2 = test[1].substring(test[1].indexOf('"') + 1, test[1].length);
    this.htmlRender = test[0] + 'type="' + this.type + '"' + test2;
    // send data to our backend
  }

  handleChange(event) {
    this.type = event.target.value;
  }

  componentWillLoad() {
    this.htmlRender = this.page_url

    fetch('http://'+ this.service_url +':3000/entityList')
    .then((response: Response) => response.json())
    .then(response => {
      this.entitylist = response;
    });
  }

  @Listen('entitySelected')
  entitySelected(event: CustomEvent) {
    this.selectedType = event.detail;
    var test = this.page_url.split('type="');
    var test2 = test[1].substring(test[1].indexOf('"') + 1, test[1].length);
    this.htmlRender = test[0] + 'type="' + this.selectedType + '"' + test2;
  }

  render() {

    return (
        <div>
            <app-comboBox combodata={this.entitylist}></app-comboBox>


             <form onSubmit={(e) => this.handleSubmit(e)}>
                <label>
                Name:
                <input type="text" value={this.type} onInput={(event) => this.handleChange(event)} />
                </label>
                <input type="submit" value="Submit" />
            </form>
            <h1 innerHTML={this.htmlRender} />
        </div>
    );
  }
}
