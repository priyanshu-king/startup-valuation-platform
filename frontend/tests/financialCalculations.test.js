import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateCapTable,
  calculateCompletionProgress,
  calculateFinancialProjection,
  calculateFinancialSummary,
  calculateFundraising,
  calculateRunway,
} from '../src/services/financialCalculations.js'

test('projects twelve months from supplied run rate and assumptions', () => {
  const projection = calculateFinancialProjection({
    monthlyRevenue: 100,
    operatingExpenses: 30,
    payroll: 20,
    otherCosts: 10,
    openingCash: 500,
    revenueGrowthPercent: 10,
    expenseGrowthPercent: 0,
  })

  assert.equal(projection.length, 12)
  assert.equal(projection[0].revenue, 100)
  assert.equal(projection[0].expenses, 60)
  assert.equal(projection[0].closingCash, 540)
  assert.ok(Math.abs(projection[1].revenue - 110) < 1e-10)
  assert.ok(Math.abs(projection[1].closingCash - 590) < 1e-10)
})

test('includes marketing costs and summarizes a variable forecast period', () => {
  const projection = calculateFinancialProjection({
    monthlyRevenue: 200,
    operatingExpenses: 30,
    payroll: 20,
    marketingCosts: 10,
    otherCosts: 5,
    openingCash: 100,
    revenueGrowthPercent: 0,
    expenseGrowthPercent: 0,
  }, 3)

  assert.equal(projection.length, 3)
  assert.equal(projection[0].expenses, 65)
  assert.deepEqual(calculateFinancialSummary(projection), {
    totalRevenue: 600,
    totalExpenses: 195,
    totalNetCashFlow: 405,
    endingCash: 505,
  })
})

test('rejects empty, invalid, out-of-range, and overflowing forecast inputs', () => {
  const input = {
    monthlyRevenue: 100,
    operatingExpenses: 30,
    payroll: 20,
    otherCosts: 10,
    openingCash: 500,
    revenueGrowthPercent: 0,
    expenseGrowthPercent: 0,
  }
  assert.throws(() => calculateFinancialProjection({ ...input, monthlyRevenue: '' }), /required/)
  assert.throws(() => calculateFinancialProjection({ ...input, marketingCosts: -1 }), /non-negative/)
  assert.throws(() => calculateFinancialProjection(input, 0), /1 and 36/)
  assert.throws(() => calculateFinancialProjection(input, 1.5), /1 and 36/)
  assert.throws(() => calculateFinancialProjection(input, 37), /1 and 36/)
  assert.throws(() => calculateFinancialProjection({ ...input, revenueGrowthPercent: '' }), /required/)
  assert.throws(() => calculateFinancialProjection({
    ...input,
    monthlyRevenue: 1e308,
    revenueGrowthPercent: 100,
  }, 3), /supported numeric limits/)
  const largeFiniteProjection = calculateFinancialProjection({
    ...input,
    monthlyRevenue: 1e308,
    operatingExpenses: 1e308,
    payroll: 0,
    otherCosts: 0,
    openingCash: 0,
  }, 2)
  assert.throws(() => calculateFinancialSummary(largeFiniteProjection), /supported numeric limits/)
})

test('accepts growth and forecast-period boundary values', () => {
  const projection = calculateFinancialProjection({
    monthlyRevenue: 1,
    operatingExpenses: 1,
    payroll: 0,
    otherCosts: 0,
    openingCash: 0,
    revenueGrowthPercent: 1000,
    expenseGrowthPercent: -100,
  }, 36)

  assert.equal(projection.length, 36)
  assert.equal(projection[0].revenue, 1)
  assert.equal(projection[1].revenue, 11)
  assert.equal(projection[0].expenses, 1)
  assert.equal(projection[1].expenses, 0)
})

test('runway handles net burn, zero burn, and positive cash flow', () => {
  const input = {
    cashAvailable: 600,
    monthlyRevenue: 50,
    monthlyExpenses: 70,
    monthlyPayroll: 20,
    monthlyOtherCosts: 10,
    revenueGrowthPercent: 0,
    expenseGrowthPercent: 0,
  }
  assert.equal(calculateRunway(input).runwayMonths, 12)
  const zeroBurn = calculateRunway({ ...input, monthlyRevenue: 100 })
  assert.equal(zeroBurn.monthlyNetBurn, 0)
  assert.equal(zeroBurn.runwayMonths, null)
  const positiveCashFlow = calculateRunway({ ...input, monthlyRevenue: 120 })
  assert.equal(positiveCashFlow.isCashFlowPositive, true)
  assert.equal(positiveCashFlow.runwayMonths, null)
  assert.equal(calculateRunway({ ...input, cashAvailable: 0 }).runwayMonths, 0)
})

