import DouniuRoom from '../../../game/DouniuRoom'
import GMResponse from '../../../game/GMResponse'

import { Application, ChannelService, FrontendSession, RemoterClass } from 'pinus'

export default function (app:Application) {
    return new BrnnRemote(app);
}

declare global {
    interface UserRpc {
        brnn: {
            brnnRemote: RemoterClass<FrontendSession, BrnnRemote>;
        }
    }
}

export class BrnnRemote {
    private channelService:ChannelService;
    constructor (private app:Application) {
        this.app = app;
        this.channelService = app.get("channelService");
    }

    public async add(userid:string, sid:string, name:string, flag:boolean) {
        let channel = this.channelService.getChannel(name, flag);
        let param = {
            route: "brnn.onAdd",
            userid: userid
        }
        channel.pushMessage(param.route, param);
        if (!!channel) {
            if (!channel["gameRoom"]) {
                let sqlHelper = this.app.get("sqlHelper");
                let room = new DouniuRoom(channel, sqlHelper);
                channel["gameRoom"] = room;
                room.startGame();
            }
            channel.add(userid, sid);
            let room:DouniuRoom = channel["gameRoom"]
            room.joinUser(userid);
        }
        let users = this.get(name, flag);
        return GMResponse(1, "加入房间成功", users);
    }

    private get(name:string, flag:boolean) {
        let users = [];
        let channel = this.channelService.getChannel(name, flag);
        if (!!channel) {
            users = channel.getMembers();
        }
        return users;
    }

    public async kick(userid, sid, name) {
        let channel = this.channelService.getChannel(name, false);
        if (!!channel) {
            channel.leave(userid, sid);
            let gameRoom = <DouniuRoom>channel["gameRoom"];
            gameRoom.kickUser(userid)
        }
        let param = {
            route: "brnn.onLeave",
            user: userid
        }
        channel.pushMessage(param.route, param);
    }

    public async exit(userid:string, sid:string, roomid:any) {
        let channelService = this.app.get("channelService");
        let channel = channelService.getChannel(roomid, false);
        if (!channel) {
            return {
                code: 0,
                msg: "未找到指定房间"
            }
        }
        channel.leave(userid, sid);
        let gameRoom:DouniuRoom = channel["gameRoom"]
        gameRoom.kickUser(userid);
        if (channel.getUserAmount() == 0) {
            gameRoom.destroy();
            channel["gameRoom"] = null;
            channel.destroy();
            console.log("房间被释放成功");
            return {
                code: 1,
                msg: "离开房间，房间被销毁"
            }
        } else {
            channel.pushMessage("brnn.onLeave", {
                code: 1,
                msg: "有用户离开房间",
                data: {
                    userid: userid
                }
            })
            return {
                code: 1,
                msg: '离开房间'
            }
        }
    }
}