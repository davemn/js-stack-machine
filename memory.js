(function(exports){
  exports.length = 0x10000; // max bytes addressable by 16-bit word, = 64K bytes
  
  var bank = new ArrayBuffer(exports.length);
  
  /*
   *       0 --------- 32K --- 64K
   * 0x[0000     7FFF][8000    FFFF]
   */
  var rom = new DataView(bank, 0, 0x8000); // lower half of memory is read-only
  var ram = new DataView(bank, 0x8000, 0x7F80); // upper half of memory is read/write
  // var io =  new DataView(bank, 0xFF80, 0x80); // top 128 bytes, for memory-mapped I/O
  
  exports.readByte = function(addr){
    if(addr < 0 || addr >= this.length)
      throw new Error('Memory access violation!');
    
    var view = new DataView(bank, addr, 1);
    return view.getUint8(0);
  };
  
  exports.readWord = function(addr){
    if(addr < 0 || addr >= this.length)
      throw new Error('Memory access violation!');
    
    var view = new DataView(bank, addr, 2);
    return view.getUint16(0); // in big-endian format
  };
  
  exports.writeByte = function(addr, val){
    if(addr < 0 || addr >= this.length)
      throw new Error('Memory access violation!');
    
    switch(addr & 0xF000){
      case 0x0000:
      case 0x1000:
      case 0x2000:
      case 0x3000:
      case 0x4000:
      case 0x5000:
      case 0x6000:
      case 0x7000:
        // throw new Error('Memory protection violation!'); // ROM portion of mem
        rom.setUint8(addr, val);
        break;
      case 0x8000:
      case 0x9000:
      case 0xA000:
      case 0xB000:
      case 0xC000:
      case 0xD000:
      case 0xE000:
        ram.setUint8(addr & 0x7FFF, val);
        break;
      case 0xF000:
        if(addr < 0xFF80)
          ram.setUint8(addr & 0x7FFF, val);
        else
          throw new Error('Memory protection violation!'); // Memory-mapped I/O portion of mem
        break;
    }
  };
  
  exports.writeWord = function(addr, val){
    if(addr < 0 || addr >= this.length)
      throw new Error('Memory access violation!');
    
    switch(addr & 0xF000){
      case 0x0000:
      case 0x1000:
      case 0x2000:
      case 0x3000:
      case 0x4000:
      case 0x5000:
      case 0x6000:
      case 0x7000:
        // throw new Error('Memory protection violation!'); // ROM portion of mem
        rom.setUint16(addr, val);
        break;
      case 0x8000:
      case 0x9000:
      case 0xA000:
      case 0xB000:
      case 0xC000:
      case 0xD000:
      case 0xE000:
        ram.setUint16(addr & 0x7FFF, val);
        break;
      case 0xF000:
        if(addr < 0xFF80)
          ram.setUint16(addr & 0x7FFF, val);
        else
          throw new Error('Memory protection violation!'); // Memory-mapped I/O portion of mem
        break;
    }
  };
  
  exports.asString = function(offset, byteLen){
    var out = '';
    
    for(var i=0; i < byteLen; i++){
      // Convert byte to 2-character hex string
      var hex = this.readByte(offset+i).toString(16);
      var hexStr = ('00'+hex).substring(hex.length);
      
      out += hexStr + ' ';
    }
    
    return out;
  };
  
})(window.Memory = {});