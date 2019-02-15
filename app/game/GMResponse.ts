
export default function(code, msg, data?:any) {
    return {
        code: code,
        msg: msg,
        data: data ? data : ""
        
    };
};