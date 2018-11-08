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
//     # Object destructuring would be helpful here, but maybe possible in python?

const args = process.argv.slice(2)
const path = require('path')
const circulationdataPath = path.join(__dirname, args[0])
const fs = require('fs')
const circulationData = require(circulationdataPath)

const getDecade = (date) => {
  const year = date.getFullYear()
  const yearArray = year.toString().split('')
  yearArray[yearArray.length - 1] = 0
  return yearArray.join('')
}

const cleanCirculation = circulationData.circulationData.map(match => {
  console.log(match.year, match.month, match.day || 1)
  return ({
        actual_issue_date: new Date(match.year, match.month-1, `${match.day || 1}`),
        issue_circulation: match._circulation,
        price: match._price,
        type: match.type,
        publishing_company: match['publishing company'],
        titles_included: match['titles included'],
        editor: match.editor,
        magazine_id: match.magazine_id,
        type_id: match.type_id,
        circulation_for_db: match.circulation_for_db,
        price_for_db: match.price_for_db,
        magazine_title: match.magazine
      })
}
  )


console.log('initial length is', circulationData.circulationData.length)
console.log(circulationData.circulationData[0])
console.log(cleanCirculation[0])
console.log('final length of array is', cleanCirculation.length)

fs.writeFile(`${args[0].split('-')[0].toLowerCase()}-circulation.json`, JSON.stringify(cleanCirculation), 'utf8', (err) => {
  if (err) throw err
  console.log('Successfully joined data')
})
