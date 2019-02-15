import MySqlHelper from '../dao/mysqlHelper'

export default class RoomManager {
    public static fetchRoomInfo(sqlHelper:MySqlHelper, rtype, callback) {
        let sql = `select * from t_room where rtype = '${rtype}' limit 6;`;
        sqlHelper.query(sql, null, (error, results) => {
            callback(error, results);
        })
    }

    public static fetchRoomCreatedByUser(sqlHelper:MySqlHelper, userid:string, callback:Function) {
        let sql = `select * from t_room where creator = '${userid}';`;
        sqlHelper.query(sql, null, (error, results, fields) => {
            if (callback) {
                let roomdata = null;
                if (results) {
                    roomdata = results[0];
                }
                callback(error, roomdata);
            }
        })
    }

    public static fetchRoomJoinedByUser(sqlHelper:MySqlHelper, userid:string, callback) {
        let sql = `select * from t_room where users like '%${userid}%';`;
        sqlHelper.query(sql, null, (error, results, fields) => {
            if (callback) {
                let roomdata = null;
                if (results) {
                    roomdata = results[0];
                }
                callback(error, roomdata);
            }
        })
    }

    public static createRoom(sqlHelper:MySqlHelper, rtype:string, userid:string, callback:Function) {
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
            } else {
                this.fetchRoomCreatedByUser(sqlHelper, userid, callback);
            }
        }) 
    }

    public static fetchUserInfo(sqlHelper:MySqlHelper, uidArr, callback:Function) {
        let uidstring = uidArr.join(",");
        let sql = `select * from t_user where userid in (${uidstring})`;
        sqlHelper.query(sql, null, (error, results, fields) => {
            callback(error, results);
        })
    }
}