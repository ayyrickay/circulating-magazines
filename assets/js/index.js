import { notes, colorScales, stateCodes } from '../data/constants.js'
import { titleList } from '../data/titles-list.js'
import {renderIssueData, renderGeoData, togglePropertyVisibility} from './helpers/DataRender.js'
import {renderNumberWithCommas, toMetric, formatNum} from './helpers/DataFormat.js'
const numberFormat = d3.format(".2f")
const us1Chart = dc.geoChoroplethChart("#us1-chart")
const us2Chart = dc.geoChoroplethChart("#us2-chart")
const composite = dc.compositeChart("#line-chart")
const rangeChart = dc.barChart("#range-chart")
const us1Width = document.getElementById('us1-chart').offsetWidth
const us1Height = document.getElementById('us1-chart').offsetHeight
const us2Width = document.getElementById('us2-chart').offsetWidth
const us2Height = document.getElementById('us2-chart').offsetHeight
const lineChartWidth = document.getElementById('line-chart').offsetWidth
const lineChartHeight = document.getElementById('line-chart').offsetHeight
const state = {
  maxCompare: 2,
  titles: ['saev', null],
  title1: {
    totalSalesByState: null,
    usChartRenderOption: 'percentOfPopulation',
    data: {},
    geoClicked: false,
    circulationClicked: false
  },
  title2: {
    totalSalesByState: null,
    usChartRenderOption: 'percentOfPopulation',
    data: {},
    geoClicked: false,
    circulationClicked: false
  }
}

function generateSelect () {
  let i = 0

  while (i < state.maxCompare) {
    const selectField = document.getElementById('select-field')
    const currentNodes = selectField.childNodes
    const selectName = `select-field-${i}`
    const label = document.createElement('label')
    label.htmlFor = selectName
    const input = document.createElement('input')
    input.name = selectName
    input.id = selectName
    input.placeholder = "Select a title"
    label.appendChild(input)
    selectField.appendChild(label)
    i++
  }
}

generateSelect()

// TODO: pull the titles list from the clean data
function addAwesomeplete() {
  const selectorIds = Array.from(document.getElementById('select-field').childNodes).map((nodes, i) => `select-field-${i}`)
  selectorIds.forEach(selectorId => {
    const selector = document.getElementById(selectorId)
    selector.classList.add('title-select')
    new Awesomplete(selector, {
      autoFirst: true,
      list: titleList,
      replace: (suggestion) => {
        selector.value = suggestion.label
      }
    })
  })
}

addAwesomeplete()

const titleSelector = document.getElementById('select-field-0')
const title2Selector = document.getElementById('select-field-1')
titleSelector.value = 'Saturday Evening Post'
title2Selector.value = 'New Yorker'

// ****************************************************
// Helper Functions
// ****************************************************
function changeRenderOption(event, title) {
  if (state[title].circulationClicked) {
    state[title].usChartRenderOption = event.target.value
    title === 'title1' ? us1Chart.customUpdate() : us2Chart.customUpdate()
    dc.redrawAll()
  } else {
    document.getElementById(`${title}RenderOption1`).checked = true
  }
}

function getWidth(element) {
  if (document.getElementById(element)) {
    return document.getElementById('line-chart').offsetWidth
  } else {
    console.error(`No element found with ID ${element}`)
    return 0
  }
}

function getHeight(element) {
  if (document.getElementById(element)) {
    return document.getElementById('line-chart').offsetHeight
  } else {
    console.error(`No element found with ID ${element}`)
    return 0
  }
}

function generateScale(chartGroup, title) {
  if (state[title].usChartRenderOption === 'percentOfPopulation') {
    return [0, 1]
  } else {
    return [0, getTopValue(chartGroup, title)]
  }
}

const getTopValue = (group) => d3.max(group.all(), d => {
  if (state[title].usChartRenderOption === 'percentOfPopulation') {
    return d.value.sampled_total_sales / d.value.state_population
  } else {
    return d.value.sampled_total_sales
  }
})

// ****************************************************
// Create Event Listeners for HTML
// ****************************************************
document.getElementById('reset-button').addEventListener('click', () => {
  composite.filterAll()
  rangeChart.filterAll()
  dc.redrawAll()
})

