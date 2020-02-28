// ****************************************************
// Formatting
// ****************************************************
export const renderNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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

export function formatNum(num, state, title) {
  if (state[title].usChartRenderOption === 'percentOfPopulation') {
    return `${(num*100).toFixed(2)}%`
  } else {
    return toMetric(num)
  }
}