test('runway includes marketing, variable periods, and cash shortfall month', () => {
  const result = calculateRunway({
    cashAvailable: 100,
    monthlyRevenue: 10,
    monthlyExpenses: 20,
    monthlyPayroll: 15,
    monthlyMarketingCosts: 5,
    monthlyOtherCosts: 0,
    revenueGrowthPercent: 0,
    expenseGrowthPercent: 0,
  }, 4)

  assert.equal(result.monthlyTotalExpenses, 40)
  assert.equal(result.monthlyNetCashFlow, -30)
  assert.equal(result.monthlyNetBurn, 30)
  assert.equal(result.runwayMonths, 100 / 30)
  assert.equal(result.projection.length, 4)
  assert.equal(result.firstCashShortfallMonth, 4)
  assert.equal(result.projection[0].expenses, 40)
})

test('runway rejects zero cash inputs, empty values, and overflowing results', () => {
  const input = {
    cashAvailable: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    monthlyPayroll: 0,
    monthlyOtherCosts: 0,
    revenueGrowthPercent: 0,
    expenseGrowthPercent: 0,
  }
  assert.equal(calculateRunway(input).runwayMonths, null)
  assert.throws(() => calculateRunway({ ...input, cashAvailable: '' }), /required/)
  assert.throws(() => calculateRunway({ ...input, cashAvailable: -1 }), /non-negative/)
  assert.throws(() => calculateRunway({
    ...input,
    cashAvailable: 1e308,
    monthlyExpenses: 1e-308,
  }), /runway exceeds supported numeric limits/)
})

test('fundraising calculates post-money ownership and apportions use of funds', () => {
  const result = calculateFundraising({
    fundingAmount: 2,
    preMoneyValuation: 8,
    founderOwnershipPercent: 80,
    allocations: [
      { category: 'Product', percent: 60 },
      { category: 'Hiring', percent: 40 },
    ],
  })
  assert.equal(result.postMoneyValuation, 10)
  assert.equal(result.investorOwnershipPercent, 20)
  assert.equal(result.founderPostRoundPercent, 64)
  assert.equal(result.founderDilutionPercentagePoints, 16)
  assert.deepEqual(result.allocations.map((entry) => entry.amount), [1.2, 0.8])
})

test('fundraising rejects allocations that do not total 100 percent', () => {
  assert.throws(() => calculateFundraising({
    fundingAmount: 2,
    preMoneyValuation: 8,
    founderOwnershipPercent: 100,
    allocations: [{ category: 'Product', percent: 60 }],
  }), /exactly 100%/)
})

test('cap table dilution preserves relative ownership and totals 100 percent', () => {
  const result = calculateCapTable({
    fundingAmount: 2,
    preMoneyValuation: 8,
    shareholders: [
      { name: 'Founder', type: 'founder', ownershipPercent: 80 },
      { name: 'Existing investor', type: 'investor', ownershipPercent: 20 },
    ],
  })
  const ownershipTotal = result.shareholders.reduce((sum, holder) => sum + holder.postRoundOwnershipPercent, 0)
  assert.equal(result.investorOwnershipPercent, 20)
  assert.equal(ownershipTotal + result.investorOwnershipPercent, 100)
  assert.equal(result.shareholders[0].postRoundOwnershipPercent, 64)
})

test('cap table rejects invalid current ownership totals', () => {
  assert.throws(() => calculateCapTable({
    fundingAmount: 2,
    preMoneyValuation: 8,
    shareholders: [{ name: 'Founder', type: 'founder', ownershipPercent: 90 }],
  }), /add up to exactly 100%/)
})

test('readiness progress reflects completed checklist items', () => {
  assert.equal(calculateCompletionProgress([]), 0)
  assert.equal(calculateCompletionProgress([
    { status: 'done' },
    { status: 'in_progress' },
    { status: 'done' },
  ]), 67)
})
