# ScopeKind AI Engine prototype

## Purpose

The prototype analyzes one client request against explicit project scope and approved decisions. It returns one of four review labels:

- `within_scope`
- `clarification_needed`
- `potential_change`
- `contradiction`

It is decision support, not an automatic contractual determination. A freelancer should approve any client-facing conclusion.

## Data boundary

The repository contains synthetic evaluation cases only. Do not add customer messages, contracts, briefs, names, emails, or files to Git. Do not reuse one customer's context for another customer's analysis.

Model requests use `store: false`. Before a real pilot, add tenant isolation, authorization, retention/deletion rules, audit logs, redaction, consent language, and a data-processing review.

## Modes

The deterministic mode is the safe default. It makes the data contract and evaluation pipeline testable without sending data to an external model:

```sh
node scripts/eval-ai-engine.mjs
```

The optional model mode uses the OpenAI Responses API with strict structured output:

```sh
export OPENAI_API_KEY="..."
export SCOPEKIND_AI_MODEL="..."
node scripts/eval-ai-engine.mjs --mode=openai
```

Keep secrets outside the repository. Select the model explicitly rather than relying on a silently changing default.

## Input contract

```json
{
  "scope": {
    "deliverables": [{ "id": "scope-1", "text": "One primary logo" }],
    "exclusions": [{ "id": "exclude-1", "text": "Social templates" }]
  },
  "decisions": [{ "id": "decision-1", "text": "Approved minimal direction" }],
  "request": { "id": "request-1", "text": "Can we add a social media kit?" }
}
```

Each evidence item returned by the engine cites a supplied source ID. Missing context must produce clarification rather than invented evidence.

## Evaluation policy

The initial dataset verifies plumbing, not market-level quality. Before a pilot:

1. Expand synthetic cases, including adversarial and ambiguous requests.
2. Have at least two humans label cases independently.
3. Track per-class precision and recall, especially false `within_scope` and false `potential_change` results.
4. Define acceptable thresholds before enabling client-facing output.
5. Preserve a holdout set that is never used to tune prompts or examples.

Fine-tuning is out of scope until retrieval, prompting, and evaluation expose a stable repeated error that a sufficiently large, authorized dataset can address.

