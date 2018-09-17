// Render CSV as a 2D Matrix
// Iterate over the matrix and generates a JSON in the following format:
// const population = {
//   'state1': {
//     decade1: 'value',
//     decade2: 'value',
//     decade3: 'value'
//   },
//   'state2': {
//     decade1: 'value',
//     decade2: 'value',
//     decade3: 'value'
//   }
// }

const fs = require('fs')
const readline = require('readline')

const data = []

var lineReader = readline.createInterface({
  input: fs.createReadStream('./populationByState.csv')
});

lineReader.on('line', (line) => {
  const cells = line.split(",")
  data.push(cells)
});

lineReader.on('close', () => {
  const populationJson = {}

  for (let y = 1; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      if (x === 0) {
        populationJson[data[y][0]] = {}
      } else {
        populationJson[data[y][0]][data[0][x]] = data[y][x]
      }
    }
  }

  fs.writeFile('population_by_state.json', JSON.stringify(populationJson), 'utf8', (err) => {
    if (err) throw err
    console.log('Successfully generated population json')
  })
})
