Prop Trading Cockpit – Full Product Requirements Document (PRD)
Version: 1.0
Date: 2026-05-14
Owner: Founder / PM

1. Product overview
Build a trader‑centric analytics cockpit that sits on top of prop firm and broker data, turning raw executions into edge‑focused insights: session intelligence, behavioral patterns, and multi‑account capital allocation.

Unlike prop firm dashboards, which are optimized to monitor rule breaches, drawdowns, and evaluation objectives at the single‑account level, this product is optimized to make traders better and more consistently profitable over time.[web:2][web:3]

2. Problem statement
Prop firm dashboards are compliance‑first, not improvement‑first.
Prop firm and risk dashboards focus on tracking max daily and overall drawdown, consistency rules, profit target progress, and evaluation objectives.[web:2][web:3][web:4][web:35] They offer only generic stats (win rate, R:R, P&L curves) and are designed to protect firm capital, not systematically improve the trader’s edge.

Traders lack session and time‑of‑day intelligence.
Even when dashboards show results by day or hour, they are not organized around meaningful futures/FX sessions (London, NY, Asia), nor do they translate patterns into clear, actionable recommendations like “stop trading here.”[web:2][web:17][web:18]

Behavioral leak detection is practically nonexistent.
Existing tools rarely detect revenge trading, over‑trading, or risk‑rule edge behavior automatically; advice is generic and manual journaling is required.[web:17][web:18][web:20][web:27]

Multi‑account prop traders have no unified cockpit.
Traders with multiple funded and evaluation accounts across different prop firms must log into separate portals, each with its own metrics and risk rules.[web:1][web:14][web:22][web:31] They cannot see combined equity, risk, or edge to make capital allocation decisions.

Existing journals are powerful but not prop‑specific.
Products like TradesViz and others offer dozens or hundreds of statistics and auto‑sync from brokers, yet are general‑purpose journals with complex UIs and not tailored to funded‑account drawdown constraints or multi‑firm capital routing.[web:20][web:25][web:27][web:31]

3. Product vision
Create the “cockpit” for serious futures and FX prop traders – a single interface that ingests executions from any prop firm/broker and outputs:

When to trade – session intelligence and time‑of‑day heatmaps.

How to trade – behavioral pattern detection and risk discipline prompts.

Where to deploy capital – multi‑account, multi‑firm capital views and routing insights.

The long‑term vision is: Every serious prop trader runs their trading day off this cockpit, not off individual prop firm dashboards.

4. Goals and non‑goals
4.1 Goals
Reduce “dumb losses” by making time‑of‑day and session patterns obvious and actionable.

Surface behavioral risk patterns (revenge trading, over‑trading, pushing drawdown limits) early enough to prevent catastrophic days and evaluation failures.

Provide a unified view across all funded and evaluation accounts so traders can allocate capital and risk intelligently.

Keep ingestion friction near zero with a smart importer that auto‑detects common prop/broker CSV schemas.

4.2 Non‑goals (for v1)
Executing orders or replacing broker/prop firm front‑ends.

Providing trading signals or strategy recommendations.

Becoming a generic, multi‑asset retail trading journal; focus is futures/FX prop use‑cases first.

5. Target users & personas
Persona 1: Funded grinder
Holds 1–3 funded accounts across firms (e.g., FTMO, MyFundedFX, The Funded Trader).

Trades intraday futures/FX, often around London and NY sessions.

Pain: Knows certain hours are terrible for them (e.g., first 30 minutes of NY open) but has no hard data.

Goal: Maintain funding, avoid drawdown breaches and challenge resets, slowly scale capital.

Persona 2: Scaling prop operator
Runs 3–10 funded/eval accounts across multiple firms and instruments.

Pain: No unified view of risk or performance; must log into several dashboards and journals, each with different metrics.[web:1][web:22][web:31]

Goal: Route size to highest‑edge setups while staying within firm rules; optimize multi‑account payouts.

