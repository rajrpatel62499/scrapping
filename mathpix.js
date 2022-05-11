const { default: axios } = require("axios");

const url = 'https://api.mathpix.com/v3/text';



const convertImageToMathml = (base64) => {
    const imgUrl = `data:image/png;base64,${base64}`

    const headers = {
        app_id: 'e0036818_u_nus_edu_5c5a56_2375f0',
        app_key: '7f07985f0c117c53eef8',
        'Content-type': 'application/json',
    };
    const body = {
        src: imgUrl,
        formats: ['text', 'data', 'html'],
        data_options: {
            include_mathml: true,
        },
    };

    
    return axios({
        url: url,
        method: 'post',
        headers: headers,
        data: JSON.stringify(body)
    })
}

module.exports = { convertImageToMathml };