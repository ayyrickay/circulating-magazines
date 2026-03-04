import assert from 'assert'
import moment from 'moment'
import {
  geoReducerAdd,
  geoReducerRemove,
  geoReducerDefault,
  circulationReducerAdd,
  circulationReducerRemove,
  circulationReducerDefault
} from '../assets/js/helpers/dc-reducers.js'

describe('Reducers', () => {
  before(() => {
    global.moment = moment
  })

  describe('geo reducers', () => {
    it('should add and remove values symmetrically', () => {
      const value = {
        sampled_issue_date: '1945-01-29T00:00:00Z',
        sampled_mail_subscriptions: 10,
        sampled_single_copy_sales: 20,
        sampled_total_sales: 30,
        state_population: 40
      }

      const added = geoReducerAdd(geoReducerDefault(), value)
      assert.equal(added.count, 1)
      assert.equal(added.sampled_mail_subscriptions, 10)
      assert.equal(added.sampled_single_copy_sales, 20)
      assert.equal(added.sampled_total_sales, 30)
      assert.equal(added.state_population, 40)
      assert.equal(Object.keys(added.date_counts).length, 1)

      const removed = geoReducerRemove(added, value)
      assert.equal(removed.count, 0)
      assert.equal(removed.sampled_mail_subscriptions, 0)
      assert.equal(removed.sampled_single_copy_sales, 0)
      assert.equal(removed.sampled_total_sales, 0)
      assert.equal(Object.keys(removed.date_counts).length, 0)
    })
  })

  describe('circulation reducers', () => {
    it('should add and remove issue circulation totals', () => {
      const value = {
        canonical_title: 'Sample Title',
        issue_circulation: 1234,
        price: '$0.10',
        type: 'weekly',
        publishing_company: 'Sample Publishing',
        titles_included: 'Sample',
        editor: 'Editor Name',
        circulation_quality: 'Certified',
        special_notes: 'Note'
      }

      const added = circulationReducerAdd(circulationReducerDefault(), value)
      assert.equal(added.count, 1)
      assert.equal(added.issue_circulation, 1234)
      assert.equal(added.canonical_title, 'Sample Title')

      const removed = circulationReducerRemove(added, value)
      assert.equal(removed.count, 0)
      assert.equal(removed.issue_circulation, 0)
    })
  })
})
