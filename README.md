# Checkmango SDK for JavaScript

The official server-side JavaScript and TypeScript SDK for [Checkmango](https://checkmango.com).
Requires Node.js 22 or newer and uses its built-in `fetch`. Both ES modules and CommonJS are supported.

## Installation

```sh
npm install @checkmango/checkmango.js
```

Create an API token in your [Checkmango dashboard](https://checkmango.com/user/api-tokens).
Set `CHECKMANGO_API_KEY` and `CHECKMANGO_ORGANIZATION_ID` in your server environment.
The SDK does not load `.env` files itself.

> Do not use this package directly in a browser: it would expose your API token.
> Call Checkmango from your server instead.

## Usage

```js
import Checkmango from '@checkmango/checkmango.js';

const cm = new Checkmango(
  process.env.CHECKMANGO_API_KEY,
  process.env.CHECKMANGO_ORGANIZATION_ID,
);

const health = await cm.health(); // { ping: 'pong', time: '...' }
const organization = await cm.getOrganization({ id: cm.organizationId });
const config = await cm.getOrganizationConfig();
```

For CommonJS, use the named export:

```js
const { Checkmango } = require('@checkmango/checkmango.js');
```

Organization IDs may be strings (including environment variable values) or numbers.
`getCurrentOrganization()` returns the authenticated user's current organization;
other scoped methods use the organization ID passed to the constructor.

```js
await cm.createEvent({ key: 'PURCHASE', type: 'unique' });
await cm.createExperiment({ key: 'CHECKOUT_CTA', event_key: 'PURCHASE' });
await cm.createVariant({ experiment: 'CHECKOUT_CTA', key: 'CONTROL', control: true });
await cm.createVariant({ experiment: 'CHECKOUT_CTA', key: 'GREEN', control: false });
await cm.startExperiment({ key: 'CHECKOUT_CTA' });

// Record an impression/enrollment. The API creates the participant if needed.
await cm.ingest({ experiment: 'CHECKOUT_CTA', variant: 'GREEN', participant: 'USER_123' });
// Record a conversion. eventValue is optional for numeric/revenue events.
await cm.ingest({ experiment: 'CHECKOUT_CTA', variant: 'GREEN', participant: 'USER_123', event: 'PURCHASE' });
```

Ingestion resolves to `undefined` when the API accepts the request with HTTP 202.
Processing happens asynchronously; acceptance does not mean processing has completed.

## Filtering, relationships, and pagination

```js
const experiments = await cm.listExperiments({
  status: 'running',
  sort: ['-created_at'],
  include: ['variants', 'organization'],
  perPage: 10,
  page: 2,
});

const experiment = await cm.getExperiment({ key: 'CHECKOUT_CTA', include: ['variants'] });
```

Responses preserve the API's JSON:API document: resources are in `data`, related
resources in the optional `included` array, and pagination in `links`/`meta` when
provided. Sort fields prefixed with `-` sort descending. Allowed relationships
and sort fields vary by method and are described by the exported TypeScript types.

## API coverage

| Resource | Methods |
| --- | --- |
| Account | `health`, `getUser`, `listOrganizations`, `getOrganization`, `getCurrentOrganization`, `getOrganizationConfig` |
| Experiments | `listExperiments`, `getExperiment`, `createExperiment`, `updateExperiment`, `deleteExperiment`, `startExperiment`, `stopExperiment` |
| Variants | `listVariants`, `getVariant`, `createVariant`, `updateVariant`, `deleteVariant`, `getVariantStatistics` |
| Events | `listEvents`, `getEvent`, `createEvent`, `updateEvent`, `deleteEvent` |
| Participants | `listParticipants`, `getParticipant`, `createParticipant`, `updateParticipant`, `deleteParticipant` |
| Enrollments | `listParticipantExperiments`, `getParticipantExperiment`, `unenrolParticipant`, `ingest` |
| Participant attributes | `listParticipantAttributes`, `updateParticipantAttributes`, `deleteParticipantAttributes` |
| Features | `listFeatures`, `getFeature`, `createFeature`, `updateFeature`, `deleteFeature` |

```js
await cm.createFeature({ key: 'NEW_CHECKOUT', enabled: true, value: 'green', format: 'text' });
await cm.updateFeature({ feature: 'NEW_CHECKOUT', enabled: false });
await cm.updateParticipantAttributes({
  participant: 'USER_123',
  attributes: [{ key: 'plan', value: 'pro' }],
});
const statistics = await cm.getVariantStatistics({
  experiment: 'CHECKOUT_CTA', key: 'GREEN', event_key: 'PURCHASE',
});
```

Feature values currently support text only, and feature keys cannot be renamed.
Participant attribute deletion accepts an optional `attribute` key; omitting it
deletes all attributes for that participant. It returns the remaining collection.
`listParticipantExperiments` returns enrollment resources, while
`getParticipantExperiment` returns the experiment with the participant's variant.

## Errors

```js
import { CheckmangoError } from '@checkmango/checkmango.js';

try {
  await cm.getEvent({ key: 'PURCHASE' });
} catch (error) {
  if (error instanceof CheckmangoError) {
    console.error(error.status, error.message, error.errors);
  } else {
    throw error; // Network failures or invalid successful JSON responses.
  }
}
```

HTTP errors preserve `status`, the API's message, validation/JSON:API `errors`, and
the parsed or raw response `body`. Empty and non-JSON HTTP errors retain their
status. Requests are not automatically retried; redirects are rejected.
For a custom API installation, set `cm.apiUrl` to its API base URL.

## Migrating from 0.1.1

- Use organization terminology and `CHECKMANGO_ORGANIZATION_ID`. `teamId`,
  `listTeams`, `getTeam`, and `getCurrentTeam` remain deprecated aliases and now
  call organization endpoints. Legacy `include: ['team']` maps to `organization`.
- Prefer `event_key` when creating/updating experiments. The previous `event`
  option remains supported; `event_key` takes precedence when both are supplied.
- Creating events requires `type`, matching API validation. Variant updates no
  longer require resending `key`. Descriptions and notes can be cleared with `null`.
- Response types now describe organization IDs, nullable timestamps, JSON:API
  included arrays, and current resource attributes. Variant statistics are read
  through `getVariantStatistics`, rather than assumed to exist on variant resources.
- Use Node.js 22 or newer. CommonJS consumers should use the named `Checkmango` export.

## Development

```sh
npm ci
npm test
npm audit
```

Tests cover request contracts and failure handling with mocked HTTP responses,
and verify ESM/CommonJS imports and TypeScript declarations from the packed
archive. CI runs on Node.js 22 and 24. Tests do not contact production.

Thanks to [@lemonsqueezy/lemonsqueezy.js](https://github.com/lmsqueezy/lemonsqueezy.js)
for the original starting point for this package.
