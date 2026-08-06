import { OpenPanel, type TrackProperties } from '@openpanel/web'
import { daysUntilMatch } from 'src/utils/date'
import type { Match, Sport } from 'stores/form-store'
import type { Router } from 'vue-router'

interface MatchProperties {
  sport: Sport
  team: string
  opponent: string
  tournament: string
  matchType: string
  atHome: boolean
  isWomen: boolean
  isCantera: boolean
  isDateConfirmed: boolean
  daysUntilMatch: number
}

// The form collects names, phone numbers, emails, birth dates and document
// numbers. None of it may appear here — only choices and outcomes.
interface EventProperties {
  form_started: undefined
  match_info_opened: undefined
  match_filters_opened: { source: 'link' | 'match_field' }
  match_filters_changed: { selectedTeams: number; totalTeams: number }
  match_selected: MatchProperties
  ticket_category_selected: { category: string }
  deadline_warning_shown: {
    atHome: boolean
    daysLeft: number
    deadlineDays: number
  }
  deadline_warning_resolved: {
    confirmed: boolean
    atHome: boolean
    daysLeft: number
  }
  request_incomplete: { missingFields: string }
  request_submitted: MatchProperties & {
    ticketCategory: string
    withPersonalData: boolean
    withTelegram: boolean
  }
  request_failed: { status: number }
  request_status_opened: undefined
  new_request_started: undefined
  matches_load_failed: { reason: string }
  matches_reload_requested: undefined
  members_load_failed: { reason: string }
}

type AnalyticsEvent = keyof EventProperties

type TrackArgs<E extends AnalyticsEvent> = EventProperties[E] extends undefined
  ? [event: E]
  : [event: E, properties: EventProperties[E]]

// The analytics host is the only thing this app talks to outside Russia, and it
// can be blocked at any time. Everything below is written so that a dead host
// costs the user nothing: no throw ever escapes, and once the host has clearly
// stopped answering we stop asking for the rest of the session.
const MAX_FAILED_SENDS = 3
const SEND_TIMEOUT_MS = 10_000

let client: OpenPanel | null = null
let stopped = false
let failedSends = 0

// The production bundle is rendered by Puppeteer at build time (prerender.js);
// nothing it does may reach the analytics instance.
const isPrerender = () => window.__PRERENDER__ === true || navigator.webdriver

export function initAnalytics(router: Router) {
  const apiUrl = process.env.OPENPANEL_API_URL
  const clientId = process.env.OPENPANEL_CLIENT_ID

  // Without an explicit apiUrl the SDK falls back to OpenPanel's public cloud,
  // so an unconfigured build must stay silent rather than pick a default.
  if (!apiUrl || !clientId || isPrerender()) return

  // A boot file that throws makes Quasar log the error and skip mounting
  // altogether, leaving a blank page — see @quasar/app-vite client-entry.
  try {
    client = new OpenPanel({
      apiUrl,
      clientId,
      trackOutgoingLinks: true,
      // Runs before every send, including the ones the SDK makes on its own for
      // outgoing links, so this is the one switch that silences all of them.
      filter: () => !stopped,
    })
    client.setGlobalProperties({ appVersion: process.env.APP_VERSION })
  } catch {
    client = null
    return
  }

  // Automatic screen views report `window.location.href`, and the server turns
  // every query parameter into a stored property. Send the bare path instead.
  router.afterEach(to => {
    try {
      client?.screenView(to.path)
    } catch {
      stopped = true
    }
  })
}

export function track<E extends AnalyticsEvent>(...args: TrackArgs<E>) {
  const [event, properties] = args as [AnalyticsEvent, TrackProperties?]
  try {
    const sent = client?.track(event, properties)
    if (sent) watchSend(sent)
  } catch {
    stopped = true
  }
}

function watchSend(sent: Promise<unknown>) {
  let done = false
  const finish = (result: unknown) => {
    if (done) return
    done = true
    noteSendResult(result)
  }

  void sent.then(finish, () => {
    finish(null)
  })

  // A blocked host tends to swallow the request rather than refuse it, so the
  // SDK never reports a failure and the promise never settles. One stuck
  // request is harmless; a new one per event for the whole session is not.
  setTimeout(() => {
    finish(null)
  }, SEND_TIMEOUT_MS)
}

// The SDK resolves to `null` once a request is beyond saving — retries
// exhausted, or rejected outright. A blocked host stays blocked, so a short run
// of those is reason enough to give up instead of retrying all session.
function noteSendResult(result: unknown) {
  if (result !== null) {
    failedSends = 0
    return
  }
  if (++failedSends >= MAX_FAILED_SENDS) stopped = true
}

export function matchProperties(match: Match): MatchProperties {
  return {
    sport: match.sport,
    team: match.team,
    opponent: match.vs,
    tournament: match.tournament,
    matchType: match.type,
    atHome: match.atHome,
    isWomen: match.isWomen,
    isCantera: match.isCantera,
    isDateConfirmed: match.isDateConfirmed,
    daysUntilMatch: daysUntilMatch(match.date),
  }
}
