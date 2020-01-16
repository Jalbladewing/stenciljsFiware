import { Component, Prop, Event, EventEmitter } from '@stencil/core';


@Component({
  tag: 'app-comboBox',
  styleUrl: 'app-comboBox.css',
  shadow: true
})
export class AppComboBox {

  @Prop() combodata: string[];
  @Prop() comboid: string;
  @Prop() componentWidth: string;
  @Prop({ mutable: true }) selectedData: string;

  private dropDownParent?: HTMLDivElement;
  private dropDown?: HTMLDivElement;
  private dropDownSearch?: HTMLInputElement;

  constructor() {
    this.dropDownClick = this.dropDownClick.bind(this);
    this.filterFunction = this.filterFunction.bind(this);
    this.selectedData = ""
  }

  componentDidLoad()
  {
    if(this.componentWidth)
    {
      this.dropDownParent.setAttribute('style', 'width:'+ this.componentWidth + 'px !important');
      this.dropDownSearch.setAttribute('style', 'width:'+ this.componentWidth + 'px !important');
    } 
  }

  dropDownClick()
  {
      this.dropDown.classList.toggle("show");
  }

  filterFunction() {
    var filter = this.dropDownSearch.value.toUpperCase();
   var a = this.dropDown.getElementsByTagName("a");
    for (var i = 0; i < a.length; i++) {
      var txtValue = a[i].textContent || a[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
      } else {
        a[i].style.display = "none";
      }
    }
  }

  clickElement(event)
  {
    this.selectedData = event.target.innerText;
    this.entitySelected.emit(this.comboid + ":" + this.selectedData);
  }

  @Event({
    eventName: 'entitySelected',
    composed: true,
    cancelable: true,
    bubbles: true,
  }) entitySelected: EventEmitter;

  render() {

    return (
        <div>
            <div class="dropdown" ref={el => this.dropDownParent = el as HTMLDivElement}>
              <div>
                <input ref={el => this.dropDownSearch = el as HTMLInputElement} onFocus={this.dropDownClick} onBlur={this.dropDownClick} type="text" placeholder="Search.." id="myInput" onKeyUp={this.filterFunction} value={this.selectedData}></input>
                <span class="input-icon">&#11167;</span>
                </div>
                <div ref={el => this.dropDown = el as HTMLDivElement} id="myDropdown" class="dropdown-content">
                    {this.combodata.length > 0 ? this.combodata.map((elementName) =>
                                <a onMouseDown={(event) => this.clickElement(event)}>{elementName}</a>
                            ):<a class="no-display"></a>}
                </div>
            </div>
        </div>
    );
  }
}
