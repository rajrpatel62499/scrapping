const csv = require('csv-parser');
const fs = require('fs');

const filePath = "data/list.csv";

const loadCsv = () => new Promise((resolve, reject) => {
    let data = [];    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // console.log(row);
        data.push(row.Url);
      })
      .on('end', () => {
        // console.log('CSV file successfully processed');
        resolve(data);
      })
      .on("error", (err)=> {
          reject(err);
      });
})

module.exports = loadCsv;