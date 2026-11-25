/*! qrcode-generator 1.4.4 (c) Kazuhiko Arase, MIT license — https://github.com/kazuhikoarase/qrcode-generator */
//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

(function (factory) {
  if (typeof define === 'function' && define.amd) {
      define([], factory);
  } else if (typeof exports === 'object') {
      module.exports = factory();
  }
}(function () {
    return qrcode;
}));

/* ============================================================
   HM-RECEIPT v1 — «تحميل الإيصال» + صفحة التحقق (جمعية هامة) — 2026-11-25
   يعمل في صفحات: /o/<رمز>/inv و /order-completed/<رمز>/invoice و /orders/<رمز>/invoice
   وأي صفحة + #receipt=XXXX-XXXX (صفحة التحقق) و /account-orders («طلباتي وإيصالاتي»)
   السكربت: «إيصالات هامة» (يتأكد من الدفع ويعطي البيانات فقط). الرسم هنا في المتصفح بالتصميم المعتمد (148b).
   الإيقاف السريع: RECEIPT_ON=0 في شيت «إيصالات هامة».
   ============================================================ */
(function () {
  'use strict';
  if (window.HMReceipt) return;
  var API = 'https://script.google.com/macros/s/AKfycbwPBld_gaHZoPlezPNpukCHNVzN3EfR9wyFwwmL2WJ1hL3cFBgDiE8ceWeZOsAmQZYe-g/exec';
  var NAVY = '#126762', INK2 = '#5b6b80', LINE = '#E3ECE7', GOLD = '#A8864A';
  var ME = (document.currentScript && document.currentScript.src) || '';
  if (!ME) { var sc = document.querySelector('script[src*="receipt.js"]'); ME = sc ? sc.src : ''; }
  var BASE = ME.replace(/[^\/]*$/, '');
  var ORG = 'جمعية هامة لخدمة الحجاج والمعتمرين';
  var LIC = 'مسجلة لدى المركز الوطني لتنمية القطاع غير الربحي برقم 1000688400';
  var PHONE = '0555 06 7720';
  var ICON_D = 'M81.6 86.4 81.0 86.4 80.2 87.0 74.0 89.5 74.0 97.4 76.9 96.5 81.8 94.2 81.9 86.6ZM116.9 86.2 116.9 94.2 117.2 94.6 124.0 91.8 125.4 91.6 147.0 101.1 152.0 103.6 152.6 103.8 153.1 103.4 153.2 95.5 151.4 94.0 125.1 82.4 124.2 82.5 122.1 83.6 118.4 85.0ZM95.5 80.2 90.6 82.2 88.5 83.5 88.5 90.5 88.8 91.0 90.0 90.9 95.6 88.2 95.8 80.5ZM74.0 104.5 74.0 154.4 74.6 154.4 75.0 154.9 95.8 154.9 96.2 153.6 96.2 140.2 96.8 139.5 101.4 139.4 102.1 140.1 102.1 153.4 103.1 154.9 181.0 154.9 181.1 154.5 181.9 154.2 181.9 107.1 169.2 101.8 168.1 101.0 159.8 97.6 159.0 98.1 159.0 114.2 158.6 114.6 158.0 114.6 157.1 114.0 147.2 109.8 145.4 109.4 145.0 110.0 145.0 145.5 144.6 146.0 111.4 146.1 110.9 145.6 110.8 140.4 111.5 139.4 138.1 139.5 138.9 139.1 139.1 138.6 139.1 104.4 137.2 103.1 125.1 97.9 124.1 98.0 123.2 98.6 121.8 99.0 117.1 101.1 116.6 102.6 116.8 130.4 116.2 131.0 111.4 131.0 110.8 130.4 110.9 74.6 110.2 73.6 107.9 74.0 102.5 76.1 102.1 77.4 102.2 130.4 101.8 130.9 96.8 131.0 96.2 130.5 96.2 96.0 95.8 95.2 95.1 95.2 90.0 97.8 86.5 99.0ZM153.8 122.0 157.2 123.1 158.4 123.8 159.0 124.5 159.0 145.5 158.2 146.2 153.8 146.0 153.2 145.2 153.2 122.6ZM167.6 110.4 168.5 110.4 172.4 112.0 173.4 113.1 173.4 145.5 172.5 146.1 168.2 146.1 167.4 145.4 167.4 110.6ZM87.5 107.9 88.1 108.6 88.1 145.2 87.4 146.1 82.8 146.0 82.2 145.4 82.2 110.5 83.5 109.5ZM125.2 107.4 130.1 109.4 130.8 110.2 130.8 130.5 130.4 131.0 125.8 131.1 124.9 130.4 124.9 108.5ZM117.4 71.0 117.1 77.8 117.4 78.8 118.2 78.6 119.6 77.8 123.9 76.0 125.0 75.9 137.5 81.4 139.0 81.8 144.6 84.5 148.2 85.8 149.5 86.6 155.0 88.8 158.6 90.6 162.2 91.9 167.6 94.5 173.5 96.8 174.9 97.6 179.6 99.6 180.9 99.8 181.4 99.2 181.2 92.6 180.4 91.8 174.9 89.2 161.9 83.9 159.1 82.4 152.9 80.0 150.1 78.5 143.6 76.0 140.2 74.2 136.8 73.0 126.0 68.1 124.4 67.8 118.4 70.2ZM74.0 73.8 74.0 82.5 74.5 82.5 81.2 79.9 82.1 79.2 90.5 75.9 91.6 75.1 97.1 73.0 100.8 71.1 106.9 68.8 109.6 67.2 113.2 66.0 124.0 61.1 125.2 61.1 132.4 64.1 133.6 65.0 139.2 67.1 142.6 68.9 164.8 78.2 167.9 79.9 174.0 82.2 179.8 85.0 181.9 85.2 181.9 76.8 155.2 65.0 153.8 64.6 148.4 62.0 144.9 60.8 141.2 58.9 135.8 56.8 132.4 55.0 126.4 52.6 126.0 52.0 123.4 52.0 123.0 52.6 114.6 56.0 111.2 57.8 107.8 59.0 102.2 61.6 98.8 62.9 97.4 63.8 96.5 63.9 95.1 64.8 89.5 66.9 88.1 67.8Z';   // أيقونة شعار هامة بلا كتابة (إحداثيات الشعار 256)، x 74.25–181.4، y 52.5–154.1
  var ICON_BOX = {x: 74.25, y: 52.5, w: 107.15, h: 101.6};
  var ERR = {
    not_paid: 'لم يكتمل الدفع لهذا التبرع بعد.', bad_order: 'رابط التبرع غير صحيح.', locked: 'محاولات كثيرة. حاول بعد ساعة.',
    paused: 'الإيصالات متوقفة مؤقتاً. حاول لاحقاً.', net: 'تعذّر الاتصال. تأكد من الإنترنت ثم أعد المحاولة.', server: 'حدث خطأ. أعد المحاولة بعد قليل.'
  };

  /* ---------- أدوات ---------- */
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function post(body) {
    return fetch(API, {method: 'POST', body: JSON.stringify(body)}).then(function (r) { return r.json(); });
  }
  function orderFromPath(p) {
    var m = String(p || '').match(/\/(?:o\/([A-Za-z0-9]{6,24})\/inv|(?:order-completed|orders)\/([A-Za-z0-9]{6,24})\/invoice)/);
    return m ? (m[1] || m[2]) : '';
  }
  function fmtAmt(a) { a = Number(a) || 0; return (Math.round(a * 100) % 100) ? a.toFixed(2) : String(Math.round(a)); }

  /* التاريخ: من created_at (UTC) إلى توقيت الرياض */
  var MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  function riyadh(iso) {
    var m = String(iso || '').match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
    if (!m) return null;
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) + 3 * 3600e3); // نقرأ بـ getUTC*
  }
  function gregText(d) {
    var h = d.getUTCHours(), mi = d.getUTCMinutes(), ap = h < 12 ? 'ص' : 'م', h12 = h % 12 || 12;
    return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear() + ' – ' + h12 + ':' + (mi < 10 ? '0' : '') + mi + ' ' + ap;
  }
  function hijriText(d) {
    try {
      var f = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'});
      var s = f.format(d).replace(/\s*هـ$/, '').trim();
      return /\d{4}/.test(s) ? s + 'هـ' : '';
    } catch (e) { return ''; }
  }
  function dateParts(r) {
    var d = riyadh(r.iso);
    if (d) return {g: gregText(d), h: hijriText(d)};
    return {g: String(r.date || '').replace('|', '–'), h: ''};
  }

  /* المبلغ كتابةً (ريالات صحيحة حتى 999,999 + هللات) */
  var ONES = ['','واحد','اثنان','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة','عشرة','أحد عشر','اثنا عشر','ثلاثة عشر','أربعة عشر','خمسة عشر','ستة عشر','سبعة عشر','ثمانية عشر','تسعة عشر'];
  var TENS = ['','','عشرون','ثلاثون','أربعون','خمسون','ستون','سبعون','ثمانون','تسعون'];
  var HUND = ['','مئة','مئتان','ثلاثمئة','أربعمئة','خمسمئة','ستمئة','سبعمئة','ثمانمئة','تسعمئة'];
  function below1000(n) {
    var h = Math.floor(n / 100), r = n % 100, p = [];
    if (h) p.push(HUND[h]);
    if (r) {
      if (r < 20) p.push(ONES[r]);
      else { var o = r % 10, t = Math.floor(r / 10); p.push(o ? ONES[o] + ' و' + TENS[t] : TENS[t]); }
    }
    return p.join(' و');
  }
  function riyalWord(n) {           // تمييز العدد
    var r = n % 100;
    if (n === 1) return 'ريال سعودي';
    if (n === 2) return 'ريالان سعوديان';
    if (r >= 3 && r <= 10) return 'ريالات سعودية';
    return 'ريال سعودي';
  }
  function words(a) {
    a = Math.round((Number(a) || 0) * 100);
    var n = Math.floor(a / 100), hl = a % 100, s = '';
    if (n === 0) s = 'صفر';
    else if (n === 1) s = '';
    else if (n === 2) s = '';
    else {
      var th = Math.floor(n / 1000), rest = n % 1000, p = [];
      if (th) {
        if (th === 1) p.push('ألف');
        else if (th === 2) p.push('ألفان');
        else if (th >= 3 && th <= 10) p.push(below1000(th) + ' آلاف');
        else p.push(below1000(th) + ' ألف');
      }
      if (rest) p.push(below1000(rest));
      s = p.join(' و');
    }
    var out = (n === 1 ? 'ريال سعودي واحد' : n === 2 ? 'ريالان سعوديان' : s + ' ' + riyalWord(n));
    if (hl) out += ' و' + below1000(hl) + ' ' + (hl >= 3 && hl <= 10 ? 'هللات' : 'هللة');
    return out + ' فقط';
  }

  /* ---------- الخطوط والصور ---------- */
  var assets = null;
  function loadAssets() {
    if (assets) return assets;
    var fonts = [
      ['HMRT', 'fonts/Tajawal-Regular.ttf', '400'], ['HMRT', 'fonts/Tajawal-Bold.ttf', '700'],
      ['HMRT', 'fonts/Tajawal-ExtraBold.ttf', '800'], ['HMRA', 'fonts/Amiri-Bold-dua.ttf', '700']
    ].map(function (f) {
      var ff = new FontFace(f[0], 'url(' + BASE + f[1] + ')', {weight: f[2]});
      return ff.load().then(function (x) { document.fonts.add(x); });
    });
    var logo = new Promise(function (ok, no) { var i = new Image(); i.crossOrigin = 'anonymous'; i.onload = function () { ok(i); }; i.onerror = no; i.src = BASE + 'img/receipt/logo.png'; });
    assets = Promise.all([Promise.all(fonts), logo]).then(function (r) { return {logo: r[1]}; });
    assets.catch(function () { assets = null; });
    return assets;
  }

  /* ---------- رمز QR ---------- */
  function qrCanvas(text, size) {
    var q = qrcode(0, 'M'); q.addData(text); q.make();
    var n = q.getModuleCount(), quiet = 0, cv = document.createElement('canvas'), cell = size / (n + quiet * 2);
    cv.width = cv.height = size; var c = cv.getContext('2d');
    c.fillStyle = '#fff'; c.fillRect(0, 0, size, size); c.fillStyle = NAVY;
    for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (q.isDark(r, k)) c.fillRect(Math.floor((k + quiet) * cell), Math.floor((r + quiet) * cell), Math.ceil(cell), Math.ceil(cell));
    return cv;
  }

  /* ---------- الرسم ---------- */
  // يرسم الإيصال بالتخطيط المعتمد. kind: 'sq' (1080×1080) أو 'a5' (1080×1532)
  function draw(kind, d, A, scale) {
    var S = kind === 'sq' ? {
      W:1080, H:1080, pad:48, h1:44, org:30, lgW:170, amtTop:4, amtL:32, amtN:92, amtU:42, wTop:2, wSize:30, barT:20, barB:16,
      rowPad:14, lab:28, val:36, sub:28, duaM:20, dua:34, ln:28, ct:30, ctT:8, ln2T:6, qr:0, hg:44, wm:640
    } : {
      W:1080, H:1532, pad:88, h1:52, org:30, lgW:200, amtTop:24, amtL:36, amtN:160, amtU:56, wTop:10, wSize:34, barT:28, barB:28,
      rowPad:18, lab:30, val:40, sub:30, duaM:28, dua:40, ln:28, ct:30, ctT:12, ln2T:12, qr:152, hg:66, wm:760
    };
    d.proj = String(d.proj || '').split('|')[0].trim();
    scale = scale || 1;
    var cv = document.createElement('canvas'); cv.width = S.W * scale; cv.height = S.H * scale;
    var c = cv.getContext('2d'); c.scale(scale, scale);
    c.fillStyle = '#fff'; c.fillRect(0, 0, S.W, S.H);
    c.direction = 'rtl'; c.textBaseline = 'alphabetic';

    function font(sz, w, fam) { c.font = (w || 400) + ' ' + sz + 'px ' + (fam || 'HMRT') + ', Tahoma, sans-serif'; }
    function asc(sz) { var m = c.measureText('إيصال'); return {a: m.fontBoundingBoxAscent || sz * 0.95, d: m.fontBoundingBoxDescent || sz * 0.35}; }
    // يكتب سطراً داخل صندوق ارتفاعه lh*sz ويرجع الارتفاع
    function line(txt, x, top, sz, w, color, lh, align, fam) {
      font(sz, w, fam); c.fillStyle = color; c.textAlign = align || 'right';
      var m = asc(sz), boxH = sz * lh, y = top + (boxH - (m.a + m.d)) / 2 + m.a;
      c.fillText(txt, x, y); return boxH;
    }
    function width(txt, sz, w, fam) { font(sz, w, fam); return c.measureText(txt).width; }

    /* الخلفية: أيقونة شعار هامة بلا كتابة، خط رفيع رمادي، في منتصف الإيصال تماماً */
    try {
      var k = S.wm / ICON_BOX.w;
      c.save();
      c.translate(S.W / 2, S.H / 2); c.scale(k, k);
      c.translate(-(ICON_BOX.x + ICON_BOX.w / 2), -(ICON_BOX.y + ICON_BOX.h / 2));
      c.strokeStyle = 'rgba(120,124,128,0.11)'; c.lineWidth = 2 / k; c.lineJoin = 'round';
      c.stroke(new Path2D(ICON_D));
      c.restore();
    } catch (e) {}

    var P = S.pad, W = S.W, y = P;

    /* الرأس: الشعار يميناً، QR يساراً، والعنوان في الوسط */
    var lw = S.lgW, lh = Math.round(A.logo.naturalHeight * lw / A.logo.naturalWidth);
    c.drawImage(A.logo, W - P - lw, y, lw, lh);
    var labW = width('امسح للتحقق', 28, 700), qs = S.qr || Math.round(labW), labSz = S.qr ? 28 * qs / labW : 28;
    var qcv = qrCanvas('https://hamh.sa/#receipt=' + d.v.slice(0, 4) + '-' + d.v.slice(4), qs * 2);
    c.drawImage(qcv, P, y, qs, qs);
    var qrBlockH = qs + 8 + line('امسح للتحقق', P + qs / 2, y + qs + 8, labSz, 700, NAVY, 1.2, 'center');
    var hdH = Math.max(lh, qrBlockH), HG = S.hg;  // HG: أقل فراغ بين العنوان وبين الشعار ورمز QR
    var midL = P + qs + HG, midR = W - P - lw - HG, midC = (midL + midR) / 2, midW = midR - midL;
    var t1 = S.h1, t2 = S.org;                     // نصغّر العنوان قليلاً إن لم يتسع (بحد أدنى)
    while (t1 > 34 && width('إيصال تبرع إلكتروني', t1, 800) > midW) t1 -= 2;
    while (t2 > 26 && width(ORG, t2, 700) > midW) t2 -= 1;
    var midH = t1 * 1.2 + 6 + t2 * 1.35, my = y + (lh - midH) / 2;   // في منتصف ارتفاع الشعار
    my += line('إيصال تبرع إلكتروني', midC, my, t1, 800, NAVY, 1.2, 'center') + 6;
    line(ORG, midC, my, t2, 700, INK2, 1.35, 'center');
    y += hdH + S.amtTop;

    /* المبلغ */
    var nTxt = fmtAmt(d.amt), gap = 18;
    var wl = width('المبلغ', S.amtL, 700), wn = width(nTxt, S.amtN, 800), wu = width('ريال', S.amtU, 800);
    var tot = wl + wn + wu + gap * 2, xr = W / 2 + tot / 2;
    font(S.amtN, 800); var mN = asc(S.amtN), base = y + (S.amtN - (mN.a + mN.d)) / 2 + mN.a;
    c.textAlign = 'right';
    font(S.amtL, 700); c.fillStyle = INK2; c.fillText('المبلغ', xr, base);
    font(S.amtN, 800); c.fillStyle = NAVY; c.direction = 'ltr'; c.textAlign = 'right'; c.fillText(nTxt, xr - wl - gap, base); c.direction = 'rtl';
    font(S.amtU, 800); c.textAlign = 'right'; c.fillText('ريال', xr - wl - gap - wn - gap, base);
    y += S.amtN + S.wTop;
    y += line(words(d.amt), W / 2, y, S.wSize, 700, NAVY, 1.25, 'center');

    /* خط الزخرفة (زخرفة فقط، بلا نص) */
    y += S.barT; c.fillStyle = GOLD; roundRect(c, W / 2 - 70, y, 140, 5, 2.5); c.fill(); y += 5 + S.barB;

    /* الصفوف */
    var dp = dateParts(d), colW = (W - 2 * P - 40) / 2, xR = W - P, xL = P + colW;
    var gift = d.gift && d.gift.to ? d.gift : null;
    var rows = kind === 'sq' ? [
      [['رقم الإيصال', d.n], ['الرقم المرجعي للعملية', d.ref || '—']],
      [['التاريخ والوقت', dp.g, dp.h], ['طريقة الدفع', d.pay || '—']],
      [['اسم المتبرع', d.name], ['المشروع', d.proj]]
    ] : [
      [['رقم الإيصال', d.n], ['الرقم المرجعي للعملية', d.ref || '—']],
      [['التاريخ والوقت', dp.g, dp.h]],
      [['اسم المتبرع', d.name], ['المشروع', d.proj]],
      gift ? [['طريقة الدفع', d.pay || '—'], [gift.mourn ? 'صدقة عن' : 'إهداء إلى', gift.to]] : [['طريقة الدفع', d.pay || '—']]
    ];
    rows.forEach(function (row) {
      var top = y + S.rowPad, hMax = 0, one = row.length === 1;
      row.forEach(function (cell, i) {
        var x = one ? W / 2 : (i === 0 ? xR : P), al = one ? "center" : (i === 0 ? "right" : "left"), h = 0;
        h += line(cell[0], x, top + h, S.lab, 400, INK2, 1.2, al);
        h += 9; h += line(fit(cell[1], S.val, 800, one ? W - 2 * P : colW), x, top + h, S.val, 800, NAVY, 1.25, al);
        if (cell[2]) { h += 5; h += line(cell[2], x, top + h, S.sub, 400, INK2, 1.25, al); }
        hMax = Math.max(hMax, h);
      });
      y = top + hMax + S.rowPad;
      c.fillStyle = LINE; c.fillRect(P, y, W - 2 * P, 2); y += 2;
    });
    function fit(t, sz, w, maxW) {   // يختصر النص الطويل حتى لا يتجاوز العمود
      t = String(t == null ? '' : t); if (width(t, sz, w) <= maxW) return t;
      while (t.length > 1 && width(t + '…', sz, w) > maxW) t = t.slice(0, -1);
      return t + '…';
    }

    /* الدعاء */
    y += S.duaM;
    line('تقبّل الله منك، وجعله في ميزان حسناتك.', W / 2, y, S.dua, 700, NAVY, 1.4, 'center', 'HMRA');

    /* التذييل مثبت في الأسفل — نفسه في المقاسين (قرار عبدالله: البيانات الكاملة في كل المقاسات) */
    var foot = [[LIC, S.ln, 400, INK2, 0], [PHONE + ' · hamh.sa · info@hamh.org.sa', S.ct, 800, NAVY, S.ctT, 1], ['إيصال إلكتروني لا يحتاج توقيعاً ولا ختماً', S.ln, 400, INK2, S.ln2T]];
    var fh = foot.reduce(function (s, f) { return s + f[4] + f[1] * 1.3; }, 0), fy = S.H - P - fh;
    foot.forEach(function (f) { fy += f[4]; if (f[5]) c.direction = 'ltr'; fy += line(f[0], W / 2, fy, f[1], f[2], f[3], 1.3, 'center'); c.direction = 'rtl'; });
    return cv;
  }
  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  /* ---------- PDF بصفحة A5 فيها صورة الإيصال ---------- */
  function pdfFromJpeg(jpeg, pxW, pxH) {
    var W = 419.53, H = 595.28, enc = new TextEncoder(), parts = [], off = 0, xref = [];
    function add(x) { var b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); off += b.length; }
    function obj(n, body) { xref[n] = off; add(n + ' 0 obj\n'); body(); add('\nendobj\n'); }
    add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    obj(1, function () { add('<< /Type /Catalog /Pages 2 0 R >>'); });
    obj(2, function () { add('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'); });
    obj(3, function () { add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>'); });
    var cs = 'q ' + W + ' 0 0 ' + H + ' 0 0 cm /Im0 Do Q';
    obj(4, function () { add('<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream'); });
    obj(5, function () { add('<< /Type /XObject /Subtype /Image /Width ' + pxW + ' /Height ' + pxH + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpeg.length + ' >>\nstream\n'); add(jpeg); add('\nendstream'); });
    var xo = off, s = 'xref\n0 6\n0000000000 65535 f \n';
    for (var i = 1; i <= 5; i++) s += String(xref[i]).padStart(10, '0') + ' 00000 n \n';
    add(s + 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xo + '\n%%EOF');
    return new Blob(parts, {type: 'application/pdf'});
  }
  function toBlob(cv, type, q) { return new Promise(function (ok) { cv.toBlob(ok, type, q); }); }
  function save(blob, name) {
    var u = URL.createObjectURL(blob), a = el('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 4000);
  }

  /* ---------- الواجهة ---------- */
  var css = false;
  function style() {
    if (css) return; css = true;
    var s = el('style'); s.textContent = [
      '.hmr-card{direction:rtl;text-align:center;background:#fff;border:1px solid ' + LINE + ';border-radius:16px;padding:16px;margin:14px 0;font-family:inherit}',
      '.hmr-card p{margin:0 0 12px;font-size:16px;color:' + INK2 + '}',
      '.hmr-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:48px;border:0;border-radius:12px;background:' + NAVY + ';color:#fff!important;font:inherit;font-size:17px;font-weight:700;cursor:pointer}',
      '.hmr-btn[disabled]{opacity:.65;cursor:wait}',
      '.hmr-btn2{background:#fff;color:' + NAVY + '!important;border:2px solid ' + NAVY + '}',
      '.hmr-lnk{display:inline-block;margin-top:12px;font-size:15px;font-weight:700;color:' + NAVY + '!important;text-decoration:none!important;background:none;border:0;cursor:pointer;font-family:inherit}',
      '.hmr-ov{position:fixed;inset:0;z-index:2147483100;background:rgba(18,103,98,.55);display:flex;align-items:center;justify-content:center;padding:14px;direction:rtl}',
      '.hmr-sh{background:#fff;border-radius:20px;padding:14px;width:100%;max-width:440px;max-height:calc(100vh - 28px);overflow:auto;font-family:inherit;text-align:center}',
      '.hmr-x{width:34px;height:34px;border-radius:50%;border:0;background:#F2F5F4;color:' + INK2 + ';font-size:18px;line-height:1;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;margin:0 auto 10px 0}',
      '.hmr-sh img{display:block;width:100%;border-radius:12px;border:1px solid ' + LINE + '}',
      '.hmr-row{display:flex;gap:10px;margin-top:12px}.hmr-row .hmr-btn{height:46px;font-size:16px}',
      '.hmr-note{margin:10px 0 0;font-size:14px;color:' + INK2 + '}',
      '.hmr-msg{padding:22px 8px;font-size:16px;color:' + INK2 + '}',
      '.hmr-ok{font-size:22px;font-weight:800;color:' + NAVY + ';margin:6px 0 14px}',
      '.hmr-kv{display:flex;justify-content:space-between;gap:12px;padding:10px 4px;border-bottom:1px solid ' + LINE + ';font-size:16px}',
      '.hmr-kv b{color:' + NAVY + '}.hmr-kv span{color:' + INK2 + '}'
    ].join('\n');
    document.head.appendChild(s);
  }
  function overlay() {
    style();
    var ov = el('div', 'hmr-ov'), sh = el('div', 'hmr-sh'), x = el('button', 'hmr-x');
    x.type = 'button'; x.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" style="display:block"><path d="M2 2L12 12M12 2L2 12" stroke="' + INK2 + '" stroke-width="2" stroke-linecap="round"/></svg>'; x.setAttribute('aria-label', 'إغلاق'); sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true');
    sh.appendChild(x); ov.appendChild(sh); document.body.appendChild(ov);
    function close() { ov.remove(); document.removeEventListener('keydown', esc); }
    function esc(e) { if (e.key === 'Escape') close(); }
    x.onclick = close; ov.onclick = function (e) { if (e.target === ov) close(); }; document.addEventListener('keydown', esc);
    setTimeout(function () { x.focus(); }, 30);
    return {sh: sh, close: close};
  }
  function icon() {
    var s = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M4 20h16"/></svg>';
    var w = el('span'); w.innerHTML = s; return w.firstChild;
  }

  var cache = {};
  function getReceipt(order) {
    if (!cache[order]) {
      cache[order] = post({a: 'receipt', o: order});
      cache[order].catch(function () { delete cache[order]; });
    }
    return cache[order];
  }

  // يفتح نافذة الإيصال لطلب معيّن (تُستعمل أيضاً من نافذة الإهداء)
  function open(order) {
    var o = overlay(), wait = el('div', 'hmr-msg', 'نجهّز إيصالك…'); o.sh.appendChild(wait);
    Promise.all([getReceipt(order), loadAssets()]).then(function (r) {
      var d = r[0], A = r[1];
      if (!d || !d.ok) { wait.textContent = ERR[d && d.error] || ERR.server; return; }
      var sq = draw('sq', d, A, 1);
      wait.remove();
      var im = el('img'); im.alt = 'إيصال التبرع رقم ' + d.n; im.src = sq.toDataURL('image/png'); o.sh.appendChild(im);
      var row = el('div', 'hmr-row'), b1 = el('button', 'hmr-btn', 'حفظ الصورة'), b2 = el('button', 'hmr-btn hmr-btn2', 'ملف PDF');
      b1.type = b2.type = 'button'; row.appendChild(b1); row.appendChild(b2); o.sh.appendChild(row);
      if (d.gift && d.gift.to) o.sh.appendChild(el('p', 'hmr-note', 'الإيصال لك أنت وفيه المبلغ. البطاقة هي التي تُرسل.'));
      b1.onclick = function () { toBlob(sq, 'image/png').then(function (b) { save(b, 'إيصال-تبرع-' + d.n + '.png'); }); };
      b2.onclick = function () {
        b2.disabled = true;
        var a5 = draw('a5', d, A, 2);
        toBlob(a5, 'image/jpeg', 0.92).then(function (b) { return b.arrayBuffer(); }).then(function (buf) {
          save(pdfFromJpeg(new Uint8Array(buf), a5.width, a5.height), 'إيصال-تبرع-' + d.n + '.pdf');
        }).finally(function () { b2.disabled = false; });
      };
    }).catch(function () { wait.textContent = ERR.net; });
  }

  // صفحة التحقق: #receipt=XXXX-XXXX
  function verifyPage(code) {
    var o = overlay(), wait = el('div', 'hmr-msg', 'نتحقق من الإيصال…'); o.sh.appendChild(wait);
    post({a: 'verify', v: code}).then(function (r) {
      wait.remove();
      if (!r || !r.ok) { o.sh.appendChild(el('div', 'hmr-msg', ERR[r && r.error] || ERR.server)); return; }
      if (!r.valid) {
        o.sh.appendChild(el('div', 'hmr-ok', 'لم نجد هذا الإيصال'));
        o.sh.appendChild(el('p', 'hmr-note', 'تأكد من الرمز، أو تواصل مع الجمعية على ' + PHONE + '.'));
        return;
      }
      o.sh.appendChild(el('div', 'hmr-ok', '✅ إيصال صحيح'));
      o.sh.appendChild(el('p', 'hmr-note', 'صادر من ' + ORG));
      [['رقم الإيصال', r.n], ['المبلغ', fmtAmt(r.amt) + ' ريال'], ['المشروع', String(r.proj || '').split('|')[0].trim()], ['التاريخ', String(r.date || '').replace('|', '–')]]
        .forEach(function (kv) { var w = el('div', 'hmr-kv'); w.appendChild(el('span', '', kv[0])); w.appendChild(el('b', '', String(kv[1]))); o.sh.appendChild(w); });
    }).catch(function () { wait.textContent = ERR.net; });
  }

  // بطاقة «إيصال تبرعك جاهز» في صفحة الفاتورة/الشكر
  function card(order) {
    var tries = 0;
    (function place() {
      var title = document.querySelector('main.content-container .page-title') || document.querySelector('.z-order-invoice-view .page-title');
      if (!title) { var h1 = document.querySelector('.order-completed-content h1'); if (h1) title = h1.closest('.d-flex') || h1; }   /* صفحة الشكر بعد الدفع */
      if (!title) { if (++tries < 40) setTimeout(place, 250); return; }
      if (document.querySelector('.hmr-card')) return;
      getReceipt(order).then(function (d) {
        if (!d || !d.ok) return;               // غير مدفوع أو خطأ: لا نعرض شيئاً
        if (document.querySelector('.hmr-card')) return;
        style();
        var cd = el('div', 'hmr-card'), b = el('button', 'hmr-btn'), l = el('button', 'hmr-lnk', 'تحقق من الإيصال');
        cd.appendChild(el('p', '', 'إيصال تبرعك جاهز'));
        b.type = l.type = 'button'; b.appendChild(icon()); b.appendChild(document.createTextNode('تحميل الإيصال'));
        b.onclick = function () { open(order); }; l.onclick = function () { verifyPage(d.v); };
        cd.appendChild(b); cd.appendChild(l);
        if (d.gift && d.gift.to && window.HMGift) {   // للمُهدي: رجوع لبطاقة الإهداء
          var gl = el('button', 'hmr-lnk', d.gift.mourn ? 'أرسل البطاقة' : 'أكمل إرسال هديتك'); gl.type = 'button';
          gl.style.marginInlineStart = '16px'; gl.onclick = function () { window.HMGift.complete(order); }; cd.appendChild(gl);
        }
        title.parentNode.insertBefore(cd, title.nextSibling);
        loadAssets();                           // نجهّز الخطوط مبكراً
      }).catch(function () {});
    })();
  }

  window.HMReceipt = {open: open, verify: verifyPage};

  function route() {
    var h = location.hash || '', m = h.match(/^#receipt=([A-Za-z0-9]{4}-?[A-Za-z0-9]{4})$/);
    if (m) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} verifyPage(m[1].replace('-', '').toUpperCase()); return; }
    if (location.pathname === '/account-orders') { ordersPage(); return; }
    var ord = orderFromPath(location.pathname);
    if (ord) card(ord);
  }

  /* «طلباتي وإيصالاتي»: زر «الإيصال» بجانب «مشاهدة» + بطاقات الجوال + «بانتظار الدفع» (148c، معتمد 2026-11-25) */
  function ordersPage() {
    if (!document.getElementById('hmr-orders-css')) {
      var s = el('style'); s.id = 'hmr-orders-css';
      s.textContent = 'table.order-table td.order-action{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}' +
        'table.order-table td.order-action a.btn,table.order-table td.order-action .hmr-rbtn{box-sizing:border-box;display:inline-flex!important;align-items:center;justify-content:center;gap:6px;width:120px;height:40px!important;margin:6px 0 0!important;padding:0 10px!important;border-radius:10px!important;font-size:15px!important;font-weight:700!important;text-decoration:none!important;line-height:1!important;cursor:pointer}' +
        'table.order-table td.order-action a.btn{background:#fff!important;color:' + NAVY + '!important;border:2px solid ' + NAVY + '!important}' +
        'table.order-table td.order-action .hmr-rbtn{background:' + NAVY + '!important;color:#fff!important;border:2px solid ' + NAVY + '!important;font-family:inherit}' +
        'table.order-table td.order-action .hmr-wait{box-sizing:border-box;display:inline-flex!important;align-items:center;justify-content:center;width:120px;height:40px;margin:6px 0 0;padding:2px 10px 0;border-radius:10px;background:#F1F3F5;color:' + INK2 + ';font-size:15px;font-weight:700;line-height:1;cursor:default;font-family:inherit}' +
        '@media (max-width:767px){' +
        'table.order-table,table.order-table tbody{display:block!important;width:100%!important;border:0!important}' +
        'table.order-table tbody tr{display:grid!important;grid-template-columns:1fr auto;grid-template-areas:"num st" "dt tot" "act act";gap:8px 10px;align-items:center;background:#fff;border:1px solid ' + LINE + '!important;border-radius:14px;padding:14px!important;margin:0 0 12px!important;box-shadow:0 1px 3px rgba(18,103,98,.06)}' +
        'table.order-table tbody tr td{display:block!important;width:auto!important;padding:0!important;border:0!important;text-align:right!important}' +
        'table.order-table td.order-status::before,table.order-table td.order-date::before,table.order-table td.order-total::before,table.order-table td.order-action::before,table.order-table td.order-date::after,table.order-table td.order-total::after{display:none!important;content:none!important}' +
        'table.order-table td.order-number{grid-area:num;display:flex!important;direction:rtl!important;align-items:center!important;gap:6px;justify-content:flex-start;font-size:16px;font-weight:700}' +
        'table.order-table td.order-number::before{content:"رقم التبرع"!important;font-weight:400;font-size:13px;color:' + INK2 + ';width:auto!important;min-width:0!important;max-width:none!important;padding:0!important;margin:0!important;text-align:right!important;flex:none!important;position:relative!important;top:-1px!important;line-height:1.2!important;display:block!important}' +
        'table.order-table td.order-number a{direction:ltr;position:relative;top:1px}' +
        'table.order-table td.order-status{grid-area:st;justify-self:end;width:max-content!important;min-width:0!important;max-width:none!important;height:26px;display:flex!important;align-items:center;justify-content:center;line-height:1!important;box-sizing:border-box;padding:0 12px 1px!important;font-size:13px!important;font-weight:700;border-radius:999px;text-align:center!important}' +
        'table.order-table td.hmr-st-ok{background:#DFF3E6;color:' + NAVY + '}table.order-table td.hmr-st-wait{background:#F1F3F5;color:' + INK2 + '}' +
        'table.order-table td.order-date{grid-area:dt;font-size:13px;color:' + INK2 + '}' +
        'table.order-table td.order-total{grid-area:tot;justify-self:end;font-size:17px;font-weight:800;color:' + NAVY + '}' +
        'table.order-table td.order-action{grid-area:act;display:flex!important;gap:8px;flex-wrap:nowrap!important;padding-top:4px!important}' +
        'table.order-table td.order-action a.btn,table.order-table td.order-action .hmr-rbtn,table.order-table td.order-action .hmr-wait{flex:1 1 0;width:auto!important;margin:0!important;height:42px!important}' +
        'table.order-table td.order-action a.btn{padding:3px 10px 0!important}' +
        '}';
      document.head.appendChild(s);
    }
    var fill = function () {
      var h1 = document.querySelector('h1');
      if (h1 && (h1.textContent || '').trim() === 'طلباتي') h1.textContent = 'طلباتي وإيصالاتي';
      document.querySelectorAll('table.order-table tbody tr').forEach(function (tr) {
        var st = tr.querySelector('td.order-status');
        if (st && (st.textContent || '').trim() === 'تم التوصيل') st.textContent = 'تم التبرع';
        if (st) { st.classList.remove('hmr-st-ok', 'hmr-st-wait'); st.classList.add((st.textContent || '').trim() === 'تم التبرع' ? 'hmr-st-ok' : 'hmr-st-wait'); }
        if (tr.querySelector('.hmr-rbtn,.hmr-wait')) return;
        var a = null, as = tr.querySelectorAll('a');
        for (var i = 0; i < as.length; i++) if (/\/invoice/.test(as[i].getAttribute('href') || '')) { a = as[i]; break; }
        var o = a && orderFromPath(a.getAttribute('href'));
        if (!o) return;
        var b = el('button', 'hmr-rbtn'); b.type = 'button';
        b.appendChild(icon()); b.appendChild(document.createTextNode('الإيصال'));
        b.querySelector('svg').setAttribute('width', '16'); b.querySelector('svg').setAttribute('height', '16');
        b.onclick = function () { open(o); };
        a.parentNode.appendChild(b);
        /* غير المدفوع: «بانتظار الدفع» بدل الزر (قرار عبدالله 2026-11-25 13:47) */
        fetch('/api/v1/orders/' + o + '/invoice', {headers: {Accept: 'application/json'}})
          .then(function (r) { return r.json(); })
          .then(function (j) {
            var od = j && (j.order || (j.data && j.data.order));
            if (od && String(od.payment_status || '').toLowerCase() !== 'paid' && b.isConnected) {
              var w = el('span', 'hmr-wait', 'بانتظار الدفع'); b.replaceWith(w);
            }
          }).catch(function () {});   // عند الخطأ يبقى الزر
      });
    };
    fill(); setTimeout(fill, 800); setTimeout(fill, 2500); setTimeout(fill, 6000);
    var tm = 0; try { new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(fill, 150); }).observe(document.body, {childList: true, subtree: true}); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', route); else route();
  window.addEventListener('hashchange', route);
})();
