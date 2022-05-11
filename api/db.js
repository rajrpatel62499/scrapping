const { default: axios } = require("axios");

const config = {
    userName: 'examsnetuser1@yopmail.com', 
    password: 'admin@123',
    backendUrl: 'https://v1-dev-backend.tryjackett.com'
}

const loginToDB = async () => {
    const loginUrl = `${config.backendUrl}/api/v1/auth/login`;
    const headers = {
        'Content-type': 'application/json',
    }
    
    const payload = {
        username: config.userName, 
        password: config.password
    }

    const loginCall = () => axios({
        url: loginUrl, 
        method: 'post',
        headers: headers,
        data: JSON.stringify(payload)
    });


    try {
        const res = await loginCall();
        return res.data.data; 
    } catch (error) {
        console.error(error);
        return false;
    }
}


loginToDB().then(res => {
    console.log(res);
    if (res) {
        console.log("LOGGED IN");
    }
})

module.exports = {loginToDB};

