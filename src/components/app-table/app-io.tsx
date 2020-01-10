export interface Socket {
    emit: () => void,
    on: () => void
}

export class SocketIoService {
    private static instance: SocketIoService;

    static getInstance(path: string = "/assets/lib/socket.io.js"): SocketIoService {
        SocketIoService.instance = SocketIoService.instance || new SocketIoService(path);
        return SocketIoService.instance;
    }

    _socket: any;
    _io: any;  
    path: string;
    lib: boolean = false;

    constructor(path: string) {
        if (SocketIoService.instance) {
            throw new Error("Error - use SocketIoService.getInstance()");
        }
        this.path = path;
        this.attachLibrary();
    }

    /**
     * attach lib to the head of the page
     */
    attachLibrary(): void {
        if (!this.lib) {
            const scriptTag = document.createElement('script');
            scriptTag.src = this.path;
            document.querySelector('head').appendChild(scriptTag);
            this.ensureIoPresent().then(function () {
                this._io = window['io'];
                this._socket = this._io('http://localhost:3000');
                this.lib = true;
            }.bind(this));
        }
    }

    /**
     * wait for io object presence on window
     */
    ensureIoPresent() {
        const waitForIo = (resolve: any) => {
            if (window['io'] !== undefined) {
                return resolve();
            }
            setTimeout(waitForIo, 30, resolve);
        }
        return new Promise(function (resolve: any) {
            waitForIo(resolve);
        }.bind(this));
    }

    /**
     * wait for socket
     */
    ensureSocketPresent() {
        const waitForSocket = (resolve: any) => {
            if (this._socket !== undefined) {
                return resolve();
            }
            setTimeout(waitForSocket, 30, resolve);
        }
        return new Promise(function (resolve: any) {
            waitForSocket(resolve);
        }.bind(this));
    }

    public onSocketReady(callback: () => any) {
        return this.ensureIoPresent().then(function () {
            callback();
        }.bind(this));
    }

    /**
     * register socket callback
     * @param identifier 
     * @param callback 
     */
    public onSocket(identifier: string, callback: any) {
        this.ensureSocketPresent().then(function () {            
            this._socket.on(identifier, callback);
        }.bind(this));
    }

    /**
     * emit on socket
     * @param identifier
     * @param callback 
     */
    public emitSocket(identifier: string, payload: string) {
        console.log(identifier, payload);
        this.ensureSocketPresent().then(function () {
            this._socket.emit(identifier, payload);
        }.bind(this));
    }

    /**
     * get socket
     */
    public socket() {
        return this._socket;
    }
}
