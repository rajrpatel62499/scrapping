const puppeteer = require('puppeteer');
const loadCsv = require('./utils/loadCSV');
const logger = require('./utils/logger');
const { convertImageToMathml } = require('./api/mathpix');
const { makeDirIfNotExist } = require("./util");
const db = require('./api/db');

const storeImage = false;

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

const getMathmlFromBase64 = async (base64) => {
    // const base64 = Buffer.from(file).toString('base64') // old for file buffer.  
    const data = await convertImageToMathml(base64);
    if (data && data?.data?.html) {
        const mathml = data.data.html;
        return mathml.replace(/style=\"display: none\"/g,'');
    }
    return '';
}

(async () => {

    try {
        
        const urls = await loadCsv();
    
        const { browser, page } = await initBrowser();
        await page.setViewport({ height: 1080, width: 1920 })

        const user = await db.loginToDB();
        
        for (let urlIndex = 0; urlIndex < urls.length; urlIndex++) {
            const url = urls[urlIndex];
            try {
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
                    await page.waitForTimeout(1000);
                    
                    const dir = `./images/${folderName}/${queIndex+1}`;
                    if (storeImage) {
                        makeDirIfNotExist(dir);
                    }
    
                    // validate the answer 
                    const [validateBtn] = await page.$x("//a[contains(.,'Validate')]");
                    await validateBtn.click();

                                                
                    const cropQuestion = async () => {
                        const questionDiv = await page.$("#imagewrap");

                        // capture option
                        const opt = storeImage ? { path: `${dir}/question.png`, } : {};
                        let base64 = await questionDiv.screenshot({ encoding: 'base64', ...opt});

                        // convert base64 to mathml
                        const mathml = await getMathmlFromBase64(base64);
                        return mathml;
                    }
                
                    const cropOptions = async () => {
                        try {
                            // fetching answers divs
                            await page.waitForSelector("#answers > .list-group-item");
                            const options = await page.$$("#answers > .list-group-item");
    
                            // looping through options
                            const promises = options.map(async (option, optIndex) => {
                                let isAnswer = false;
                                // finding the right answer
                                try {
                                    await option.$eval('.rightanswer', node => node);
                                    isAnswer = true;
                                } catch (error) {}

                                // waiting for a sec to capture all options perfectly. required step 
                                await page.waitForTimeout(1000);

                                // capture option
                                const opt = storeImage ? { path: `${dir}/option-${optIndex + 1}.png`, } : {};
                                let base64 = await option.screenshot({ encoding: 'base64', ...opt});

                                // convert base64 to mathml
                                const mathml = await getMathmlFromBase64(base64);

                                return { isAnswer, mathml };
                            })
                            const out = await Promise.all(promises);
                            // console.log(out);
                            return out;
    
                        } catch (error) {
                            console.error(error);                        
                        }
                    }

                    const cropAnswer = async () => {
                        // grab solution here and add it to answers table. 
                        // const sol = await page.$eval("#answerstatus", ele => ele.querySelectorAll("div"));
                        const sol = await (await (await page.$("#answerstatus")).$$("div")).at(1);
                        // const inn = await sol.evaluate(x => x.innerHTML);
                        // capture solution
                        const opt = storeImage ? { path: `${dir}/solution.png`, } : {};
                        let base64 = await sol.screenshot({ encoding: 'base64', ...opt});
                        // convert base64 to mathml
                        const answer = await getMathmlFromBase64(base64);
                        return answer;
                    }
            
                    const question = await cropQuestion();
                    const options = await cropOptions();
                    const answer = await cropAnswer();
                    console.log(`Done cropping Question ${queIndex+1} `);

                    // make question object and store it to the database. 
                    try {
                        const res = await db.addQuestionToDB(user, question, options, answer);
                        console.log(`Question Added to user account ${res}`);
                    } catch (error) {
                        console.error(`Error in adding question ${error}`);
                    }
                }
            } catch (error) {
                if (error && error.message == 'Protocol error (Page.navigate): Session closed. Most likely the page has been closed.') {
                    throw error;
                }
                urlIndex++; // will move forward to another url if any issue. 
                logger.warn(`Found problem in URL SKIPPING ${url}`);
            }
            
        }
    } catch (error) {
        console.error(error);
    }


})();


