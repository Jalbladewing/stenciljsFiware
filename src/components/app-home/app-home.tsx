import { Component, h } from '@stencil/core';
import io from 'socket.io-client';


@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css',
  shadow: true
})
export class AppHome {

  socket:any;

  constructor() 
  {    
      this.socket=io('http://localhost:3000/subscription');
  
      this.socket.on('payload', (msg) => {     // separate the salted message with "#" tag 
       console.log("Hola");
    });
  }

  render() {
    return (
      <div class='app-home'>
        <p>
          Welcome to the Stencil App Starter.
          You can use this starter to build entire apps all with
          web components using Stencil!
          Check out our docs on <a href='https://stenciljs.com'>stenciljs.com</a> to get started.
        </p>

        <stencil-route-link url='/profile/stencil'>
          <button>
            Profile page
          </button>
        </stencil-route-link>
      </div>
    );
  }
}
