var fs = require('fs');
const makeDirIfNotExist = (dir) => {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Directory Created: ${dir} `);
        return true;
    }
    return false;
}

module.exports = { makeDirIfNotExist }