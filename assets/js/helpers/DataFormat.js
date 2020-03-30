// ****************************************************
// Formatting
// ****************************************************
import { stateCodes } from '../../data/constants.js'

export function combineCirculation (titles, circulation1, circulation2) {
  if (titles.length < 1 || !Array.isArray(titles)) {
    return []
  }

  if (titles[1] === 'null') {
    return circulation1
  }

  return [...circulation1, ...circulation2]
}

export const renderNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export function hasAValidIssueDate (issueData) {
  // Checks to see if object has actual_issue_date property that looks kinda like the following format: 1921-06-04T00:00:00.000Z
  return issueData.actual_issue_date ? /^\d{4}\-\d{1,2}\-\d{1,2}\T0{2}\:0{2}\:0{2}Z$/.test(issueData.actual_issue_date) : false
}

export function titleCleanup (geo, circulation) {
  const cleanGeodata = geo.filter(data => {
    if (!data) {return false}
    return stateCodes[data.state_region]
  })

  const cleanCirculationData = circulation.map(title => {
    if(hasAValidIssueDate(title)) {
      title.actual_issue_date = moment.utc(title.actual_issue_date)
      return title
    } else {
      console.log('Invalid issue date; using 01/01/1946 as placeholder. Please report this issue or repair data set and include the title below.')
      console.error(title)
      title.actual_issue_date = moment.utc('1946-01-01T00:00:00Z')
      return title
    }
  })

  return [cleanGeodata, cleanCirculationData]
}

export function renderDateInUTC(date) {
  return new Date(date).toLocaleString('en-US', {timezone: 'UTC'})
}

export function prettifyIssueData({data: {key, value: {issue_circulation, price, type, publishing_company, editor, magazine_title, circulation_quality, special_notes, titles_included}}}) {
  return {
    circulation_quality: circulation_quality ? `${circulation_quality}` : null,
    date: key ? key.format('MMM D, YYYY') : '-',
    issue_circulation: issue_circulation ? `${parseInt(issue_circulation).toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," )} copies` : '-',
    price: price ? price : '-',
    publishing_company: publishing_company ? publishing_company : '-',
    editor: editor ? editor : '-',
    magazine_title: magazine_title ? magazine_title : '-',
    titles_included: titles_included ? titles_included.split('@').join(', ') : '-',
    special_notes: special_notes ? special_notes : undefined
  }
}

export function toMetric(x) {
  if (isNaN(x)) {return x}

  if(x < 1000) {
    return x;
  }

  if(x < 1000000) {
    return Math.round(x/1000) + "k";
  }

  if( x < 10000000) {
    return (x/1000000).toFixed(2) + "M";
  }

  if(x < 1000000000) {
    return Math.round(x/1000000) + "M";
  }

  if(x < 1000000000000) {
    return Math.round(x/1000000000) + "B";
  }

  return "1T+";
}

export function formatNum(num, renderOption) {
  if ( renderOption === 'percentOfPopulation') {
    return `${(num*100).toFixed(2)}%`
  } else {
    return toMetric(num)
  }
}
