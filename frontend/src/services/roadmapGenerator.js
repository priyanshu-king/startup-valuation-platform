const CATEGORY_LABELS = {
  saas: 'SaaS or web application',
  mobile_app: 'mobile app',
  marketplace: 'marketplace',
  ecommerce: 'e-commerce business',
  local_service: 'local service business',
  consulting: 'consulting or professional service',
  other: 'other business',
}

const OFFERING_TASKS = {
  saas: {
    title: 'Shape the smallest useful software offer',
    instructions: 'Sketch the core customer journey and test a clickable mock-up or manual prototype before committing to a full build. A technical MVP is optional until customer evidence supports it.',
    skills: ['Product discovery', 'No-code prototyping or design'],
    metric: 'Target customers who can complete the core workflow in a test',
    hours: 8,
  },
  mobile_app: {
    title: 'Test the mobile customer journey',
    instructions: 'Prototype the most important mobile workflow and test it with target users. A landing page, clickable prototype, or concierge test can validate demand before app development.',
    skills: ['Product discovery', 'Mobile UX or prototyping'],
    metric: 'Target users completing the primary workflow in a test',
    hours: 10,
  },
  marketplace: {
    title: 'Run a small two-sided matching test',
    instructions: 'Recruit a small group of buyers and providers and match them manually. Validate supply and demand on both sides before investing in marketplace software.',
    skills: ['Customer research', 'Community or operations'],
    metric: 'Successful manual matches and repeat interest on both sides',
    hours: 10,
  },
  ecommerce: {
    title: 'Prepare a small initial product offer',
    instructions: 'Confirm product availability, supplier terms, fulfillment, and returns. Test a limited catalogue or pre-order only where local rules and supplier commitments allow.',
    skills: ['Sourcing', 'Fulfillment and customer support'],
    metric: 'Orders fulfilled successfully and customer feedback recorded',
    hours: 10,
  },
  local_service: {
    title: 'Package a first local service offer',
    instructions: 'Define a clear service scope, service area, delivery process, and customer communication. Start with a manual booking process instead of building software.',
    skills: ['Service delivery', 'Local customer support'],
    metric: 'Pilot customers served and feedback captured',
    hours: 6,
  },
  consulting: {
    title: 'Package a focused consulting offer',
    instructions: 'Define the client problem, engagement scope, deliverables, boundaries, and a simple proposal. Start with direct conversations and a manual delivery process.',
    skills: ['Subject-matter expertise', 'Client communication'],
    metric: 'Qualified conversations and pilot engagements completed',
    hours: 6,
  },
  other: {
    title: 'Create a small testable first offer',
    instructions: 'Describe the smallest safe, useful offer you can deliver to a real customer. Use a manual service, sample, or prototype if that is more appropriate than software.',
    skills: ['Customer discovery', 'Offer delivery'],
    metric: 'Target customers who try the offer and share feedback',
    hours: 8,
  },
}

