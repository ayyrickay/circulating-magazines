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
const circulationdataPath = path.join(__dirname, `/../rawData/${args[0]}-Circulation.js`)
const fs = require('fs')
const circulationData = require(circulationdataPath)

const getDecade = (date) => {
  const year = date.getFullYear()
  const yearArray = year.toString().split('')
  yearArray[yearArray.length - 1] = 0
  return yearArray.join('')
}

console.log(circulationdataPath)

const cleanCirculation = circulationData.circulationData
  .filter(issue => issue.circulation)
  .map(match => {
    return {
        actual_issue_date: new Date(match.year, match.month-1, `${match.day || 1}`),
        issue_circulation: match.circulation,
        circulation_quality: match.circulation_quality,
        circulation_source: match.circulation_source,
        price: match.price,
        publishing_company: match.publisher,
        publishing_group: match.publishing_group,
        titles_included: match.titles_included,
        editor: match.editor,
        magazine_id: match.magazine_id,
        type_id: match.type_id,
        magazine_title: match.magazine,
        canonical_title: match.canonical_title
      }
}
  )


console.log('initial length is', circulationData.circulationData.length)
console.log(circulationData.circulationData[0])
console.log(cleanCirculation[0])
console.log('final length of array is', cleanCirculation.length)

fs.writeFile(path.join(__dirname, `/../clean/${args[0].toLowerCase()}-circulation.json`), JSON.stringify(cleanCirculation), 'utf8', (err) => {
  if (err) throw err
  console.log('Successfully joined data')
})
