'use strict';

var _nextNum = 0
function genUID(){
    /*Return an identifier that has never before been returned by
    genUID()*/
    _nextNum += 1;
    return 'id'+_nextNum;
}

if (typeof(module) !== 'undefined') {
  module.exports = {
    'genUID': genUID
  };
}
