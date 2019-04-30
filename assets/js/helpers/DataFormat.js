// ****************************************************
// Formatting
// ****************************************************
export const renderNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export function prettifyIssueData({data: {key, value: {issue_circulation, price, type, publishing_company, editor, magazine_title, circulation_quality}}}) {
  return {
    circulation_quality: circulation_quality ? circulation_quality : null,
    date: key ? key.format('mmm dd, yyyy') : '-',
    issue_circulation: issue_circulation ? `${issue_circulation.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} issues` : '-',
    price: price ? price : '-',
    publishing_company: publishing_company ? publishing_company : '-',
    editor: editor ? editor : '-',
    magazine_title: magazine_title ? magazine_title : '-'
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

export function formatNum(num, state) {
  if (state.us1ChartRenderOption === 'percentOfPopulation') {
    // console.log(num, (num*100).toFixed(3))
    return `${(num*100).toFixed(2)}%`
  } else {
    return toMetric(num)
  }
}
