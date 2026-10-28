function requireFiniteNonNegative(value, name) {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    throw new RangeError(`${name} is required.`)
  }
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new RangeError(`${name} must be a finite, non-negative number.`)
  }
  return parsed
}

function requireGrowthRate(value, name) {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
    throw new RangeError(`${name} is required.`)
  }
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < -100 || parsed > 1000) {
    throw new RangeError(`${name} must be between -100% and 1,000%.`)
  }
  return parsed / 100
}

function requirePositive(value, name) {
  const parsed = requireFiniteNonNegative(value, name)
  if (parsed === 0) throw new RangeError(`${name} must be greater than zero.`)
  return parsed
}

export function calculateFinancialProjection(inputs, months = 12) {
  const monthlyRevenue = requireFiniteNonNegative(inputs.monthlyRevenue, 'Monthly revenue')
  const operatingExpenses = requireFiniteNonNegative(inputs.operatingExpenses, 'Operating expenses')
  const payroll = requireFiniteNonNegative(inputs.payroll, 'Payroll')
  const otherCosts = requireFiniteNonNegative(inputs.otherCosts, 'Other costs')
  const marketingCosts = inputs.marketingCosts === undefined
    ? 0
    : requireFiniteNonNegative(inputs.marketingCosts, 'Marketing costs')
  const openingCash = requireFiniteNonNegative(inputs.openingCash, 'Opening cash')
  const revenueGrowth = requireGrowthRate(inputs.revenueGrowthPercent, 'Revenue growth')
  const expenseGrowth = requireGrowthRate(inputs.expenseGrowthPercent, 'Expense growth')

  if (!Number.isInteger(months) || months < 1 || months > 36) {
    throw new RangeError('Projection length must be between 1 and 36 months.')
  }

  let closingCash = openingCash
  return Array.from({ length: months }, (_, index) => {
    const revenue = monthlyRevenue * ((1 + revenueGrowth) ** index)
    const expenses = (operatingExpenses + payroll + marketingCosts + otherCosts) * ((1 + expenseGrowth) ** index)
    const netCashFlow = revenue - expenses
    closingCash += netCashFlow
    if (![revenue, expenses, netCashFlow, closingCash].every(Number.isFinite)) {
      throw new RangeError('The projection exceeds supported numeric limits. Review the amounts and growth assumptions.')
    }
    return {
      month: index + 1,
      revenue,
      expenses,
      netCashFlow,
      closingCash,
    }
  })
}

export function calculateFinancialSummary(projection) {
  if (!Array.isArray(projection) || projection.length === 0) {
    throw new RangeError('A non-empty financial projection is required.')
  }

  const summary = projection.reduce((totals, month) => ({
    totalRevenue: totals.totalRevenue + month.revenue,
    totalExpenses: totals.totalExpenses + month.expenses,
    totalNetCashFlow: totals.totalNetCashFlow + month.netCashFlow,
  }), { totalRevenue: 0, totalExpenses: 0, totalNetCashFlow: 0 })
  const endingCash = projection[projection.length - 1].closingCash
  if (![summary.totalRevenue, summary.totalExpenses, summary.totalNetCashFlow, endingCash].every(Number.isFinite)) {
    throw new RangeError('The financial summary exceeds supported numeric limits.')
  }

  return { ...summary, endingCash }
}

export function calculateRunway(inputs, months = 12) {
  const cashAvailable = requireFiniteNonNegative(inputs.cashAvailable, 'Available cash')
  const monthlyRevenue = requireFiniteNonNegative(inputs.monthlyRevenue, 'Monthly revenue')
  const monthlyExpenses = requireFiniteNonNegative(inputs.monthlyExpenses, 'Monthly expenses')
  const monthlyPayroll = requireFiniteNonNegative(inputs.monthlyPayroll, 'Monthly payroll')
  const monthlyMarketingCosts = inputs.monthlyMarketingCosts === undefined
    ? 0
    : requireFiniteNonNegative(inputs.monthlyMarketingCosts, 'Monthly marketing costs')
  const monthlyOtherCosts = requireFiniteNonNegative(inputs.monthlyOtherCosts, 'Other monthly costs')
  const monthlyTotalExpenses = monthlyExpenses + monthlyPayroll + monthlyMarketingCosts + monthlyOtherCosts
  const monthlyNetCashFlow = monthlyRevenue - monthlyTotalExpenses
  const netBurn = -monthlyNetCashFlow
  if (![monthlyTotalExpenses, monthlyNetCashFlow, netBurn].every(Number.isFinite)) {
    throw new RangeError('Combined monthly cash flows exceed supported numeric limits.')
  }
  const runwayMonths = netBurn > 0 ? cashAvailable / netBurn : null
  if (runwayMonths !== null && !Number.isFinite(runwayMonths)) {
    throw new RangeError('The calculated runway exceeds supported numeric limits.')
  }
  const projection = calculateFinancialProjection({
    monthlyRevenue,
    operatingExpenses: monthlyExpenses,
    payroll: monthlyPayroll,
    marketingCosts: monthlyMarketingCosts,
    otherCosts: monthlyOtherCosts,
    openingCash: cashAvailable,
    revenueGrowthPercent: inputs.revenueGrowthPercent,
    expenseGrowthPercent: inputs.expenseGrowthPercent,
  }, months)
  const firstCashShortfallMonth = projection.find((month) => month.closingCash <= 0)?.month ?? null

  return {
    cashAvailable,
    monthlyTotalExpenses,
    monthlyNetCashFlow,
    monthlyNetBurn: netBurn > 0 ? netBurn : 0,
    runwayMonths,
    isCashFlowPositive: netBurn <= 0,
    firstCashShortfallMonth,
    projection,
  }
}

