import { useCallback, useEffect, useState } from 'react'
import { Download, Eye, Trash2 } from 'lucide-react'
import { reportsApi } from '@/services/api'
import { formatDate, formatDateTime, loadSettings } from '@/services/userSettings'
import {
  formatInr,
  ToolAction,
  ToolCard,
  ToolError,
  ToolMetrics,
  ToolNotice,
  ToolPage,
} from './ToolUi'

function valuationRange(low, high) {
  return `${Number(low).toFixed(2)}–${Number(high).toFixed(2)} Cr`
}

export default function Reports() {
  const [dateFormat] = useState(() => loadSettings().settings.preferences.dateFormat)
  const [reports, setReports] = useState([])
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState('')

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await reportsApi.list()
      setReports(data)
    } catch (requestError) {
      setError(requestError.message || 'Your reports could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadReports() }, [loadReports])

  async function openReport(reportId) {
    setAction(`open-${reportId}`)
    setError('')
    try {
      const { data } = await reportsApi.get(reportId)
      setSelected(data)
    } catch (requestError) {
      setError(requestError.message || 'The report could not be opened.')
    } finally {
      setAction('')
    }
  }

  async function downloadReport(reportId) {
    setAction(`download-${reportId}`)
    setError('')
    try {
      const { data } = await reportsApi.downloadPdf(reportId)
      const objectUrl = URL.createObjectURL(data)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = `startup-valuation-report-${reportId}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    } catch (requestError) {
      setError(requestError.message || 'The PDF could not be downloaded.')
    } finally {
      setAction('')
    }
  }

  async function deleteReport(reportId) {
    if (!window.confirm('Delete this report and its saved valuation? This cannot be undone.')) return
    setAction(`delete-${reportId}`)
    setError('')
    try {
      await reportsApi.delete(reportId)
      if (selected?.report_id === reportId) setSelected(null)
      await loadReports()
    } catch (requestError) {
      setError(requestError.message || 'The report could not be deleted.')
      setAction('')
    }
  }

  return (
    <ToolPage
      title="Reports"
      description="Your saved valuation reports, generated from the exact inputs and result persisted when you calculated each valuation."
    >
      <ToolCard title="Report history" description="Reports are private to your signed-in account. PDFs are rendered from saved report data when downloaded.">
        <ToolError>{error}</ToolError>
        {loading ? (
          <p role="status">Loading your saved reports…</p>
        ) : reports.length === 0 ? (
          <div className="workspace-empty-state">
            <h2>No saved reports yet</h2>
            <p>Calculate a valuation while signed in. Its saved inputs and result will appear here as a downloadable report.</p>
          </div>
        ) : (
          <div className="workspace-table-scroll">
            <table className="workspace-table">
              <thead><tr><th>Company</th><th>Generated</th><th>Valuation range</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.report_id}>
                    <th scope="row">{report.company_name}</th>
                    <td>{formatDate(report.generated_at, dateFormat)}</td>
                    <td>{valuationRange(report.valuation_low, report.valuation_high)}</td>
                    <td>{report.status}</td>
                    <td>
                      <div className="workspace-report-actions">
                        <button type="button" onClick={() => openReport(report.report_id)} disabled={Boolean(action)} aria-label={`Open ${report.company_name} report`}>
                          <Eye size={15} /> Open
                        </button>
                        <button type="button" onClick={() => downloadReport(report.report_id)} disabled={Boolean(action)} aria-label={`Download ${report.company_name} PDF`}>
                          <Download size={15} /> PDF
                        </button>
                        <button type="button" onClick={() => deleteReport(report.report_id)} disabled={Boolean(action)} aria-label={`Delete ${report.company_name} report`}>
                          <Trash2 size={15} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ToolCard>

      {selected && (
        <>
          <ToolCard title={`${selected.company_name} valuation report`} description={`Report #${selected.report_id} / Generated ${formatDateTime(selected.generated_at, dateFormat)} / Saved valuation #${selected.valuation_id}`}>
            <ToolMetrics items={[
              { label: 'Valuation range', value: valuationRange(selected.valuation_low, selected.valuation_high), note: 'INR crore; converted to INR below.' },
              { label: 'Base estimate', value: `${Number(selected.valuation_base).toFixed(2)} Cr` },
              { label: 'Financial health', value: `${Number(selected.scores.financial_health).toFixed(1)} / 100` },
              { label: 'Growth score', value: `${Number(selected.scores.growth).toFixed(1)} / 100` },
              { label: 'Investor readiness', value: `${Number(selected.scores.investor_readiness).toFixed(1)} / 100` },
              { label: 'Cash runway', value: selected.cash_runway_months == null ? 'Not available' : `${Number(selected.cash_runway_months).toFixed(1)} months` },
              { label: 'LTV / CAC', value: selected.ltv_cac_ratio == null ? 'Not available' : `${Number(selected.ltv_cac_ratio).toFixed(2)}x` },
              { label: 'Revenue', value: formatInr(selected.financials.annual_revenue) },
            ]} />
            <ToolAction onClick={() => downloadReport(selected.report_id)} disabled={Boolean(action)}>
              <Download size={16} /> {action === `download-${selected.report_id}` ? 'Preparing PDF…' : 'Download PDF'}
            </ToolAction>
          </ToolCard>
          <ToolCard title="Valuation methods and saved assumptions">
            <div className="workspace-table-scroll">
              <table className="workspace-table">
                <thead><tr><th>Method</th><th>Result</th><th>Applicability</th><th>Saved assumption</th></tr></thead>
                <tbody>{selected.method_breakdown.map((method) => (
                  <tr key={method.method_name}>
                    <th scope="row">{method.method_name}</th>
                    <td>{method.value_crore == null ? 'Not applicable' : `${Number(method.value_crore).toFixed(2)} Cr`}</td>
                    <td>{method.applicable ? 'Applicable' : 'Not applicable'}</td>
                    <td>{method.note}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <pre className="workspace-report-json">{JSON.stringify(selected.assumptions, null, 2)}</pre>
            <ToolNotice>{selected.disclaimer}</ToolNotice>
          </ToolCard>
        </>
      )}
    </ToolPage>
  )
}
