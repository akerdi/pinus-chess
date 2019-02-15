"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RoomManager {
    static fetchRoomInfo(sqlHelper, rtype, callback) {
        let sql = `select * from t_room where rtype = '${rtype}' limit 6;`;
        sqlHelper.query(sql, null, (error, results) => {
            callback(error, results);
        });
    }
    static fetchRoomCreatedByUser(sqlHelper, userid, callback) {
        let sql = `select * from t_room where creator = '${userid}';`;
        sqlHelper.query(sql, null, (error, results, fields) => {
            if (callback) {
                let roomdata = null;
                if (results) {
                    roomdata = results[0];
                }
                callback(error, roomdata);
            }
        });
    }
    static fetchRoomJoinedByUser(sqlHelper, userid, callback) {
        let sql = `select * from t_room where users like '%${userid}%';`;
        sqlHelper.query(sql, null, (error, results, fields) => {
            if (callback) {
                let roomdata = null;
                if (results) {
                    roomdata = results[0];
                }
                callback(error, roomdata);
            }
        });
    }
    static createRoom(sqlHelper, rtype, userid, callback) {
        let time = new Date().getTime();
        let params = {
            rtype: rtype,
            createtime: time,
            creator: userid,
            cost: 1,
            state: 0
        };
        let sql = 'insert into t_room SET ?';
        sqlHelper.query(sql, params, (error, results, fields) => {
            if (error) {
                callback(error, results);
            }
            else {
                this.fetchRoomCreatedByUser(sqlHelper, userid, callback);
            }
        });
    }
    static fetchUserInfo(sqlHelper, uidArr, callback) {
        let uidstring = uidArr.join(",");
        let sql = `select * from t_user where userid in (${uidstring})`;
        sqlHelper.query(sql, null, (error, results, fields) => {
            callback(error, results);
        });
    }
}
exports.default = RoomManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbU1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvZ2FtZS9Sb29tTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBO0lBQ1csTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFxQixFQUFFLEtBQUssRUFBRSxRQUFRO1FBQzlELElBQUksR0FBRyxHQUFHLHVDQUF1QyxLQUFLLFlBQVksQ0FBQztRQUNuRSxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFDMUMsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFFTSxNQUFNLENBQUMsc0JBQXNCLENBQUMsU0FBcUIsRUFBRSxNQUFhLEVBQUUsUUFBaUI7UUFDeEYsSUFBSSxHQUFHLEdBQUcseUNBQXlDLE1BQU0sSUFBSSxDQUFDO1FBQzlELFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbEQsSUFBSSxRQUFRLEVBQUU7Z0JBQ1YsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUNwQixJQUFJLE9BQU8sRUFBRTtvQkFDVCxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN6QjtnQkFDRCxRQUFRLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQzdCO1FBQ0wsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDO0lBRU0sTUFBTSxDQUFDLHFCQUFxQixDQUFDLFNBQXFCLEVBQUUsTUFBYSxFQUFFLFFBQVE7UUFDOUUsSUFBSSxHQUFHLEdBQUcsMkNBQTJDLE1BQU0sS0FBSyxDQUFDO1FBQ2pFLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbEQsSUFBSSxRQUFRLEVBQUU7Z0JBQ1YsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUNwQixJQUFJLE9BQU8sRUFBRTtvQkFDVCxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN6QjtnQkFDRCxRQUFRLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQzdCO1FBQ0wsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDO0lBRU0sTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFxQixFQUFFLEtBQVksRUFBRSxNQUFhLEVBQUUsUUFBaUI7UUFDMUYsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoQyxJQUFJLE1BQU0sR0FBRztZQUNULEtBQUssRUFBRSxLQUFLO1lBQ1osVUFBVSxFQUFFLElBQUk7WUFDaEIsT0FBTyxFQUFFLE1BQU07WUFDZixJQUFJLEVBQUUsQ0FBQztZQUNQLEtBQUssRUFBRSxDQUFDO1NBQ1gsQ0FBQztRQUNGLElBQUksR0FBRyxHQUFHLDBCQUEwQixDQUFDO1FBQ3JDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDcEQsSUFBSSxLQUFLLEVBQUU7Z0JBQ1AsUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQzthQUM1QjtpQkFBTTtnQkFDSCxJQUFJLENBQUMsc0JBQXNCLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQzthQUM1RDtRQUNMLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQUVNLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBcUIsRUFBRSxNQUFNLEVBQUUsUUFBaUI7UUFDeEUsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQyxJQUFJLEdBQUcsR0FBRyx5Q0FBeUMsU0FBUyxHQUFHLENBQUM7UUFDaEUsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNsRCxRQUFRLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztDQUNKO0FBNURELDhCQTREQyJ9