// document.addEventListener('awesomplete-selectcomplete').
document.getElementById('title1RenderOption1').addEventListener('change', (ev) => changeRenderOption(ev, 'title1'))
document.getElementById('title1RenderOption2').addEventListener('change', (ev) => changeRenderOption(ev, 'title1'))
document.getElementById('title2RenderOption1').addEventListener('change', (ev) => changeRenderOption(ev, 'title2'))
document.getElementById('title2RenderOption2').addEventListener('change', (ev) => changeRenderOption(ev, 'title2'))

window.onresize = (event) => {
  composite.width(getWidth('line-chart') - 50).height(getHeight('line-chart') - 50).transitionDuration(0)
  rangeChart.width(getWidth('line-chart') - 50).transitionDuration(0)
  us1Chart
    .projection(d3.geoAlbersUsa()
      .scale(Math.min(getWidth('us1-chart') * 1.5, getHeight('us1-chart') * 1.5))
      .translate([getWidth('us1-chart') / 8, getHeight('us1-chart') / 2.5])
    )
    .transitionDuration(0)
    .width(getWidth('us1-chart') - 200)
    .height(getHeight('us1-chart') - 50)

    us2Chart
      .projection(d3.geoAlbersUsa()
        .scale(Math.min(getWidth('us2-chart') * 1.5, getHeight('us2-chart') * 1.5))
        .translate([getWidth('us2-chart') / 8, getHeight('us2-chart') / 2.5])
      )
      .transitionDuration(0)
      .width(getWidth('us2-chart') - 200)
      .height(getHeight('us2-chart') - 50)

  dc.renderAll()
  us1Chart.transitionDuration(750)
  us2Chart.transitionDuration(750)
  composite.transitionDuration(750)
}

// ****************************************************
// Render Logic for Chart
// ****************************************************

