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
const path = require('path')
const geodataPath = path.join(__dirname, args[0])
const fs = require('fs')
const geoData = require(geodataPath)
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

const revisedGeoData = geoData.geodata.map(data => {
  const periodEndingComponents = data['Period Ending'].split('/')
  const periodEnding = new Date(`19${periodEndingComponents[2]}`, parseInt(periodEndingComponents[0])-1, periodEndingComponents[1])
  const periodStart = new Date(new Date(periodEnding).setMonth(periodEnding.getMonth() - 6))
  return {
    sample_period_ending: periodEnding,
    sample_period_start: periodStart,
    state_region: data['State/Region'],
    state_population: getPopulation(data['State/Region'], periodEnding),
    sampled_mail_subscriptions: parseInt(data['Mail Subscriptions']),
    sampled_single_copy_sales: parseInt(data['Single Copy Sales']),
    sampled_total_sales: parseInt(data.Total),
    sampled_issue_date: data['Issue Date'],
    magazine_title: data.Title
  }
})

const finalData = [].concat.apply([], revisedGeoData)

console.log('initial length is', geoData.geodata.length)
console.log(args[0].split('-')[0])
console.log(finalData[0])
console.log('final length of array is', finalData.length)

fs.writeFile(`${args[0].split('-')[0].toLowerCase()}-geodata.json`, JSON.stringify(finalData), 'utf8', (err) => {
  if (err) throw err
  console.log('Successfully cleaned data')
})