Persona 3: Challenge taker
Regularly in evaluation phases across multiple prop firms.

Pain: Fails challenges for repeating behavioral issues (revenge trading, last‑day over‑risking) without systematic feedback.

Goal: Finally pass and maintain accounts by understanding and fixing behavioral leaks.

6. Market & competitive context
Prop firm dashboards (e.g., FTMO Account Analysis, MetriX) provide balance curves, general statistics, results by day/hour, and breakdowns by instrument, with strong emphasis on evaluation objectives and risk rules.[web:2][web:17][web:18][web:29]

Risk/rule education from prop firms and educators focuses on understanding daily and overall drawdown, fixed vs trailing drawdown, and risk per trade, reinforcing compliance but not personalized analytics.[web:3][web:4][web:33][web:35]

Prop‑focused journals and compliance tools (e.g., TradesViz prop compliance dashboards, PropJournal) emphasize real‑time rule tracking, rolling‑window pass rates, and extensive stat libraries rather than simple, behavior‑driven insights.[web:22][web:25][web:27][web:31]

Our differentiation:

Session‑ and behavior‑first framing rather than challenge‑ and rule‑first framing.

Multi‑firm, multi‑account capital cockpit instead of siloed single‑firm views.

7. Core product pillars
Data ingestion & normalization (Import Engine)
Smart, low‑friction import pipeline that absorbs diverse CSV formats from prop firms and brokers, maps them into a consistent schema, and powers all analytics.

Session intelligence (Time & market regime analytics)
Configurable session definitions (London, NY, Asia, custom) with performance metrics and heatmaps that show clearly when the trader should or should not be trading.

Behavioral analytics (Revenge & discipline engine)
Automated detection of revenge trading, over‑trading, and rule‑edge behavior, with incident timelines and behavioral profiles.

Multi‑account aggregation & capital routing
Unified portfolio view across all accounts and firms, with groupable accounts, firm/instrument breakdowns, and basic capital allocation suggestions.

Plans, billing & growth
Free, Pro, and Elite tiers that monetize deeper analytics and multi‑account features, with clear upgrade paths.

8. Scope & phased roadmap
Phase 1 – Foundation & MVP
Objective: Prove value quickly by making CSV import simple and showing useful account‑level analytics.

Key capabilities:

CSV upload for common prop/broker exports.

Auto‑detection of source formats and minimal mapping UI.

Normalization to internal schema and basic error handling.

Account‑level equity curve, daily P&L, summary stats, instrument breakdown.

Simple portfolio view for “All accounts.”

Phase 2 – Session intelligence & behavioral analytics
Objective: Deliver “wow” features that validate the cockpit positioning.

Key capabilities:

Default sessions (London/NY/Asia) and per‑session metrics.

Time‑of‑day/weekday heatmaps and insight cards (e.g., “you lose 80% of trades in first 30 minutes of NY open”).

Automated detection of revenge trading and over‑trading incidents, displayed on the equity curve and in a behavior tab.

Phase 3 – Pro/Elite tiers & multi‑account capital cockpit
Objective: Monetize via multi‑account traders and deepen retention features.

Key capabilities:

Plan definitions (Free/Pro/Elite) with feature gating.

Account groups and portfolio equity across firms.

Firm‑ and instrument‑level exposure views.

Simple capital routing suggestions based on historical expectancy.

9. Functional requirements by epic
Epic 1 – Data Ingestion & Normalization
F1.1 CSV Upload (MVP)

Allow users to upload one or more trade CSV files from supported prop firms/brokers.

Validate file type and size; show upload states (uploading, success, failure).

On success, show import summary and link to analytics.

F1.2 Auto‑Detection of Source Format

Inspect headers and sample rows to infer source type (FTMO, MT4/5, Tradovate, generic).

For known formats, correctly identify source in ≥90% of test cases.

Fall back to user confirmation when confidence is low.

F1.3 Column Mapping UI (Fallback)

