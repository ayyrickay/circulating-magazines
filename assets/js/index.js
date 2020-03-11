import { notes, colorScales } from '../data/constants.js'
import { titleList } from '../data/titles-list.js'
import { processData } from './helpers/CrossfilterGenerator.js'
import {renderIssueData, renderGeoData, togglePropertyVisibility} from './helpers/DataRender.js'
import {titleCleanup, renderNumberWithCommas, toMetric, formatNum} from './helpers/DataFormat.js'
import {geoReducerAdd, geoReducerRemove, geoReducerDefault, circulationReducerAdd, circulationReducerRemove, circulationReducerDefault} from './helpers/dc-reducers.js'
const numberFormat = d3.format(".2f")
const us1Chart = dc.geoChoroplethChart("#us1-chart")
const us2Chart = dc.geoChoroplethChart("#us2-chart")
const composite = dc.compositeChart("#line-chart")
const us1Width = document.getElementById('us1-chart').offsetWidth
const us1Height = document.getElementById('us1-chart').offsetHeight
const us2Width = document.getElementById('us2-chart').offsetWidth
const us2Height = document.getElementById('us2-chart').offsetHeight
const lineChartWidth = document.getElementById('line-chart').offsetWidth
const lineChartHeight = document.getElementById('line-chart').offsetHeight
const titleNames = ['title1', 'title2']
const appState = {
  maxCompare: 2,
  titles: ['saev', 'null'],
  title1: {
    totalSalesByState: null,
    usChartRenderOption: 'percentOfPopulation',
    data: {},
    geoClicked: false,
    circulationClicked: false,
    usChart: us1Chart
  },
  title2: {
    totalSalesByState: null,
    usChartRenderOption: 'percentOfPopulation',
    data: {},
    geoClicked: false,
    circulationClicked: false,
    usChart: us2Chart
  }
}

