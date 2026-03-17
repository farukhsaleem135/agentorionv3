import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const TeamReport = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "AgentOrion — Team Feature Implementation Report";
  }, []);

  const handleDownload = () => window.print();

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; max-width: 100% !important; }
          body { background: white !important; color: black !important; font-size: 11pt; }
          .page-break { page-break-before: always; }
          h1, h2, h3 { color: black !important; }
          table { font-size: 10pt; }
          th { background: #e5e7eb !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </button>
        <button onClick={handleDownload} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          Download PDF
        </button>
      </div>

      <div className="print-container max-w-3xl mx-auto px-6 py-10 text-foreground">
        {/* Header */}
        <div className="mb-10 border-b border-border pb-6">
          <h1 className="text-3xl font-bold mb-2">Team Feature — Implementation Report</h1>
          <p className="text-muted-foreground text-sm">
            AgentOrion Platform · Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p className="text-muted-foreground text-xs mt-1">Classification: Internal — Product & Engineering</p>
        </div>

        {/* Executive Summary */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3 text-primary">1. Executive Summary</h2>
          <p className="text-sm leading-relaxed mb-3">
            The Team feature enables team leaders (brokers, team leads) to invite agents, manage roles, and distribute incoming leads using configurable assignment rules. The database infrastructure is <strong>partially built</strong> — the core <code>team_members</code> table, RLS policies, and auto-linking trigger are live. However, the lead distribution engine, notification system, and advanced assignment algorithms require implementation before the feature is production-ready.
          </p>
          <div className="bg-secondary/50 rounded-xl p-4 border border-border">
            <p className="text-sm font-semibold mb-2">Current Status: 🟡 Partially Implemented</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
              <li>✅ Database schema (team_members table with RLS)</li>
              <li>✅ Auto-link trigger (pending invites → active on signup)</li>
              <li>✅ Team management UI (invite, remove, view members)</li>
              <li>✅ Assignment rules UI (selection interface)</li>
              <li>⚠️ Lead distribution logic (not implemented)</li>
              <li>⚠️ Invitation email delivery (not implemented)</li>
              <li>⚠️ Assignment rules persistence (local state only)</li>
              <li>❌ Agent performance tracking (not built)</li>
              <li>❌ Geo-targeting data model (not built)</li>
            </ul>
          </div>
        </section>

        {/* How It Works Today */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3 text-primary">2. How the Team System Works Today</h2>

          <h3 className="text-base font-semibold mt-5 mb-2">2.1 Team Leader Registration</h3>
          <p className="text-sm leading-relaxed mb-3">
            Currently, there is <strong>no dedicated "team leader" role assigned at registration</strong>. Any authenticated user can access the Team page and invite members. The system treats the inviting user as the <code>team_owner_id</code> in the <code>team_members</code> table. This means:
          </p>
          <ul className="text-sm list-disc pl-6 space-y-1 mb-3">
            <li>The first user to invite someone becomes that member's team owner</li>
            <li>There is no explicit "team leader" flag on the user's profile or subscription</li>
            <li>Team ownership is implicit — defined by who created the invite</li>
          </ul>
          <div className="bg-accent/20 rounded-xl p-4 border border-border mb-3">
            <p className="text-xs font-semibold text-accent-foreground mb-1">🔧 Recommendation</p>
            <p className="text-xs text-muted-foreground">
              Add a <code>team_role</code> field to the profiles table or create a dedicated <code>teams</code> table so team leaders are explicitly identified. This prevents ambiguity when a user is both a team owner and a member of another team.
            </p>
          </div>

          <h3 className="text-base font-semibold mt-5 mb-2">2.2 Invitation Flow</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-border rounded-lg overflow-hidden mb-3">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3 font-semibold">Step</th>
                  <th className="text-left p-3 font-semibold">Action</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="p-3">1</td><td className="p-3">Team leader clicks "Invite" and enters email + role</td><td className="p-3">✅ Built</td></tr>
                <tr><td className="p-3">2</td><td className="p-3">Record inserted into <code>team_members</code> with status "pending"</td><td className="p-3">✅ Built</td></tr>
                <tr><td className="p-3">3</td><td className="p-3">Invitation email sent to the invitee</td><td className="p-3">❌ Not built</td></tr>
                <tr><td className="p-3">4</td><td className="p-3">Invitee signs up via /auth page</td><td className="p-3">✅ Built</td></tr>
                <tr><td className="p-3">5</td><td className="p-3"><code>auto_link_team_invites</code> trigger fires, linking user to team</td><td className="p-3">✅ Built</td></tr>
                <tr><td className="p-3">6</td><td className="p-3">Member status changes to "active", <code>member_user_id</code> set</td><td className="p-3">✅ Built</td></tr>
                <tr><td className="p-3">7</td><td className="p-3">Team leader sees member as active on Team page</td><td className="p-3">✅ Built</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm leading-relaxed">
            <strong>Key limitation:</strong> Step 3 (email delivery) requires the Resend integration to be configured with a verified domain. Currently, team leaders must manually share the signup link with invitees.
          </p>

          <h3 className="text-base font-semibold mt-5 mb-2">2.3 Database Schema</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3 font-semibold">Column</th>
                  <th className="text-left p-3 font-semibold">Type</th>
                  <th className="text-left p-3 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="p-3 font-mono">id</td><td className="p-3">uuid</td><td className="p-3">Primary key</td></tr>
                <tr><td className="p-3 font-mono">team_owner_id</td><td className="p-3">uuid</td><td className="p-3">The user who created the invite (team leader)</td></tr>
                <tr><td className="p-3 font-mono">email</td><td className="p-3">text</td><td className="p-3">Invitee's email address</td></tr>
                <tr><td className="p-3 font-mono">role</td><td className="p-3">text</td><td className="p-3">"agent", "admin", or "leader"</td></tr>
                <tr><td className="p-3 font-mono">status</td><td className="p-3">text</td><td className="p-3">"pending", "active", or "removed"</td></tr>
                <tr><td className="p-3 font-mono">member_user_id</td><td className="p-3">uuid (nullable)</td><td className="p-3">Set when invitee signs up</td></tr>
                <tr><td className="p-3 font-mono">joined_at</td><td className="p-3">timestamp</td><td className="p-3">Set when auto-linked</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Assignment Rules */}
        <div className="page-break" />
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3 text-primary">3. Lead Assignment Rules — Detailed Requirements</h2>
          <p className="text-sm leading-relaxed mb-4">
            The Team page displays four assignment strategies. Currently these are <strong>UI-only</strong> — the selected rule is stored in local React state and has no effect on lead routing. Below is what each rule requires to function:
          </p>

          {/* Round Robin */}
          <div className="bg-card border border-border rounded-xl p-5 mb-4">
            <h3 className="text-base font-bold mb-2">3.1 Round Robin</h3>
            <p className="text-sm leading-relaxed mb-2">Distributes leads evenly across all active team agents in rotating order.</p>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Implementation Requirements:</p>
            <ul className="text-xs list-disc pl-5 space-y-1">
              <li>New table or column: <code>team_settings</code> with <code>assignment_rule</code> and <code>last_assigned_index</code></li>
              <li>Modify the lead intake flow (funnel form submission) to check team membership</li>
              <li>Database function: <code>assign_lead_round_robin(team_owner_id, lead_id)</code> that queries active members, increments the index, and sets <code>funnel_leads.assigned_to</code></li>
              <li>Trigger on <code>funnel_leads INSERT</code> to auto-assign if team has round robin enabled</li>
            </ul>
            <p className="text-xs font-semibold text-primary mt-3">Complexity: 🟢 Low — straightforward counter-based distribution</p>
          </div>

          {/* Performance-Based */}
          <div className="bg-card border border-border rounded-xl p-5 mb-4">
            <h3 className="text-base font-bold mb-2">3.2 Performance-Based</h3>
            <p className="text-sm leading-relaxed mb-2">Routes leads to agents with the highest conversion rates.</p>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Implementation Requirements:</p>
            <ul className="text-xs list-disc pl-5 space-y-1">
              <li>New table: <code>agent_performance</code> — tracks per-agent metrics (leads assigned, leads converted, conversion rate, avg response time)</li>
              <li>Materialized view or scheduled function to compute rolling 30-day conversion rates</li>
              <li>Database function: <code>assign_lead_performance(team_owner_id, lead_id)</code> that selects the agent with highest conversion rate who hasn't exceeded capacity</li>
              <li>Agent capacity limits (max concurrent leads per agent)</li>
              <li>Fallback to round robin when all agents have equal or zero performance data</li>
            </ul>
            <p className="text-xs font-semibold text-primary mt-3">Complexity: 🟡 Medium — requires historical tracking + aggregation</p>
          </div>

          {/* Geo-Targeted */}
          <div className="bg-card border border-border rounded-xl p-5 mb-4">
            <h3 className="text-base font-bold mb-2">3.3 Geo-Targeted</h3>
            <p className="text-sm leading-relaxed mb-2">Matches leads to agents based on their assigned market areas or zip codes.</p>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Implementation Requirements:</p>
            <ul className="text-xs list-disc pl-5 space-y-1">
              <li>New columns on <code>team_members</code>: <code>assigned_zip_codes text[]</code>, <code>assigned_market_areas text[]</code></li>
              <li>UI for team leaders to assign geographic zones to each agent</li>
              <li>Lead intake must capture geographic data (zip code from funnel's <code>target_area</code> or <code>zip_codes</code>)</li>
              <li>Database function: <code>assign_lead_geo(team_owner_id, lead_id, lead_zip)</code> that matches lead zip to agent zones</li>
              <li>Fallback strategy when no agent covers the lead's area (round robin among all agents)</li>
              <li>Optional: integration with MLS data to auto-suggest market area assignments</li>
            </ul>
            <p className="text-xs font-semibold text-primary mt-3">Complexity: 🟡 Medium — requires geo-zone management UI + matching logic</p>
          </div>

          {/* AI-Optimized */}
          <div className="bg-card border border-border rounded-xl p-5 mb-4">
            <h3 className="text-base font-bold mb-2">3.4 AI-Optimized</h3>
            <p className="text-sm leading-relaxed mb-2">Uses AI to analyze lead profile, agent strengths, and historical data to make optimal assignments.</p>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Implementation Requirements:</p>
            <ul className="text-xs list-disc pl-5 space-y-1">
              <li>All prerequisites from Performance-Based AND Geo-Targeted rules</li>
              <li>Agent profile data: specialties (buyer/seller/luxury/first-time), language, availability schedule</li>
              <li>Edge function: <code>ai-lead-assignment</code> that sends lead + agent profiles to AI gateway</li>
              <li>AI prompt engineering to score agent-lead compatibility (intent match, price range match, location, agent availability, historical success with similar leads)</li>
              <li>Confidence threshold — if AI confidence is below threshold, fall back to round robin</li>
              <li>Audit log for AI decisions (transparency for team leaders)</li>
            </ul>
            <p className="text-xs font-semibold text-primary mt-3">Complexity: 🔴 High — depends on all other rules being built first + AI integration</p>
          </div>
        </section>

        {/* Implementation Roadmap */}
        <div className="page-break" />
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3 text-primary">4. Implementation Roadmap</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3 font-semibold">Phase</th>
                  <th className="text-left p-3 font-semibold">Deliverables</th>
                  <th className="text-left p-3 font-semibold">Dependencies</th>
                  <th className="text-left p-3 font-semibold">Est. Effort</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 font-semibold">Phase 1: Foundation</td>
                  <td className="p-3">
                    • <code>team_settings</code> table (assignment_rule, last_assigned_index)<br/>
                    • Persist selected rule to database<br/>
                    • Invitation email via Resend edge function<br/>
                    • Team leader explicit identification
                  </td>
                  <td className="p-3">Resend API key</td>
                  <td className="p-3">3-5 days</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Phase 2: Round Robin</td>
                  <td className="p-3">
                    • <code>assign_lead_round_robin()</code> SQL function<br/>
                    • Trigger on funnel_leads INSERT<br/>
                    • Assignment notification to agent<br/>
                    • "Assigned to" display on lead cards
                  </td>
                  <td className="p-3">Phase 1</td>
                  <td className="p-3">2-3 days</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Phase 3: Performance</td>
                  <td className="p-3">
                    • <code>agent_performance</code> table + aggregation function<br/>
                    • <code>assign_lead_performance()</code> SQL function<br/>
                    • Performance dashboard on Team page<br/>
                    • Agent capacity limits
                  </td>
                  <td className="p-3">Phase 2 + sufficient lead data</td>
                  <td className="p-3">4-6 days</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Phase 4: Geo-Targeting</td>
                  <td className="p-3">
                    • Geo-zone columns on team_members<br/>
                    • Zone assignment UI<br/>
                    • <code>assign_lead_geo()</code> SQL function<br/>
                    • Map visualization (optional)
                  </td>
                  <td className="p-3">Phase 2 + MLS integration for zip data</td>
                  <td className="p-3">4-5 days</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Phase 5: AI-Optimized</td>
                  <td className="p-3">
                    • <code>ai-lead-assignment</code> edge function<br/>
                    • Agent specialty profiles<br/>
                    • AI decision audit log<br/>
                    • Confidence thresholds + fallback
                  </td>
                  <td className="p-3">Phases 3 + 4</td>
                  <td className="p-3">5-7 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Data Flow Diagram */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3 text-primary">5. Lead Assignment Data Flow</h2>
          <div className="bg-secondary/30 rounded-xl p-5 border border-border font-mono text-xs leading-loose">
            <p>New Lead Submitted (funnel form)</p>
            <p className="pl-4">↓</p>
            <p className="pl-4">INSERT into funnel_leads</p>
            <p className="pl-8">↓</p>
            <p className="pl-8">Trigger: check if funnel owner has a team</p>
            <p className="pl-12">↓</p>
            <p className="pl-12">Query team_settings for assignment_rule</p>
            <p className="pl-16">↓</p>
            <p className="pl-8">┌─────────────────┬──────────────────┬────────────────┬──────────────┐</p>
            <p className="pl-8">│ Round Robin      │ Performance      │ Geo-Targeted   │ AI-Optimized │</p>
            <p className="pl-8">│ Next in rotation │ Highest conv %   │ Match zip code │ AI scoring   │</p>
            <p className="pl-8">└─────────────────┴──────────────────┴────────────────┴──────────────┘</p>
            <p className="pl-16">↓</p>
            <p className="pl-12">UPDATE funnel_leads SET assigned_to = selected_agent</p>
            <p className="pl-16">↓</p>
            <p className="pl-12">Notify agent (push / email / in-app)</p>
          </div>
        </section>

        {/* Database Changes Required */}
        <div className="page-break" />
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3 text-primary">6. Required Database Changes</h2>

          <div className="bg-card border border-border rounded-xl p-5 mb-4">
            <h3 className="text-sm font-bold mb-2 font-mono">New Table: team_settings</h3>
            <pre className="text-[10px] bg-secondary/50 rounded-lg p-3 overflow-x-auto whitespace-pre">{`CREATE TABLE public.team_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_owner_id uuid NOT NULL UNIQUE,
  assignment_rule text NOT NULL DEFAULT 'round_robin',
  last_assigned_index integer DEFAULT 0,
  max_leads_per_agent integer DEFAULT 50,
  auto_assign_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);`}</pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 mb-4">
            <h3 className="text-sm font-bold mb-2 font-mono">New Table: agent_performance</h3>
            <pre className="text-[10px] bg-secondary/50 rounded-lg p-3 overflow-x-auto whitespace-pre">{`CREATE TABLE public.agent_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_owner_id uuid NOT NULL,
  agent_user_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  leads_assigned integer DEFAULT 0,
  leads_converted integer DEFAULT 0,
  conversion_rate numeric DEFAULT 0,
  avg_response_time_minutes integer DEFAULT NULL,
  revenue_generated numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_owner_id, agent_user_id, period_start)
);`}</pre>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 mb-4">
            <h3 className="text-sm font-bold mb-2 font-mono">Alter: team_members (Geo-Targeting)</h3>
            <pre className="text-[10px] bg-secondary/50 rounded-lg p-3 overflow-x-auto whitespace-pre">{`ALTER TABLE public.team_members
  ADD COLUMN assigned_zip_codes text[] DEFAULT '{}',
  ADD COLUMN assigned_market_areas text[] DEFAULT '{}',
  ADD COLUMN specialties text[] DEFAULT '{}',
  ADD COLUMN max_concurrent_leads integer DEFAULT 50;`}</pre>
          </div>
        </section>

        {/* Security */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3 text-primary">7. Security Considerations</h2>
          <ul className="text-sm list-disc pl-6 space-y-2">
            <li><strong>RLS on team_settings:</strong> Only <code>team_owner_id = auth.uid()</code> can read/write their settings</li>
            <li><strong>RLS on agent_performance:</strong> Team owners can view their agents' data; agents can view their own</li>
            <li><strong>Lead assignment trigger:</strong> Must use <code>SECURITY DEFINER</code> to write across user boundaries (assigning a lead owned by team leader to a team member)</li>
            <li><strong>Invitation abuse:</strong> Rate-limit invites to prevent spam (max 20 pending invites per team)</li>
            <li><strong>Cross-team data isolation:</strong> Agents on Team A must never see leads from Team B — current RLS via <code>funnel_leads</code> → <code>funnels.user_id</code> enforces this, but assigned agents need a SELECT policy via <code>assigned_to</code></li>
          </ul>
          <div className="bg-destructive/10 rounded-xl p-4 border border-destructive/30 mt-4">
            <p className="text-xs font-semibold text-destructive mb-1">⚠️ Critical RLS Gap</p>
            <p className="text-xs text-muted-foreground">
              Currently, <code>funnel_leads</code> SELECT policy only allows the funnel owner to view leads. Once leads are assigned to team agents, a new policy is required: <code>assigned_to = auth.uid()</code> so agents can view their assigned leads. Without this, team members cannot see leads routed to them.
            </p>
          </div>
        </section>

        {/* Subscription Gating */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3 text-primary">8. Subscription Tier Gating</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3 font-semibold">Feature</th>
                  <th className="text-center p-3 font-semibold">Free</th>
                  <th className="text-center p-3 font-semibold">Growth</th>
                  <th className="text-center p-3 font-semibold">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="p-3">Team members</td><td className="p-3 text-center">—</td><td className="p-3 text-center">Up to 5</td><td className="p-3 text-center">Unlimited</td></tr>
                <tr><td className="p-3">Round Robin</td><td className="p-3 text-center">—</td><td className="p-3 text-center">✅</td><td className="p-3 text-center">✅</td></tr>
                <tr><td className="p-3">Performance-Based</td><td className="p-3 text-center">—</td><td className="p-3 text-center">—</td><td className="p-3 text-center">✅</td></tr>
                <tr><td className="p-3">Geo-Targeted</td><td className="p-3 text-center">—</td><td className="p-3 text-center">—</td><td className="p-3 text-center">✅</td></tr>
                <tr><td className="p-3">AI-Optimized</td><td className="p-3 text-center">—</td><td className="p-3 text-center">—</td><td className="p-3 text-center">✅</td></tr>
                <tr><td className="p-3">Performance Dashboard</td><td className="p-3 text-center">—</td><td className="p-3 text-center">Basic</td><td className="p-3 text-center">Full</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3 text-primary">9. Summary & Answers</h2>
          <div className="space-y-4 text-sm leading-relaxed">
            <div>
              <p className="font-semibold">Q: Is the team leader role defined at registration?</p>
              <p className="text-muted-foreground">No. Currently any user can invite others. A team leader is implicitly the user whose ID is stored as <code>team_owner_id</code>. To formalize this, a <code>team_settings</code> table and/or profile flag should be added.</p>
            </div>
            <div>
              <p className="font-semibold">Q: Are invitees auto-assigned to the team leader?</p>
              <p className="text-muted-foreground">Yes. The <code>auto_link_team_invites</code> trigger fires on user signup. If the new user's email matches a pending invite, they are automatically linked to the team with status "active".</p>
            </div>
            <div>
              <p className="font-semibold">Q: Is the Team feature ready for production?</p>
              <p className="text-muted-foreground">The invitation and member management flow works. Lead distribution (the core value proposition) is not yet implemented. Phases 1–2 are required for a minimum viable Team feature.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
          <p>AgentOrion Team Feature Report · {new Date().getFullYear()} · Confidential</p>
        </div>
      </div>
    </>
  );
};

export default TeamReport;
