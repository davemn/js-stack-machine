(function(exports, $, ace){
  
  var Range = ace.require('ace/range').Range;

  function stringSplice(str, idx, count, add){
    return str.slice(0,idx) + (add || '') + str.slice(idx+count);
  }
  
  function stringWrap(str, colLen){
    var wrapArr = str.match(new RegExp('.{1,'+colLen+'}','g')) || [];
    var wrap = wrapArr.reduce(function(prev,cur){
      if(prev.length === 0)
        return cur;
      return prev + '\n' + cur;
    },'');
    
    return wrap;
  }
  
  // Pad a string with the PADWITH characters, to a length 
  // that is a multiple of MULTIPLE.
  function stringRPadToMultiple(str, multiple, padWith){
    var strPadded;
    var noPadding = (str.length % multiple) === 0;
    
    if(noPadding)
      strPadded = str;
    else {
      var paddedLength = str.length + multiple - (str.length % multiple);
      strPadded = (str + Array(multiple+1).join(padWith)).substring(0,paddedLength);
    }
    
    return strPadded;
  }
  
  // ===========================================================
  
  // new AceHexEditor.instance('editor-mem', 'editor-mem-ascii');
  exports.instance = function(hexViewElemId, asciiViewElemId){
    // - Initialize memory editor ---
    this.memGui = ace.edit(hexViewElemId);
    
    // this.memGui.getSession().setMode('ace/mode/assembly_x86');
    this.memGui.setShowPrintMargin(false);
    this.memGui.getSession().setTabSize(2);
    this.memGui.getSession().setUseSoftTabs(true);
    this.memGui.$blockScrolling = Infinity; // suppress warnings about scrolling
    
    // custom gutter, ala http://stackoverflow.com/questions/28311086/modify-the-gutter-of-ajax-org-cloud9-editor-ace-editor
    this.memGui.session.gutterRenderer = {
      getWidth: function(session, lastLineNumber, config) {          
        return 4 * config.characterWidth;
      },
      getText: function(session, row) {
        // Convert to padded hexadecimal
        var hex = row.toString(16).toUpperCase();
        return ('0000'+hex).substring(hex.length);
      }
    };
    
    // - Initialize ASCII memory editor ---
    this.asciiMemGui = ace.edit(asciiViewElemId);
    
    this.asciiMemGui.setShowPrintMargin(false);
    this.asciiMemGui.getSession().setTabSize(2);
    this.asciiMemGui.getSession().setUseSoftTabs(true);
    this.asciiMemGui.renderer.setShowGutter(false);
    this.asciiMemGui.$blockScrolling = Infinity; // suppress warnings about scrolling
    
    this.$memGui      = $('#'+hexViewElemId);
    this.$asciiMemGui = $('#'+asciiViewElemId);
    
    // ===
    
    var outerThis = this;
    
    // Modify the ASCII view when the hex view changes
    this.$asciiMemGui.on('editor-sync', function(evt, cursor, charCode){
      outerThis.syncAsciiView(cursor, charCode);
    });
      
    // Substitute chars invalid for hex view, wrap hex view to 16 columns
    this.$memGui.on('keypress', '.ace_text-input', function(evt){
      evt.preventDefault(); // prevent Ace from doing further key event handling
    
      var input = String.fromCharCode(evt.which);
      outerThis.onKeypressHexView(input);
    });
    
    // Modify the hex view when the ascii view changes
    this.$memGui.on('editor-sync', function(evt, cursor, charCode){
      outerThis.syncHexView(cursor, charCode);
    });
    
    // Substitute chars invalid for ascii view, wrap ascii view to 8 columns
    this.$asciiMemGui.on('keypress', '.ace_text-input', function(evt){
      evt.preventDefault(); // prevent Ace from doing further key event handling
    
      var input = String.fromCharCode(evt.which);
      outerThis.onKeypressAsciiView(input);
    });
  };
  
  // Modify the ASCII view when the hex view changes
  exports.instance.prototype.syncAsciiView = function(cursor, charCode){
    // console.log(cursor);
    // console.log(charCode);
  
    // cursor = position of cursor before last edit
    var asciiCol = Math.floor(cursor.column/2);
    
    var oldDoc = this.asciiMemGui.getValue();
    oldDoc = oldDoc.replace(/\n/g,''); // remove newlines if this is a multiline input
    
    var cleanInput = String.fromCharCode(charCode);
    cleanInput = cleanInput.replace(/[^A-Za-z ]/g,'.');
    
    var newDoc = stringSplice(oldDoc, (cursor.row*8)+asciiCol, 1, cleanInput);
    var newDocPadded = stringRPadToMultiple(newDoc, 8, '.');
    var newDocWrap = stringWrap(newDocPadded, 8);
    
    this.asciiMemGui.setValue(newDocWrap, 1); // set the document text to the spliced string, and move the cursor to the end
    
    // Move the cursor to the new edit point
    
    this.asciiMemGui.clearSelection();
    if(asciiCol === 8){
      this.asciiMemGui.scrollToLine(cursor.row + 1)
      this.asciiMemGui.moveCursorTo(cursor.row+1, 1); // row, col
    }
    else {
      this.asciiMemGui.scrollToLine(cursor.row)
      this.asciiMemGui.moveCursorTo(cursor.row, asciiCol+1);
    }
  };
  
  // Substitute chars invalid for hex view, wrap hex view to 16 columns
  exports.instance.prototype.onKeypressHexView = function(input){
    var cursor = this.memGui.getCursorPosition();
    
    var cleanInput = input.replace(/[^A-Fa-f0-9]/g,'');
    if(cleanInput.length === 0)
      cleanInput = '0';
      
    var oldDoc = this.memGui.getValue();
    oldDoc = oldDoc.replace(/\n/g,''); // remove newlines if this is a multiline input
    
    var newDoc = stringSplice(oldDoc, (cursor.row*16)+cursor.column, 1, cleanInput);
    
    // Pad the edited doc with zeroes, to a multiple of 16 chars
    var newDocPadded = stringRPadToMultiple(newDoc, 16, '0');
    
    var newDocWrap = stringWrap(newDocPadded,16);
    
    this.memGui.setValue(newDocWrap, 1); // set the document text to the spliced string, and move the cursor to the end
    
    // Move the cursor to the new edit point
    
    this.memGui.clearSelection();
    if(cursor.column === 16){
      this.memGui.scrollToLine(cursor.row + 1)
      this.memGui.moveCursorTo(cursor.row+1, 1); // row, col
    }
    else {
      this.memGui.scrollToLine(cursor.row)
      this.memGui.moveCursorTo(cursor.row, cursor.column+1);
    }
    
    // Trigger a sync with the ASCII view, passing along info about this edit
    
    var cursorClone = $.extend({}, cursor);
    var hexStr = '';
    var hex = -1;
    
    if((cursor.row*16 + cursor.column) % 2 === 0){ // edited the lowest nybble of the byte
      hexStr = newDocPadded[cursor.row*16 + cursor.column] + newDocPadded[cursor.row*16 + cursor.column + 1];
    }
    else { // edited the highest nybble of the byte
      hexStr = newDocPadded[cursor.row*16 + cursor.column - 1] + newDocPadded[cursor.row*16 + cursor.column];
    }
    hex = parseInt(hexStr,16);
    
    this.$asciiMemGui.trigger('editor-sync', [cursorClone, hex]);
  };
  
  // Modify the hex view when the ascii view changes
  exports.instance.prototype.syncHexView = function(cursor, charCode){
    // cursor = position of cursor before last edit
    var hexCol = cursor.column*2;
    
    var oldDoc = this.memGui.getValue();
    oldDoc = oldDoc.replace(/\n/g,''); // remove newlines if this is a multiline input
    
    // Convert character code to 2-character hex string
    var hex = charCode.toString(16);
    var cleanInput = ('00'+hex).substring(hex.length);
    
    // Insert hex in appropriate location, and pad the edited doc with filler char, to a multiple of 8 chars
    var newDoc = stringSplice(oldDoc, (cursor.row*16)+hexCol, 2, cleanInput);
    var newDocPadded = stringRPadToMultiple(newDoc, 16, '0');
    var newDocWrap = stringWrap(newDocPadded, 16);
    
    this.memGui.setValue(newDocWrap, 1); // set the document text to the spliced string, and move the cursor to the end
    
    // Move the cursor to the new edit point
    this.memGui.clearSelection();
    if(hexCol === 16){
      this.memGui.scrollToLine(cursor.row + 1)
      this.memGui.moveCursorTo(cursor.row+1, 2); // row, col
    }
    else {
      this.memGui.scrollToLine(cursor.row)
      this.memGui.moveCursorTo(cursor.row, hexCol+2);
    }
  };
  
  // Substitute chars invalid for ascii view, wrap ascii view to 8 columns
  exports.instance.prototype.onKeypressAsciiView = function(input){
    var cursor = this.asciiMemGui.getCursorPosition();
    
    var cleanInput = input.replace(/[^A-Za-z0-9 ]/g,'');
    if(cleanInput.length === 0)
      cleanInput = '.';
      
    var oldDoc = this.asciiMemGui.getValue();
    oldDoc = oldDoc.replace(/\n/g,''); // remove newlines if this is a multiline input
    
    var newDoc = stringSplice(oldDoc, (cursor.row*8)+cursor.column, 1, cleanInput);
    
    // Pad the edited doc with filler char, to a multiple of 8 chars
    var newDocPadded = stringRPadToMultiple(newDoc, 8, '.');
    var newDocWrap = stringWrap(newDocPadded,8);
    
    this.asciiMemGui.setValue(newDocWrap, 1); // set the document text to the spliced string, and move the cursor to the end
    
    // Move the cursor to the new edit point
    this.asciiMemGui.clearSelection();
    if(cursor.column === 8){
      this.asciiMemGui.scrollToLine(cursor.row + 1)
      this.asciiMemGui.moveCursorTo(cursor.row+1, 1); // row, col
    }
    else {
      this.asciiMemGui.scrollToLine(cursor.row)
      this.asciiMemGui.moveCursorTo(cursor.row, cursor.column+1);
    }
    
    // Trigger a sync with the hex view, passing along info about this edit
    var cursorClone = $.extend({}, cursor);
    var hex = cleanInput.charCodeAt(0);
    
    this.$memGui.trigger('editor-sync', [cursorClone, hex]);
  };
  
})(window.AceHexEditor = {}, jQuery, ace);