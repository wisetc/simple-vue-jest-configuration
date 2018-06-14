<template>
  <span>Hello world.</span>
</template>

<script>
import {concat} from './'
import mixins from './mixins'

export default {
  mixins: [mixins],
  
  data () {
    return {
      msg: 'hello'
    }
  },

  methods: {
    concat
  }
}
</script>
