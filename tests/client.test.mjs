import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import Checkmango, { CheckmangoError } from "../dist/index.js";

afterEach(() => mock.restoreAll());
const client = () => new Checkmango("test-token", "42");
function respond(body = { data: {} }, status = 200) {
    return mock.method(
        globalThis,
        "fetch",
        async () =>
            new Response(
                body === undefined || body === null
                    ? null
                    : JSON.stringify(body),
                { status },
            ),
    );
}

// These paths and bodies follow the application API contract, not SDK-generated URLs.
const routes = [
    ["health", undefined, "GET", "health"],
    ["getUser", undefined, "GET", "user"],
    ["listOrganizations", undefined, "GET", "organizations"],
    ["getOrganization", { id: 7 }, "GET", "organizations/7"],
    ["getCurrentOrganization", undefined, "GET", "current-organization"],
    ["listTeams", undefined, "GET", "organizations"],
    ["getTeam", { id: 7 }, "GET", "organizations/7"],
    ["getCurrentTeam", undefined, "GET", "current-organization"],
    ["getOrganizationConfig", undefined, "GET", "organizations/42/config"],
    [
        "ingest",
        {
            experiment: "EXP",
            participant: "USER",
            variant: "A",
            event: "SALE",
            eventValue: 0,
        },
        "POST",
        "organizations/42/ingest",
        {
            experiment: "EXP",
            participant: "USER",
            variant: "A",
            event: "SALE",
            eventValue: 0,
        },
    ],
    ["listExperiments", undefined, "GET", "organizations/42/experiments"],
    [
        "getExperiment",
        { key: "EXP" },
        "GET",
        "organizations/42/experiments/EXP",
    ],
    [
        "createExperiment",
        { key: "EXP", event: "SALE" },
        "POST",
        "organizations/42/experiments",
        { key: "EXP", event_key: "SALE" },
    ],
    [
        "createExperiment",
        { key: "EXP", event_key: "SALE" },
        "POST",
        "organizations/42/experiments",
        { key: "EXP", event_key: "SALE" },
    ],
    [
        "updateExperiment",
        { experiment: "EXP", event: "SALE", description: null },
        "PUT",
        "organizations/42/experiments/EXP",
        { event_key: "SALE", description: null },
    ],
    [
        "deleteExperiment",
        { key: "EXP" },
        "DELETE",
        "organizations/42/experiments/EXP",
    ],
    [
        "startExperiment",
        { key: "EXP" },
        "POST",
        "organizations/42/experiments/EXP/start",
    ],
    [
        "stopExperiment",
        { key: "EXP" },
        "POST",
        "organizations/42/experiments/EXP/stop",
    ],
    ["listParticipants", undefined, "GET", "organizations/42/participants"],
    [
        "getParticipant",
        { key: "USER" },
        "GET",
        "organizations/42/participants/USER",
    ],
    [
        "createParticipant",
        { key: "USER", attributes: { plan: "pro" } },
        "POST",
        "organizations/42/participants",
        { key: "USER", attributes: { plan: "pro" } },
    ],
    [
        "updateParticipant",
        { participant: "USER", notes: null },
        "PUT",
        "organizations/42/participants/USER",
        { notes: null },
    ],
    [
        "deleteParticipant",
        { key: "USER" },
        "DELETE",
        "organizations/42/participants/USER",
    ],
    [
        "listVariants",
        { experiment: "EXP" },
        "GET",
        "organizations/42/experiments/EXP/variants",
    ],
    [
        "getVariant",
        { experiment: "EXP", key: "A" },
        "GET",
        "organizations/42/experiments/EXP/variants/A",
    ],
    [
        "createVariant",
        { experiment: "EXP", key: "A", control: false, traffic: 0 },
        "POST",
        "organizations/42/experiments/EXP/variants",
        { key: "A", control: false, traffic: 0 },
    ],
    [
        "updateVariant",
        { experiment: "EXP", variant: "A", control: true },
        "PUT",
        "organizations/42/experiments/EXP/variants/A",
        { control: true },
    ],
    [
        "deleteVariant",
        { experiment: "EXP", variant: "A" },
        "DELETE",
        "organizations/42/experiments/EXP/variants/A",
    ],
    [
        "getVariantStatistics",
        { experiment: "EXP", key: "A" },
        "GET",
        "organizations/42/experiments/EXP/variants/A/statistics",
    ],
    ["listEvents", undefined, "GET", "organizations/42/events"],
    ["getEvent", { key: "SALE" }, "GET", "organizations/42/events/SALE"],
    [
        "createEvent",
        { key: "SALE", type: "count", is_revenue: true },
        "POST",
        "organizations/42/events",
        { key: "SALE", type: "count", is_revenue: true },
    ],
    [
        "updateEvent",
        { event: "SALE", type: "unique" },
        "PUT",
        "organizations/42/events/SALE",
        { type: "unique" },
    ],
    ["deleteEvent", { key: "SALE" }, "DELETE", "organizations/42/events/SALE"],
    [
        "listParticipantExperiments",
        { participant: "USER" },
        "GET",
        "organizations/42/participants/USER/experiments",
    ],
    [
        "getParticipantExperiment",
        { participant: "USER", experiment: "EXP" },
        "GET",
        "organizations/42/participants/USER/experiments/EXP",
    ],
    [
        "unenrolParticipant",
        { participant: "USER", experiment: "EXP" },
        "DELETE",
        "organizations/42/participants/USER/experiments/EXP",
    ],
    [
        "listParticipantAttributes",
        { participant: "USER" },
        "GET",
        "organizations/42/participants/USER/attributes",
    ],
    [
        "updateParticipantAttributes",
        { participant: "USER", attributes: [{ key: "plan", value: null }] },
        "PUT",
        "organizations/42/participants/USER/attributes",
        { attributes: [{ key: "plan", value: null }] },
    ],
    [
        "deleteParticipantAttributes",
        { participant: "USER", attribute: "plan" },
        "DELETE",
        "organizations/42/participants/USER/attributes",
        { attribute: "plan" },
    ],
    ["listFeatures", undefined, "GET", "organizations/42/features"],
    ["getFeature", { key: "FLAG" }, "GET", "organizations/42/features/FLAG"],
    [
        "createFeature",
        { key: "FLAG", enabled: false, value: "" },
        "POST",
        "organizations/42/features",
        { key: "FLAG", enabled: false, value: "" },
    ],
    [
        "updateFeature",
        { feature: "FLAG", value: null },
        "PUT",
        "organizations/42/features/FLAG",
        { value: null },
    ],
    [
        "deleteFeature",
        { key: "FLAG" },
        "DELETE",
        "organizations/42/features/FLAG",
    ],
];
for (const [method, args, verb, path, body] of routes) {
    test(`${method} sends ${verb} ${path} with the API payload`, async () => {
        const fetch = respond();
        await client()[method](args);
        const [url, options] = fetch.mock.calls[0].arguments;
        assert.equal(url.href, `https://checkmango.com/api/${path}`);
        assert.equal(options.method, verb);
        assert.deepEqual(
            options.body === undefined ? undefined : JSON.parse(options.body),
            body,
        );
        assert.equal(options.headers.Authorization, "Bearer test-token");
        assert.equal(options.headers.Accept, "application/vnd.api+json");
        assert.equal(options.headers["Content-Type"], "application/json");
        assert.equal(options.redirect, "error");
    });
}
test("serializes pagination, descending sorts, status and legacy relationship aliases", async () => {
    const fetch = respond();
    await client().listExperiments({
        perPage: 10,
        page: 2,
        include: ["team", "variants"],
        sort: ["-created_at", "key"],
        status: "running",
    });
    assert.deepEqual(
        Object.fromEntries(fetch.mock.calls[0].arguments[0].searchParams),
        {
            per_page: "10",
            page: "2",
            include: "organization,variants",
            sort: "-created_at,key",
            "filter[status]": "running",
        },
    );
});
test("omits undefined query values", async () => {
    const fetch = respond();
    await client().listExperiments({
        page: undefined,
        status: undefined,
        include: undefined,
    });
    assert.equal(fetch.mock.calls[0].arguments[0].search, "");
});
test("sends statistics event and attribute filters using their API names", async () => {
    const fetch = respond();
    await client().getVariantStatistics({
        experiment: "EXP",
        key: "A",
        event_key: "SALE",
        include: ["event"],
    });
    assert.equal(
        fetch.mock.calls[0].arguments[0].searchParams.get("event_key"),
        "SALE",
    );
    await client().listParticipantAttributes({
        participant: "USER",
        "attribute.key": "plan",
        sort: ["-value"],
    });
    assert.equal(
        fetch.mock.calls[1].arguments[0].searchParams.get(
            "filter[attribute.key]",
        ),
        "plan",
    );
    assert.equal(
        fetch.mock.calls[1].arguments[0].searchParams.get("sort"),
        "-value",
    );
});
test("encodes resource keys as individual path segments", async () => {
    const fetch = respond();
    await client().getVariant({ experiment: "exp /?#", key: "A /?#" });
    assert.equal(
        fetch.mock.calls[0].arguments[0].pathname,
        "/api/organizations/42/experiments/exp%20%2F%3F%23/variants/A%20%2F%3F%23",
    );
});
test("keeps legacy teamId and organizationId synchronized and normalizes base URL", async () => {
    const fetch = respond();
    const cm = client();
    cm.teamId = 8;
    assert.equal(cm.organizationId, 8);
    cm.organizationId = "9";
    assert.equal(cm.teamId, "9");
    cm.apiUrl = "https://example.com/custom/api";
    await cm.listEvents();
    assert.equal(
        fetch.mock.calls[0].arguments[0].href,
        "https://example.com/custom/api/organizations/9/events",
    );
});
test("accepts empty 202 ingestion and 204 deletion responses", async () => {
    respond(null, 202);
    assert.equal(
        await client().ingest({
            experiment: "EXP",
            variant: "A",
            participant: "USER",
        }),
        undefined,
    );
    mock.restoreAll();
    respond(null, 204);
    assert.equal(await client().deleteEvent({ key: "SALE" }), undefined);
});
test("preserves JSON bodies on DELETE and health responses", async () => {
    const body = { data: [] };
    respond(body);
    assert.deepEqual(
        await client().deleteParticipantAttributes({ participant: "USER" }),
        body,
    );
    mock.restoreAll();
    const health = { ping: "pong", time: "2026-09-20T00:00:00Z" };
    respond(health);
    assert.deepEqual(await client().health(), health);
});
for (const [status, body] of [
    [401, { message: "Unauthenticated." }],
    [422, { message: "Invalid input.", errors: { key: ["Required."] } }],
    [429, { errors: [{ detail: "Rate limited" }] }],
]) {
    test(`preserves API errors for HTTP ${status}`, async () => {
        respond(body, status);
        await assert.rejects(client().listEvents(), (error) => {
            assert.ok(error instanceof Error);
            assert.ok(error instanceof CheckmangoError);
            assert.equal(error.status, status);
            assert.equal(error.message, body.message ?? `HTTP ${status}`);
            assert.deepEqual(error.errors, body.errors);
            assert.deepEqual(error.body, body);
            return true;
        });
    });
}
for (const body of ["<html>Unavailable</html>", ""]) {
    test(`preserves HTTP status when error body is ${body ? "HTML" : "empty"}`, async () => {
        mock.method(
            globalThis,
            "fetch",
            async () =>
                new Response(body, { status: 503, statusText: "Unavailable" }),
        );
        await assert.rejects(
            client().health(),
            (error) =>
                error instanceof CheckmangoError &&
                error.status === 503 &&
                error.body === body,
        );
    });
}
test("does not hide malformed successful JSON or network failures", async () => {
    mock.method(globalThis, "fetch", async () => new Response("invalid"));
    await assert.rejects(client().health(), SyntaxError);
    mock.restoreAll();
    const error = new TypeError("Network unavailable");
    mock.method(globalThis, "fetch", async () => {
        throw error;
    });
    await assert.rejects(client().health(), (actual) => actual === error);
});
