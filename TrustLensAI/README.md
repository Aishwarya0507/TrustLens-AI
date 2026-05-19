# TrustLens AI Sentinel

**The AI watchdog that audits and intercepts unsafe AI decisions in real time.**

TrustLens AI Sentinel is a HackWithBangalore prototype for the Hindsight x CascadeFlow challenge. It demonstrates how an AI agent can remember past decisions, detect unsafe patterns, explain risk, and intercept high-stakes AI decisions before they cause business, legal, or ethical harm.

## Problem

AI agents are moving into hiring, finance, support, operations, and compliance. But most teams cannot answer simple questions:

- Why did the AI make this decision?
- Did it use sensitive or unfair signals?
- Has it repeated the same risky pattern before?
- Should this decision be blocked before it reaches a real user?
- Can the company produce an audit trail later?

TrustLens solves this by acting as a real-time sentinel for AI decisions.

## Demo Scenario

The prototype uses an **AI hiring audit** scenario:

1. A base AI screening agent makes a candidate decision.
2. TrustLens audits the decision in real time.
3. It checks confidence, sensitive data, policy risk, and Hindsight memory.
4. When repeated risky rejection patterns appear, TrustLens intercepts the decision.
5. It generates an audit-ready report.

The intended wow moment:

> TrustLens detects repeated rejection of strong candidates from non-premier colleges and forces human review.

## How It Uses Hindsight

The prototype stores every audited decision in local memory. New decisions are compared against previous decisions to detect repeated unsafe behavior.

Example memory pattern:

- Strong non-premier candidate rejected
- Similar strong non-premier candidate rejected again
- Third similar decision triggers real-time interception

This shows the agent learning from previous sessions instead of acting like a one-time chatbot.

## How It Uses CascadeFlow

TrustLens routes decisions through different audit paths based on risk:

- **Fast path** for low-risk decisions
- **Policy verifier** for medium-risk decisions
- **Deep audit** for high-risk decisions
- **Human review** when unsafe patterns or sensitive data are detected

This shows runtime intelligence, model/task routing, and cost-aware escalation.

## MVP Features

- Decision simulator for AI hiring cases
- Live Sentinel panel
- Hindsight memory timeline
- Bias and policy risk dashboard
- CascadeFlow route display
- Audit report generator
- One-click winning demo sequence

## Run Locally

Start the local Node HTTP server to serve the application:

```bash
node src/server.mjs [port]
```

By default, the server runs at **http://127.0.0.1:5173**. Open this URL in any web browser.

Alternatively, you can open `public/index.html` directly in a browser (some file protocol environments may restrict local storage features).

## Submission Positioning

Use this one-line pitch everywhere:

> TrustLens AI Sentinel is the AI watchdog that audits, explains, and intercepts unsafe AI decisions in real time.

## Future Scope

- Connect to Hindsight memory API or vector database
- Integrate Azure OpenAI for decision generation and policy reasoning
- Add multi-domain audit packs for hiring, lending, support, and healthcare
- Export signed audit reports as PDF
- Add enterprise policy configuration
- Add Slack/Teams alerts for human review workflows
