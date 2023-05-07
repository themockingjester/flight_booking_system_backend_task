const resultObject = (success,message,data,code)=>{
    return {
        success,message,data,code
    }
}

const responseBody = (success,message,data,code)=>{
    return {
        success,message,data,code
    }
}

module.exports = {
    responseBody,resultObject
}
