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
const fs = require('fs')
const geoData = require('./node-geodata')
const circulationData = require('./node-circulation')

const revisedGeoData = geoData.geoData.map(data => {
  const periodEndingComponents = data['Period Ending'].split('/')
  const periodEnding = new Date(`19${periodEndingComponents[2]}`, parseInt(periodEndingComponents[0])-1, periodEndingComponents[1])
  const periodStart = new Date(new Date(periodEnding).setMonth(periodEnding.getMonth() - 6))
  return {
    sample_period_ending: periodEnding,
    sample_period_start: periodStart,
    state_region: data['State/Region'],
    sampled_mail_subscriptions: data['Mail Subscriptions'],
    sampled_single_copy_sales: data['Single Copy Sales'],
    sampled_total_sales: data.Total,
    sampled_issue_date: data['Issue Date'],
    magazine_title: data.Title
  }
})

const geoJoin = (data) => {
  const filteredMatches = circulationData.circulationData.filter(filterData => {
    const titleMatch = data.magazine_title === filterData.magazine
    const fullIssueDate = new Date(filterData.year, filterData.month-1, filterData.day)
    const inDateRange = fullIssueDate <= data.sample_period_ending && fullIssueDate >= data.sample_period_start
    return titleMatch && inDateRange
  })
  return filteredMatches.map(match => {
    return Object.assign({}, data, {
      actual_issue_date: new Date(match.year, match.month-1, match.day),
      issue_circulation: match.circulation,
      price: match.price,
      type: match.type,
      publishing_company: match['publishing company'],
      titles_included: match['titles included'],
      editor: match.editor,
      magazine_id: match.magazine_id,
      type_id: match.type_id,
      circulation_for_db: match.circulation_for_db,
      price_for_db: match.price_for_db
    })
  })
}

const joinedData = revisedGeoData.map(geoJoin)

const finalData = [].concat.apply([], joinedData)

fs.writeFile('./assets/data/joined_data.json', JSON.stringify(finalData), 'utf8', (err) => {
  if (err) throw err
  console.log('Successfully joined data')
})
