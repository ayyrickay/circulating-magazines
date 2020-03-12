import {renderNumberWithCommas, prettifyIssueData} from './DataFormat.js'

// ****************************************************
// Render Logic for Chart
// ****************************************************
export function togglePropertyVisibility(key, value, transform) {
  if (value) {
    document.getElementById(key).parentNode.classList.remove('hide')
    document.getElementById(key).textContent = transform ? transform(value) : value // can use transformation to process data
  } else {
    document.getElementById(key).parentNode.classList.add('hide')
  }
}

export function renderIssueData(data, title) {
  if (data) {
    const {date, issue_circulation, publishing_company, price, editor, magazine_title, titles_included, circulation_quality, special_notes} = prettifyIssueData(data)
    document.getElementById(`${title}-total-circulation`).textContent = issue_circulation
    document.getElementById(`${title}-issue-date`).textContent = date
    document.getElementById(`${title}-issue-publisher`).textContent = publishing_company
    document.getElementById(`${title}-issue-price`).textContent = price
    document.getElementById(`${title}-issue-editor`).textContent = editor
    document.getElementById(`${title}-circulation-quality`).textContent = `(${circulation_quality})`
    document.getElementById(`${title}-titles-included`).textContent = titles_included
    togglePropertyVisibility(`${title}-special-note`, special_notes)
  } else {
    document.getElementById(`${title}-circulation-quality`).textContent = ''
    document.getElementById(`${title}-total-circulation`).textContent = '-'
    document.getElementById(`${title}-issue-date`).textContent = '-'
    document.getElementById(`${title}-issue-publisher`).textContent = '-'
    document.getElementById(`${title}-issue-price`).textContent = '-'
    document.getElementById(`${title}-issue-editor`).textContent = '-'
    togglePropertyVisibility(`${title}-special-note`)
  }
}

export function renderGeoData(data, state, title, selectedItem) {
  if (data && state.circulationClicked && selectedItem) {
    const {key, value: {date_counts, sampled_total_sales, sampled_mail_subscriptions, sampled_single_copy_sales, state_population}} = selectedItem
    document.getElementById(`${title}-selected-state`).textContent = key
    document.getElementById(`${title}-mail-subscriptions`).textContent = `${renderNumberWithCommas(sampled_mail_subscriptions)}`
    document.getElementById(`${title}-single-copy-sales`).textContent = `${renderNumberWithCommas(sampled_single_copy_sales)}`
    document.getElementById(`${title}-state-circulation`).textContent = `${renderNumberWithCommas(sampled_total_sales)}`
    document.getElementById(`${title}-state-pop`).textContent = `${(sampled_total_sales/state_population * 100).toFixed(3)}%`
    document.getElementById(`${title}-percent-of-total`).textContent = `${(sampled_total_sales/state.totalSalesByState.value.sampled_total_sales * 100).toFixed(3)}%`
    document.getElementById(`${title}-geo-issue-date`).textContent = moment.utc(+Object.keys(date_counts)[0]).format('MMM D, YYYY')
  } else {
    document.getElementById(`${title}-selected-state`).textContent = '-'
    document.getElementById(`${title}-mail-subscriptions`).textContent = '-'
    document.getElementById(`${title}-single-copy-sales`).textContent = '-'
    document.getElementById(`${title}-state-circulation`).textContent = '-'
    document.getElementById(`${title}-state-pop`).textContent = '-'
    document.getElementById(`${title}-percent-of-total`).textContent = '-'
    document.getElementById(`${title}-geo-issue-date`).textContent = '-'

  }
}
