import { notes, colorScales, stateCodes } from '../data/constants.js'
import {renderIssueData, renderGeoData} from './helpers/DataRender.js'
import {renderNumberWithCommas, toMetric, formatNum} from './helpers/DataFormat.js'
const numberFormat = d3.format(".2f")
const titleSelector = document.getElementById('title-select')
const us1Chart = dc.geoChoroplethChart("#us1-chart")
const lineChart = dc.lineChart("#line-chart")
const rangeChart = dc.barChart("#range-chart")
const us1Width = document.getElementById('us1-chart').offsetWidth
const us1Height = document.getElementById('us1-chart').offsetHeight
const lineChartWidth = document.getElementById('line-chart').offsetWidth
const lineChartHeight = document.getElementById('line-chart').offsetHeight
const state = {
  isClicked: false,
  selectedMagazine: 'saev',
  totalSalesByState: null,
  us1ChartRenderOption: 'percentOfPopulation',
  title1Data: {}
}

titleSelector.value = 'Saturday Evening Post'

new Awesomplete(titleSelector, {
  autoFirst: true,
  list: [{"value":"adve","label":"Adventure"},{"value":"amma","label":"American Magazine"},{"value":"amme","label":"American Mercury"},{"value":"atmo","label":"Atlantic Monthly"},{"value":"batm","label":"Batman"},{"value":"blbo","label":"Blue Book Magazine"},{"value":"blma","label":"Black Mask"},{"value":"cent","label":"Century"},{"value":"clma","label":"Clayton Magazines"},{"value":"clmab","label":"Clayton Magazines (bimonthly)"},{"value":"coll","label":"Collier's"},{"value":"defi","label":"Dell Fiction Group"},{"value":"dial","label":"Dial"},{"value":"fiho","label":"Fiction House"},{"value":"foru","label":"Forum"},{"value":"harp","label":"Harper's"},{"value":"judg","label":""},{"value":"libe","label":"Liberty"},{"value":"muns","label":"Munsey Combination"},{"value":"neyo","label":"New Yorker"},{"value":"play","label":"Playboy"},{"value":"popu","label":"Popular Publications"},{"value":"saev","label":"Saturday Evening Post"},{"value":"scma","label":"Scribner's Magazine"},{"value":"shst","label":"Short Stories"},{"value":"smse","label":"Smart Set"},{"value":"stsm","label":"Street and Smith Combination"},{"value":"supe","label":"Superman"},{"value":"thgr","label":"Thrilling Group"},
  {"value":"vafa","label":"Vanity Fair"}],
  replace: (suggestion) => {
    titleSelector.value = suggestion.label
  }
})

