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

    before(async function() {
        const filenames = await fs.promises.readdir(dataDirectory, 'utf8')
        const filteredFiles = filenames.filter(filename => filename.indexOf('circulation') > -1)
        data = await Promise.all(
            filteredFiles.map(async (filename) => {
                const file = path.join(dataDirectory, filename)
                const content = await fs.promises.readFile(file, 'utf-8')
                return JSON.parse(content)
            })
        )
    })

    it('should return an array of data', function () {
        const dataLength = data.length > 0
        assert.ok(dataLength)
    })

    it('should have valid issue dates for all titles', function() {
        data.forEach((title) => {
            title.forEach((issue) => {
                assert.ok(
                    hasAValidIssueDate(issue),
                    `${issue.canonical_title} has an issue date of ${issue.actual_issue_date}`
                )
            })
        })
    })

})
