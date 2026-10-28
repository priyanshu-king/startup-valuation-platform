import test from 'node:test'
import assert from 'node:assert/strict'
import { generateRoadmap } from '../src/services/roadmapGenerator.js'

const baseInput = {
  idea: 'A mobile app that helps neighborhood gardeners share tools.',
  targetCustomers: 'Home gardeners in apartment communities',
  category: 'mobile_app',
  businessModel: 'freemium',
  geography: 'Bengaluru, India',
  budgetInr: '25000',
  hoursPerWeek: 6,
  stage: 'validation',
  teamSize: 2,
  skills: 'Design, community building',
  launchTimeline: '3-6 months',
}

test('generates a deterministic, category-adapted roadmap with dependencies and dates', () => {
  const start = new Date('2026-10-28T00:00:00.000Z')
  const roadmap = generateRoadmap(baseInput, start)
  const repeated = generateRoadmap(baseInput, start)

  assert.equal(roadmap.generatedBy, 'deterministic-template')
  assert.equal(roadmap.categoryLabel, 'mobile app')
  assert.ok(roadmap.phases.some((phase) => phase.name === 'Plan the finances'))
  assert.ok(roadmap.tasks.some((task) => task.title === 'Test the mobile customer journey'))
  assert.equal(roadmap.tasks[0].startDate, '2026-10-28')
  assert.equal(roadmap.tasks[0].dependencies.length, 0)
  assert.ok(roadmap.tasks.slice(1).every((task) => task.dependencies.length === 1))
  const ids = new Set(roadmap.tasks.map((task) => task.id))
  assert.ok(roadmap.tasks.every((task) => task.dependencies.every((dependency) => ids.has(dependency))))
  assert.ok(roadmap.tasks.every((task) => task.status === 'not_started'))
  assert.ok(roadmap.tasks.every((task) => task.costEstimateInr === null))
  assert.deepEqual(roadmap.phases, repeated.phases)
  assert.match(roadmap.assumptions.join(' '), /user-entered assumption/)
})

test('adapts initial-offer guidance for nontechnical service businesses', () => {
  const roadmap = generateRoadmap({
    ...baseInput,
    category: 'consulting',
    idea: 'A consulting service for small businesses that need accessible bookkeeping help.',
    budgetInr: '',
    geography: '',
    targetCustomers: '',
  }, new Date('2026-10-28T00:00:00.000Z'))

  const offer = roadmap.tasks.find((task) => task.title === 'Package a focused consulting offer')
  assert.ok(offer)
  assert.match(offer.instructions, /manual delivery process/)
  assert.match(roadmap.categoryGuidance, /software is optional/)
  assert.ok(roadmap.assumptions.some((assumption) => /No starting budget/.test(assumption)))
  assert.ok(roadmap.assumptions.some((assumption) => /No target geography/.test(assumption)))
})

test('tailors launch tasks to an operating startup and records explicit planning risks', () => {
  const ideaStage = generateRoadmap(baseInput, new Date('2026-10-28T00:00:00.000Z'))
  const launchedStage = generateRoadmap({
    ...baseInput,
    stage: 'launched',
    skills: 'Customer support',
    budgetInr: '0',
  }, new Date('2026-10-28T00:00:00.000Z'))

  assert.ok(ideaStage.tasks.some((task) => task.title === 'Choose one customer acquisition experiment'))
  assert.ok(launchedStage.tasks.some((task) => task.title === 'Review current customer-acquisition channels'))
  assert.match(launchedStage.resourceGuidance, /planning limit/)
  assert.ok(launchedStage.risks.some((risk) => /Customer demand/.test(risk)))
  assert.ok(launchedStage.assumptions.some((assumption) => /Customer support/.test(assumption)))
})

test('rejects missing idea, invalid category, unsupported stage, and invalid availability', () => {
  assert.throws(() => generateRoadmap({ ...baseInput, idea: 'Too short' }), /at least 20 characters/)
  assert.throws(() => generateRoadmap({ ...baseInput, category: 'unknown' }), /business category/)
  assert.throws(() => generateRoadmap({ ...baseInput, stage: 'series-a' }), /current stage/)
  assert.throws(() => generateRoadmap({ ...baseInput, hoursPerWeek: 0 }), /between 1 and 80 hours/)
  assert.throws(() => generateRoadmap({ ...baseInput, budgetInr: '-1' }), /non-negative INR/)
  assert.throws(() => generateRoadmap({ ...baseInput, teamSize: '1.5' }), /whole number/)
})
