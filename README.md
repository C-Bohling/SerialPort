# JS Serial Reader for NOYITO USB Data Acquisition Module

This library is intended for use with the NOYITO USB 10-Channel 12-bit AD Data Acquisition Module. I built it because I had one of these units and could not find very much information on how I would use it in a js web app. I wanted to be able to reuse my code for reading voltages from this device, so I wrote it as a separate project.

## How to Use

- **Import library**  
  *Example:* 

      import SerialPort from './SerialPort.js';  

- **Create an instance of the `SerialPort` class.**  
  *Example:* 
  
      const port = SerialPort() 

- **Run the `setUpPort()` method on your SerialPort instance by way of user interaction.**  
  This asynchronous method is the one that actually asks the user to allow the use of the serial port and gets the serial port. It must be called by way of user interaction, like a click.  

  *Syntax:* 
  
      setUpPort(baudRate, options={})

  There are two accepted properties for the `options` argument:
  - **`alwaysAsk`** -  If the `alwaysAsk` property is set to `true`, the function will ask the user to select the usb device, no matter if the user has already allowed a device. If it is left `false` and the user has already allowed the website to use a port, it will automatically pick the first device in the list of devices the user has allowed. Defaults to false.
  - **`filters`** - The `filters` property helps the user select the correct usb device to allow the site to use by limiting the number of devices the user can pick from. It should be an object containing one or both of the elements `usbVendorId` and `usbProductId`.  
    
  <br>*Note:*  
  For the NOYITO USB module listed in the description, the `baudRate` should be set to `115200` and the module has a `usbVendorId` of `0x1A86`.
  
  *Example:* 
  
      port.setUpPort(115200, { alwaysAsk: true, filters: { usbVendorId: 0x1A86 } })

- **Run the `activateReadLoop()` method on your SerialPort instance.**  
  This asynchronous method starts a loop that updates the `voltages` property.

- **Get the current voltages by accessing the `voltages` property.**  
  The `voltages` property is a list of the voltages coming from the usb device. The index represents the channel number, so to access the voltage of channel 6 you would access the value of `voltages` at index 6.  
  
  *Example:* 

      const channelSixVoltage = port.voltages[6]

- **To stop the read loop, simply run the `endReadLoop()` method on your SerialPort instance.**

## Browser Support:
This library requires Web Serial API support. Information on current browser support of this web API can be found [here](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility). 

## Notes:

- The NOYITO USB 10-channel 12-bit AD Data Acquisition Module can be [purchased on amazon](https://www.amazon.com/NOYITO-10-Channel-12-Bit-Acquisition-Communication/dp/B075GHTCTS) for $14.  
- Schematics and other resources for this Data Acquisition Module can be found [here](https://onedrive.live.com/?authkey=%21AKlzuGTRE1KRf1o&id=4A0865B22350D05C%21247&cid=4A0865B22350D05C&parId=root&parQt=sharedby&o=OneUp).