UI to map CSV columns to required internal fields (time, symbol, side, size, P&L, etc.).

Required fields clearly indicated; mapping must be complete to proceed.

Allow saving mappings per source for reuse.

F1.4 Normalization Pipeline

Convert timestamps to UTC while storing original timezone metadata.

Standardize symbols, side, volume, monetary values, and account IDs.

Deduplicate trades based on account+ticket+time+symbol+size.

Log and exclude failed rows with reasons.

F1.5 Import Summary & Error Reporting

Show total rows, imported trades, skipped trades, date range, and accounts detected.

Group errors by type with counts and sample rows.

Optional error report export (CSV).

F1.6 Re‑Parsing and Re‑Mapping (P2)

Allow re‑running the parser on stored raw files when mapping logic improves.

Version import runs and keep old vs new results.

Epic 2 – Core Analytics (Account & Portfolio)
F2.1 Equity Curve per Account

Display realized P&L equity curve per account over time.

Allow date‑range selection; hover shows daily and cumulative P&L.

F2.2 Daily P&L Breakdown

Bar chart of daily P&L (green for profit, red for loss).

Clicking a bar filters the trade list to that day.

F2.3 Summary Stats Card

For selected range and account/portfolio, show: win rate, avg win, avg loss, profit factor or R:R, max daily drawdown, trade count, active days.

Metrics update when filters change.

F2.4 Instrument Breakdown (P1)

Table or chart with symbol, trades, win rate, net P&L, P&L per trade.

Clicking a symbol filters the trade list and charts.

F2.5 Portfolio (All Accounts) View (P1)

"All accounts" selection to aggregate P&L and metrics in a base currency.

UI clearly marks when user is in portfolio vs single‑account mode.

Epic 3 – Session Intelligence
F3.1 Default Session Definitions

Ship with default sessions (London, NY, Asia) as UTC time ranges.

Assign each trade to at most one session based on open or close time (configurable).

F3.2 Session Metrics per Instrument & Overall

For each session, compute: trades, win rate, net P&L, P&L per trade, max session drawdown.

Provide metrics at session×instrument and session×portfolio level.

F3.3 Time‑of‑Day & Weekday Heatmap (P1)

Heatmap with weekday rows and time‑bucket columns (e.g., 1‑hour buckets).

Color encodes net P&L or expectancy; hover shows stats and sample size.

F3.4 Custom Session Builder (P1)

Let users define named sessions with start/end time, timezone, and optional instrument filters.

Apply sessions to historical trades and recompute metrics.

Prevent or clearly resolve overlapping sessions.

F3.5 Session Insight Cards (P1)

Generate human‑readable insights, e.g., “You lose 80% of trades taken in the first 30 minutes of NY open.”

Show metric definition, time window, and sample size.

Allow users to dismiss or pin cards.

Epic 4 – Behavioral Analytics
F4.1 Behavioral Signal Engine (MVP)

Implement rule‑based detection for:

Revenge trading (big loss → cluster of rapid trades or size increase).

Over‑trading (day’s trade count far above baseline, especially on losing days).

Store as BehavioralIncident objects with timestamps and metadata.

F4.2 Behavior Timeline & Markers (P1)

Show incident markers on equity curves and list them in a behavior tab.

Clicking an incident zooms charts and lists to the relevant window.

F4.3 Incident Detail View (P1)

For each incident, show sequence of trades (size, side, P&L, time between trades).

Include summary metrics: pre‑incident, incident, and post‑incident P&L.

Optional user notes/tags per incident.

F4.4 Behavioral Profile Summary (P2)

Over 30–90 days, aggregate incidents into a profile (counts, typical triggers, common times).

Show simple statements like “After a −2R day, revenge clusters are 3x more likely.”

Epic 5 – Multi‑Account Aggregation & Capital View
F5.1 Account Linking & Grouping (P1)

Let users create named account groups (e.g., “FTMO funded,” “Evaluations”) and add/remove accounts.

