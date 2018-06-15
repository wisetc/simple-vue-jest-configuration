<template>
  <el-dialog
    title="账单信息"
    :visible.sync="visible"
    :modal="false"
    @close="handleClose"
  >
    <table class="table">
      <thead>
        <tr>
          <th></th>
          <th>账单开始时间</th>
          <th>账单结束时间</th>
          <th>提前付款天数</th>
          <th>付款日期</th>
          <th>付款金额</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(bill, key) in reqChargInputLogBeanList" :key="key">
          <td style="width:80px; padding:4px 4px;">{{key + 1}}</td>
          <td>
            <el-date-picker
              v-model="bill.startChargTime"
              type="date"
              class="_picker"
              placeholder="账单开始时间"
              size="small"
              @change="sync_payDate(bill)"
            />
          </td>
          <td>
            <el-date-picker
              v-model="bill.endChargTime"
              type="date"
              class="_picker"
              placeholder="账单结束时间"
              size="small"
            />
          </td>
          <td>
            <el-input
              v-model.number="bill.advanceDays"
              placeholder="提前付款天数"
              class="_input"
              size="small"
              @change="handleAdvanceDaysChange(bill, key)"
            />
          </td>
          <td>
            <el-date-picker
              v-model="bill._payDate"
              class="_picker"
              placeholder="付款日期"
              size="small"
              @change="syncAdvanceDays(bill)"
            />
          </td>
          <td>
            <el-input
              v-model.number="bill.initialAmount"
              placeholder="付款金额"
              class="_input"
              size="small"
              @change="handleChange"
            />
          </td>
          <td>
            <el-button
              size="small"
              type="text"
              style="padding:0 8px;"
              @click="removeBill(key)"
            >X</el-button>
          </td>
        </tr>
        <tr>
          <td
            colspan="7"
            style="font-size:16px;"
            @click="pushBill">+</td>
        </tr>
      </tbody>
    </table>

    <div class="sm-input-wrap">
      <div>
        <span>合计</span>
        <el-input v-model.number="totalAmount" placeholder="合同总金额" class="sm-input" />
      </div>
    </div>

    <div slot="footer">
      <el-button type="warning" @click="reset">重 置</el-button>
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleClick">确 认</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    // 托管开始时间
    startTime: {
      type: Date,
      default: () => new Date()
    },
    // 托管结束时间
    endTime: {
      type: Date,
      default: () => new Date()
    },
    // 付款周期
    cycle: {
      type: String,
      default: 'ONEMON'
    },
    // 收房价格
    rental: {
      type: Number,
      required: true,
    },
    decorationMonth: {
      type: Number,
      default: 0,
    },
    // 空置天数
    decorationDay: {
      type: Number,
      default: 0,
    },
  },
  
  data () {
    const getFirstStartTime = () => {
      return new Date(this.moment(this.startTime)
        .add(this.decorationMonth, 'months')
        .add(this.decorationDay, 'days')
        .valueOf())
    }
    
    return {
      // 对话框: (显示, 隐藏)
      visible: true,
      // 总额
      totalAmount: null,
      reqChargInputLogBeanList: [],

      firstStartTime: getFirstStartTime()
    }
  },

  computed: {
    deltaMonth () {
      const dict = {
        ONEMON: 1,
        TWOMON: 2,
        FOURMON: 4,
        THREEMON: 3,
        SIXMON: 6,
        TWELVEMON: 12,
        ONEPAY: null,
      }
      return dict[this.cycle]
    },

    hasDecorationStyle () {
      return this.decorationMonth > 0 || this.decorationDay > 0
    }
  },

  created () {
    this.initReqChargInputLogBeanList()
  },

  methods: {
    // 点击重置
    reset () {
      this.$confirm('是否重置表单？', '确认', {type: 'warning'}).then(() => {
        this.initReqChargInputLogBeanList()
      }).catch(_ => {})
    },
    
    pushBill () {
      const { reqChargInputLogBeanList, moment, deltaMonth } = this
      const lastItem = reqChargInputLogBeanList[reqChargInputLogBeanList.length - 1]
      const startChargTime = new Date(moment(lastItem.endChargTime).add(1, 'days').valueOf())
      const endChargTime = new Date(moment(startChargTime).add(deltaMonth, 'months').add(-1, 'days').valueOf()) 

      this.reqChargInputLogBeanList.push({
        ...lastItem,
        startChargTime,
        endChargTime,
      })
    },

    // 修改提前付款天数
    handleAdvanceDaysChange (bill, i) {
      this.sync_payDate(bill)
      // 提前天数同步吧
      if (i === 0) {
        for (let i = 1; i < this.reqChargInputLogBeanList.length; i++) {
          const _bill = this.reqChargInputLogBeanList[i]
          _bill.advanceDays = bill.advanceDays
          this.sync_payDate(_bill)
        }
      }
    },
    
    removeBill (i: number) {
      this.reqChargInputLogBeanList.splice(i, 1)
    },

    calcTotalAmount () {
      return this.reqChargInputLogBeanList.reduce((y, x) => y + parseInt(x.initialAmount), 0)
    },
    
    // click ok
    handleClick () {
      if (this.validate()) {
        const totalAmount = this.calcTotalAmount()
        if (totalAmount !== this.totalAmount) {
          this.$message.error('填写的金额总和不一致，请检查后重试。')
        } else {
          const reqChargInputLogBeanList = this.reqChargInputLogBeanList.map(item => ({
            ...item,
            _payDate: undefined,
            startChargTime: this.moment(item.startChargTime).format('YYYY-MM-DDT00:00:00'),
            endChargTime: this.moment(item.endChargTime).format('YYYY-MM-DDT00:00:00'),
            initialAmount: item.initialAmount * 1000
          }))
          this.$emit('submit', reqChargInputLogBeanList)
        }
      }
    },

    validate () {
      let msg = ''
      let ret = true
      const advanceDaysOk = this.reqChargInputLogBeanList.every(item =>
        item.advanceDays !== null && item.advanceDays !== '')
      if (!advanceDaysOk) {
        msg = '请正确填写提前付款天数。'
        ret = false
      }
      msg && this.$message.warning(msg)
      return ret
    },
    
    // 改变付款日期
    syncAdvanceDays (bill: Object) {
      const {_payDate, startChargTime} = bill
      bill.advanceDays = this.moment(startChargTime).diff(this.moment(_payDate), 'd')
    },
    
    initReqChargInputLogBeanList () {
      const {moment, firstStartTime, endTime} = this
      // 不满一月算整月(diff已作取整)
      const months = moment(endTime).diff(moment(firstStartTime), 'months') + 1
      // 不满一周期算整周期
      const num = this.deltaMonth ? Math.ceil(months / this.deltaMonth) : 1
      // console.log('num', num)
      let ret = []
      let current = firstStartTime
      for (let i = 0; i < num; i++) {
        let next = new Date(moment(current).add(this.deltaMonth, 'months').valueOf())
        let endChargTime = new Date(moment(next).add(-1, 'days').valueOf())
        let initialAmount = this.rental * this.deltaMonth

        // 如果下一月是二月底并且上一月不是同一天，那么不减天
        const nextDay = moment(next).format('MM-DD')
        const currentDay = moment(current).format('MM-DD')
        const isNextFebEnd = (nextDay === '02-28' && currentDay !== '01-28') ||
          (nextDay === '02-29' && currentDay !== '01-29')

        // 如果一下个月是小月底，那么不减天
        const isSmallEnd = /-30/.test(nextDay) && /-31/.test(currentDay)
        // 不规则结束
        if (i === num - 1 && moment(endChargTime).format('YYYY-MM-DD') !== moment(this.endTime).format('YYYY-MM-DD')) {
          endChargTime = this.endTime
          initialAmount = null
        } else if (isNextFebEnd || isSmallEnd) {
          endChargTime = next
          next = new Date(moment(next).add(1, 'days').valueOf())
        }

        ret.push({
          startChargTime: current,
          endChargTime,
          advanceDays: null,
          _payDate: null,
          initialAmount
        })
        current = next
      }
      this.reqChargInputLogBeanList = ret
    },

    sync_payDate (bill: Object) {
      const {advanceDays, startChargTime} = bill
      bill._payDate = new Date(this.moment(startChargTime).add(advanceDays * -1, 'd').valueOf())
    },

    handleClose() {
      this.$emit('close')
    },

    handleChange () {
      this.totalAmount = this.calcTotalAmount()
    }
  }
}
</script>

<style lang="scss" scoped>
.table {
  width: 100%;
  text-align: center;
  border-collapse: collapse;
  td {
    border: 1px solid green;
    width: 20%;
    padding: 4px 0;
    
    ._picker, ._input {
      width: 90%;
    }
  }
}

.sm-input-wrap {
  margin-top: 24px;
}

.sm-input {
  width: 160px;
}
</style>
