import utf8ArrayToStr from "./utf8ArrayToString.js";

class SerialPort {
    constructor() {
        if (!('serial' in navigator)) {
            throw Error('browser does not support navigator.serial');
        }
        this._port = null;
        this.voltages = [];
        this.allowReadLoop = false;
    }

    get port() {
        if (this._port) return this._port;
        else throw new Error('You must run .setUpPort() by way of user interaction before using .port');
    }

    set port(newPort) {
        this._port = newPort;
    }

    async setUpPort(baudRate, options={}) {
        // this function must be called as the result of a user's interaction
        const filters = options.filters ? options.filters : {};
        this.baudRate = baudRate;
        try {
            const serialOptions = Object.keys(filters).length ? { filters: [filters] } : {};
            const allowedPorts = await navigator.serial.getPorts(serialOptions);
            if (options.alwaysAsk || !allowedPorts.length) {
                this.port = await navigator.serial.requestPort(serialOptions);
            } else {
                this.port = allowedPorts[0];
            }
        } catch (e) {
            console.error(e);
        }
        return this.port;
    }

    async activateReadLoop() {
        await this.port.open({ baudRate: this.baudRate });
        this.allowReadLoop = true;

        let prevPartial = '';
        
        while (this.port.readable && this.allowReadLoop) {
            const reader = this.port.readable.getReader();
            try {
                while (this.allowReadLoop) {
                    const { value, done } = await reader.read();
                    if (done) {
                        break;
                    }
                    const data = this.parseData(value, prevPartial)

                    data.data.forEach((data) => {
                        this.voltages[data.channelNumber] = data.voltage;
                    })

                    prevPartial = data.partial;
                }
            } catch (error) {
                console.error(error)
            } finally {
                reader.releaseLock();
            }
        }
        this.port.close();
    }

    endReadLoop() {
        this.allowReadLoop = false;
    }

    parseData(data, prevPartial) {
        if (data.length) {
            const string = utf8ArrayToStr(data);
            const splitString = string.split('\r\n').filter((value) => {
                return value !== '';
            });
            const lines = splitString.map((line) => {
                const lineNoTabs = line.replace('\t', ';');
                const formattedLine = lineNoTabs.trim();
                return formattedLine;
            })
            lines[0] = prevPartial + lines[0];

            const lastLine = lines[lines.length-1];
            const partial = lastLine.slice(-1) === 'V' ? '' : lines.pop();
            const processedData = { 
                data: [],
                partial: partial
            }

            lines.forEach((line) => {
                try {
                    const halves = line.split(';');
                    const channelStatement = halves[0].split(':')[0]
                    const channelNumber = parseInt(channelStatement.replace('CH', ''));
                    const voltage = parseFloat(halves[1].replace('V', ''));

                    processedData.data.push({
                        channelNumber: channelNumber,
                        voltage: voltage
                    })
                } catch (error) {
                    console.error(error)
                }
                
            })

            return processedData
        }
        
    }
}

export default SerialPort;