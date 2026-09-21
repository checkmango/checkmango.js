import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

test("published archive supports ESM, CommonJS and their TypeScript declarations", () => {
    const directory = mkdtempSync(join(tmpdir(), "checkmango-package-"));
    try {
        const filename = execFileSync(
            "npm",
            ["pack", "--silent", "--pack-destination", directory],
            { encoding: "utf8" },
        )
            .trim()
            .split("\n")
            .at(-1);
        const packageDirectory = join(
            directory,
            "node_modules/@checkmango/checkmango.js",
        );
        mkdirSync(packageDirectory, { recursive: true });
        execFileSync("tar", [
            "-xzf",
            join(directory, filename),
            "-C",
            packageDirectory,
            "--strip-components=1",
        ]);
        const run = (code) =>
            execFileSync(
                process.execPath,
                ["--input-type=module", "-e", code],
                { cwd: directory, encoding: "utf8" },
            );
        assert.equal(
            run(
                "import Checkmango, { CheckmangoError } from '@checkmango/checkmango.js'; console.log(typeof Checkmango, typeof CheckmangoError)",
            ).trim(),
            "function function",
        );
        assert.equal(
            execFileSync(
                process.execPath,
                [
                    "-e",
                    "const { Checkmango } = require('@checkmango/checkmango.js'); console.log(typeof Checkmango)",
                ],
                { cwd: directory, encoding: "utf8" },
            ).trim(),
            "function",
        );
        const consumer = `
import CheckmangoDefault, { Checkmango, CheckmangoError } from '@checkmango/checkmango.js';
import type { EventResponse, VariantResponse, HealthResponse, CreateExperimentOptions } from '@checkmango/checkmango.js';
const cm = new Checkmango('token', '42');
const esm = new CheckmangoDefault('token', 42);
const event: Promise<EventResponse> = cm.getEvent({ key: 'SALE' });
const variant: Promise<VariantResponse> = cm.updateVariant({ experiment: 'EXP', variant: 'A', control: true });
const health: Promise<HealthResponse> = cm.health();
const options: CreateExperimentOptions = { key: 'EXP', event_key: 'SALE' };
cm.createExperiment(options);
cm.createExperiment({ key: 'EXP', event: 'SALE' });
cm.listExperiments({ sort: ['-created_at'], include: ['organization'], status: 'running' });
cm.listParticipants(); cm.listEvents(); cm.listFeatures();
cm.updateParticipantAttributes({ participant: 'USER', attributes: [{ key: 'plan', value: null }] });
// @ts-expect-error An event key is required to create an experiment.
cm.createExperiment({ key: 'EXP' });
// @ts-expect-error An event type is required by the API.
cm.createEvent({ key: 'SALE' });
// @ts-expect-error Updating an event requires its route key.
cm.updateEvent({ type: 'count' });
// @ts-expect-error Feature keys cannot be renamed.
cm.updateFeature({ feature: 'FLAG', key: 'NEW' });
void event; void variant; void health; void esm; void CheckmangoError;
`;
        writeFileSync(join(directory, "consumer.mts"), consumer);
        writeFileSync(
            join(directory, "consumer.cts"),
            consumer.replace(
                "import CheckmangoDefault, { Checkmango, CheckmangoError }",
                "import { Checkmango as CheckmangoDefault, Checkmango, CheckmangoError }",
            ),
        );
        execFileSync(
            process.execPath,
            [
                resolve("node_modules/typescript/bin/tsc"),
                "--noEmit",
                "--strict",
                "--module",
                "NodeNext",
                "--moduleResolution",
                "NodeNext",
                "--target",
                "ES2022",
                "consumer.mts",
                "consumer.cts",
            ],
            { cwd: directory, stdio: "pipe" },
        );
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});
