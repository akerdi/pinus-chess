import UToken from '../../../game/UToken'
import GMResponse from '../../../game/GMResponse'
import RoomManager from '../../../game/RoomManager'
import { Application, FrontendSession, BackendSession } from 'pinus';
import mysqlHelper from '../../../dao/mysqlHelper';

export default function (app: Application) {
    return new Handler(app);
}

export class Handler {
    constructor(private app: Application) {
        this.app = app;
    }

    async enterRoom(msg:{token:string, rtype:string}, session:FrontendSession) {
        let tokenStr = msg.token;
        let token = new UToken();
        token.decrypt(tokenStr);
        let sessionService = this.app.get("sessionService");
        if (token.isValid() == false) {
            sessionService.kickBySessionId(session.id);
            return {
                code: -102,
                msg: "无效的token"
            }
        }

        if (msg.rtype == "brnn") {
            let rid = msg.rtype;
            if (!sessionService.getByUid(token.userid)) {
                session.bind(token.userid, function (err:Error, result) {
                    console.log("session bind token id error: ", err.stack);
                });
                session.set("rid", rid);
                session.push("rid", function (err) {
                    if (err) {
                        console.error("set rid for session service fail:::error:", err.stack)
                    }
                });
                session.on("closed", this.brnnOnUserLeave.bind(this));

            }
            ///////
            let users = await this.app.rpc.brnn.brnnRemote.add.route(session)(token.userid, this.app.get("serverId"), msg.rtype, true);
            return {
                users: users
            }
        }
    }

    brnnOnUserLeave(session:FrontendSession) {
        if (!session || !session.uid) {
            return ;
        }
        this.app.rpc.brnn.brnnRemote.exit.route(session)(session.uid, this.app.get("serverId"), session.get("rid"))
    }

    async exit(msg, session:FrontendSession) {
        ///////
        let res = await this.app.rpc.brnn.brnnRemote.exit.route(session)(session.uid, this.app.get("serverId"), session.get("rid"))
        return {
            res: res
        }
    }

    async fetchRoomInfo(msg:{rtype:string}, session:FrontendSession) {
        let sqlHelper:mysqlHelper = this.app.get("sqlHelper");
        RoomManager.fetchRoomInfo(sqlHelper, msg.rtype, function (error, roomsData) {
            if (error) {
                return GMResponse(-100, "获取房间信息失败", error);
            } else {
                return GMResponse(1, "OK", roomsData);
            }
        })
    }

    async createRoom(msg:{token:string, userid:string, rtype:string}, session:FrontendSession) {
        let tokenStr = msg.token;
        let token = new UToken;
        token.decrypt(tokenStr);
        let sessionService = this.app.get("sessionService");
        if (token.isValid() == false) {
            sessionService.kickBySessionId(session.id);
            return {
                code: -102,
                msg: "无效的token"
            }
        }
        if (!sessionService.getByUid(token.userid)) {
            session.bind(token.userid, function (err, result) {
                console.error("error: ", err.stack);
            });
            session.on("closed", this.exitGame.bind(this));
        }
        let sqlHelper:mysqlHelper = this.app.get("sqlHelper");
        let self = this;
        RoomManager.fetchRoomCreatedByUser(sqlHelper, msg.userid, function (error, roomdata) {
            if (error) {
                let response = GMResponse(-100, "获取该用户创建的")
                return response;
            }
            if (roomdata) {
                let response = GMResponse(2, "不能重复创建房间", roomdata)
                return response;
            } else {
                RoomManager.createRoom(sqlHelper, msg.rtype, msg.userid,
                    function (error, roomdata) {
                        if (error) {
                            let response = GMResponse(-100, "创建房间", error);
                            return response;
                        } else {
                            
                        }
                    })
            }
        })
    }

    exitGame(session:FrontendSession) {
        if (!session || !session.uid) {
            return ;
        }
        if (session.get("rtype") == "brnn") {
            this.app.rpc.brnn.brnnRemote.exit(session, session.uid, this.app.get("serverId"), session.get("rtype"), null);
        }
    }

    public async joinRoom(msg:{rtype:string, token:string, userid:string, roomid:string}, session:FrontendSession) {
        let tokenStr = msg.token;
        let token = new UToken;
        token.decrypt(tokenStr);
        let sessionService = this.app.get("sessionService");
        if (token.isValid() == false) {
            sessionService.kickBySessionId(session.id);
            return {
                code: -102,
                msg: "无效的token"
            }
        }
        if (!sessionService.getByUid(token.userid)) {
            session.bind(token.userid, function (err, result) {
                console.log("session bind token.userid fail:::", err.stack);
            })
            session.on("closed", this.exitGame.bind(this));
        }
        session.set("roomid", msg.roomid);
        session.set("rtype", msg.rtype);
        session.pushAll(function (err) {
            console.error(err);
        });
        if (msg.rtype == "brnn") {
            return await this.app.rpc.brnn.brnnRemote.add.route(session)(token.userid, this.app.get("serverId"), msg.rtype, true);
        }
    }

    public async fetchUserInfo(msg:{userList:any[]}, session:FrontendSession) {
        let uidArr = msg.userList;
        let sqlHelper:mysqlHelper = this.app.get("sqlHelper");
        RoomManager.fetchUserInfo(sqlHelper, uidArr,
            function (error, results) {
                return GMResponse(1, "获取用户信息成功", results);
            })
    }


    /**
     * New client entry.
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     * @param  {Function} next    next step callback
     * @return {Void}
     */
    async entry(msg: any, session: FrontendSession) {
        return { code: 200, msg: 'game server is ok.' };
    }

    /**
     * Publish route for mqtt connector.
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     * @param  {Function} next    next step callback
     * @return {Void}
     */
    async publish(msg: any, session: FrontendSession) {
        let result = {
            topic: 'publish',
            payload: JSON.stringify({ code: 200, msg: 'publish message is ok.' })
        };
        return result;
    }

    /**
     * Subscribe route for mqtt connector.
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     * @param  {Function} next    next step callback
     * @return {Void}
     */
    async subscribe(msg: any, session: FrontendSession) {
        let result = {
            topic: 'subscribe',
            payload: JSON.stringify({ code: 200, msg: 'subscribe message is ok.' })
        };
        return result;
    }

}