const puppeteer = require('puppeteer');
const loadCsv = require('./loadCSV');
const logger = require('./logger');
const { convertImageToMathml } = require('./mathpix');
const { makeDirIfNotExist } = require("./util");

const storeImage = true;

// const url = `https://examsnet.com/test/physical-world-and-measurements/`;
const initBrowser = async () => {
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
    return { browser, page};
}

const extractFolderNameFromUrl = (url) => {
    const folderName = url.split("/test/")[1];
    if(folderName.endsWith("/")) {
        return folderName.substring(0, folderName.length - 1);
    } else {
        return folderName
    }
}   

(async () => {

    try {
        
        const urls = await loadCsv();
    
        const { browser, page } = await initBrowser();
        await page.setViewport({ height: 1080, width: 1920 })
        
        for (let urlIndex = 0; urlIndex < urls.length; urlIndex++) {
            const url = urls[urlIndex];
            console.log(`WORKING ON URL: ${url} `);
            await page.goto(url);
        
            const folderName = extractFolderNameFromUrl(url);
        
            const getQuestionCount = async () => {
                const innerText = await page.$eval("#question", el => {return el.lastElementChild.lastElementChild.innerHTML});
                const count = Number.parseInt(innerText.split(":")[1]);
                return count;        
            }
        
            const totalQuestions = await getQuestionCount();
            console.log(`Total Questions: ${totalQuestions}`);
        
            for (let queIndex = 0; queIndex < totalQuestions; queIndex++) {
                console.log(`Fetching question ${queIndex+1} images`);
                await page.goto(url + `${queIndex+1}`);
                
                const dir = `./images/${folderName}/${queIndex+1}`;
                if (storeImage) {
                    makeDirIfNotExist(dir);
                }

                const cropQuestion = async () => {
                    const questionDiv = await page.$("#imagewrap");
                    let file;
                    if (storeImage) {
                        file = await questionDiv.screenshot({ path: `${dir}/question.png` });
                    } else {
                        file = await questionDiv.screenshot();
                    }
                    const base64 = Buffer.from(file).toString('base64') 
                    const data = await convertImageToMathml(base64);
                    if (data && data?.data?.html) {
                        const mathml = data.data.html;
                    }
                }
            
                const cropAnswers = async () => {
                    try {
                        const answers = await page.$$("#answers > .list-group-item");

                        for (let answerIndex = 0; answerIndex < answers.length; answerIndex++) {
                            const answer = answers[answerIndex];
                            await page.waitForTimeout(1000);

                            if (storeImage) {
                                file = await answer.screenshot({ path: `${dir}/option-${answerIndex + 1}.png` });
                            } else {
                                file = await answer.screenshot();
                            }
                            const base64 = Buffer.from(file).toString('base64') 
                            const data = await convertImageToMathml(base64);
                            if (data && data?.data?.html) {
                                const mathml = data.data.html;
                            }
                        }

                    } catch (error) {
                        console.error(error);                        
                    }
                }
        
                await cropQuestion();
                await cropAnswers();
                console.log(`Done cropping Question ${queIndex+1} `);
            }
            
        }
    } catch (error) {
        console.error(error);
    }


})();


