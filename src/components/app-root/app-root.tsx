import { Component, State } from '@stencil/core';
import { SocketIoService } from './app-io';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: true
})
export class AppRoot {
  
  /**
   * socket io instance 
   */
  _socketService: SocketIoService = SocketIoService.getInstance();

  @State() list: any[];
  @State() type: string;
  @State() id: string;

  
  
  constructor() {
    this._socketService;
    this.list = [];
    this.type = "Light";
    this.id = "";
  }

  componentWillLoad() {
    fetch('http://localhost:3000/subscription?entity=' + this.type + '&id=' + this.id)
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
            {this.list.map((todo) =>
              <li class="list-group-item active">
              <div class="md-v-line"></div><i class="fas fa-laptop mr-4 pr-3"></i>
                {todo.name} - ( 
                {todo.values.map((todoVale) =>
                <span>{todoVale.name}: {todoVale.value}, </span>
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
