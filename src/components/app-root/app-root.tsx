import { Component, State, Prop } from '@stencil/core';
import { SocketIoService } from './app-io';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: true
})
export class AppRoot {
  
  @State() list: any[];
  @Prop() type: string;
  @Prop() id: string;
  @Prop() service_url: string;

  /**
   * socket io instance 
   */
  _socketService: SocketIoService = SocketIoService.getInstance(this.service_url);
  
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
      <div>
        <header>
          <h1>Stencil App Starter</h1>
        </header>

        <main>
          <ul class="list-group">
            {this.list.map((entity) =>
              <li class="list-group-item active">
              <div class="md-v-line"></div><i class="fas fa-laptop mr-4 pr-3"></i>
                {entity.name} - ( 
                {entity.values.map((entityValue) =>
                <span>{entityValue.name}: {entityValue.value}, </span>
                )}
                )
              </li>
            )}
          </ul>
        </main>

      </div>
    );
  }
}
