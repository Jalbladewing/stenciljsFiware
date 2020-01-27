export interface Socket {
    emit: () => void,
    on: () => void
}

export class SocketIoService {
    private static instance: SocketIoService;

    static getInstance(url: string = "localhost", path: string = "dist/collection/assets/lib/socket.io.js"): SocketIoService {
        SocketIoService.instance = SocketIoService.instance || new SocketIoService(path, url);
        return SocketIoService.instance;
    }

    _socket: any;
    _io: any;  
    path: string;
    lib: boolean = false;

    constructor(path: string, url: string) {
        if (SocketIoService.instance) {
            throw new Error("Error - use SocketIoService.getInstance()");
        }
        this.path = path;
        this.attachLibrary(url);
    }

    /**
     * attach lib to the head of the page
     */
    attachLibrary(url: string): void {
        if (!this.lib) {
            const scriptTag = document.createElement('script');
            scriptTag.src = this.path;
            document.querySelector('head').appendChild(scriptTag);
            this.ensureIoPresent().then(function () {
                this._io = window['io'];
                this._socket = this._io('http://' + url + ':3000');
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
