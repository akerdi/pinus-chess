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
const DouniuRoom_1 = require("../../../game/DouniuRoom");
const GMResponse_1 = require("../../../game/GMResponse");
function default_1(app) {
    return new BrnnRemote(app);
}
exports.default = default_1;
class BrnnRemote {
    constructor(app) {
        this.app = app;
        this.app = app;
        this.channelService = app.get("channelService");
    }
    add(userid, sid, name, flag) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = this.channelService.getChannel(name, flag);
            let param = {
                route: "brnn.onAdd",
                userid: userid
            };
            channel.pushMessage(param.route, param);
            if (!!channel) {
                if (!channel["gameRoom"]) {
                    let sqlHelper = this.app.get("sqlHelper");
                    let room = new DouniuRoom_1.default(channel, sqlHelper);
                    channel["gameRoom"] = room;
                    room.startGame();
                }
                channel.add(userid, sid);
                let room = channel["gameRoom"];
                room.joinUser(userid);
            }
            let users = this.get(name, flag);
            return GMResponse_1.default(1, "加入房间成功", users);
        });
    }
    get(name, flag) {
        let users = [];
        let channel = this.channelService.getChannel(name, flag);
        if (!!channel) {
            users = channel.getMembers();
        }
        return users;
    }
    kick(userid, sid, name) {
        return __awaiter(this, void 0, void 0, function* () {
            let channel = this.channelService.getChannel(name, false);
            if (!!channel) {
                channel.leave(userid, sid);
                let gameRoom = channel["gameRoom"];
                gameRoom.kickUser(userid);
            }
            let param = {
                route: "brnn.onLeave",
                user: userid
            };
            channel.pushMessage(param.route, param);
        });
    }
    exit(userid, sid, roomid) {
        return __awaiter(this, void 0, void 0, function* () {
            let channelService = this.app.get("channelService");
            let channel = channelService.getChannel(roomid, false);
            if (!channel) {
                return {
                    code: 0,
                    msg: "未找到指定房间"
                };
            }
            channel.leave(userid, sid);
            let gameRoom = channel["gameRoom"];
            gameRoom.kickUser(userid);
            if (channel.getUserAmount() == 0) {
                gameRoom.destroy();
                channel["gameRoom"] = null;
                channel.destroy();
                console.log("房间被释放成功");
                return {
                    code: 1,
                    msg: "离开房间，房间被销毁"
                };
            }
            else {
                channel.pushMessage("brnn.onLeave", {
                    code: 1,
                    msg: "有用户离开房间",
                    data: {
                        userid: userid
                    }
                });
                return {
                    code: 1,
                    msg: '离开房间'
                };
            }
        });
    }
}
exports.BrnnRemote = BrnnRemote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJublJlbW90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2Jybm4vcmVtb3RlL2Jybm5SZW1vdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHlEQUFpRDtBQUNqRCx5REFBaUQ7QUFJakQsbUJBQXlCLEdBQWU7SUFDcEMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBRkQsNEJBRUM7QUFVRDtJQUVJLFlBQXFCLEdBQWU7UUFBZixRQUFHLEdBQUgsR0FBRyxDQUFZO1FBQ2hDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVZLEdBQUcsQ0FBQyxNQUFhLEVBQUUsR0FBVSxFQUFFLElBQVcsRUFBRSxJQUFZOztZQUNqRSxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekQsSUFBSSxLQUFLLEdBQUc7Z0JBQ1IsS0FBSyxFQUFFLFlBQVk7Z0JBQ25CLE1BQU0sRUFBRSxNQUFNO2FBQ2pCLENBQUE7WUFDRCxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFO2dCQUNYLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ3RCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUMxQyxJQUFJLElBQUksR0FBRyxJQUFJLG9CQUFVLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUM5QyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDO29CQUMzQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7aUJBQ3BCO2dCQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUN6QixJQUFJLElBQUksR0FBYyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7Z0JBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDekI7WUFDRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNqQyxPQUFPLG9CQUFVLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxQyxDQUFDO0tBQUE7SUFFTyxHQUFHLENBQUMsSUFBVyxFQUFFLElBQVk7UUFDakMsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRTtZQUNYLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDaEM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRVksSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSTs7WUFDL0IsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRTtnQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxRQUFRLEdBQWUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUMvQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFBO2FBQzVCO1lBQ0QsSUFBSSxLQUFLLEdBQUc7Z0JBQ1IsS0FBSyxFQUFFLGNBQWM7Z0JBQ3JCLElBQUksRUFBRSxNQUFNO2FBQ2YsQ0FBQTtZQUNELE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QyxDQUFDO0tBQUE7SUFFWSxJQUFJLENBQUMsTUFBYSxFQUFFLEdBQVUsRUFBRSxNQUFVOztZQUNuRCxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3BELElBQUksT0FBTyxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ1YsT0FBTztvQkFDSCxJQUFJLEVBQUUsQ0FBQztvQkFDUCxHQUFHLEVBQUUsU0FBUztpQkFDakIsQ0FBQTthQUNKO1lBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDM0IsSUFBSSxRQUFRLEdBQWMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFBO1lBQzdDLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUIsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUM5QixRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ25CLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUM7Z0JBQzNCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDdkIsT0FBTztvQkFDSCxJQUFJLEVBQUUsQ0FBQztvQkFDUCxHQUFHLEVBQUUsWUFBWTtpQkFDcEIsQ0FBQTthQUNKO2lCQUFNO2dCQUNILE9BQU8sQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFO29CQUNoQyxJQUFJLEVBQUUsQ0FBQztvQkFDUCxHQUFHLEVBQUUsU0FBUztvQkFDZCxJQUFJLEVBQUU7d0JBQ0YsTUFBTSxFQUFFLE1BQU07cUJBQ2pCO2lCQUNKLENBQUMsQ0FBQTtnQkFDRixPQUFPO29CQUNILElBQUksRUFBRSxDQUFDO29CQUNQLEdBQUcsRUFBRSxNQUFNO2lCQUNkLENBQUE7YUFDSjtRQUNMLENBQUM7S0FBQTtDQUNKO0FBdkZELGdDQXVGQyJ9