// ****************************************************
// Helper Functions
// ****************************************************
function changeRenderOption(event) {
  if (state.isClicked) {
    state.us1ChartRenderOption = event.target.value
    us1Chart.customUpdate()
    dc.redrawAll()
  } else {
    document.getElementById('renderOption1').checked = true
    document.getElementById('renderOption2').checked = false
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

function transformValue(data, statePopulation, total) {
  if (state.us1ChartRenderOption === 'percentOfPopulation') {
    return data / statePopulation
  } else {
    return data
  }
}

function generateScale(chartGroup) {
  if (state.us1ChartRenderOption === 'percentOfPopulation') {
    return [0, 1]
  } else {
    return [0, getTopValue(chartGroup)]
  }
}

const getTopValue = (group) => d3.max(group.all(), d => {
  if (state.us1ChartRenderOption === 'percentOfPopulation') {
    return d.value.sampled_total_sales / d.value.state_population
  } else {
    return d.value.sampled_total_sales
  }
})

// ****************************************************
// Create Event Listeners for HTML
// ****************************************************
document.getElementById('reset-button').addEventListener('click', () => {
  lineChart.filterAll()
  rangeChart.filterAll()
  dc.redrawAll()
})

document.getElementById('renderOption1').addEventListener('change', changeRenderOption)
document.getElementById('renderOption2').addEventListener('change', changeRenderOption)

window.onresize = (event) => {
  lineChart.width(getWidth('line-chart') - 50).height(getHeight('line-chart') - 50).transitionDuration(0)
  rangeChart.width(getWidth('line-chart') - 50).transitionDuration(0)
  us1Chart
    .projection(d3.geoAlbersUsa()
      .scale(Math.min(getWidth('us1-chart') * 1.5, getHeight('us1-chart') * 1.5))
      .translate([getWidth('us1-chart') / 8, getHeight('us1-chart') / 2.5])
    )
    .transitionDuration(0)
    .width(getWidth('us1-chart') - 200)
    .height(getHeight('us1-chart') - 50)

  dc.renderAll()
  us1Chart.transitionDuration(750)
  lineChart.transitionDuration(750)
}

// ****************************************************
// Render Logic for Chart
// ****************************************************

const renderCharts = (data) => {
  const title1GeoData = data[0].filter(data => {
    if (!data) {return false}
    return stateCodes[data.state_region]
  })

  const title1Circulation = data[1]

  title1Circulation.forEach(d => {
    d.actual_issue_date = new Date(d.actual_issue_date)
  })

  const geodata = crossfilter(title1GeoData)
  const circulation = crossfilter(title1Circulation)

  // Reducer function for raw geodata
  function geoReducerAdd(p, v) {
    // console.log(p.sampled_issue_date, v.sampled_issue_date, state.periodEnding, state.periodStart)
    ++p.count
    p.sampled_mail_subscriptions += v.sampled_mail_subscriptions
    p.sampled_single_copy_sales += v.sampled_single_copy_sales
    p.sampled_total_sales += v.sampled_total_sales
    p.state_population = v.state_population // only valid for population viz
    p.sampled_issue_date = v.sampled_issue_date
    return p
  }

  function geoReducerRemove(p, v) {
    const currDate = new Date(v.sampled_issue_date)
    // if(currDate.getFullYear() === 1921) {
    //   console.log(currDate)
    // }
    currDate <= state.periodEnding && currDate >= state.periodStart ? console.log(v.sampled_issue_date, p.sampled_issue_date) : null
    const dateToRender = currDate <= state.periodEnding && currDate >= state.periodStart ? v.sampled_issue_date : p.sampled_issue_date
    --p.count
    p.sampled_mail_subscriptions -= v.sampled_mail_subscriptions
    p.sampled_single_copy_sales -= v.sampled_single_copy_sales
    p.sampled_total_sales -= v.sampled_total_sales
    p.state_population = v.state_population // only valid for population viz
    p.sampled_issue_date = dateToRender
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
      sampled_issue_date: ""
    }
  }

  // Generate dimensions and groups for choropleth
  const stateRegion = geodata.dimension((d) => d.state_region)
  const samplePeriodEnd = geodata.dimension(d => d.sample_period_ending)
  const salesByState = stateRegion.group().reduce(geoReducerAdd, geoReducerRemove, geoReducerDefault)

  state.totalSalesByState = salesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))

  // generate dimensions and groups for line/range chart
  const title1Dates = circulation.dimension(d => d.actual_issue_date)
  const title1CirculationByDate = title1Dates.group().reduce((p, v) => {
      ++p.count
      p.canonical_title = v.canonical_title
      p.issue_circulation += v.issue_circulation
      p.price = v.price
      p.type = v.type
      p.publishing_company = v.publishing_company
      p.titles_included = v.titles_included
      p.editor = v.editor
      p.circulation_quality = v.circulation_quality
      return p
    },
    /* callback for when data is removed from the current filter results */
    (p, v) => {
      --p.count
      p.canonical_title = v.canonical_title
      p.issue_circulation -= v.issue_circulation
      p.price = v.price
      p.type = v.type
      p.publishing_company = v.publishing_company
      p.titles_included = v.titles_included
      p.editor = v.editor
      p.circulation_quality = v.circulation_quality
      return p
    },
    /* initialize p */
    () => ({
      canonical_title:"",
      count: 0,
      issue_circulation: 0,
      price: "",
      type: "",
      publishing_company: "",
      titles_included: "",
      editor: "",
      circulation_quality: ""
    })
    )


  // ****************************************************
  // Static Render Data
  // ****************************************************
  const specialNote = notes[state.selectedMagazine.toUpperCase()]
  const {canonical_title, titles_included} = title1CirculationByDate.all()[0].value
  document.getElementById('special-note').textContent = specialNote
  document.getElementById('non-canon-title').textContent = canonical_title
  if (titles_included === "") {
    document.getElementById('titles-included').parentNode.classList.add('hide')
  } else {
    document.getElementById('titles-included').parentNode.classList.remove('hide')
  }

  const generateMapTipText = (sampled_total_sales, state_population) => {
    if (state.us1ChartRenderOption === 'percentOfPopulation') {
      return `${(sampled_total_sales / state_population).toFixed(3)} issues per person`
    } else {
      return `${renderNumberWithCommas(sampled_total_sales)} issues`
    }
  }

  const mapTip = d3.tip()
    .attr('class', 'tooltip')
    .offset([-10, 0])
    .html((d) => {
      return `
      <div class="tooltip-data">
        <h4 class="key">State</h4>
        <p>${d.properties.name}</p>
      </div>
      <div class="tooltip-data">
      ${state.isClicked ?
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
          <p>${key.format('mmm dd, yyyy')}</p>
        </div>
        <div class="tooltip-data">
          <h4 class="key">Circulation</h4>
          <p> ${issue_circulation.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} issues</p>
        </div>
        `
      })

    const resetCharts = () => {
      samplePeriodEnd.filter(null)
      state.isClicked = false

      document.getElementById('renderOption1').checked = true
      document.getElementById('renderOption2').checked = false
      document.getElementById('clearIssueFilterButton').style.visibility = 'hidden'
      state.us1ChartRenderOption = 'rawData'
      renderIssueData()

      lineTip.hide()

      us1Chart.customUpdate()
      us1Chart.colorDomain(generateScale(salesByState))
      us1Chart.redraw()
    }

    window.addEventListener("awesomplete-selectcomplete", (e) => {
                    state.selectedMagazine = e.text.value
                    resetCharts()
                    generateCharts()
                }, false)

    d3.json("./assets/geo/us-states.json").then((statesJson) => {
        us1Chart.customUpdate = () => {
          us1Chart.group(salesByState)
          us1Chart.redraw()
        }

        us1Chart.legendables = () => {
          if (state.isClicked) {
            const range = us1Chart.colors().range()
            const domain = us1Chart.colorDomain()
            const step = (domain[1] - domain[0]) / range.length
            let val = domain[0]
            return range.map(function (d, i) {
                const legendable = {name: `${formatNum(val, state)} - ${formatNum(val+step, state)}`, chart: us1Chart}
                legendable.color = us1Chart.colorCalculator()(val)
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
                .colorDomain(generateScale(salesByState))
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
                    if (state.us1ChartRenderOption === 'percentOfPopulation') {
                      return kv.value.sampled_total_sales / kv.value.state_population
                    } else {
                      return kv.value.sampled_total_sales
                    }
                  }
                })
                .renderTitle(false)
                .legend(dc.legend().x(getWidth('us1-chart') / 4.5).y(getHeight('us1-chart') / 2.5).itemHeight(10).itemWidth(getWidth('us1-chart') / 10).legendWidth(getWidth('us1-chart') / 3))
                .on('renderlet.click', (chart) => {
                  chart.selectAll('path').on('click', () => {})
                })
                .on('pretransition', (chart) => {
                    chart.selectAll('path')
                        .call(mapTip)
                        .on('mouseover.mapTip', d => {mapTip.show(d); renderGeoData(d, state, salesByState.all().filter(item => item.key === d.properties.name)[0])})
                        .on('mouseout.mapTip', d => {mapTip.hide(d); renderGeoData(null, state)});
                })
                .on('filtered', (chart, filter) => {
                  // console.log(chart.filters())
                  // console.log(filter)
                })
                .on("preRender", (chart) => {
                  chart.colorDomain(d3.extent(chart.data(), chart.valueAccessor()));
                })
                .on("preRedraw", (chart) => {
                  chart.colorDomain(d3.extent(chart.data(), chart.valueAccessor()));
                })

        lineChart.unClick = resetCharts

        lineChart
          .width(lineChartWidth-50)
          .height(lineChartHeight-50)
          .xUnits(d3.timeMonths)
          .margins({ top: 10, right: 10, bottom: 50, left: 80 })
          .dimension(title1Dates)
          .rangeChart(rangeChart)
          .group(title1CirculationByDate)
          .colors(colorScales.blue[colorScales.blue.length - 1])
          .elasticY(true)
          .brushOn(false)
          .valueAccessor(d => d.value.issue_circulation)
          .x(d3.scaleTime().domain([d3.min(title1CirculationByDate.all(), d => d.key), d3.max(title1CirculationByDate.all(), d => d.key)]))
          .renderTitle(false)
          .on('renderlet.click', (chart) => {
            chart.selectAll('circle').on('click', (selected) => {
              state.isClicked = true
              const clearFilterButton = document.getElementById('clearIssueFilterButton')
              clearFilterButton.style.visibility = 'visible'
              clearFilterButton.addEventListener('click', lineChart.unClick)
              renderIssueData(selected)
              samplePeriodEnd.filter(d => {
                const currentIssueDate = new Date(selected.x)
                const periodEnding = new Date(d)
                const periodStart = new Date(periodEnding.getMonth() === 5 ? new Date(periodEnding).setFullYear(periodEnding.getFullYear(), 0, 1) : new Date(periodEnding).setFullYear(periodEnding.getFullYear(), 6, 1)) // error is definitely on this line
                if (currentIssueDate >= periodStart && currentIssueDate <= periodEnding) {
                  Object.assign(state, {currentIssueDate, periodStart, periodEnding})
                  return currentIssueDate >= periodStart && currentIssueDate <= periodEnding
                }
              })

              state.totalSalesByState = salesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))
              us1Chart.colorDomain(generateScale(salesByState))
              us1Chart.customUpdate()
            })
          })
          .on('renderlet.mouseover', (chart) => {
            chart.selectAll('circle').on('mouseover.hover', (selected) => {
              if (!state.isClicked) {
                samplePeriodEnd.filter(d => {
                  const currentIssueDate = new Date(selected.x)
                  const periodEnding = new Date(d)
                  const periodStart = new Date(periodEnding.getMonth() === 5 ? new Date(periodEnding).setFullYear(periodEnding.getFullYear(), 0, 1) : new Date(periodEnding).setFullYear(periodEnding.getFullYear(), 6, 1)) // error is definitely on this line
                  if (currentIssueDate >= periodStart && currentIssueDate <= periodEnding) {
                    Object.assign(state, {currentIssueDate, periodStart, periodEnding})
                    return currentIssueDate >= periodStart && currentIssueDate <= periodEnding
                  }
                })

                state.totalSalesByState = salesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))

                us1Chart.colorDomain(generateScale(salesByState))
                us1Chart.customUpdate()
              }
            })

            chart.selectAll('circle').on('mouseleave.hover', (selected) => {
              if (!state.isClicked) {
                samplePeriodEnd.filter(null)
                us1Chart.colorDomain(generateScale(salesByState))
                us1Chart.redraw()
              }
            })

          })
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
          .render()


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
  Promise.all([`assets/data/clean/${state.selectedMagazine}-geodata.json`, `assets/data/clean/${state.selectedMagazine}-circulation.json`].map(url => d3.json(url)))
  .then(renderCharts)
}

generateCharts()
