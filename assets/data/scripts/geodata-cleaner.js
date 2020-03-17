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
import csv from 'csvtojson'
import path from 'path'
import { fileURLToPath } from 'url';
import moment from'moment'
import fs  from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const geodataPath = path.join(__dirname, args[0])

import {populationData} from './node_population_by_state.js'

const getDecade = (date) => {
  const year = date.get('year')
  const yearArray = year.toString().split('')
  yearArray[yearArray.length - 1] = 0
  return yearArray.join('')
}

const getPopulation = (state, date) => {
  const stateObject = populationData[state]
  if (!stateObject) {
    return stateObject
  } else {
    return parseInt(stateObject[getDecade(date)])
  }
}

async function getGeodataJson () {
  const geodata = await csv({
    ignoreEmpty: true,
    trim: true
  }).fromFile(geodataPath)

  const revisedGeodata = geodata.filter(data => data.mail_subscriptions > -1 && data.single_copy_sales > -1).map(data => {
    const [month, day, year] = data.period_ending.split('/')
    if (!year) return console.log(data)
    const periodEnding = moment.utc({'year': year.indexOf('19') < -1 ? `19${year}` : year, month: parseInt(month)-1, 'day': day })
    const periodStart = moment.utc({'year': periodEnding.get('year'), 'month': periodEnding.get('month') - 5, 'day': 1})
    return {
      sample_period_ending: periodEnding.format(),
      sample_period_start: periodStart.format(),
      state_region: data.state_region,
      state_population: getPopulation(data.state_region, periodEnding),
      sampled_mail_subscriptions: parseInt(data.mail_subscriptions),
      sampled_single_copy_sales: parseInt(data.single_copy_sales),
      sampled_total_sales: parseInt(data.mail_subscriptions) + parseInt(data.single_copy_sales),
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