const COMMON_PHASES = [
  {
    id: 'validation',
    name: 'Validate the problem',
    milestone: 'Evidence that the problem matters to target customers',
    tasks: [
      {
        title: 'Describe the customer problem',
        instructions: 'Write down who has the problem, when it occurs, and what they do today. Treat this as a hypothesis until customers confirm it.',
        skills: ['Customer discovery'],
        metric: 'Problem interviews completed and recurring needs recorded',
        hours: 3,
      },
      {
        title: 'Talk to target customers',
        instructions: 'Invite a small, relevant group to discuss their current workflow. Ask about recent behavior, alternatives, and costs rather than pitching an untested solution.',
        skills: ['Interviewing', 'Listening'],
        metric: 'Customer conversations and repeated pain points documented',
        hours: 8,
      },
    ],
  },
  {
    id: 'business-model',
    name: 'Shape the business model',
    milestone: 'A testable offer and business model hypothesis',
    tasks: [
      {
        title: 'Map alternatives and competitors',
        instructions: 'List the alternatives customers already use, including doing nothing. Compare observable offers and pricing; do not assume competitors are direct equivalents.',
        skills: ['Desk research'],
        metric: 'Alternatives reviewed and customer preferences noted',
        hours: 4,
      },
      {
        title: 'Define the first offer and pricing hypothesis',
        instructions: 'Write a short offer for one customer segment and a price hypothesis. Validate willingness to pay through conversations or a small test; do not treat the first price as market evidence.',
        skills: ['Offer design', 'Customer conversations'],
        metric: 'Offer responses and price objections recorded',
        hours: 4,
      },
    ],
  },
  {
    id: 'financial-plan',
    name: 'Plan the finances',
    milestone: 'A first budget and cash-runway review',
    tasks: [
      {
        title: 'List startup costs and a spending limit',
        instructions: 'Use quotes or known supplier costs where available. Mark unknown costs for follow-up instead of filling gaps with invented estimates.',
        skills: ['Basic bookkeeping'],
        metric: 'Known one-time and monthly costs separated from open questions',
        hours: 3,
        tool: { label: 'Financial planner', href: '/app/financial-planner' },
      },
      {
        title: 'Review cash runway before committing',
        instructions: 'Compare available cash with expected monthly inflows and outflows. Revisit the plan before taking on recurring costs or paid acquisition.',
        skills: ['Cash-flow planning'],
        metric: 'Runway reviewed against the next decision or launch date',
        hours: 2,
        tool: { label: 'Runway calculator', href: '/app/runway' },
      },
    ],
  },
  {
    id: 'initial-offer',
    name: 'Prepare the first offering',
    milestone: 'A small, deliverable first offer ready for a pilot',
    tasks: [],
  },
  {
    id: 'pilot',
    name: 'Run a small pilot',
    milestone: 'Real customer feedback from a limited pilot',
    tasks: [
      {
        title: 'Invite a small pilot group',
        instructions: 'Set a clear scope and timebox for a low-risk pilot. Agree what feedback you need and how you will record it.',
        skills: ['Customer support', 'Operations'],
        metric: 'Pilot participants onboarded and outcomes recorded',
        hours: 6,
      },
      {
        title: 'Review pilot feedback and blockers',
        instructions: 'Group feedback into observed outcomes, unresolved problems, and assumptions that still need testing. Decide what to improve before a broader launch.',
        skills: ['Analysis', 'Customer follow-up'],
        metric: 'Pilot learnings and next decision documented',
        hours: 4,
      },
    ],
  },
  {
    id: 'launch',
    name: 'Launch deliberately',
    milestone: 'A measured launch with a clear way to hear from customers',
    tasks: [
      {
        title: 'Choose one customer acquisition experiment',
        instructions: 'Select a low-cost channel customers already use, such as direct outreach, referrals, a local partnership, or useful content. Set a small test and a stop/review point.',
        skills: ['Customer communication', 'Experiment tracking'],
        metric: 'Responses, signups, enquiries, or orders from the chosen channel',
        hours: 5,
      },
      {
        title: 'Launch the offer and track actual results',
        instructions: 'Make the offer available to the intended audience. Record actual enquiries, signups, customers, revenue, and costs; do not substitute targets for observed results.',
        skills: ['Delivery', 'Record keeping'],
        metric: 'Actual customer and financial outcomes recorded',
        hours: 5,
        tool: { label: 'Valuation tool', href: '/valuation' },
      },
    ],
  },
  {
    id: 'review',
    name: 'Review and decide',
    milestone: 'A documented decision on what to test or improve next',
    tasks: [
      {
        title: 'Review outcomes and update the next plan',
        instructions: 'Compare observed customer and financial results with your assumptions. Choose whether to continue, adjust the offer, or test a different customer problem.',
        skills: ['Decision making'],
        metric: 'Next experiment and its success measure written down',
        hours: 2,
        tool: { label: 'Reports', href: '/app/reports' },
      },
    ],
  },
]

const CATEGORY_CONTEXT = {
  saas: 'Validate the core workflow with a prototype or manual test before committing to software development.',
  mobile_app: 'Use interviews and a clickable prototype before investing in a full mobile application.',
  marketplace: 'Test supply and demand separately; a manual matching service is a valid first experiment.',
  ecommerce: 'Confirm suppliers, fulfillment, returns, and product economics before expanding inventory.',
  local_service: 'A service can launch with manual bookings; no website or app is required to validate it.',
  consulting: 'A clear service offer and direct customer conversations can be the first product; software is optional.',
  other: 'Choose the smallest safe offer customers can try; software is optional.',
}

const STAGE_GUIDANCE = {
  idea: 'Begin with the customer problem and test the riskiest assumptions before spending on a solution.',
  validation: 'Prioritize gaps in customer evidence; revisit any research task that is not supported by recorded conversations.',
  mvp: 'Review the customer evidence before expanding the first offer. A technical MVP is not required for service businesses.',
  launched: 'Use actual customer, delivery, and cost data to refine the offer; do not treat launch activity as proof of demand.',
  growing: 'Focus on repeatable customer outcomes and unit costs before increasing fixed spending or adding new channels.',
}

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result.toISOString().slice(0, 10)
}

