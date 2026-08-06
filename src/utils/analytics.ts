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
  form_started: void
  match_info_opened: void
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
  request_status_opened: void
  new_request_started: void
  matches_load_failed: { reason: string }
  matches_reload_requested: void
  members_load_failed: { reason: string }
}

type AnalyticsEvent = keyof EventProperties

type TrackArgs<E extends AnalyticsEvent> = EventProperties[E] extends void
  ? [event: E]
  : [event: E, properties: EventProperties[E]]

let client: OpenPanel | null = null

// The production bundle is rendered by Puppeteer at build time (prerender.js);
// nothing it does may reach the analytics instance.
const isPrerender = () =>
  window.__PRERENDER__ === true || navigator.webdriver === true

export function initAnalytics(router: Router) {
  const apiUrl = process.env.OPENPANEL_API_URL
  const clientId = process.env.OPENPANEL_CLIENT_ID

  // Without an explicit apiUrl the SDK falls back to OpenPanel's public cloud,
  // so an unconfigured build must stay silent rather than pick a default.
  if (!apiUrl || !clientId || isPrerender()) return

  // A boot file that throws makes Quasar log the error and skip mounting
  // altogether, leaving a blank page — see @quasar/app-vite client-entry.
  try {
    client = new OpenPanel({ apiUrl, clientId, trackOutgoingLinks: true })
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
      client = null
    }
  })
}

export function track<E extends AnalyticsEvent>(...args: TrackArgs<E>) {
  const [event, properties] = args as [AnalyticsEvent, TrackProperties?]
  try {
    void client?.track(event, properties)
  } catch {
    client = null
  }
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
