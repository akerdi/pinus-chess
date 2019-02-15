/**
 * 服务器返回信息简单封装
 */

var MResponse = function (data) {
    this.data = data['data'];
    this.code = data['code'];
    this.msg = data['msg'];
}

// 
MResponse.prototype.hasError = function () {
    return this.code <= 0;
}

// 
MResponse.prototype.isOK = function () {
    return this.code > 0;
}

// 
module.exports = MResponse;