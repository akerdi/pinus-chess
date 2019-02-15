import GMResponse from '../../../game/GMResponse'
import { Application, BackendSession, ChannelService } from 'pinus'
import DouniuRoom from '../../../game/DouniuRoom';
import mysqlHelper from '../../../dao/mysqlHelper';

export default function (app:Application) {
    return new Handler(app);
}

export class Handler {
    private channelService:ChannelService;
    constructor (private app:Application) {
        this.app = app;
        this.channelService = app.get("channelService");
    }

    public async chipIn(msg:{userid:string, gold:number, pkindex:number}, session:BackendSession) {
        let userid = msg.userid;
        let gold = msg.gold;
        let pkindex = msg.pkindex;
        let channel = this.channelService.getChannel("brnn", false);
        if (!channel) {
            return GMResponse(-101, "未找到房间")
        }
        let room:DouniuRoom = channel["gameRoom"];
        let sqlHelper:mysqlHelper = this.app.get("sqlHelper")
        try {
            let userinfo:any = await sqlHelper.asyncQueryUserInfo(userid);
            let cpr = room.chipIn(userid, gold, pkindex, userinfo.gold);
            return GMResponse(1, "ok", cpr);
        } catch (error) {
            return GMResponse(-105, "下次失败，可能余额不够");
        }
    }
}