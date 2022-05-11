const puppeteer = require('puppeteer');
const loadCsv = require('./loadCSV');
const logger = require('./logger');
const { convertImageToMathml } = require('./mathpix');
const { makeDirIfNotExist } = require("./util");

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
        return mathml;
    }
    return '';
}

(async () => {

    try {
        
        const urls = await loadCsv();
    
        const { browser, page } = await initBrowser();
        await page.setViewport({ height: 1080, width: 1920 })
        
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
                        // capture option
                        const opt = storeImage ? { path: `${dir}/question.png`, } : {};
                        let base64 = await option.screenshot({ encoding: 'base64', ...opt});

                        // convert base64 to mathml
                        const mathml = await getMathmlFromBase64(base64);
                        return mathml;
                    }
                
                    const cropAnswers = async () => {
                        try {
                            // validate the answer 
                            const [validateBtn] = await page.$x("//a[contains(.,'Validate')]");
                            await validateBtn.click();
                            
                            // fetching answers divs
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
                            console.log(out);
                            return out;
    
                        } catch (error) {
                            console.error(error);                        
                        }
                    }
            
                    const question = await cropQuestion();
                    const answers = await cropAnswers();
                    console.log(`Done cropping Question ${queIndex+1} `);
                }
            } catch (error) {
                urlIndex++; // will move forward to another url if any issue. 
                logger.warn(`Found problem in URL SKIPPING ${url}`);
            }
            
        }
    } catch (error) {
        console.error(error);
    }


})();