export function calculateFundraising(inputs) {
  const fundingAmount = requirePositive(inputs.fundingAmount, 'Funding amount')
  const preMoneyValuation = requirePositive(inputs.preMoneyValuation, 'Pre-money valuation')
  const founderOwnershipPercent = requireFiniteNonNegative(
    inputs.founderOwnershipPercent,
    'Founder ownership',
  )

  if (founderOwnershipPercent > 100) {
    throw new RangeError('Founder ownership must not exceed 100%.')
  }

  const allocations = inputs.allocations.map((allocation) => ({
    category: allocation.category,
    percent: requireFiniteNonNegative(allocation.percent, `${allocation.category} allocation`),
  }))
  const allocationTotal = allocations.reduce((sum, allocation) => sum + allocation.percent, 0)
  if (allocations.some((allocation) => allocation.percent > 100) || Math.abs(allocationTotal - 100) > 0.0001) {
    throw new RangeError('Use-of-funds percentages must add up to exactly 100%.')
  }

  const postMoneyValuation = preMoneyValuation + fundingAmount
  if (!Number.isFinite(postMoneyValuation)) {
    throw new RangeError('The combined round valuation exceeds supported numeric limits.')
  }
  const investorOwnershipPercent = (fundingAmount / postMoneyValuation) * 100
  const founderPostRoundPercent = founderOwnershipPercent * (preMoneyValuation / postMoneyValuation)

  return {
    fundingAmount,
    preMoneyValuation,
    postMoneyValuation,
    investorOwnershipPercent,
    founderOwnershipPercent,
    founderPostRoundPercent,
    founderDilutionPercentagePoints: founderOwnershipPercent - founderPostRoundPercent,
    allocations: allocations.map((allocation) => ({
      ...allocation,
      amount: fundingAmount * (allocation.percent / 100),
    })),
  }
}

export function calculateCapTable(inputs) {
  const fundingAmount = requirePositive(inputs.fundingAmount, 'Funding amount')
  const preMoneyValuation = requirePositive(inputs.preMoneyValuation, 'Pre-money valuation')
  const shareholders = inputs.shareholders.map((shareholder) => ({
    name: String(shareholder.name ?? '').trim(),
    type: shareholder.type,
    ownershipPercent: requireFiniteNonNegative(
      shareholder.ownershipPercent,
      `${shareholder.name || 'Shareholder'} ownership`,
    ),
  }))

  if (!shareholders.length || shareholders.some((shareholder) => !shareholder.name)) {
    throw new RangeError('Add at least one named shareholder.')
  }
  if (shareholders.some((shareholder) => shareholder.ownershipPercent > 100)) {
    throw new RangeError('Each shareholder ownership must not exceed 100%.')
  }

  const currentOwnershipPercent = shareholders.reduce(
    (sum, shareholder) => sum + shareholder.ownershipPercent,
    0,
  )
  if (Math.abs(currentOwnershipPercent - 100) > 0.0001) {
    throw new RangeError('Current shareholder ownership must add up to exactly 100%.')
  }

  const postMoneyValuation = preMoneyValuation + fundingAmount
  if (!Number.isFinite(postMoneyValuation)) {
    throw new RangeError('The combined round valuation exceeds supported numeric limits.')
  }
  const existingOwnershipFactor = preMoneyValuation / postMoneyValuation
  const investorOwnershipPercent = (fundingAmount / postMoneyValuation) * 100

  return {
    preMoneyValuation,
    fundingAmount,
    postMoneyValuation,
    investorOwnershipPercent,
    shareholders: shareholders.map((shareholder) => ({
      ...shareholder,
      postRoundOwnershipPercent: shareholder.ownershipPercent * existingOwnershipFactor,
    })),
  }
}

export function calculateCompletionProgress(items) {
  if (!items.length) return 0
  const completed = items.filter((item) => item.status === 'done').length
  return Math.round((completed / items.length) * 100)
}
