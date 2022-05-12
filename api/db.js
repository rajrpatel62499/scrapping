const { default: axios } = require("axios");

const config = {
    userName: 'examsnetuser1@yopmail.com', 
    password: 'admin@123',
    backendUrl: 'https://v1-dev-backend.tryjackett.com',
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

const constructQuestionObj =  (user, question, opts, answer) => {
    const questionType = 'MCQ';
    const username = user.username;
    const questionText = question;
    const options = opts.map(x => ({ optionText: x.mathml, isAnswer: x.isAnswer, images: [] }));
    const answers = [{ answerText: answer, images: []}];

    const questionData = {
        username: username,
        author: username,
        questionDifficulty:  "",
        questionText:  questionText,
        questionType:  questionType,
        options: options,
        images: [],
        marks: '',
        answers: answers,
        // answers: [{ answerText: '', images: [] }],

        // tags
        tag: {
          subject: '',
          chapter: '', //TODO: folder name
          topic: '',
          curriculum: '',
          classes: [''],
          bloomTaxonomies: [''],
          customTags: [''],
        },
        childQuestions: []
    };
    return questionData;
}

const addQuestionToDB = async(user, questionText, opts, answer) => {
    const url = `${config.backendUrl}/api/v1/questions`;
    const headers = {
        'Content-type': 'application/json',
        'authorization': `Bearer ${user.token}`
    }
    
    const payload = constructQuestionObj(user, questionText, opts, answer)

    const addQuestionApiCall = () => axios({
        url: url, 
        method: 'post',
        headers: headers,
        data: payload
    });

    console.log(payload);

    try {
        const res = await addQuestionApiCall();
        return res;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = { config, loginToDB, addQuestionToDB };

