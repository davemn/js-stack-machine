(function(exports){
  exports.length = 0x10000; // max bytes addressable by 16-bit word, = 64K bytes
  
  var bank = new ArrayBuffer(exports.length);
  var ram = new DataView(bank, 0);
  
  exports.reset = function(){
    var view = new DataView(bank);
    for(var dwordI=0; dwordI < (this.length/4); dwordI++){
      view.setUint32(dwordI*4, 0);
    }
  };
  
  exports.readByte = function(addr){
    if(addr < 0 || addr >= this.length)
      throw new Error('Memory access violation!');
    
    var view = new DataView(bank, addr, 1);
    return view.getInt8(0);
  };
  
  exports.readShort = function(addr){
    if(addr < 0 || addr >= this.length-1)
      throw new Error('Memory access violation!');
    
    var view = new DataView(bank, addr, 2);
    return view.getInt16(0);
  };
  
  exports.readInt = function(addr){
    if(addr < 0 || addr >= this.length-3)
      throw new Error('Memory access violation!');
    
    var view = new DataView(bank, addr, 4);
    return view.getInt32(0);
  };
  
  // TODO find a solution for 64-bit integers. 
  // http://stackoverflow.com/a/9643650
  // 
  // exports.readLong = function(addr)
  
  exports.readChar = function(addr){
    if(addr < 0 || addr >= this.length-1)
      throw new Error('Memory access violation!');
    
    var view = new DataView(bank, addr, 2);
    return view.getUint16(0); // unsigned!
  };
  
  // ---
  
  exports.writeByte = function(addr, val){
    if(addr < 0 || addr >= this.length)
      throw new Error('Memory access violation!');
    
    // if(val < -128 || 127 < val)
    //   throw new Error('Attempted to write value greater than type size.');
    
    ram.setInt8(addr, val);
  };
  
  exports.writeShort = function(addr, val){
    if(addr < 0 || addr >= this.length-1)
      throw new Error('Memory access violation!');
    
    ram.setInt16(addr, val);
  };
  
  exports.writeInt = function(addr, val){
    if(addr < 0 || addr >= this.length-3)
      throw new Error('Memory access violation!');
    
    ram.setInt32(addr, val);
  };
  
  // TODO find a solution for 64-bit integers
  // 
  // exports.writeLong = function(addr, val)
  
  exports.writeChar = function(addr, val){
    if(addr < 0 || addr >= this.length-1)
      throw new Error('Memory access violation!');
    
    ram.setUint16(addr, val);
  };
  
  // ---
  
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