function generateSelect () {
  let i = 0

  while (i < appState.maxCompare) {
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

// ****************************************************
// Helper Functions
// ****************************************************
function changeRenderOption(event, title) {
  if (appState[title].circulationClicked) {
    appState[title].usChartRenderOption = event.target.value
    appState[title].usChart.customUpdate()
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
  if (appState[title].usChartRenderOption === 'percentOfPopulation') {
    return [0, 1]
  } else {
    return [0, getTopValue(chartGroup, title)]
  }
}

const getTopValue = (group) => d3.max(group.all(), d => {
  if (appState[title].usChartRenderOption === 'percentOfPopulation') {
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
  dc.redrawAll()
})

// document.addEventListener('awesomplete-selectcomplete').
document.getElementById('title1RenderOption1').addEventListener('change', (ev) => changeRenderOption(ev, 'title1'))
document.getElementById('title1RenderOption2').addEventListener('change', (ev) => changeRenderOption(ev, 'title1'))
document.getElementById('title2RenderOption1').addEventListener('change', (ev) => changeRenderOption(ev, 'title2'))
document.getElementById('title2RenderOption2').addEventListener('change', (ev) => changeRenderOption(ev, 'title2'))

window.onresize = (event) => {
  composite.width(getWidth('line-chart') - 50).height(getHeight('line-chart') - 50).transitionDuration(0)
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
  console.log(processData(data[0], data[1]))
  appState.title1 = Object.assign({}, appState.title1, processData(data[0], data[1]))
  appState.title1.totalSalesByState = appState.title1.salesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))
  appState.title2 = Object.assign({}, appState.title2, processData(data[2], data[3]))
  appState.title2.totalSalesByState = appState.title2.salesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))

  // ****************************************************
  // Static Render Data
  // ****************************************************
  function renderStaticContent (title) {
    // Renders static information for each title
    const {canonical_title, titles_included} = appState[title].circulationByDate.all()[0].value
    console.log('rendering static content', canonical_title, titles_included)

    const editorNote = notes[appState.titles[title === 'title1' ? 0 : 1].toUpperCase()]
    document.getElementById(`${title}-editorial-note`).textContent = editorNote
    document.getElementById(`${title}-non-canon-title`).textContent = canonical_title
    appState[title].canonical_title = canonical_title
    togglePropertyVisibility(`${title}-titles-included`, titles_included, (titles) => titles.split('@').join(', '))
  }

  titleNames.forEach(title => renderStaticContent(title))

  const generateMapTipText = (sampled_total_sales, state_population) => {
    if (appState.title1.usChartRenderOption === 'percentOfPopulation') {
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
      ${appState.title1.circulationClicked ?
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
        ${appState.title2.circulationClicked ?
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
      appState[title].circulationClicked = false
      appState[title].usChartRenderOption = 'percentOfPopulation'
      document.getElementById(`${title}RenderOption1`).checked = true
      document.getElementById(`${title}ClearGeoFilterButton`).classList.add('hide')
      document.getElementById('clearIssueFilterButton').classList.add('hide')

      renderIssueData(null, title)
      renderGeoData(null, appState[title], title)

      lineTip.hide()
      appState[title].usChart.filter(null)
      appState[title].usChart.customUpdate()
      appState[title].usChart.colorDomain(generateScale(appState[title].salesByState, 'title1'))
      appState[title].usChart.redraw()
    }

    function resetCharts () {
      document.getElementById('clearIssueFilterButton').classList.add('hide')
      lineTip.hide()

      titleNames.forEach(title => {
        appState[title].samplePeriodEnd.filter(null)
        appState[title].circulationClicked = false
        document.getElementById(`${title}RenderOption1`).checked = true
        document.getElementById(`${title}ClearGeoFilterButton`).classList.add('hide')

        appState[title].usChartRenderOption = 'percentOfPopulation'

        renderIssueData(null, title)
        renderGeoData(null, appState[title], title)

        appState[title].usChart.filter(null)
        appState[title].usChart.customUpdate()
        appState[title].usChart.colorDomain(generateScale(appState[title].salesByState, title))
        appState[title].usChart.redraw()
      })
    }

    window.addEventListener("awesomplete-selectcomplete", (e) => {
      const targetNode = e.target.id.split('-').pop()
                    appState.titles[targetNode] = e.text.value
                    resetChart(`title${parseInt(targetNode) + 1}`)
                    generateCharts()
                }, false)

    d3.json("./assets/geo/us-states.json").then((statesJson) => {
        function customUpdate (title) {
          appState[title].usChart.group(appState[title].salesByState)
          appState[title].usChart.redraw()
        }

        us1Chart.customUpdate = () => customUpdate('title1')
        us2Chart.customUpdate = () => customUpdate('title2')

        us1Chart.legendables = () => {
          if (appState.title1.circulationClicked) {
            const range = us1Chart.colors().range()
            const domain = us1Chart.colorDomain()
            const step = (domain[1] - domain[0]) / range.length
            let val = domain[0]
            return range.map(function (d, i) {
                const legendable = {name: `${formatNum(val, appState, 'title1')} - ${formatNum(val+step, appState, 'title1')}`, chart: us1Chart}
                legendable.color = us1Chart.colorCalculator()(val)
                val += step
                return legendable
            })
          } else {
            return []
          }
        }

        us2Chart.legendables = () => {
          if (appState.title2.circulationClicked) {
            const range = us2Chart.colors().range()
            const domain = us2Chart.colorDomain()
            const step = (domain[1] - domain[0]) / range.length
            let val = domain[0]
            return range.map(function (d, i) {
                const legendable = {name: `${formatNum(val, appState, 'title2')} - ${formatNum(val+step, appState, 'title2')}`, chart: us2Chart}
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
                .dimension(appState.title1.stateRegion)
                .group(appState.title1.salesByState)
                .colors(d3.scaleQuantize().range(colorScales.blue))
                .colorDomain(generateScale(appState.title1.salesByState, 'title1'))
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
                    if (appState.title1.usChartRenderOption === 'percentOfPopulation') {
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
                          if (!appState.title1.geoClicked) {
                            title1MapTip.show(d)
                            renderGeoData(d, appState.title1, 'title1', appState.title1.salesByState.all().filter(item => item.key === d.properties.name)[0])
                          }
                        })
                        .on('mouseout.title1MapTip', d => {
                          title1MapTip.hide(d)
                          if(!appState.title1.geoClicked) {
                            renderGeoData(null, appState.title1, 'title1')
                          }
                        });
                })
                .on('renderlet.click', chart => {
                  chart.selectAll('path').on('click', selected => {
                    const selectedState = selected.properties.name
                    if(appState.title1.circulationClicked && appState.title1.geoClicked) {
                      console.log('derp')
                      chart.filter(null)
                      chart.filter(selectedState)
                      renderGeoData(selectedState, appState.title1, 'title1', appState.title1.salesByState.all().filter(item => item.key === selectedState)[0])
                    } else if (appState.title1.circulationClicked) {
                      console.log('doop')
                      appState.title1.geoClicked = true
                      const clearGeoFilterButton = document.getElementById('title1ClearGeoFilterButton')
                      clearGeoFilterButton.classList.remove('hide')
                      clearGeoFilterButton.addEventListener('click', () => {
                        renderGeoData(null, appState.title1, 'title1')
                        chart.filter(null)
                        appState.title1.geoClicked = false
                        clearGeoFilterButton.classList.add('hide')
                      })
                      chart.filter(selectedState)
                      renderGeoData(selectedState, appState.title1, 'title1', appState.title1.salesByState.all().filter(item => item.key === selectedState)[0])
                    }
                  })
                })
                .on('filtered.geodata', (chart, filter) => {
                  if(chart.filter() === null) {
                    renderGeoData(null, appState.title1, 'title1')
                    const clearGeoFilterButton = document.getElementById('title1ClearGeoFilterButton')
                    appState.title1.geoClicked = false
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
                .dimension(appState.title2.stateRegion)
                .group(appState.title2.salesByState)
                .colors(d3.scaleQuantize().range(colorScales.red))
                .colorDomain(generateScale(appState.title2.salesByState, 'title2'))
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
                    if (appState.title2.usChartRenderOption === 'percentOfPopulation') {
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
                          if (!appState.title2.geoClicked) {
                            title2MapTip.show(d)
                            renderGeoData(d, appState.title2, 'title2', appState.title2.salesByState.all().filter(item => item.key === d.properties.name)[0])
                          }
                        })
                        .on('mouseout.title2MapTip', d => {
                          title2MapTip.hide(d)
                          if(!appState.title2.geoClicked) {
                            renderGeoData(null, appState.title2, 'title2')
                          }
                        });
                })
                .on('renderlet.click', chart => {
                  chart.selectAll('path').on('click', selected => {
                    const selectedState = selected.properties.name
                    if(appState.title2.circulationClicked && appState.title2.geoClicked) {
                      chart.filter(null)
                      chart.filter(selectedState)
                      renderGeoData(selectedState, appState.title2, 'title2', appState.title2.salesByState.all().filter(item => item.key === selectedState)[0])
                    } else if (appState.title2.circulationClicked) {
                      appState.title2.geoClicked = true
                      const clearGeoFilterButton = document.getElementById('title2ClearGeoFilterButton')
                      clearGeoFilterButton.classList.remove('hide')
                      clearGeoFilterButton.addEventListener('click', () => {
                        renderGeoData(null, appState.title2, 'title2')
                        chart.filter(null)
                        appState.title2.geoClicked = false
                        clearGeoFilterButton.classList.add('hide')
                      })
                      chart.filter(selectedState)
                      renderGeoData(selectedState, appState.title2, 'title2', appState.title2.salesByState.all().filter(item => item.key === selectedState)[0])
                    }
                  })
                })
                .on('filtered.geodata', (chart, filter) => {
                  if(chart.filter() === null) {
                    renderGeoData(null, appState.title2, 'title2')
                    const clearGeoFilterButton = document.getElementById('title2ClearGeoFilterButton')
                    appState.title2.geoClicked = false
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

        function generateLineCharts() {
          const colors = ['blue', 'red']
          return appState.titles
            .filter(title => title !== 'null')
            .map((title, index) => {
            return dc.lineChart(composite)
              .group(appState[`title${index+1}`].circulationByDate)
              .dimension(appState[`title${index+1}`].dates)
              .colors(colorScales[colors[index]][colorScales[colors[index]].length - 1])
              .valueAccessor(d => parseInt(d.value.issue_circulation))
              .xyTipsOn(true)
          })
        }

        const lineCharts = generateLineCharts()
        console.log(lineCharts)
        composite
          .width(lineChartWidth-50)
          .height(lineChartHeight-50)
          .margins({ top: 10, right: 10, bottom: 50, left: 80 })
          .elasticY(true)
          .x(d3.scaleTime().domain([d3.min(appState.title1.circulationByDate.all(), d => d.key), d3.max(appState.title1.circulationByDate.all(), d => d.key)]))
          .xUnits(d3.timeYears)
          .brushOn(false)
          .compose(lineCharts)
          .on('pretransition.click', (chart) => {
            chart.selectAll('circle').on('click', (selected) => {
              const currentTitle = selected.data.value.canonical_title === appState.title1.canonical_title ? 'title1' : 'title2'
              appState[currentTitle].circulationClicked = true
              const clearFilterButton = document.getElementById('clearIssueFilterButton')
              clearFilterButton.classList.remove('hide')
              clearFilterButton.addEventListener('click', composite.unClick)
              renderIssueData(selected, currentTitle)

              appState[currentTitle].samplePeriodEnd.filter(d => {
                const currentIssueDate = moment.utc(selected.x)
                const periodEnding = moment.utc(d)
                const periodStart = moment.utc({'year': periodEnding.get('year'), 'month': periodEnding.get('month') === 5 ? 0 : 6, 'day':1})
                if (currentIssueDate >= periodStart && currentIssueDate <= periodEnding) {
                  Object.assign(appState[currentTitle], {currentIssueDate, periodStart, periodEnding})
                  return currentIssueDate >= periodStart && currentIssueDate <= periodEnding
                }
              })

              appState[currentTitle].totalSalesByState = appState[currentTitle].salesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))
              appState[currentTitle].usChart.colorDomain(generateScale(appState[currentTitle].salesByState, 'title1'))
              appState[currentTitle].usChart.customUpdate()
            })
          })
          .on('renderlet.mouseover', (chart) => {
            chart.selectAll('circle').on('mouseover.hover', (selected) => {
              const currentTitle = selected.data.value.canonical_title === appState.title1.canonical_title ? 'title1' : 'title2'
              if (!appState[currentTitle].circulationClicked) {
                appState[currentTitle].samplePeriodEnd.filter(d => {
                  const currentIssueDate = moment.utc(selected.x)
                  const periodEnding = moment.utc(d)
                  const periodStart = moment.utc({'year': periodEnding.get('year'), 'month': periodEnding.get('month') === 5 ? 0 : 6, 'day':1})
                  if (currentIssueDate >= periodStart && currentIssueDate <= periodEnding) {
                    Object.assign(appState[currentTitle], {currentIssueDate, periodStart, periodEnding})
                    return currentIssueDate >= periodStart && currentIssueDate <= periodEnding
                  }
                })

                appState[currentTitle].totalSalesByState = appState[currentTitle].salesByState.all().reduce((a, b) => ({value: {sampled_total_sales: a.value.sampled_total_sales + b.value.sampled_total_sales}}))

                appState[currentTitle].usChart.colorDomain(generateScale(appState.title1.salesByState, 'title1'))
                appState[currentTitle].usChart.customUpdate()
              }
            })

            chart.selectAll('circle').on('mouseleave.hover', (selected) => {
              const currentTitle = selected.data.value.canonical_title === appState.title1.canonical_title ? 'title1' : 'title2'

              if (!appState[currentTitle].circulationClicked) {
                appState[currentTitle].samplePeriodEnd.filter(null)
                appState[currentTitle].usChart.colorDomain(generateScale(appState[currentTitle].salesByState, 'title1'))
                appState[currentTitle].usChart.redraw()
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

        // Establish global chart filter method
        dc.chartRegistry.list().forEach((chart) => {
          chart.on('filtered', () => {
            us1Chart.customUpdate()
            us2Chart.customUpdate()
          })
        })

        dc.renderAll()
    })
}

const generateCharts = () => {
  const data = appState.titles.map(currentTitle => [`assets/data/clean/${currentTitle}-geodata.json`, `assets/data/clean/${currentTitle}-circulation.json`]).flat()
  Promise.all(data.map(url => d3.json(url)))
  .then(renderCharts)
}

generateCharts()
