import {mount, createLocalVue} from '@vue/test-utils'
import DateRange from '../../src/DateRange'
import ElementUI from 'element-ui'
import moment from 'moment'

const localVue = createLocalVue()
localVue.use(ElementUI)
localVue.mixin({methods: {moment}})

describe('DateRange', () => {
  it('should setup correctly.', () => {
    const wrapper = mount(DateRange, {
      localVue,
      propsData: {
        rental: 0
      }
    })
    expect(wrapper.vm.visible).toBe(true)
  })
})
