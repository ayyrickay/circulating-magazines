// Reducer function for raw geodata
export function geoReducerAdd(p, v) {
  const canonDate = moment.utc(new Date(v.sampled_issue_date)).valueOf()
  ++p.count
  p.date_counts[canonDate] = (p.date_counts[canonDate] || 0) + 1
  p.sampled_mail_subscriptions += v.sampled_mail_subscriptions
  p.sampled_single_copy_sales += v.sampled_single_copy_sales
  p.sampled_total_sales += v.sampled_total_sales
  p.state_population = v.state_population // only valid for population viz
  p.sampled_issue_date = v.sampled_issue_date
  return p
}

export function geoReducerRemove(p, v) {
  const canonDate = moment.utc(new Date(v.sampled_issue_date)).valueOf()
  --p.count
  if(!--p.date_counts[canonDate]) { delete p.date_counts[canonDate] }
  p.sampled_mail_subscriptions -= v.sampled_mail_subscriptions
  p.sampled_single_copy_sales -= v.sampled_single_copy_sales
  p.sampled_total_sales -= v.sampled_total_sales
  p.state_population = v.state_population // only valid for population viz
  return p
}

// generic georeducer
export function geoReducerDefault() {
  return {
    count: 0,
    sampled_mail_subscriptions: 0,
    sampled_single_copy_sales: 0,
    sampled_total_sales: 0,
    state_population: 0,
    sampled_issue_date: "",
    date_counts: {}
  }
}

export function circulationReducerAdd(p, v) {
    ++p.count
    p.canonical_title = v.canonical_title
    p.issue_circulation += v.issue_circulation
    p.price = v.price
    p.type = v.type
    p.publishing_company = v.publishing_company
    p.titles_included = v.titles_included
    p.editor = v.editor
    p.circulation_quality = v.circulation_quality
    p.special_notes = v.special_notes
    return p
  }
  /* callback for when data is removed from the current filter results */
  export function circulationReducerRemove(p, v) {
    --p.count
    p.canonical_title = v.canonical_title
    p.issue_circulation -= v.issue_circulation
    p.price = v.price
    p.type = v.type
    p.publishing_company = v.publishing_company
    p.titles_included = v.titles_included
    p.editor = v.editor
    p.circulation_quality = v.circulation_quality
    p.special_notes = v.special_notes
    return p
  }
  /* initialize p */
  export function circulationReducerDefault(){
    return {
      canonical_title:"",
      count: 0,
      issue_circulation: 0,
      price: "",
      type: "",
      publishing_company: "",
      titles_included: "",
      editor: "",
      circulation_quality: "",
      special_notes: ""
    }
  }
