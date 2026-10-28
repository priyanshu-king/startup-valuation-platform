const CONTENT = {
  about: {
    title: 'About Startup Valuation',
    intro: 'A practical, transparent way to explore a model-based estimate from the figures founders provide.',
    sections: [
      ['What this product does', 'The current application collects startup profile, financial, business, and market inputs and calculates an estimate using a deterministic mathematical engine.'],
      ['What it does not do', 'It does not verify submitted data, retrieve market comparables, provide a certified appraisal, or offer investment advice. The estimate should be treated as an exploration tool, not a promise of value.'],
    ],
  },
  contact: {
    title: 'Contact',
    intro: 'The current build does not have a configured support address or contact submission service.',
    sections: [
      ['Product support', 'A support channel has not been configured for this deployment. Do not send sensitive financial or personal information through an unverified channel.'],
      ['Using the product', 'You can try the valuation form with non-confidential sample inputs. The result is a model-based estimate and is not a formal appraisal.'],
    ],
  },
  privacy: {
    title: 'Privacy & data handling',
    intro: 'This page describes the current application capabilities; deployment-specific practices must be reviewed by the operator.',
    sections: [
      ['Valuation data', 'New valuations are associated with the signed-in account. Private API reads, report history, report downloads, and report deletion verify that ownership. Pre-account records remain unassigned and are excluded from private history; they are not automatically attributed to a new user.'],
      ['Authentication', 'Passwords are hashed with Argon2 using pwdlib. The browser receives a revocable HttpOnly session cookie; opaque session values are stored as hashes on the backend. Password recovery, email verification, and account deletion are not yet available.'],
      ['Deployment responsibility', 'HTTPS, database access, backups, restore testing, retention, and infrastructure monitoring depend on deployment configuration. Reports are generated on demand from saved valuation records rather than stored as public files.'],
      ['No unsupported guarantees', 'The application does not claim that submitted data is encrypted at rest or automatically deleted. SQL parameter echo is disabled. Operators should publish policies matching their infrastructure before collecting real user data.'],
    ],
  },
  terms: {
    title: 'Terms & valuation disclaimer',
    intro: 'Use the current valuation tool only as an informational aid, not as professional financial advice.',
    sections: [
      ['Model-based estimates', 'Outputs are generated from user-submitted inputs and documented model assumptions. They are not verified facts, an independent valuation, a securities offer, or a recommendation to invest.'],
      ['No guarantee', 'The calculation is an illustrative estimate and may not reflect market conditions, company-specific risks, or the value agreed by investors, buyers, or other parties.'],
      ['Your inputs', 'You are responsible for the accuracy and suitability of the information you enter. Authenticated valuation reports are restricted to their owner, but deployment transport, storage, and retention controls must be reviewed before entering sensitive information.'],
    ],
  },
}

export default function ContentPage({ page }) {
  const content = CONTENT[page]

  return (
    <article className="sv-content-page">
      <div className="sv-content-page__intro">
        <p className="sv-eyebrow"><span /> Startup Valuation</p>
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
      </div>
      {page === 'about' && (
        <figure className="sv-content-page__portrait">
          <img src="/founder-portrait.jpeg" alt="Founder portrait" width="400" height="400" />
        </figure>
      )}
      <div className="sv-content-page__sections">
        {content.sections.map(([heading, body]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>
    </article>
  )
}
