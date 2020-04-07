import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url';
import {hasAValidIssueDate} from '../assets/js/helpers/DataFormat.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataDirectory = path.join(__dirname, '../assets/data/clean')

describe('Data Set', function() {
    let data = []

    before(function(done) {
        fs.readdir(dataDirectory, 'utf8', (err, filenames) => {
            if (err) throw err
            const filteredFiles = filenames.filter(filename => filename.indexOf('circulation') > -1)
            filteredFiles.forEach((filename, i) => {
                const file = path.join(dataDirectory, filename)
                fs.readFile(file, 'utf-8', function(err, content) {
                    if (err) throw err
                    const json = JSON.parse(content)
                    data.push(json)
                    if (i === filteredFiles.length - 1) { done()}
                })
            })
        })
    })

    it('should return an array of data', function () {
        const dataLength = data.length > 0
        assert.ok(dataLength)
    })

    it('should have valid issue dates for all titles', function() {
        data.forEach(title => {
            const issue = title[0]
            assert.ok(hasAValidIssueDate(issue), `${issue.canonical_title} has an issue date of ${issue.actual_issue_date}`)
        })
    })

})