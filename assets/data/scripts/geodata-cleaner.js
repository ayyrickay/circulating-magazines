//
// # For each GEO record, identify date field
// # Generate period_starting field (6 months earlier)
// # Filter combo data based on the issue and year
// # For each ISSUE record Combine all fields and do clean up:
//     # Only use GEO title field
//     # Create GEO sampled_issue_date field (GEO Issue Date)
//     # Create actual_issue_date field (generated from Day/Month/Year)
//     # All other fields can be combined
//

/*
 * STRUCTURE
 * node geodata-cleaner.js {PATH_TO_FILE}
 * EXAMPLE
 * node geodata-cleaner.js NEYO-geodata.js
 */

const args = process.argv.slice(2)
const csv = require('csvtojson')
const path = require('path')
const geodataPath = path.join(__dirname, args[0])
const fs = require('fs')
const populationData = require('./node_population_by_state')

const getDecade = (date) => {
  const year = date.getFullYear()
  const yearArray = year.toString().split('')
  yearArray[yearArray.length - 1] = 0
  return yearArray.join('')
}

const getPopulation = (state, year) => {
  const stateObject = populationData.populationData[state]
  if (!stateObject) {
    return stateObject
  } else {
    return parseInt(stateObject[getDecade(year)])
  }
}

async function getGeodataJson () {
  const geodata = await csv({
    ignoreEmpty: true,
    trim: true
  }).fromFile(geodataPath)

  console.log(geodataPath, geodata)
  const revisedGeodata = geodata.filter(data => data.mail_subscriptions > -1 && data.single_copy_sales > -1).map(data => {
    const [month, day, year] = data.period_ending.split('/')
    if (!year) return console.log(data)
    const periodEnding = new Date(year.indexOf('19') < -1 ? `19${year}` : year, parseInt(month)-1, day)
    const periodStart = new Date(new Date(periodEnding).setMonth(periodEnding.getMonth() - 6))
    return {
      sample_period_ending: periodEnding,
      sample_period_start: periodStart,
      state_region: data.state_region,
      state_population: getPopulation(data.state_region, periodEnding),
      sampled_mail_subscriptions: parseInt(data.mail_subscriptions),
      sampled_single_copy_sales: parseInt(data.single_copy_sales),
      sampled_total_sales: parseInt(data.mail_subscriptions + data.single_copy_sales),
      sampled_issue_date: data.issue_date,
      magazine_title: data.title,
      title_code: data.title_code
    }
  })

  const finalData = [].concat.apply([], revisedGeodata)

  console.log('initial length is', geodata.length)
  console.log(args[0].split('/')[2].split('-')[0])
  console.log(finalData[0])
  console.log('final length of array is', finalData.length)

  fs.writeFile(path.join(__dirname, `/../clean/${args[0].split('/')[2].split('-')[0].toLowerCase()}-geodata.json`), JSON.stringify(finalData), 'utf8', (err) => {
    if (err) {throw err}
    console.log('Successfully cleaned data')
    })
}

getGeodataJson()
