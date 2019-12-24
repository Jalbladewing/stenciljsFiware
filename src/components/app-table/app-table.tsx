import { Component, State, Prop } from '@stencil/core';
import { SocketIoService } from './app-io';
import 'stencil-apexcharts';

@Component({
  tag: 'app-table',
  styleUrl: 'app-table.css',
  shadow: true
})
export class AppTable {
  
  /**
   * socket io instance 
   */
  _socketService: SocketIoService = SocketIoService.getInstance();

  @State() list: any[];
  @Prop() type: string;
  @Prop() id: string;
  @Prop() service_url: string;

  constructor() {
    this._socketService;
    this.list = [];
  }

  componentWillLoad() {
    fetch('http://'+ this.service_url +':3000/subscription?entity=' + this.type + '&id=' + this.id)
      .then((response: Response) => response.json())
      .then(response => {
        this.list = JSON.parse(JSON.stringify(response)).entities
      });
  }

  /**
   * inital socket usage
   */
  componentDidLoad() {    
    this._socketService.onSocketReady(() => {
      this._socketService.onSocket(this.type + "-" + this.id, (msg: string) => {
        this.list = JSON.parse(JSON.stringify(msg)).entities
      });
    });
  }

  render() {

    return (
        <div class="container body">
            <div class="table-wrapper">
                <div class="table-title">
                    <div class="row">
                        <div class="col-sm-6">
                            <h2><b>{this.type}</b> Devices</h2>
                        </div>
                    </div>
                </div>
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>
                                <span class="custom-checkbox">
                                    <input type="checkbox" id="selectAll"/>
                                    <label htmlFor="selectAll"></label>
                                </span>
                            </th>
                            <th>
                                Name
                            </th>
                            {this.list.length > 0 ? this.list[0].values.map((entityValue) =>
                                <th>{entityValue.name}</th>
                            ):<th>No items found</th>}
                                    
                        </tr>
                    </thead>
                    <tbody>
                        {this.list.map((entity) =>
                            <tr>
                                <td>
                                    <span class="custom-checkbox">
                                        <input type="checkbox" id="checkbox2" name="options[]" value="1"/>
                                        <label htmlFor="checkbox2"></label>
                                    </span>
                                </td>
                                <td>{entity.name}</td>
                                {entity.values.map((entityValue) =>
                                    <td>{entityValue.value}</td>
                                )}
                            </tr>
                        )}				
                    </tbody>
                </table>
                <div class="clearfix">
                    <div class="hint-text">Showing <b>{this.list.length}</b> out of <b>{this.list.length}</b> entries</div>
                    <ul class="pagination">
                        <li class="page-item disabled"><a href="#">Previous</a></li>
                        <li class="page-item active"><a href="#" class="page-link">1</a></li>
                        <li class="page-item"><a href="#" class="page-link">Next</a></li>
                    </ul>
                </div>
            </div>
    </div>
    );
  }
}
