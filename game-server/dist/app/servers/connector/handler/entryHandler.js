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
const RoomManager_1 = require("../../../game/RoomManager");
function default_1(app) {
    return new Handler(app);
}
exports.default = default_1;
class Handler {
    constructor(app) {
        this.app = app;
        this.app = app;
    }
    enterRoom(msg, session) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokenStr = msg.token;
            let token = new UToken_1.default();
            token.decrypt(tokenStr);
            let sessionService = this.app.get("sessionService");
            if (token.isValid() == false) {
                sessionService.kickBySessionId(session.id);
                return {
                    code: -102,
                    msg: "无效的token"
                };
            }
            if (msg.rtype == "brnn") {
                let rid = msg.rtype;
                if (!sessionService.getByUid(token.userid)) {
                    session.bind(token.userid, function (err, result) {
                        console.log("session bind token id error: ", err.stack);
                    });
                    session.set("rid", rid);
                    session.push("rid", function (err) {
                        if (err) {
                            console.error("set rid for session service fail:::error:", err.stack);
                        }
                    });
                    session.on("closed", this.brnnOnUserLeave.bind(this));
                }
                ///////
                let users = yield this.app.rpc.brnn.brnnRemote.add.route(session)(token.userid, this.app.get("serverId"), msg.rtype, true);
                return {
                    users: users
                };
            }
        });
    }
    brnnOnUserLeave(session) {
        if (!session || !session.uid) {
            return;
        }
        this.app.rpc.brnn.brnnRemote.exit.route(session)(session.uid, this.app.get("serverId"), session.get("rid"));
    }
    exit(msg, session) {
        return __awaiter(this, void 0, void 0, function* () {
            ///////
            let res = yield this.app.rpc.brnn.brnnRemote.exit.route(session)(session.uid, this.app.get("serverId"), session.get("rid"));
            return {
                res: res
            };
        });
    }
    fetchRoomInfo(msg, session) {
        return __awaiter(this, void 0, void 0, function* () {
            let sqlHelper = this.app.get("sqlHelper");
            RoomManager_1.default.fetchRoomInfo(sqlHelper, msg.rtype, function (error, roomsData) {
                if (error) {
                    return GMResponse_1.default(-100, "获取房间信息失败", error);
                }
                else {
                    return GMResponse_1.default(1, "OK", roomsData);
                }
            });
        });
    }
    createRoom(msg, session) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokenStr = msg.token;
            let token = new UToken_1.default;
            token.decrypt(tokenStr);
            let sessionService = this.app.get("sessionService");
            if (token.isValid() == false) {
                sessionService.kickBySessionId(session.id);
                return {
                    code: -102,
                    msg: "无效的token"
                };
            }
            if (!sessionService.getByUid(token.userid)) {
                session.bind(token.userid, function (err, result) {
                    console.error("error: ", err.stack);
                });
                session.on("closed", this.exitGame.bind(this));
            }
            let sqlHelper = this.app.get("sqlHelper");
            let self = this;
            RoomManager_1.default.fetchRoomCreatedByUser(sqlHelper, msg.userid, function (error, roomdata) {
                if (error) {
                    let response = GMResponse_1.default(-100, "获取该用户创建的");
                    return response;
                }
                if (roomdata) {
                    let response = GMResponse_1.default(2, "不能重复创建房间", roomdata);
                    return response;
                }
                else {
                    RoomManager_1.default.createRoom(sqlHelper, msg.rtype, msg.userid, function (error, roomdata) {
                        if (error) {
                            let response = GMResponse_1.default(-100, "创建房间", error);
                            return response;
                        }
                        else {
                        }
                    });
                }
            });
        });
    }
    exitGame(session) {
        if (!session || !session.uid) {
            return;
        }
        if (session.get("rtype") == "brnn") {
            this.app.rpc.brnn.brnnRemote.exit(session, session.uid, this.app.get("serverId"), session.get("rtype"), null);
        }
    }
    joinRoom(msg, session) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokenStr = msg.token;
            let token = new UToken_1.default;
            token.decrypt(tokenStr);
            let sessionService = this.app.get("sessionService");
            if (token.isValid() == false) {
                sessionService.kickBySessionId(session.id);
                return {
                    code: -102,
                    msg: "无效的token"
                };
            }
            if (!sessionService.getByUid(token.userid)) {
                session.bind(token.userid, function (err, result) {
                    console.log("session bind token.userid fail:::", err.stack);
                });
                session.on("closed", this.exitGame.bind(this));
            }
            session.set("roomid", msg.roomid);
            session.set("rtype", msg.rtype);
            session.pushAll(function (err) {
                console.error(err);
            });
            if (msg.rtype == "brnn") {
                return yield this.app.rpc.brnn.brnnRemote.add.route(session)(token.userid, this.app.get("serverId"), msg.rtype, true);
            }
        });
    }
    fetchUserInfo(msg, session) {
        return __awaiter(this, void 0, void 0, function* () {
            let uidArr = msg.userList;
            let sqlHelper = this.app.get("sqlHelper");
            RoomManager_1.default.fetchUserInfo(sqlHelper, uidArr, function (error, results) {
                return GMResponse_1.default(1, "获取用户信息成功", results);
            });
        });
    }
    /**
     * New client entry.
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     * @param  {Function} next    next step callback
     * @return {Void}
     */
    entry(msg, session) {
        return __awaiter(this, void 0, void 0, function* () {
            return { code: 200, msg: 'game server is ok.' };
        });
    }
    /**
     * Publish route for mqtt connector.
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     * @param  {Function} next    next step callback
     * @return {Void}
     */
    publish(msg, session) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = {
                topic: 'publish',
                payload: JSON.stringify({ code: 200, msg: 'publish message is ok.' })
            };
            return result;
        });
    }
    /**
     * Subscribe route for mqtt connector.
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     * @param  {Function} next    next step callback
     * @return {Void}
     */
    subscribe(msg, session) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = {
                topic: 'subscribe',
                payload: JSON.stringify({ code: 200, msg: 'subscribe message is ok.' })
            };
            return result;
        });
    }
}
exports.Handler = Handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29ubmVjdG9yL2hhbmRsZXIvZW50cnlIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxpREFBeUM7QUFDekMseURBQWlEO0FBQ2pELDJEQUFtRDtBQUluRCxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRkQsNEJBRUM7QUFFRDtJQUNJLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7UUFDaEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQUVLLFNBQVMsQ0FBQyxHQUFnQyxFQUFFLE9BQXVCOztZQUNyRSxJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO1lBQ3pCLElBQUksS0FBSyxHQUFHLElBQUksZ0JBQU0sRUFBRSxDQUFDO1lBQ3pCLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDeEIsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNwRCxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxLQUFLLEVBQUU7Z0JBQzFCLGNBQWMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMzQyxPQUFPO29CQUNILElBQUksRUFBRSxDQUFDLEdBQUc7b0JBQ1YsR0FBRyxFQUFFLFVBQVU7aUJBQ2xCLENBQUE7YUFDSjtZQUVELElBQUksR0FBRyxDQUFDLEtBQUssSUFBSSxNQUFNLEVBQUU7Z0JBQ3JCLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEtBQUss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