All analytics can be filtered by group.

F5.2 Combined Portfolio Equity & P&L (P1)

Portfolio equity curve aggregating realized P&L across selected accounts/groups.

Summary stats and daily P&L charts respect group and account filters.

F5.3 Firm‑ & Instrument‑Level Exposure (P2)

Table with P&L, drawdown, and trades by prop firm and instrument cluster.

Help answer: “Where is my edge strongest/weakest by firm and product?”

F5.4 Capital Routing Suggestions v1 (P2)

Insight cards highlighting best and worst performing session×instrument×firm combinations.

Suggestions only; no automated order routing.

Epic 6 – Plans, Billing & Paywalls
F6.1 Plan Definitions (Free, Pro, Elite) (P0)

Implement internal plan model with limits (accounts, history, features).

Each user has a plan assigned.

F6.2 Feature Gating & UI States (P0)

Gate features server‑side and reflect in UI (lock icons, upgrade CTAs).

Free: 1 account, limited history, basic analytics.

Pro: multiple accounts (e.g., up to 3), full history, advanced sessions and behavior.

Elite: unlimited accounts, multi‑firm portfolio tab, capital routing, priority features.

F6.3 Billing Integration (P1)

Integrate with a billing provider (e.g., Stripe).

Support trials, upgrades/downgrades, and cancellations.

Handle failed payments and grace periods.

Epic 7 – UX, Onboarding & Demo Experience
F7.1 First‑Time Onboarding Flow (P0)

Guided onboarding that explains core value (sessions + behavior + multi‑account) in ≤3 screens.

Strong CTA to upload CSV or explore sample data.

F7.2 Sample Data / Sandbox Mode (P1)

Provide demo trades so new users can see heatmaps, behavioral incidents, and portfolio views without uploading.

F7.3 Basic Settings (P1)

Time zone, default date range, base currency.

All charts and metrics respect these settings.

Epic 8 – Technical & Operational Foundations
F8.1 Authentication & Authorization (P0)

Email/password auth (OAuth later), with sign‑up, login, logout, and password reset.

Protect all user‑specific API endpoints.

F8.2 Observability for Imports & Metrics (P1)

Internal logging of import latency, success/failure rates, and error types.

Alerts on spikes in specific source‑format errors.

F8.3 Data Privacy & Compliance Basics (P1)

Encrypt sensitive data at rest.

Publish clear privacy policy and data usage statement.

10. Data model (high‑level)
Key entities:

User – authentication and preferences.

Account – provider_name, external_account_id, base_currency, nickname, flags (e.g., funded vs evaluation).

Trade – normalized execution: account_id, open/close time (UTC), symbol, instrument_type, side, size, prices, realized_pnl, fees, raw_source_id.

SessionDefinition – per user; name, start_time, end_time, timezone, instrument filters.

DerivedMetric – level (trade/day/session/account/portfolio), metric_type, parameters.

BehavioralIncident – user_id, account_id, type, start/end time, severity, metadata.

Plan – Free/Pro/Elite definitions.