const renderCharts = (data) => {

  // TODO: Use array destructuring to make better sense of what's happening changeRenderOption
  // const [title1Geodata, title1Circulation, title2GeoData, title2Circulation] = data

  const title1GeoData = data[0].filter(data => {
    if (!data) {return false}
    return stateCodes[data.state_region]
  })

  const title2GeoData = data[2].filter(data => {
    if (!data) {return false}
    return stateCodes[data.state_region]
  })

  const title1Circulation = data[1]
  const circulationData2 = data[3]

  title1Circulation.forEach(d => {
    // TODO: Check for time zone issues
    try {
      d.actual_issue_date = moment.utc(d.actual_issue_date)
    } catch (e) {
      console.error(e, d.actual_issue_date)
    }
  })

  // TODO: Can I check for a title2 and then do all of this?
  circulationData2.forEach(d => {
    // TODO: Check for time zone issues
    try {
      d.actual_issue_date = moment.utc(d.actual_issue_date)
    } catch (e) {
      console.error(e, d.actual_issue_date)
    }
  })

  const geodata = crossfilter(title1GeoData)
  const circulation = crossfilter(title1Circulation)

  const title2Geodata = crossfilter(title2GeoData)
  const title2Circulation = crossfilter(circulationData2)

  // Reducer function for raw geodata
  function geoReducerAdd(p, v) {
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

  function geoReducerRemove(p, v) {
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
  function geoReducerDefault() {
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

  function circulationReducerAdd(p, v) {
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
    function circulationReducerRemove(p, v) {
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
    function circulationReducerDefault(){
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
  // TODO: Candidate for a function
  // Generate dimensions and groups for choropleth (make a function?)
  const stateRegion = geodata.dimension(d => d.state_region)
  const samplePeriodEnd = geodata.dimension(d => d.sample_period_ending)
  const salesByState = stateRegion.group().reduce(geoReducerAdd, geoReducerRemove, geoReducerDefault)

  state.title1.totalSalesByState = salesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))

  const title2StateRegion = title2Geodata.dimension(d => d.state_region)
  const title2SamplePeriodEnd = title2Geodata.dimension(d => d.sample_period_ending)
  const title2SalesByState = title2StateRegion.group().reduce(geoReducerAdd, geoReducerRemove, geoReducerDefault)

  state.title2.TotalSalesByState = title2SalesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))

  // generate dimensions and groups for line/range chart
  // TODO: Candidate for a function
  const title1Dates = circulation.dimension(d => d.actual_issue_date)
  const title1CirculationByDate = title1Dates.group().reduce(circulationReducerAdd, circulationReducerRemove, circulationReducerDefault)

  const title2Dates = title2Circulation.dimension(d => d.actual_issue_date)
  const title2CirculationByDate = title2Dates.group().reduce(circulationReducerAdd, circulationReducerRemove, circulationReducerDefault)



  // ****************************************************
  // Static Render Data
  // ****************************************************
  function renderStaticContent (title) {
    // Renders static information for each title
    const {canonical_title, titles_included} = title === 'title1' ?
      title1CirculationByDate.all()[0].value :
      title2CirculationByDate.all()[0].value

    const editorNote = notes[state.titles[title === 'title1' ? 0 : 1].toUpperCase()]
    document.getElementById(`${title}-editorial-note`).textContent = editorNote
    document.getElementById(`${title}-non-canon-title`).textContent = canonical_title
    state[title].canonical_title = canonical_title
    togglePropertyVisibility(`${title}-titles-included`, titles_included, (titles) => titles.split('@').join(', '))
  }

  renderStaticContent('title1')
  renderStaticContent('title2')

  const generateMapTipText = (sampled_total_sales, state_population) => {
    if (state.title1.usChartRenderOption === 'percentOfPopulation') {
      return `${(sampled_total_sales / state_population).toFixed(3)} copies per person`
    } else {
      return `${renderNumberWithCommas(sampled_total_sales)} copies`
    }
  }

  const title1MapTip = d3.tip()
    .attr('class', 'tooltip')
    .offset([-10, 0])
    .html((d) => {
      return `
      <div class="tooltip-data">
        <h4 class="key">State</h4>
        <p>${d.properties.name}</p>
      </div>
      <div class="tooltip-data">
      ${state.title1.circulationClicked ?
        '' :
        `<h4 class="key">Data</h4>
         <p> Please select a specific issue for more detailed data</p>`
        }
      </div>
      `
    })

    const title2MapTip = d3.tip()
      .attr('class', 'tooltip')
      .offset([-10, 0])
      .html((d) => {
        return `
        <div class="tooltip-data">
          <h4 class="key">State</h4>
          <p>${d.properties.name}</p>
        </div>
        <div class="tooltip-data">
        ${state.title2.circulationClicked ?
          '' :
          `<h4 class="key">Data</h4>
           <p> Please select a specific issue for more detailed data</p>`
          }
        </div>
        `
      })

    const lineTip = d3.tip()
      .attr('class', 'tooltip')
      .offset([-10, 0])
      .html(({data: {key, value: {issue_circulation, price, type, publishing_company, editor}}}) => {
        return `
        <div class="tooltip-data">
          <h4 class="key">Date</h4>
          <p>${key.format('MMM D, YYYY')}</p>
        </div>
        <div class="tooltip-data">
          <h4 class="key">Circulation</h4>
          <p> ${parseInt(issue_circulation).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} copies</p>
        </div>
        `
      })

    function resetChart (title) {
      state[title].circulationClicked = false
      state[title].usChartRenderOption = 'percentOfPopulation'
      document.getElementById(`${title}RenderOption1`).checked = true
      document.getElementById(`${title}ClearGeoFilterButton`).classList.add('hide')
      document.getElementById('clearIssueFilterButton').classList.add('hide')

      renderIssueData(null, title)
      renderGeoData(null, state[title], title)

      lineTip.hide()

      if(title === 'title1') {
        us1Chart.filter(null)
        us1Chart.customUpdate()
        us1Chart.colorDomain(generateScale(salesByState, 'title1'))
        us1Chart.redraw()
      } else if (title === 'title2') {
        us2Chart.filter(null)
        us2Chart.customUpdate()
        us2Chart.colorDomain(generateScale(title2SalesByState, 'title2'))
        us2Chart.redraw()
      }
    }

    function resetCharts () {
      samplePeriodEnd.filter(null)
      state.title1.circulationClicked = false
      state.title2.circulationClicked = false

      document.getElementById('clearIssueFilterButton').classList.add('hide')
      document.getElementById('title1RenderOption1').checked = true
      document.getElementById('title2RenderOption1').checked = true
      document.getElementById('title1ClearGeoFilterButton').classList.add('hide')
      document.getElementById('title2ClearGeoFilterButton').classList.add('hide')


      state.title1.usChartRenderOption = 'percentOfPopulation'
      state.title2.usChartRenderOption = 'percentOfPopulation'

      renderIssueData(null, 'title1')
      renderIssueData(null, 'title2')
      renderGeoData(null, state.title1, 'title1')
      renderGeoData(null, state.title1, 'title2')

      lineTip.hide()

      us1Chart.filter(null)
      us1Chart.customUpdate()
      us1Chart.colorDomain(generateScale(salesByState, 'title1'))
      us1Chart.redraw()

      us2Chart.filter(null)
      us2Chart.customUpdate()
      us2Chart.colorDomain(generateScale(title2SalesByState, 'title2'))
      us2Chart.redraw()
    }

    window.addEventListener("awesomplete-selectcomplete", (e) => {
      const targetNode = e.target.id.split('-').pop()
                    state.titles[targetNode] = e.text.value
                    resetChart(`title${parseInt(targetNode) + 1}`)
                    generateCharts()
                }, false)

    d3.json("./assets/geo/us-states.json").then((statesJson) => {
        function customUpdate (title) {
          if (title === 'title1') {
            us1Chart.group(salesByState)
            us1Chart.redraw()
          } else if (title === 'title2'){
            us2Chart.group(title2SalesByState)
            us2Chart.redraw()
          }
        }

        us1Chart.customUpdate = () => customUpdate('title1')
        us2Chart.customUpdate = () => customUpdate('title2')

        us1Chart.legendables = () => {
          if (state.title1.circulationClicked) {
            const range = us1Chart.colors().range()
            const domain = us1Chart.colorDomain()
            const step = (domain[1] - domain[0]) / range.length
            let val = domain[0]
            return range.map(function (d, i) {
                const legendable = {name: `${formatNum(val, state, 'title1')} - ${formatNum(val+step, state, 'title1')}`, chart: us1Chart}
                legendable.color = us1Chart.colorCalculator()(val)
                val += step
                return legendable
            })
          } else {
            return []
          }
        }

        us2Chart.legendables = () => {
          if (state.title2.circulationClicked) {
            const range = us2Chart.colors().range()
            const domain = us2Chart.colorDomain()
            const step = (domain[1] - domain[0]) / range.length
            let val = domain[0]
            return range.map(function (d, i) {
                const legendable = {name: `${formatNum(val, state, 'title2')} - ${formatNum(val+step, state, 'title2')}`, chart: us2Chart}
                legendable.color = us2Chart.colorCalculator()(val)
                val += step
                return legendable
            })
          } else {
            return []
          }
        }

        us1Chart.width(us1Width + 16)
                .height(us1Height)
                .dimension(stateRegion)
                .group(salesByState)
                .colors(d3.scaleQuantize().range(colorScales.blue))
                .colorDomain(generateScale(salesByState, 'title1'))
                .colorAccessor(d => {
                  return d ? d : 0
                })
                .overlayGeoJson(statesJson.features, "state", d => {
                  return d.properties.name
                })
                .projection(d3.geoAlbersUsa()
                  .scale(Math.min(getWidth('us1-chart') * 1.5, getHeight('us1-chart') * 1.5))
                  .translate([getWidth('us1-chart') / 8, getHeight('us1-chart') / 2.5])
                )
                .valueAccessor(kv => {
                  if (kv.value !== undefined) {
                    if (state.title1.usChartRenderOption === 'percentOfPopulation') {
                      return kv.value.sampled_total_sales / kv.value.state_population
                    } else {
                      return kv.value.sampled_total_sales
                    }
                  }
                })
                .renderTitle(false)
                .legend(dc.legend().x(getWidth('us1-chart') / 4.5).y(getHeight('us1-chart') / 2.5).itemHeight(10).itemWidth(getWidth('us1-chart') / 10).legendWidth(getWidth('us1-chart') / 3))
                .on('pretransition', (chart) => {
                    chart.selectAll('path')
                        .call(title1MapTip)
                        .on('mouseover.title1MapTip', d => {
                          if (!state.title1.geoClicked) {
                            title1MapTip.show(d)
                            renderGeoData(d, state.title1, 'title1', salesByState.all().filter(item => item.key === d.properties.name)[0])
                          }
                        })
                        .on('mouseout.title1MapTip', d => {
                          title1MapTip.hide(d)
                          if(!state.title1.geoClicked) {
                            renderGeoData(null, state.title1, 'title1')
                          }
                        });
                })
                .on('renderlet.click', chart => {
                  chart.selectAll('path').on('click', selected => {
                    const selectedState = selected.properties.name
                    if(state.title1.circulationClicked && state.title1.geoClicked) {
                      chart.filter(null)
                      chart.filter(selectedState)
                      renderGeoData(selectedState, state.title1, 'title1', salesByState.all().filter(item => item.key === selectedState)[0])
                    } else if (state.title1.circulationClicked) {
                      state.title1.geoClicked = true
                      const clearGeoFilterButton = document.getElementById('title1ClearGeoFilterButton')
                      clearGeoFilterButton.classList.remove('hide')
                      clearGeoFilterButton.addEventListener('click', () => {
                        renderGeoData(null, state.title1, 'title1')
                        chart.filter(null)
                        state.title1.geoClicked = false
                        clearGeoFilterButton.classList.add('hide')
                      })
                      chart.filter(selectedState)
                      renderGeoData(selectedState, state.title1, 'title1', salesByState.all().filter(item => item.key === selectedState)[0])
                    }
                  })
                })
                .on('filtered.geodata', (chart, filter) => {
                  if(chart.filter() === null) {
                    renderGeoData(null, state.title1, 'title1')
                    const clearGeoFilterButton = document.getElementById('title1ClearGeoFilterButton')
                    state.title1.geoClicked = false
                    clearGeoFilterButton.classList.add('hide')
                  }
                })
                .on("preRender", (chart) => {
                  chart.colorDomain(d3.extent(chart.data(), chart.valueAccessor()));
                })
                .on("preRedraw", (chart) => {
                  chart.colorDomain(d3.extent(chart.data(), chart.valueAccessor()));
                })

        us2Chart.width(us2Width + 367)
                .height(us2Height)
                .dimension(title2StateRegion)
                .group(title2SalesByState)
                .colors(d3.scaleQuantize().range(colorScales.red))
                .colorDomain(generateScale(title2SalesByState, 'title2'))
                .colorAccessor(d => {
                  return d ? d : 0
                })
                .overlayGeoJson(statesJson.features, "state", d => {
                  return d.properties.name
                })
                .projection(d3.geoAlbersUsa()
                  .scale(Math.min(getWidth('us2-chart') * 1.5, getHeight('us2-chart') * 1.5))
                  .translate([getWidth('us2-chart') / 8, getHeight('us2-chart') / 2.5])
                )
                .valueAccessor(kv => {
                  if (kv.value !== undefined) {
                    if (state.title2.usChartRenderOption === 'percentOfPopulation') {
                      return kv.value.sampled_total_sales / kv.value.state_population
                    } else {
                      return kv.value.sampled_total_sales
                    }
                  }
                })
                .renderTitle(false)
                .legend(dc.legend().x(getWidth('us2-chart') / 4.7).y(getHeight('us2-chart') / 2.5).itemHeight(10).itemWidth(getWidth('us2-chart') / 10).legendWidth(getWidth('us2-chart') / 3))
                .on('pretransition', (chart) => {
                    chart.selectAll('path')
                        .call(title2MapTip)
                        .on('mouseover.title2MapTip', d => {
                          if (!state.title2.geoClicked) {
                            title2MapTip.show(d)
                            renderGeoData(d, state.title2, 'title2', title2SalesByState.all().filter(item => item.key === d.properties.name)[0])
                          }
                        })
                        .on('mouseout.title2MapTip', d => {
                          title2MapTip.hide(d)
                          if(!state.title2.geoClicked) {
                            renderGeoData(null, state.title2, 'title2')
                          }
                        });
                })
                .on('renderlet.click', chart => {
                  chart.selectAll('path').on('click', selected => {
                    const selectedState = selected.properties.name
                    if(state.title2.circulationClicked && state.title2.geoClicked) {
                      chart.filter(null)
                      chart.filter(selectedState)
                      renderGeoData(selectedState, state.title2, 'title2', title2SalesByState.all().filter(item => item.key === selectedState)[0])
                    } else if (state.title2.circulationClicked) {
                      state.title2.geoClicked = true
                      const clearGeoFilterButton = document.getElementById('title2ClearGeoFilterButton')
                      clearGeoFilterButton.classList.remove('hide')
                      clearGeoFilterButton.addEventListener('click', () => {
                        renderGeoData(null, state, 'title2')
                        chart.filter(null)
                        state.title2.geoClicked = false
                        clearGeoFilterButton.classList.add('hide')
                      })
                      chart.filter(selectedState)
                      renderGeoData(selectedState, state.title2, 'title2', title2SalesByState.all().filter(item => item.key === selectedState)[0])
                    }
                  })
                })
                .on('filtered.geodata', (chart, filter) => {
                  if(chart.filter() === null) {
                    renderGeoData(null, state.title2, 'title2')
                    const clearGeoFilterButton = document.getElementById('title2ClearGeoFilterButton')
                    state.title2.geoClicked = false
                    clearGeoFilterButton.classList.add('hide')
                  }
                })
                .on("preRender", (chart) => {
                  chart.colorDomain(d3.extent(chart.data(), chart.valueAccessor()));
                })
                .on("preRedraw", (chart) => {
                  chart.colorDomain(d3.extent(chart.data(), chart.valueAccessor()));
                })

        composite.unClick = resetCharts

        // .rangeChart(rangeChart)
        //
        // .brushOn(false)
        composite
          .width(lineChartWidth-50)
          .height(lineChartHeight-50)
          .margins({ top: 10, right: 10, bottom: 50, left: 80 })
          .elasticY(true)
          .x(d3.scaleTime().domain([d3.min(title1CirculationByDate.all(), d => d.key), d3.max(title1CirculationByDate.all(), d => d.key)]))
          .xUnits(d3.timeYears)
          .brushOn(false)
          .compose([
            dc.lineChart(composite)
              .group(title1CirculationByDate)
              .dimension(title1Dates)
              .colors(colorScales.blue[colorScales.blue.length - 1])
              .valueAccessor(d => parseInt(d.value.issue_circulation))
              .xyTipsOn(true),
              dc.lineChart(composite)
                .group(title2CirculationByDate)
                .dimension(title2Dates)
                .colors(colorScales.red[colorScales.red.length - 1])
                .valueAccessor(d => parseInt(d.value.issue_circulation))
          ])
          .on('pretransition.click', (chart) => {
            chart.selectAll('circle').on('click', (selected) => {
              const currentTitle = selected.data.value.canonical_title === state.title1.canonical_title ? 'title1' : 'title2'
              state[currentTitle].circulationClicked = true
              const clearFilterButton = document.getElementById('clearIssueFilterButton')
              clearFilterButton.classList.remove('hide')
              clearFilterButton.addEventListener('click', composite.unClick)
              renderIssueData(selected, currentTitle)
              if (currentTitle === 'title1') {
                samplePeriodEnd.filter(d => {
                  const currentIssueDate = moment.utc(selected.x)
                  const periodEnding = moment.utc(d)
                  const periodStart = moment.utc({'year': periodEnding.get('year'), 'month': periodEnding.get('month') === 5 ? 0 : 6, 'day':1})
                  if (currentIssueDate >= periodStart && currentIssueDate <= periodEnding) {
                    Object.assign(state.title1, {currentIssueDate, periodStart, periodEnding})
                    return currentIssueDate >= periodStart && currentIssueDate <= periodEnding
                  }
                })

                state.title1.totalSalesByState = salesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))
                us1Chart.colorDomain(generateScale(salesByState, 'title1'))
                us1Chart.customUpdate()
              } else if (currentTitle === 'title2') {
                title2SamplePeriodEnd.filter(d => {
                  const currentIssueDate = moment.utc(selected.x)
                  const periodEnding = moment.utc(d)
                  const periodStart = moment.utc({'year': periodEnding.get('year'), 'month': periodEnding.get('month') === 5 ? 0 : 6, 'day':1})
                  if (currentIssueDate >= periodStart && currentIssueDate <= periodEnding) {
                    Object.assign(state, {currentIssueDate, periodStart, periodEnding})
                    return currentIssueDate >= periodStart && currentIssueDate <= periodEnding
                  }
                })

                state.title2.totalSalesByState = title2SalesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))
                us2Chart.colorDomain(generateScale(title2SalesByState, 'title2'))
                us2Chart.customUpdate()
              }
            })
          })
          .on('renderlet.mouseover', (chart) => {
            chart.selectAll('circle').on('mouseover.hover', (selected) => {
              const currentTitle = selected.data.value.canonical_title === state.title1.canonical_title ? 'title1' : 'title2'
              if (!state.title1.circulationClicked && currentTitle === 'title1') {
                samplePeriodEnd.filter(d => {
                  const currentIssueDate = moment.utc(selected.x)
                  const periodEnding = moment.utc(d)
                  const periodStart = moment.utc({'year': periodEnding.get('year'), 'month': periodEnding.get('month') === 5 ? 0 : 6, 'day':1})
                  if (currentIssueDate >= periodStart && currentIssueDate <= periodEnding) {
                    Object.assign(state.title2, {currentIssueDate, periodStart, periodEnding})
                    return currentIssueDate >= periodStart && currentIssueDate <= periodEnding
                  }
                })

                state.title1.totalSalesByState = salesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))

                us1Chart.colorDomain(generateScale(salesByState, 'title1'))
                us1Chart.customUpdate()
              } else if (!state.title2.circulationClicked && currentTitle === 'title2') {
                title2SamplePeriodEnd.filter(d => {
                  const currentIssueDate = moment.utc(selected.x)
                  const periodEnding = moment.utc(d)
                  const periodStart = moment.utc({'year': periodEnding.get('year'), 'month': periodEnding.get('month') === 5 ? 0 : 6, 'day':1})
                  if (currentIssueDate >= periodStart && currentIssueDate <= periodEnding) {
                    Object.assign(state.title2, {currentIssueDate, periodStart, periodEnding})
                    return currentIssueDate >= periodStart && currentIssueDate <= periodEnding
                  }
                })

                state.title2.totalSalesByState = title2SalesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))

                us2Chart.colorDomain(generateScale(title2SalesByState, 'title2'))
                us2Chart.customUpdate()
              }
            })

            chart.selectAll('circle').on('mouseleave.hover', (selected) => {
              const currentTitle = selected.data.value.canonical_title === state.title1.canonical_title ? 'title1' : 'title2'

              if (!state.title1.circulationClicked && currentTitle === 'title1') {
                samplePeriodEnd.filter(null)
                us1Chart.colorDomain(generateScale(salesByState, 'title1'))
                us1Chart.redraw()
              } else if (!state.title2.circulationClicked && currentTitle === 'title2') {
                title2SamplePeriodEnd.filter(null)
                us2Chart.colorDomain(generateScale(title2SalesByState, 'title2'))
                us2Chart.redraw()
              }
            })

          })
          .on('pretransition', (chart) => {
            // SECOND TITLE
            chart.selectAll('circle')
                .call(lineTip)
                .on('mouseover.lineTip', (selected) => {
                  lineTip.show(selected)
                })
                .on('mouseout.lineTip', (selected) => {
                  lineTip.hide(selected)
                })
          })
          .renderTitle(false)
          .render()

          /*
          .on('pretransition', (chart) => {
              chart.selectAll('circle')
                  .call(lineTip)
                  .on('mouseover.lineTip', (selected) => {
                    lineTip.show(selected)
                  })
                  .on('mouseout.lineTip', (selected) => {
                    lineTip.hide(selected)
                  })
          })
          */


        rangeChart
          .width(lineChartWidth-50)
          .height(40)
          .margins({ top: 10, right: 10, bottom: 20, left: 80 })
          .dimension(title1Dates)
          .group(title1CirculationByDate)
          .valueAccessor(d => d.value.issue_circulation)
          .centerBar(true)
          .x(d3.scaleTime().domain([d3.min(title1CirculationByDate.all(), d => d.key), d3.max(title1CirculationByDate.all(), d => d.key)]))
          .round(d3.timeMonth.round)
          .alwaysUseRounding(true)
          .xUnits(() => 200)
          .y(d3.scaleLinear().domain([0, d3.max(title1CirculationByDate.all(), d => d.value.issue_circulation)]))

        rangeChart.yAxis().ticks(0)

        // Establish global chart filter method
        dc.chartRegistry.list().forEach((chart) => {
          chart.on('filtered', () => {
            us1Chart.customUpdate()
          })
        })

        dc.renderAll()
    })
}

const generateCharts = () => {
  const data = state.titles.filter(title => title).map(currentTitle => [`assets/data/clean/${currentTitle}-geodata.json`, `assets/data/clean/${currentTitle}-circulation.json`]).flat()
  Promise.all(data.map(url => d3.json(url)))
  .then(renderCharts)
}

generateCharts()
