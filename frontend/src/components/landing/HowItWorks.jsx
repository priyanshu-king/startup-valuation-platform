const STEPS = [
  {
    number: '01',
    title: 'Bring your numbers',
    text: 'Add a company profile, financial history, customer metrics, and market estimates.',
  },
  {
    number: '02',
    title: 'Review the inputs',
    text: 'Check the full summary and correct anything before the calculation is submitted.',
  },
  {
    number: '03',
    title: 'See the model',
    text: 'Applicable methods are calculated from your inputs using explicit assumptions.',
  },
  {
    number: '04',
    title: 'Understand the range',
    text: 'Review the estimate, scores, runway, risks, and the factors behind the result.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="sv-process sv-section">
      <div className="sv-container">
        <div className="sv-section-heading sv-section-heading--split">
          <div>
            <p className="sv-eyebrow"><span /> A clear process</p>
            <h2>From company inputs to a considered estimate.</h2>
          </div>
          <p>The mathematical engine—not an AI model—produces the valuation range. Any explanatory summary is secondary to the underlying calculation.</p>
        </div>
        <ol className="sv-process__steps">
          {STEPS.map(({ number, title, text }) => (
            <li key={number}>
              <span className="sv-process__number">{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
