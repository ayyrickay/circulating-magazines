import assert from 'assert'
import { combineCirculation, prettifyIssueData, renderNumberWithCommas, titleCleanup, toMetric, formatNum} from '../assets/js/helpers/DataFormat.js'

const emptyData = {
    "data" : {
        "value": {}
    }
}

const sampleIssueData = {
    "x": "1921-06-04T00:00:00.000Z",
    "y": 1291679,
    "data": {
      "key": null,
      "value": {
        "canonical_title": "Saturday Evening Post",
        "count": 1,
        "issue_circulation": 1291679,
        "price": "$0.05",
        "publishing_company": "The Curtis Publishing Company",
        "editor": "George Horace Lorimer",
        "circulation_quality": "Certified",
        "special_notes": "\"The circulation of these editions was curtailed by reason of pressmen's 'strike.'\" (Publisher's Remarks)"
      }
    },
    "layer": "0",
    "y0": 0,
    "y1": 1291679
  }

describe('DataFormat', () => {
    describe('renderNumberWithCommas', () => {
        it('should ignore commas for small numbers', () => {
            assert.equal(renderNumberWithCommas(100), '100')
        })

        it('should ignore decimals when adding commas', () => {
            assert.equal(renderNumberWithCommas(100.000), '100')
        })

        it('should return a comma for four digit numbers', () => {
            assert.equal(renderNumberWithCommas(1000), '1,000')
        })

        it('should return two commas for large digit numbers', () => {
            assert.equal(renderNumberWithCommas(1000000), '1,000,000')
        })
    })

    describe('toMetric', () => {
        it('should return non-numeric entries', () => {
            assert.equal(toMetric('hello'), 'hello')
        })
        it('should return >1000 number as is', () => {
            assert.equal(toMetric(100), 100)
        })

        it('should return thousands', () => {
            assert.equal(toMetric(100000), '100k')
        })

        it('should return millions', () => {
            assert.equal(toMetric(10000000), '10M')
        })

        it('should return billions', () => {
            assert.equal(toMetric(1000000000), '1B')
        })

        it('should return trillions', () => {
            assert.equal(toMetric(1000000000000), '1T+')
        })

        it('should give up after trillions', () => {
            assert.equal(toMetric(100000000000000000000), '1T+')
        })
    })

    describe('formatNum', () => {
        it('should round to two sigfigs with percent', () => {
            assert.equal(formatNum(.1222444444, 'percentOfPopulation'), '12.22%')
        })

        it('should return metric designation without percent', () => {
            assert.equal(formatNum(10000, 'rawData'), '10k')
        })
    })

    describe('combineCirculation', () => {
        it('should return an empty array when given no titles', () => {
            const output = combineCirculation([], null, null)
            assert.deepEqual(output, [])
        })

        it('should return an empty array when given non-array', () => {
            const output = combineCirculation('saev', null, null)
            assert.deepEqual(output, [])
        })

        it('should combine two arrays', () => {
            const output = combineCirculation(['saev', 'neyo'], [1, 2], [3, 4])
            assert.deepEqual(output, [1, 2, 3, 4])
        })

        it('should ignore second array if value is null', () => {
            const output = combineCirculation(['saev', 'null'], [1, 2], [3, 4])
            assert.deepEqual(output, [1, 2])
        })

    })

    describe('prettyifyIssueData', () => {
        it('should return a price', () => {
            const { price } = prettifyIssueData(sampleIssueData)
            assert.equal(price, '$0.05')
        })

        it('should return a nulled data object', () => {
            assert.deepEqual(prettifyIssueData(emptyData), {
                "circulation_quality": null,
                "date": "-",
                "editor": "-",
                "issue_circulation": "-",
                "magazine_title": "-",
                "price": "-",
                "publishing_company": "-",
                "special_notes": undefined,
                "titles_included": "-"
                })
        })
    })
})