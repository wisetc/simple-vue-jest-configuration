import {mount} from '@vue/test-utils'
import App from '../../src/App'

describe('App', () => {
  it('should setup correctly', () => {
    const wrapper = mount(App)
    expect(wrapper.vm.msg).toBe('hello')
  })

  it('text should be correct', () => {
    const wrapper = mount(App)
    expect(wrapper.find('span').text()).toBe('Hello world.')    
  })

  it('concat([1], [2, 3]) should be [1, 2, 3]', () => {
    const wrapper = mount(App)
    expect(wrapper.vm.concat([1], [2, 3])).toEqual([1, 2, 3])
  })

  it('log should return a function', () => {
    const wrapper = mount(App)
    expect(typeof wrapper.vm.log()).toBe('function')
  })
})