function formatCategory(category) {
  return CATEGORY_LABELS[category] ?? CATEGORY_LABELS.other
}

export function generateRoadmap(input, now = new Date()) {
  const idea = String(input.idea ?? '').trim()
  if (idea.length < 20) {
    throw new RangeError('Describe your idea in at least 20 characters so the plan has useful context.')
  }
  if (!CATEGORY_LABELS[input.category]) {
    throw new RangeError('Choose a business category to tailor the roadmap.')
  }
  if (!['idea', 'validation', 'mvp', 'launched', 'growing'].includes(input.stage)) {
    throw new RangeError('Choose your current stage.')
  }
  const hoursPerWeek = Number(input.hoursPerWeek)
  if (!Number.isFinite(hoursPerWeek) || hoursPerWeek < 1 || hoursPerWeek > 80) {
    throw new RangeError('Available time must be between 1 and 80 hours per week.')
  }
  const budget = input.budgetInr === '' || input.budgetInr == null ? null : Number(input.budgetInr)
  if (budget !== null && (!Number.isFinite(budget) || budget < 0)) {
    throw new RangeError('Starting budget must be a non-negative INR amount.')
  }

  const offering = OFFERING_TASKS[input.category]
  const isOperating = input.stage === 'launched' || input.stage === 'growing'
  const phaseTemplates = COMMON_PHASES.map((phase) => {
    if (isOperating && phase.id === 'launch') {
      return {
        ...phase,
        tasks: [
          {
            title: 'Review current customer-acquisition channels',
            instructions: 'Use actual enquiries, signups, orders, and costs to identify which channels are worth another small test. Separate measured results from assumptions.',
            skills: ['Customer communication', 'Basic tracking'],
            metric: 'Actual acquisition outcomes and channel costs recorded',
            hours: 4,
          },
          {
            title: 'Run one focused growth experiment',
            instructions: 'Choose a single low-risk experiment based on customer feedback and available cash. Set a small budget or time limit and a clear point to stop or review.',
            skills: ['Experiment design', 'Cash-flow awareness'],
            metric: 'Experiment result compared with its stated success measure',
            hours: 5,
          },
        ],
      }
    }
    return (
    phase.id === 'initial-offer'
      ? {
          ...phase,
          tasks: [{
            ...offering,
            priority: 'high',
            completionCriteria: 'A target customer has tried the offer or a realistic test version, and feedback is recorded.',
          }],
        }
      : phase
    )
  })

  let elapsedHours = 0
  let previousTaskId = null
  const phases = phaseTemplates.map((phase, phaseIndex) => {
    const tasks = phase.tasks.map((template, taskIndex) => {
      const taskId = `${phase.id}-${taskIndex + 1}`
      const task = {
        id: taskId,
        title: template.title,
        description: template.instructions,
        instructions: template.instructions,
        estimatedHours: template.hours,
        targetDate: addDays(now, Math.max(1, Math.ceil(((elapsedHours + template.hours) / hoursPerWeek) * 7))),
        startDate: addDays(now, Math.max(0, Math.floor((elapsedHours / hoursPerWeek) * 7))),
        dependencies: previousTaskId ? [previousTaskId] : [],
        priority: template.priority ?? (phaseIndex < 2 ? 'high' : 'medium'),
        requiredSkills: template.skills,
        costEstimateInr: null,
        costNote: 'Not estimated: enter a cost only when supported by a quote or your own budget assumption.',
        completionCriteria: template.completionCriteria ?? template.metric,
        successMetric: template.metric,
        status: 'not_started',
        tool: template.tool ?? null,
      }
      elapsedHours += template.hours
      previousTaskId = taskId
      return task
    })
    return {
      id: phase.id,
      name: phase.name,
      milestone: phase.milestone,
      startDate: tasks[0]?.startDate ?? addDays(now, Math.ceil((elapsedHours / hoursPerWeek) * 7)),
      targetDate: tasks.at(-1)?.targetDate ?? addDays(now, Math.ceil((elapsedHours / hoursPerWeek) * 7)),
      tasks,
    }
  })

  const totalWeeks = Math.max(1, Math.ceil(elapsedHours / hoursPerWeek))
  const normalizedStage = input.stage
  const customer = String(input.targetCustomers ?? '').trim()
  const geography = String(input.geography ?? '').trim()
  const launchPreference = String(input.launchTimeline ?? '').trim()
  const founderSkills = String(input.skills ?? '').trim()
  const teamSize = input.teamSize === '' || input.teamSize == null ? null : Number(input.teamSize)
  if (teamSize !== null && (!Number.isInteger(teamSize) || teamSize < 1 || teamSize > 1000)) {
    throw new RangeError('Team size must be a whole number from 1 to 1,000.')
  }
  const resourceGuidance = budget === null
    ? 'No starting budget was supplied. Keep early tests small and do not commit to recurring spending until you have a verified quote.'
    : `You entered ₹${budget.toLocaleString('en-IN')} as the starting budget. Treat it as your planning limit, not a verified balance; check real local costs before committing.`
  const risks = [
    'Customer demand, willingness to pay, and competitor behavior are unverified until you collect evidence.',
    'Task effort and target dates are estimates based on the weekly hours you entered; delays, dependencies, and team availability can change them.',
    'Task costs are unknown because no local supplier quotes, wage rates, or actual spending data were provided.',
  ]
  if (input.category === 'marketplace') {
    risks.push('Marketplace adoption depends on attracting and serving both customer and provider groups; one-sided interest is not proof of a viable marketplace.')
  }
  if (input.category === 'ecommerce') {
    risks.push('Supplier availability, inventory needs, fulfillment, returns, and applicable product rules need local verification.')
  }
  if (input.category === 'local_service') {
    risks.push('Service capacity, travel time, local permissions, and delivery costs need validation in the selected service area.')
  }
  const assumptions = [
    `This is a deterministic template for a ${formatCategory(input.category)}, not an AI-generated or market-verified plan.`,
    customer ? `Target customers are your description: "${customer}".` : 'Target customers were not specified; clarify the audience before customer research.',
    geography ? `Geography is user-provided: ${geography}.` : 'No target geography was provided; local rules, costs, and channels are not assumed.',
    budget === null ? 'No starting budget was provided; task costs are intentionally left blank.' : `Starting budget is your user-entered assumption of ₹${budget.toLocaleString('en-IN')}.`,
    `Timeline uses a planning assumption of ${hoursPerWeek} hours per week; about ${totalWeeks} weeks of effort is estimated. Dates are planning estimates, not promises.`,
    launchPreference ? `Preferred launch timeline is your goal: ${launchPreference}; compare it with the task dates and adjust the plan.` : 'No preferred launch timeline was supplied.',
    `Current stage "${normalizedStage}" informs the advice, but no tasks are marked complete because the plan cannot verify work already done.`,
    founderSkills ? `Skills you listed: ${founderSkills}. Use them when assigning work; the plan does not assume the skills are verified or assigned.` : 'No existing team skills were provided; assign tasks based on actual experience and availability.',
    teamSize !== null ? `Team size of ${teamSize} is user-provided; assignees are not assigned automatically.` : 'Team size was not supplied; assign work based on actual availability.',
    'No market size, revenue, customer count, or financial result is predicted.',
  ]

  return {
    title: idea.length > 72 ? `${idea.slice(0, 69).trimEnd()}…` : idea,
    category: input.category,
    categoryLabel: formatCategory(input.category),
    businessModel: String(input.businessModel ?? '').trim() || 'Not specified',
    stage: normalizedStage,
    teamSize,
    founderSkills,
    totalEstimatedHours: elapsedHours,
    totalEstimatedWeeks: totalWeeks,
    targetDate: addDays(now, Math.ceil((elapsedHours / hoursPerWeek) * 7)),
    tasks: phases.flatMap((phase) => phase.tasks),
    phases,
    milestones: phases.map(({ id, name, milestone, targetDate }) => ({
      id: `milestone-${id}`,
      phaseId: id,
      name,
      description: milestone,
      targetDate,
      status: 'not_started',
    })),
    flow: phases.map(({ id, name, milestone }) => ({ id, name, milestone })),
    categoryGuidance: CATEGORY_CONTEXT[input.category],
    stageGuidance: STAGE_GUIDANCE[normalizedStage],
    assumptions,
    costDisclosure: 'Costs are deliberately left as user-entered assumptions. Get local supplier quotes or enter your own amounts before using the financial planner.',
    resourceGuidance,
    risks,
    generatedBy: 'deterministic-template',
    createdAt: new Date(now).toISOString(),
  }
}
