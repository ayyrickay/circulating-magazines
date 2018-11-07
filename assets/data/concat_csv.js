/*
 * STRUCTURE
 * node concat_csv.js {PATH_TO_FILE} {TARGET_TITLE_ABBREVIATION}
 * EXAMPLE
 * node concat_csv.js rawData/Geo_Files_CSV NEYO
 */
 
const args = process.argv.slice(2)
const path = require('path')
const fs = require('fs')
const csvPath = path.join(__dirname, args[0])
const csv = require("csvtojson")
const targetTitle = args[1]

fs.readdir(csvPath, (err, files) => {
  if (err) return console.error(err)

  const filteredFiles = files.filter(file => file.indexOf(targetTitle) > - 1)

  let counter = filteredFiles.length
  let completeJSON = []

  filteredFiles.forEach(file => {
    csv().fromFile(path.join(csvPath, file))
    .then((json) => {
      const cleanedArray = json.filter(data => data['Title'] !== '' || data['Total'] !== '')
      console.log(file, cleanedArray[0])
      completeJSON = completeJSON.concat(cleanedArray)
      return completeJSON
    })
    .then(data => {
      counter--
      if (counter === 0) {
        fs.writeFile(`${targetTitle}-clean.json`, JSON.stringify(completeJSON), 'utf8', (err) => {
          if (err) throw err
          console.log('Successfully joined data')
        })
      }
    })
  })
})