11. Prop firm vs cockpit – summary table
Area / Pillar	What prop firms provide today	What our cockpit is providing
Area / Pillar	What prop firms provide today	What our cockpit is providing
Primary objective	Dashboards are built to monitor evaluation objectives and rule compliance: profit target progress, max daily loss, max overall drawdown, minimum trading days, basic stats like win rate and average profit/loss.[web:2][web:11][web:29]	Product is explicitly optimized to improve trader edge and behavior over time: when to trade (sessions), how to trade (behavior & risk discipline), and where to allocate capital across accounts.
Risk & drawdown view	Strong visibility into rule limits (daily and overall drawdown), often including equity vs drawdown floors, trailing/fixed drawdown visualization, and alerts about potential breaches.[web:3][web:4][web:33][web:35]	Uses the same trade history to model “rule‑edge mismatch” and behavioral risk: flags when traders are increasing size near drawdown, pushing daily limits, or clustering losses, with coaching‑style insights rather than just limits.
Analytics scope	Account‑centric analytics: equity curve, P&L over time, general statistics (win rate, R:R, average profit/loss), basic results by hour/day, and sometimes P&L calendar and instrument breakdown.[web:2][web:17][web:18]	Edge‑centric analytics: per‑session expectancy, time‑of‑day and weekday heatmaps, session insight cards (e.g., “you lose 80% of trades in first 30 minutes of NY”), configurable sessions, and deeper expectancy stats at session × instrument level.
Session / time‑of‑day intelligence	Some tools show when you trade better or worse by hour/day, but sessions are not the core organizing concept and are not tailored to futures/FX prop use‑cases.[web:18][web:20][web:25]	Session intelligence is a first‑class pillar: named sessions (London, NY, Asia + custom), automatic assignment of trades into those blocks, performance metrics per session, and heatmaps that make “don’t trade here” windows visually obvious.
Behavioral patterns	Basic behavior feedback: equity curve, highlighted drawdown periods, journal notes/screenshots, and generic guidance to avoid over‑trading or breaking rules; little automated detection of patterns like revenge trading.[web:17][web:18][web:20][web:27]	Dedicated behavioral engine: detects revenge trading and over‑trading from trade sequences, logs “incidents,” shows them on the equity curve, and builds a behavioral profile (typical triggers, frequency, severity) that needs ongoing monitoring.
Multi‑account / multi‑firm view	Each prop firm dashboard is siloed per firm and often per account; traders must log into multiple portals and cannot easily see combined equity, risk, or edge across all funded and evaluation accounts.[web:1][web:22][web:28][web:31]	Unified cockpit across all accounts and firms: combined portfolio equity and P&L, account groups (e.g., “FTMO funded,” “evals”), firm/instrument breakdowns, and capital‑routing insights that show where to scale up or down risk.
Data ingestion & journaling	Firm dashboards auto‑ingest trades for that firm only; external journals offer broad, multi‑broker import and many stats but are not prop‑specific and often require manual setup/tweaking.[web:20][web:22][web:25][web:31]	Smart import pipeline optimized for prop: auto‑detects FTMO/prop CSV formats, normalizes into a consistent schema, handles multiple accounts, and becomes the single ingestion layer powering session, behavior, and portfolio analytics.
Depth of analytics	Some prop tools now offer deeper statistics (MFE/MAE, long vs short, instrument strengths, time‑of‑day performance) but still framed around each account’s evaluation and rule set, not a trader’s total capital picture.[web:17][web:18][web:29]	Same or deeper statistics, re‑organized around trader‑centric questions: best/worst sessions, edge stability, behavioral leak detection, and cross‑account performance — treating firm rules as constraints, not the main product.
12. Success metrics
12.1 Product success metrics
Activation: % of signups that complete at least one successful import within 24 hours.

Engagement: WAU who view Sessions or Behavior tabs at least once per week; median imports per active user per month.

Behavioral impact (later): % of users reporting reduced rule breaches or challenge failures after 60–90 days.

12.2 Business metrics
Free → Pro conversion rate.

Pro → Elite upgrade rate (expected to correlate with number of accounts).

Monthly churn by plan and by account count.

13. Risks & open questions
Risks

CSV‑first approach may still feel high‑friction; long‑term, live auto‑sync bridges may be required for stickiness.

Behavioral detection accuracy and explanation: if rules are too naive or opaque, traders may not trust the insights.

Prop firms may change export schemas frequently; requires ongoing maintenance and monitoring.

Open questions

Which exact prop firm exports (top 3–5) should be fully supported at launch?

How strongly should the product “coach” traders vs present neutral analytics?

What is the roadmap for live streaming (bridges/API) vs staying end‑of‑day for v1?

How detailed should per‑firm drawdown modeling be vs using generalized risk metrics?

