import UToken from '../../../game/UToken'
import GMResponse from '../../../game/GMResponse'
import { Application, BackendSession } from 'pinus'
import mysqlHelper from '../../../dao/mysqlHelper';
import { userInfo } from 'os';

export default function (app:Application) {
    return new GateHandler(app);
}

export class GateHandler {
    constructor(private app:Application) {

    }

    async queryEntry(msg:{userid:string}, session:BackendSession) {
        let userid = msg.userid;
        if (!userid) {
            return {
                code: 500
            }
        }
        let connectors = this.app.getServersByType("connector");
        if (!connectors || connectors.length === 0) {
            return {
                code: 500
            }
        }
        let result = connectors[0];
        return {
            code: 200,
            host: result.host,
            port: result.clientPort
        }
    }

    async guestLogin(msg:any, session:BackendSession) {
        let sqlHelper:mysqlHelper = this.app.get("sqlHelper");
        try {
            let userInfo:any = await sqlHelper.guestLogin();
            let tokenString = new UToken(userInfo.userid).encrypt();
            let connectors = this.app.getServersByType("connector");
                if (!connectors || connectors.length === 0) {
                    let response = GMResponse(-103, "can't find connectors");
                    return response
                }
                let result = connectors[0];
                let data = {
                    userinfo: userInfo,
                    token: tokenString,
                    localConnector: { host: result.host, port: result.clientPort },
                    remoteConnector: { host: '127.0.0.1', port: result.clientPort }
                };
                let response = GMResponse(1, "ok", data);
                return response;
        } catch (error) {
            return {
                code: -101,
                msg: "guest login fail, please retry"
            };
        }
    }

    async refreshToken(msg:{ token:string }, session:BackendSession) {
        let tokenStr = msg.token;
        let token = new UToken();
        token.decrypt(tokenStr);
        if (token.isValid() == false) {
            return GMResponse(-101, '非法token');
        }
        token.refresh();

        let sqlHelper:mysqlHelper = this.app.get("sqlHelper");
        sqlHelper.queryUserInfo(token.userid, function (err, userInfo) {
            if (userInfo) {
                let connectors = this.app.getServersByType("connector");
                if (!connectors || connectors.length === 0) {
                    let response = GMResponse(-103, "没有找到connector");
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
                let response = GMResponse(1, 'ok', data);
                return response;
            } else {
                return GMResponse(-102, "无此用户数据");
            }
        }.bind(this));
    }
}