const path = require('path')
const fs = require('fs')

const titles = fs.readdirSync('../clean').filter(file => file.indexOf('circulation') > -1)
console.log(titles)

const data = []

for (let i = 0; i < titles.length; i++) {
  const json = JSON.parse(fs.readFileSync(`../clean/${titles[i]}`))
  const title_code = titles[i].split('-')[0]
  const title = json[5]

  if (title) {
    const name = title.canonical_title
    data.push({value: title_code.toLowerCase(), label: name})
  } else {
    console.log('magazine title is undefined for', json[4])
  }

}

// console.log('initial length is', circulationData.circulationData.length)
// console.log(circulationData.circulationData[0])
console.log(data)
console.log('length of data is', data.length)

fs.writeFile(path.join(__dirname, '/../titles-list.js'), `export const titleList = ${JSON.stringify(data)}`, 'utf8', (err) => {
  if (err) throw err
  console.log('Successfully joined data')
})
