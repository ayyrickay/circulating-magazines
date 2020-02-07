import { notes, colorScales, stateCodes } from '../data/constants.js'
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
  circulationClicked: false, // Make this work across two separate choropleths
  geoClicked: false,
  titles: ['saev', 'neyo'],
  totalSalesByState: null,
  us1ChartRenderOption: 'percentOfPopulation',
  us2ChartRenderOption: 'percentOfPopulation',
  title1Data: {},
  maxCompare: 2
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
    new Awesomplete(selector, {
      autoFirst: true,
      list: [{"value":"4mco","label":"4-Most Comics"},{"value":"acde","label":"Actual Detective Stories"},{"value":"acfi","label":"Ace Fiction Group"},{"value":"achi","label":"Ace High"},{"value":"acst","label":"Action Stories"},{"value":"adve","label":"Adventure"},{"value":"alam","label":"All American Comics Group"},{"value":"amco","label":"American Comics Group"},{"value":"amfi","label":"American Fiction Group"},{"value":"amma","label":"American Magazine"},{"value":"amme","label":"American Mercury"},{"value":"amst","label":"Amazing Stories"},{"value":"aral","label":"Argosy All-Story"},{"value":"arcg","label":"Archie Comic Group"},{"value":"arch","label":"Archie Comics"},{"value":"arco","label":"Argosy Combination"},{"value":"atmo","label":"Atlantic Monthly"},{"value":"batm","label":"Batman"},{"value":"beho","label":"Better Homes and Gardens"},{"value":"blbo","label":"Blue Book Magazine"},{"value":"blma","label":"Black Mask"},{"value":"bnbr","label":"B'nai B'rith Magazine"},{"value":"brst","label":"Breezy Stories"},{"value":"brth","label":"Bronze Thrills"},{"value":"cama","label":"Captain Marvel Adventures"},{"value":"cent","label":"Century"},{"value":"clma","label":"Clayton Magazines"},{"value":"clmab","label":"Clayton Magazines (bimonthly)"},{"value":"cohu","label":"College Humor"},{"value":"coll","label":"Collier's"},{"value":"colo","label":"Color"},{"value":"conf","label":"Confidential"},{"value":"copa","label":"Comics on Parade"},{"value":"cosm","label":"Cosmopolitan"},{"value":"crco","label":"Crime Confessions"},{"value":"crde","label":"Crime Detective"},{"value":"cudi","label":"Cupid's Diary"},{"value":"deco","label":"Dell Comic Group"},{"value":"dede","label":"Dell Detective Group"},{"value":"defi","label":"Dell Fiction Group"},{"value":"detco","label":"Detective Comics Group"},{"value":"dewo","label":"Dell Women's Group"},{"value":"dial","label":"Dial"},{"value":"doac","label":"Double Action Group"},{"value":"dobe","label":"Down Beat"},{"value":"drwo","label":"Dream World"},{"value":"dyde","label":"Dynamic Detective"},{"value":"ebon","label":"Ebony"},{"value":"esqu","label":"Esquire"},{"value":"ever","label":"Everybody's"},{"value":"feco","label":"Feature Comics"},{"value":"fiho","label":"Fiction House"},{"value":"fist","label":"Field and Stream"},{"value":"flac","label":"Flying Aces"},{"value":"foco","label":"Fox Comic Group"},{"value":"fome","label":"For Men Only"},{"value":"forb","label":"Forbes"},{"value":"fort","label":"Fortune"},{"value":"foru","label":"Forum"},{"value":"fron","label":"Frontier"},{"value":"gude","label":"Guide Detective Unit"},{"value":"haba","label":"Harper's Bazaar"},{"value":"harp","label":"Harper's"},{"value":"hear","label":"Hearst's"},{"value":"hit","label":"Hit"},{"value":"jet","label":"Jet"},{"value":"jetr","label":"Jewish Tribune"},{"value":"judg","label":"Judge"},{"value":"ken","label":"Ken"},{"value":"laff","label":"Laff"},{"value":"laho","label":"Ladies' Home Journal"},{"value":"libe","label":"Liberty"},{"value":"life","label":"Life"},{"value":"lisn","label":"Snappy Stories Group"},{"value":"loaro","label":"Love and Romance"},{"value":"look","label":"Look"},{"value":"loro","label":"Love Romances"},{"value":"maco","label":"Marvel Comic Group"},{"value":"mans","label":"Man's Magazine"},{"value":"mcca","label":"McCall's"},{"value":"mccl","label":"McClure's"},{"value":"metr","label":"Metropolitan"},{"value":"mimo","label":"Mickey Mouse Magazine"},{"value":"mosh","label":"Movie Show"},{"value":"muma","label":"Munsey's Magazine"},{"value":"muns","label":"Munsey Combination"},{"value":"naco","label":"National Comics Group"},{"value":"nage","label":"National Geographic Magazine"},{"value":"nati","label":"Nation"},{"value":"news","label":"Newsweek"},{"value":"neyo","label":"New Yorker"},{"value":"nwst","label":"North West Stories"},{"value":"phcu","label":"Physical Culture"},{"value":"play","label":"Playboy"},{"value":"popu","label":"Popular Publications"},{"value":"raro","label":"Ranch Romances"},{"value":"redb","label":"Redbook"},{"value":"saev","label":"Saturday Evening Post"},{"value":"scin","label":"Science and Invention"},{"value":"scma","label":"Scribner's Magazine"},{"value":"scri","label":"Script"},{"value":"shst","label":"Short Stories"},{"value":"skri","label":"Sky Riders"},{"value":"smse","label":"Smart Set"},{"value":"snst","label":"Snappy Stories"},{"value":"spil","label":"Sports Illustrated"},{"value":"stag","label":"Stag"},{"value":"stsm","label":"Street and Smith Combination"},{"value":"supe","label":"Superman"},{"value":"swst","label":"Sweetheart Stories"},{"value":"tan","label":"Tan"},{"value":"tepu","label":"Teck Publications Fiction Combination"},{"value":"teta","label":"Telling Tales"},{"value":"thgr","label":"Thrilling Group"},{"value":"time","label":"Time"},{"value":"trcom","label":"True Comics"},{"value":"trix","label":"Triple-X"},{"value":"trma","label":"Marriage Stories"},{"value":"vafa","label":"Vanity Fair"},{"value":"vogu","label":"Vogue"},{"value":"wabi","label":"War Birds"},{"value":"wano","label":"War Novels"},{"value":"wast","label":"War Stories"},{"value":"weta","label":"Weird Tales"},{"value":"woho","label":"Woman's Home Companion"},{"value":"yoma","label":"C.H. Young Publishing Group"}],
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
function changeRenderOption(event) {
  if (state.circulationClicked) {
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
  composite.filterAll()
  rangeChart.filterAll()
  dc.redrawAll()
})

// document.addEventListener('awesomplete-selectcomplete').
document.getElementById('renderOption1').addEventListener('change', changeRenderOption)
document.getElementById('renderOption2').addEventListener('change', changeRenderOption)

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

  dc.renderAll()
  us1Chart.transitionDuration(750)
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

  console.log(title2GeoData, circulationData2)


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

  state.totalSalesByState = salesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))

  const title2StateRegion = geodata.dimension(d => d.state_region)
  const title2SamplePeriodEnd = geodata.dimension(d => d.sample_period_ending)
  const title2SalesByState = stateRegion.group().reduce(geoReducerAdd, geoReducerRemove, geoReducerDefault)

  state.title2TotalSalesByState = title2SalesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))

  // generate dimensions and groups for line/range chart
  // TODO: Candidate for a function
  const title1Dates = circulation.dimension(d => d.actual_issue_date)
  const title1CirculationByDate = title1Dates.group().reduce(circulationReducerAdd, circulationReducerRemove, circulationReducerDefault)

  const title2Dates = title2Circulation.dimension(d => d.actual_issue_date)
  const title2CirculationByDate = title2Dates.group().reduce(circulationReducerAdd, circulationReducerRemove, circulationReducerDefault)



  // ****************************************************
  // Static Render Data
  // ****************************************************
  const editorNote = notes[state.titles[0].toUpperCase()]
  const {canonical_title, titles_included} = title1CirculationByDate.all()[0].value
  document.getElementById('editorial-note').textContent = editorNote
  document.getElementById('non-canon-title').textContent = canonical_title
  togglePropertyVisibility('titles-included', titles_included, (titles) => titles.split('@').join(', '))

  const generateMapTipText = (sampled_total_sales, state_population) => {
    if (state.us1ChartRenderOption === 'percentOfPopulation') {
      return `${(sampled_total_sales / state_population).toFixed(3)} copies per person`
    } else {
      return `${renderNumberWithCommas(sampled_total_sales)} copies`
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
      ${state.circulationClicked ?
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

    const resetCharts = () => {
      samplePeriodEnd.filter(null)
      state.circulationClicked = false

      document.getElementById('renderOption1').checked = false
      document.getElementById('renderOption2').checked = true
      document.getElementById('clearIssueFilterButton').classList.add('hide')
      document.getElementById('clearGeoFilterButton').classList.add('hide')

      state.us1ChartRenderOption = 'percentOfPopulation'
      renderIssueData()
      renderGeoData(null, state)

      lineTip.hide()

      us1Chart.filter(null)
      us1Chart.customUpdate()
      us1Chart.colorDomain(generateScale(salesByState))
      us1Chart.redraw()
    }

    window.addEventListener("awesomplete-selectcomplete", (e) => {
      const targetNode = e.target.id.split('-').pop()
                    state.titles[targetNode] = e.text.value
                    console.log(state.titles)
                    resetCharts()
                    generateCharts()
                }, false)

    d3.json("./assets/geo/us-states.json").then((statesJson) => {
        us1Chart.customUpdate = () => {
          us1Chart.group(salesByState)
          us1Chart.redraw()
        }

        us1Chart.legendables = () => {
          if (state.circulationClicked) {
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
                .on('pretransition', (chart) => {
                    chart.selectAll('path')
                        .call(mapTip)
                        .on('mouseover.mapTip', d => {
                          if (!state.geoClicked) {
                            mapTip.show(d)
                            renderGeoData(d, state, salesByState.all().filter(item => item.key === d.properties.name)[0])
                          }
                        })
                        .on('mouseout.mapTip', d => {
                          mapTip.hide(d)
                          if(!state.geoClicked) {
                            renderGeoData(null, state)
                          }
                        });
                })
                .on('renderlet.click', chart => {
                  chart.selectAll('path').on('click', selected => {
                    const selectedState = selected.properties.name
                    if(state.circulationClicked && state.geoClicked) {
                      chart.filter(null)
                      chart.filter(selectedState)
                      renderGeoData(selectedState, state, salesByState.all().filter(item => item.key === selectedState)[0])
                    } else if (state.circulationClicked) {
                      state.geoClicked = true
                      const clearGeoFilterButton = document.getElementById('clearGeoFilterButton')
                      clearGeoFilterButton.classList.remove('hide')
                      clearGeoFilterButton.addEventListener('click', () => {
                        renderGeoData(null, state)
                        chart.filter(null)
                        state.geoClicked = false
                        clearGeoFilterButton.classList.add('hide')
                      })
                      chart.filter(selectedState)
                      renderGeoData(selectedState, state, salesByState.all().filter(item => item.key === selectedState)[0])
                    }
                  })
                })
                .on('filtered.geodata', (chart, filter) => {
                  if(chart.filter() === null) {
                    renderGeoData(null, state)
                    state.geoClicked = false
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
                .colorDomain(generateScale(title2SalesByState))
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
                    if (state.us2ChartRenderOption === 'percentOfPopulation') {
                      return kv.value.sampled_total_sales / kv.value.state_population
                    } else {
                      return kv.value.sampled_total_sales
                    }
                  }
                })
                .renderTitle(false)
                .legend(dc.legend().x(getWidth('us2-chart') / 4.5).y(getHeight('us2-chart') / 2.5).itemHeight(10).itemWidth(getWidth('us1-chart') / 10).legendWidth(getWidth('us1-chart') / 3))
                .on('pretransition', (chart) => {
                    chart.selectAll('path')
                        .call(mapTip)
                        .on('mouseover.mapTip', d => {
                          if (!state.geoClicked) {
                            mapTip.show(d)
                            renderGeoData(d, state, title2SalesByState.all().filter(item => item.key === d.properties.name)[0])
                          }
                        })
                        .on('mouseout.mapTip', d => {
                          mapTip.hide(d)
                          if(!state.geoClicked) {
                            renderGeoData(null, state)
                          }
                        });
                })
                .on('renderlet.click', chart => {
                  chart.selectAll('path').on('click', selected => {
                    const selectedState = selected.properties.name
                    if(state.circulationClicked && state.geoClicked) {
                      chart.filter(null)
                      chart.filter(selectedState)
                      renderGeoData(selectedState, state, salesByState.all().filter(item => item.key === selectedState)[0])
                    } else if (state.circulationClicked) {
                      state.geoClicked = true
                      const clearGeoFilterButton = document.getElementById('clearGeoFilterButton')
                      clearGeoFilterButton.classList.remove('hide')
                      clearGeoFilterButton.addEventListener('click', () => {
                        renderGeoData(null, state)
                        chart.filter(null)
                        state.geoClicked = false
                        clearGeoFilterButton.classList.add('hide')
                      })
                      chart.filter(selectedState)
                      renderGeoData(selectedState, state, salesByState.all().filter(item => item.key === selectedState)[0])
                    }
                  })
                })
                .on('filtered.geodata', (chart, filter) => {
                  if(chart.filter() === null) {
                    renderGeoData(null, state)
                    state.geoClicked = false
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
          .compose([
            dc.lineChart(composite)
              .group(title1CirculationByDate)
              .dimension(title1Dates)
              .colors(colorScales.blue[colorScales.blue.length - 1])
              .valueAccessor(d => parseInt(d.value.issue_circulation)),
              dc.lineChart(composite)
                .group(title2CirculationByDate)
                .dimension(title2Dates)
                .colors(colorScales.red[colorScales.red.length - 1])
                .valueAccessor(d => parseInt(d.value.issue_circulation))
          ])
          .renderTitle(false)
          .on('pretransition.click', (chart) => {
            chart.selectAll('circle').on('click', (selected) => {
              state.circulationClicked = true
              const clearFilterButton = document.getElementById('clearIssueFilterButton')
              clearFilterButton.classList.remove('hide')
              clearFilterButton.addEventListener('click', composite.unClick)
              renderIssueData(selected)
              samplePeriodEnd.filter(d => {
                const currentIssueDate = moment.utc(selected.x)
                const periodEnding = moment.utc(d)
                const periodStart = moment.utc({'year': periodEnding.get('year'), 'month': periodEnding.get('month') === 5 ? 0 : 6, 'day':1})
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
              if (!state.circulationClicked) {
                samplePeriodEnd.filter(d => {
                  const currentIssueDate = moment.utc(selected.x)
                  const periodEnding = moment.utc(d)
                  const periodStart = moment.utc({'year': periodEnding.get('year'), 'month': periodEnding.get('month') === 5 ? 0 : 6, 'day':1})
                  if (currentIssueDate >= periodStart && currentIssueDate <= periodEnding) {
                    console.log(currentIssueDate.format(), periodStart.format(), periodEnding.format())
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
              if (!state.circulationClicked) {
                samplePeriodEnd.filter(null)
                us1Chart.colorDomain(generateScale(salesByState))
                us1Chart.redraw()
              }
            })

          })
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
  const data = state.titles.map(currentTitle => [`assets/data/clean/${currentTitle}-geodata.json`, `assets/data/clean/${currentTitle}-circulation.json`]).flat()
  Promise.all(data.map(url => d3.json(url)))
  .then(renderCharts)
}

generateCharts()
