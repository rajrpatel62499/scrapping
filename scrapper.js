const puppeteer = require('puppeteer');
const loadCsv = require('./loadCSV');
const logger = require('./logger');



const url = `https://examsnet.com/test/physical-world-and-measurements/`;
(async () => {
    const urls = await loadCsv();

    const browser = await puppeteer.launch({ 
        headless: false, 
        devtools: true,
        args: [`--window-size=1920,1080`],
        defaultViewport: {
            width:1920,
            height:1080
        }
    });
    const page = await browser.newPage();
    
    await page.setViewport({ height: 1080, width: 1920 })
    await page.goto(url);

    const getQuestionCount = async () => {
        const innerText = await page.$eval("#question", el => {return el.lastElementChild.lastElementChild.innerHTML});
        const count = Number.parseInt(innerText.split(":")[1]);
        return count;        
    }

    const totalQuestions = await getQuestionCount();
    logger.info(`Total Questions: ${totalQuestions}`);

    for (let i = 0; i < totalQuestions; i++) {
        

    }


    const cropQuestion = async () => {
        const questionDiv = await page.$("#imagewrap");
        await questionDiv.screenshot({ path: './images/test-question.png' });
    }

    const cropAnswers = async () => {
        const answers = await page.$$("#answers > .list-group-item");
        answers.forEach(async(x, i) => { 
            await page.waitForTimeout(1000);
            await x.screenshot({ path: `./images/${i + 1}.png` }) 
        });
    }


    // await cropQuestion();
    // await cropAnswers();
})();


const processEachPage = () => {
    
}
