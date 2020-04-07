import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import moment from 'moment'

function hasAValidIssueDate (issueData) {
    // Checks to see if object has actual_issue_date property that looks kinda like the following format: 1921-06-04T00:00:00.000Z
    return issueData.actual_issue_date ? /^\d{4}\-\d{1,2}\-\d{1,2}\T0{2}\:0{2}\:0{2}Z$/.test(issueData.actual_issue_date) : false
}

const titles = fs.readdirSync(path.join(__dirname, '../clean')).filter(file => file.indexOf('circulation') > -1)

const data = []

for (let i = 0; i < titles.length; i++) {
    const json = JSON.parse(fs.readFileSync(path.join(__dirname, `../clean/${titles[i]}`)))
    // console.log(`${json[0].canonical_title}'s issue date is valid: ${hasAValidIssueDate(json[0])}, ${json[0].actual_issue_date}`)
    if (!hasAValidIssueDate(json[0])) {
        data.push(json[0].canonical_title)
        const cleanedDateJson = json.map(issue => {
            const issueDate = moment(issue.actual_issue_date)
            if (issueDate.isValid()) {
                return Object.assign(issue, {actual_issue_date: moment.utc(issueDate).startOf('day').format()})
            } else {
                return issue
            }
        })
        console.log(cleanedDateJson[0])
        fs.writeFile(path.join(__dirname, `../clean/${titles[i]}`), `${JSON.stringify(cleanedDateJson)}`, 'utf8', (err) => {
          if (err) throw err
          console.log('Successfully cleaned data')
        })
    }
    
}

console.log(data)
console.log('length of data is', data.length)

// fs.writeFile(path.join(__dirname, '/../titles-to-update-list.js'), `${JSON.stringify(data)}`, 'utf8', (err) => {
//   if (err) throw err
//   console.log('Successfully joined data')
// })
