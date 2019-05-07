import {renderNumberWithCommas, prettifyIssueData} from './DataFormat.js'

// ****************************************************
// Render Logic for Chart
// ****************************************************
export function renderIssueData(data) {
  if (data) {
    const {date, issue_circulation, publishing_company, price, editor, magazine_title, titles_included, circulation_quality} = prettifyIssueData(data)
    document.getElementById('total-circulation').textContent = issue_circulation
    document.getElementById('issue-date').textContent = date
    document.getElementById('issue-publisher').textContent = publishing_company
    document.getElementById('issue-price').textContent = price
    document.getElementById('issue-editor').textContent = editor
    document.getElementById('circulation-quality').textContent = circulation_quality
    document.getElementById('titles-included').textContent = titles_included
  } else {
    document.getElementById('circulation-quality').textContent = ''
    document.getElementById('total-circulation').textContent = '-'
    document.getElementById('issue-date').textContent = '-'
    document.getElementById('issue-publisher').textContent = '-'
    document.getElementById('issue-price').textContent = '-'
    document.getElementById('issue-editor').textContent = '-'
    document.getElementById('titles_included') ? document.getElementById('titles_included').textContent = '-' : null
  }
}

export function renderGeoData(data, state, selectedItem) {
  if (data && state.isClicked && selectedItem) {
    const {key, value: {sampled_total_sales, sampled_mail_subscriptions, sampled_issue_date, sampled_single_copy_sales, state_population}} = selectedItem
    console.log(sampled_issue_date)
    document.getElementById('selected-state').textContent = key
    document.getElementById('mail-subscriptions').textContent = `${renderNumberWithCommas(sampled_mail_subscriptions)}`
    document.getElementById('single-copy-sales').textContent = `${renderNumberWithCommas(sampled_single_copy_sales)}`
    document.getElementById('state-circulation').textContent = `${renderNumberWithCommas(sampled_total_sales)}`
    document.getElementById('state-pop').textContent = `${(sampled_total_sales/state_population * 100).toFixed(3)}%`
    document.getElementById('percent-of-total').textContent = `${(sampled_total_sales/state.totalSalesByState.value.sampled_total_sales * 100).toFixed(3)}%`
    document.getElementById('geo-issue-date').textContent = new Date(sampled_issue_date).format('mmm dd, yyyy')
  } else {
    document.getElementById('selected-state').textContent = '-'
    document.getElementById('mail-subscriptions').textContent = '-'
    document.getElementById('single-copy-sales').textContent = '-'
    document.getElementById('state-circulation').textContent = '-'
    document.getElementById('state-pop').textContent = '-'
    document.getElementById('percent-of-total').textContent = '-'
    document.getElementById('geo-issue-date').textContent = '-'

  }
}
