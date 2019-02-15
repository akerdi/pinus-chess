"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const UToken_1 = require("../../../game/UToken");
const GMResponse_1 = require("../../../game/GMResponse");
function default_1(app) {
    return new GateHandler(app);
}
exports.default = default_1;
class GateHandler {
    constructor(app) {
        this.app = app;
    }
    queryEntry(msg, session) {
        return __awaiter(this, void 0, void 0, function* () {
            let userid = msg.userid;
            if (!userid) {
                return {
                    code: 500
                };
            }
            let connectors = this.app.getServersByType("connector");
            if (!connectors || connectors.length === 0) {
                return {
                    code: 500
                };
            }
            let result = connectors[0];
            return {
                code: 200,
                host: result.host,
                port: result.clientPort
            };
        });
    }
    guestLogin(msg, session) {
        return __awaiter(this, void 0, void 0, function* () {
            let sqlHelper = this.app.get("sqlHelper");
            try {
                let userInfo = yield sqlHelper.guestLogin();
                let tokenString = new UToken_1.default(userInfo.userid).encrypt();
                let connectors = this.app.getServersByType("connector");
                if (!connectors || connectors.length === 0) {
                    let response = GMResponse_1.default(-103, "can't find connectors");
                    return response;
                }
                let result = connectors[0];
                let data = {
                    userinfo: userInfo,
                    token: tokenString,
                    localConnector: { host: result.host, port: result.clientPort },
                    remoteConnector: { host: '127.0.0.1', port: result.clientPort }
                };
                let response = GMResponse_1.default(1, "ok", data);
                return response;
            }
            catch (error) {
                return {
                    code: -101,
                    msg: "guest login fail, please retry"
                };
            }
        });
    }
    refreshToken(msg, session) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokenStr = msg.token;
            let token = new UToken_1.default();
            token.decrypt(tokenStr);
            if (token.isValid() == false) {
                return GMResponse_1.default(-101, '非法token');
            }
            token.refresh();
            let sqlHelper = this.app.get("sqlHelper");
            sqlHelper.queryUserInfo(token.userid, function (err, userInfo) {
                if (userInfo) {
                    let connectors = this.app.getServersByType("connector");
                    if (!connectors || connectors.length === 0) {
                        let response = GMResponse_1.default(-103, "没有找到connector");
                        return response;
                    }
                    let res = connectors[0];
                    let tokenString = token.encrypt();
                    let data = {
                        userinfo: userInfo,
                        token: tokenString,
                        localConnector: { host: res.host, port: res.clientPort },
                        remoteConnector: { host: "127.0.0.1", port: res.clientPort }
                    };
                    let response = GMResponse_1.default(1, 'ok', data);
                    return response;
                }
                else {
                    return GMResponse_1.default(-102, "无此用户数据");
                }
            }.bind(this));
        });
    }
}
exports.GateHandler = GateHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2F0ZUhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nYXRlL2hhbmRsZXIvZ2F0ZUhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLGlEQUF5QztBQUN6Qyx5REFBaUQ7QUFLakQsbUJBQXlCLEdBQWU7SUFDcEMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRkQsNEJBRUM7QUFFRDtJQUNJLFlBQW9CLEdBQWU7UUFBZixRQUFHLEdBQUgsR0FBRyxDQUFZO0lBRW5DLENBQUM7SUFFSyxVQUFVLENBQUMsR0FBbUIsRUFBRSxPQUFzQjs7WUFDeEQsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUN4QixJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNULE9BQU87b0JBQ0gsSUFBSSxFQUFFLEdBQUc7aUJBQ1osQ0FBQTthQUNKO1lBQ0QsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN4QyxPQUFPO29CQUNILElBQUksRUFBRSxHQUFHO2lCQUNaLENBQUE7YUFDSjtZQUNELElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixPQUFPO2dCQUNILElBQUksRUFBRSxHQUFHO2dCQUNULElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtnQkFDakIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxVQUFVO2FBQzFCLENBQUE7UUFDTCxDQUFDO0tBQUE7SUFFSyxVQUFVLENBQUMsR0FBTyxFQUFFLE9BQXNCOztZQUM1QyxJQUFJLFNBQVMsR0FBZSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FB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