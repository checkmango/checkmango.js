import type {
    CreateEventOptions,
    CreateExperimentOptions,
    CreateFeatureOptions,
    CreateParticipantOptions,
    CreateVariantOptions,
    DeleteEventOptions,
    DeleteExperimentOptions,
    DeleteFeatureOptions,
    DeleteParticipantAttributesOptions,
    DeleteParticipantOptions,
    DeleteVariantOptions,
    GetEventOptions,
    GetExperimentOptions,
    GetFeatureOptions,
    GetOrganizationOptions,
    GetParticipantExperimentOptions,
    GetParticipantOptions,
    GetTeamOptions,
    GetVariantOptions,
    GetVariantStatisticsOptions,
    ListEventsOptions,
    ListExperimentsOptions,
    ListFeaturesOptions,
    ListOrganizationsOptions,
    ListParticipantAttributesOptions,
    ListParticipantExperimentsOptions,
    ListParticipantsOptions,
    ListTeamsOptions,
    ListVariantsOptions,
    QueryApiOptions,
    StartExperimentOptions,
    StopExperimentOptions,
    UnenrolParticipantOptions,
    UpdateEventOptions,
    UpdateExperimentOptions,
    UpdateFeatureOptions,
    UpdateParticipantAttributesOptions,
    UpdateParticipantOptions,
    UpdateVariantOptions,
} from "./types/methods";
import type {
    EnrollmentsResponse,
    EventResponse,
    EventsResponse,
    ExperimentResponse,
    ExperimentsResponse,
    FeatureResponse,
    FeaturesResponse,
    HealthResponse,
    IngestOptions,
    OrganizationConfigResponse,
    OrganizationResponse,
    OrganizationsResponse,
    ParticipantAttributesResponse,
    ParticipantResponse,
    ParticipantsResponse,
    TeamResponse,
    TeamsResponse,
    UserResponse,
    VariantResponse,
    VariantStatisticResponse,
    VariantsResponse,
} from "./types/api";

import { CheckmangoError } from "./error";

export class Checkmango {
    public apiKey: string;

    public apiUrl = "https://checkmango.com/api/";

    public organizationId: number | string;

    /** @deprecated Use organizationId. */
    get teamId(): number | string {
        return this.organizationId;
    }
    set teamId(value: number | string) {
        this.organizationId = value;
    }

    /**
     * Checkmango API Client.
     *
     * @param {String} apiKey - Your Checkmango API Key.
     * @param {Number | String} organizationId - Your Checkmango organization ID.
     */
    constructor(apiKey: string, organizationId: number | string) {
        this.apiKey = apiKey;
        this.organizationId = organizationId;
    }

    /**
     * Builds a params object for the API query based on provided and allowed filters.
     *
     * @param {Object} [args] Arguments to the API method
     * @param {string[]} [allowedFilters] List of filters the API query permits (API field names)
     */
    private _buildParams(
        args: object,
        allowedFilters: string[] = [],
    ): Record<string, string> {
        const params: Record<string, string> = {};
        for (const [key, value] of Object.entries(args)) {
            if (value === undefined || value === null) continue;
            if (allowedFilters.includes(key)) {
                params[`filter[${key}]`] = String(value);
            } else if (key === "include" || key === "sort") {
                const values = Array.isArray(value) ? value : [value];
                params[key] = values
                    .map((item) =>
                        key === "include" && item === "team"
                            ? "organization"
                            : item,
                    )
                    .join(",");
            } else if (
                key === "page" ||
                key === "perPage" ||
                key === "event_key"
            ) {
                params[key === "perPage" ? "per_page" : key] = String(value);
            }
        }
        return params;
    }

    /** Send a request to the Checkmango API. */
    private async _query<T>({
        path,
        method = "GET",
        params,
        payload,
    }: QueryApiOptions): Promise<T> {
        const url = new URL(
            path,
            this.apiUrl.endsWith("/") ? this.apiUrl : `${this.apiUrl}/`,
        );
        for (const [key, value] of Object.entries(params ?? {})) {
            url.searchParams.set(key, value);
        }
        const response = await fetch(url, {
            method,
            headers: {
                Accept: "application/vnd.api+json",
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            body: payload === undefined ? undefined : JSON.stringify(payload),
            redirect: "error",
        });
        const text = await response.text();
        let body: unknown;
        if (text.trim()) {
            try {
                body = JSON.parse(text);
            } catch (error) {
                if (response.ok) throw error;
            }
        }
        if (!response.ok) {
            const details =
                body && typeof body === "object"
                    ? (body as Record<string, unknown>)
                    : {};
            throw new CheckmangoError(
                response.status,
                typeof details.message === "string"
                    ? details.message
                    : response.statusText || `HTTP ${response.status}`,
                details.errors,
                body ?? text,
            );
        }
        return body as T;
    }

    /**
     * Get current user.
     *
     * @returns {Object} JSON
     */
    async getUser(): Promise<UserResponse> {
        return this._query({ path: "user" });
    }

    /**
     * List organizations.
     * @deprecated Use listOrganizations().
     *
     * @param {Object} [params]
     * @param {Number} [params.page] The page number to retrieve.
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async listTeams(params: ListTeamsOptions = {}): Promise<TeamsResponse> {
        return this._query({
            path: "organizations",
            params: this._buildParams(params),
        });
    }

    /**
     * Get an organization.
     * @deprecated Use getOrganization().
     *
     * @param {Object} [params]
     * @param {Number} [params.id] The ID of the team to retrieve.
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async getTeam({ id, ...params }: GetTeamOptions): Promise<TeamResponse> {
        return this._query({
            path: `organizations/${encodeURIComponent(id)}`,
            params: this._buildParams(params),
        });
    }

    /**
     * Get the current organization.
     * @deprecated Use getCurrentOrganization().
     *
     * @returns {Object} JSON
     */
    async getCurrentTeam(): Promise<TeamResponse> {
        return this._query({
            path: "current-organization",
        });
    }

    /**
     * Ingest data.
     *
     * @param {Object} [params]
     * @param {String} [params.experiment] The experiment to ingest data into.
     * @param {String} [params.participant] The participant to ingest data into.
     * @param {String} [params.variant] The variant to ingest data into.
     * @param {String?} [params.event] The event to ingest data into.
     */
    async ingest(params: IngestOptions): Promise<void> {
        return this._query({
            path: `organizations/${encodeURIComponent(this.organizationId)}/ingest`,
            method: "POST",
            payload: params,
        });
    }

    /**
     * List experiments.
     *
     * @param {Object} [params]
     * @param {Number} [params.page] The page number to retrieve.
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async listExperiments(
        params: ListExperimentsOptions = {},
    ): Promise<ExperimentsResponse> {
        return this._query({
            path: `organizations/${encodeURIComponent(this.organizationId)}/experiments`,
            params: this._buildParams(params, ["status"]),
        });
    }

    /**
     * Get an experiment.
     *
     * @param {Object} [params]
     * @param {String} [params.key] The key of the experiment to retrieve.
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async getExperiment({
        key,
        ...params
    }: GetExperimentOptions): Promise<ExperimentResponse> {
        return this._query({
            path: `organizations/${encodeURIComponent(this.organizationId)}/experiments/${encodeURIComponent(key)}`,
            params: this._buildParams(params),
        });
    }

    /**
     * Create an experiment.
     *
     * @param {Object} [params]
     * @param {String} [params.key] The key of the experiment.
     * @param {String} [params.event] The key of the primary event goal.
     * @param {String} [params.description] The description of the experiment.
     *
     * @returns {Object} JSON
     */
    async createExperiment({
        event,
        event_key,
        ...params
    }: CreateExperimentOptions): Promise<ExperimentResponse> {
        return this._query({
            method: "POST",
            path: `organizations/${encodeURIComponent(this.organizationId)}/experiments`,
            payload: { ...params, event_key: event_key ?? event },
        });
    }

    /**
     * Update an experiment.
     *
     * @param {Object} [params]
     * @param {String} [params.experiment] The key of the experiment to update.
     * @param {String} [params.key] The new key of the experiment.
     * @param {String} [params.event] The new key of the primary event goal.
     * @param {String} [params.description] The new description of the experiment.
     *
     * @returns {Object} JSON
     */
    async updateExperiment({
        experiment,
        event,
        event_key,
        ...params
    }: UpdateExperimentOptions): Promise<ExperimentResponse> {
        return this._query({
            method: "PUT",
            path: `organizations/${encodeURIComponent(this.organizationId)}/experiments/${encodeURIComponent(experiment)}`,
            payload: { ...params, event_key: event_key ?? event },
        });
    }

    /**
     * Delete an experiment.
     *
     * @param {Object} [params]
     * @param {String} [params.key] The key of the experiment to delete.
     *
     * @returns {Object} JSON
     */
    async deleteExperiment({ key }: DeleteExperimentOptions): Promise<void> {
        return this._query({
            method: "DELETE",
            path: `organizations/${encodeURIComponent(this.organizationId)}/experiments/${encodeURIComponent(key)}`,
        });
    }

    /**
     * Start an experiment.
     *
     * @param {Object} [params]
     * @param {String} [params.key] The key of the experiment to start.
     *
     * @returns {Object} JSON
     */
    async startExperiment({
        key,
    }: StartExperimentOptions): Promise<ExperimentResponse> {
        return this._query({
            method: "POST",
            path: `organizations/${encodeURIComponent(this.organizationId)}/experiments/${encodeURIComponent(key)}/start`,
        });
    }

    /**
     * Stop an experiment.
     *
     * @param {Object} [params]
     * @param {String} [params.key] The key of the experiment to stop.
     *
     * @returns {Object} JSON
     */
    async stopExperiment({
        key,
    }: StopExperimentOptions): Promise<ExperimentResponse> {
        return this._query({
            method: "POST",
            path: `organizations/${encodeURIComponent(this.organizationId)}/experiments/${encodeURIComponent(key)}/stop`,
        });
    }

    /**
     * List participants.
     *
     * @param {Object} [params]
     * @param {Number} [params.page] The page number to retrieve.
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async listParticipants(
        params: ListParticipantsOptions = {},
    ): Promise<ParticipantsResponse> {
        return this._query({
            path: `organizations/${encodeURIComponent(this.organizationId)}/participants`,
            params: this._buildParams(params),
        });
    }

    /**
     * Get a participant.
     *
     * @param {Object} [params]
     * @param {String} [params.key] The key of the participant to retrieve.
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async getParticipant({
        key,
        ...params
    }: GetParticipantOptions): Promise<ParticipantResponse> {
        return this._query({
            path: `organizations/${encodeURIComponent(this.organizationId)}/participants/${encodeURIComponent(key)}`,
            params: this._buildParams(params),
        });
    }

    /**
     * Create a participant.
     *
     * @param {Object} [params]
     * @param {String} [params.key] The key of the participant.
     * @param {String} [params.notes] The notes of the participant.
     *
     * @returns {Object} JSON
     */
    async createParticipant(
        params: CreateParticipantOptions,
    ): Promise<ParticipantResponse> {
        return this._query({
            method: "POST",
            path: `organizations/${encodeURIComponent(this.organizationId)}/participants`,
            payload: params,
        });
    }

    /**
     * Update a participant.
     *
     * @param {Object} [params]
     * @param {String} [params.participant] The key of the participant to update.
     * @param {String} [params.key] The new key of the participant.
     * @param {String} [params.notes] The new description of the participant.
     *
     * @returns {Object} JSON
     */
    async updateParticipant({
        participant,
        ...params
    }: UpdateParticipantOptions): Promise<ParticipantResponse> {
        return this._query({
            method: "PUT",
            path: `organizations/${encodeURIComponent(this.organizationId)}/participants/${encodeURIComponent(participant)}`,
            payload: params,
        });
    }

    /**
     * Delete a participant.
     *
     * @param {Object} [params]
     * @param {String} [params.key] The key of the participant to delete.
     *
     * @returns {Object} JSON
     */
    async deleteParticipant({ key }: DeleteParticipantOptions): Promise<void> {
        return this._query({
            method: "DELETE",
            path: `organizations/${encodeURIComponent(this.organizationId)}/participants/${encodeURIComponent(key)}`,
        });
    }

    /**
     * List variants.
     *
     * @param {Object} [params]
     * @param {String} [params.experiment] The experiment to retrieve variants for.
     * @param {Number} [params.page] The page number to retrieve.
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async listVariants({
        experiment,
        ...params
    }: ListVariantsOptions): Promise<VariantsResponse> {
        return this._query({
            path: `organizations/${encodeURIComponent(this.organizationId)}/experiments/${encodeURIComponent(experiment)}/variants`,
            params: this._buildParams(params),
        });
    }

    /**
     * Get a variant.
     *
     * @param {Object} [params]
     * @param {String} [params.experiment] The key of experiment the variant belongs to.
     * @param {String} [params.key] The key of the variant to retrieve.
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async getVariant({
        experiment,
        key,
        ...params
    }: GetVariantOptions): Promise<VariantResponse> {
        return this._query({
            path: `organizations/${encodeURIComponent(this.organizationId)}/experiments/${encodeURIComponent(experiment)}/variants/${encodeURIComponent(key)}`,
            params: this._buildParams(params),
        });
    }

    /**
     * Create a variant.
     *
     * @param {Object} [params]
     * @param {String} [params.experiment] The key of the experiment the variant belongs to.
     * @param {String} [params.key] The key of the experiment.
     * @param {Boolean} [params.control] Whether the variant is the control.
     * @param {String} [params.description] The description of the experiment.
     *
     * @returns {Object} JSON
     */
    async createVariant({
        experiment,
        ...params
    }: CreateVariantOptions): Promise<VariantResponse> {
        return this._query({
            method: "POST",
            path: `organizations/${encodeURIComponent(this.organizationId)}/experiments/${encodeURIComponent(experiment)}/variants`,
            payload: params,
        });
    }

    /**
     * Update a variant.
     *
     * @param {Object} [params]
     * @param {String} [params.experiment] The key of the experiment the variant belongs to.
     * @param {String} [params.variant] The key of the variant to update.
     * @param {String} [params.key] The new key of the variant.
     * @param {Boolean} [params.control] Whether the variant is the control.
     * @param {String} [params.description] The new description of the variant.
     *
     * @returns {Object} JSON
     */
    async updateVariant({
        experiment,
        variant,
        ...params
    }: UpdateVariantOptions): Promise<VariantResponse> {
        return this._query({
            method: "PUT",
            path: `organizations/${encodeURIComponent(this.organizationId)}/experiments/${encodeURIComponent(experiment)}/variants/${encodeURIComponent(variant)}`,
            payload: params,
        });
    }

    /**
     * Delete a variant.
     *
     * @param {Object} [params]
     * @param {String} [params.experiment] The key of the experiment the variant belongs to.
     * @param {String} [params.variant] The key of the variant to delete.
     *
     * @returns {Object} JSON
     */
    async deleteVariant({
        experiment,
        variant,
    }: DeleteVariantOptions): Promise<void> {
        return this._query({
            method: "DELETE",
            path: `organizations/${encodeURIComponent(this.organizationId)}/experiments/${encodeURIComponent(experiment)}/variants/${encodeURIComponent(variant)}`,
        });
    }

    /**
     * List events.
     *
     * @param {Object} [params]
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async listEvents(params: ListEventsOptions = {}): Promise<EventsResponse> {
        return this._query({
            path: `organizations/${encodeURIComponent(this.organizationId)}/events`,
            params: this._buildParams(params),
        });
    }

    /**
     * Get an event.
     *
     * @param {Object} [params]
     * @param {String} [params.key] The key of the event to retrieve.
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async getEvent({
        key,
        ...params
    }: GetEventOptions): Promise<EventResponse> {
        return this._query({
            path: `organizations/${encodeURIComponent(this.organizationId)}/events/${encodeURIComponent(key)}`,
            params: this._buildParams(params),
        });
    }

    /**
     * Create an event.
     *
     * @param {Object} [params]
     * @param {String} [params.key] The key of the event.
     * @param {String} [params.type] The type of event.
     * @param {String} [params.description] The description of the experiment.
     *
     * @returns {Object} JSON
     */
    async createEvent(params: CreateEventOptions): Promise<EventResponse> {
        return this._query({
            method: "POST",
            path: `organizations/${encodeURIComponent(this.organizationId)}/events`,
            payload: params,
        });
    }

    /**
     * Update an event.
     *
     * @param {Object} [params]
     * @param {String} [params.event] The key of the event to update.
     * @param {String} [params.key] The new key of the event.
     * @param {String} [params.type] The new type of event.
     * @param {String} [params.description] The new description of the event.
     *
     * @returns {Object} JSON
     */
    async updateEvent({
        event,
        ...params
    }: UpdateEventOptions): Promise<EventResponse> {
        return this._query({
            method: "PUT",
            path: `organizations/${encodeURIComponent(this.organizationId)}/events/${encodeURIComponent(event)}`,
            payload: params,
        });
    }

    /**
     * Delete an event.
     *
     * @param {Object} [params]
     * @param {String} [params.key] The key of the event to delete.
     *
     * @returns {Object} JSON
     */
    async deleteEvent({ key }: DeleteEventOptions): Promise<void> {
        return this._query({
            method: "DELETE",
            path: `organizations/${encodeURIComponent(this.organizationId)}/events/${encodeURIComponent(key)}`,
        });
    }

    async listOrganizations(
        params: ListOrganizationsOptions = {},
    ): Promise<OrganizationsResponse> {
        return this.listTeams(params);
    }

    async getOrganization(
        params: GetOrganizationOptions,
    ): Promise<OrganizationResponse> {
        return this.getTeam(params);
    }

    async getCurrentOrganization(): Promise<OrganizationResponse> {
        return this.getCurrentTeam();
    }

    async getOrganizationConfig(): Promise<OrganizationConfigResponse> {
        return this._query({
            path: `organizations/${encodeURIComponent(this.organizationId)}/config`,
        });
    }

    async listParticipantExperiments({
        participant,
        ...params
    }: ListParticipantExperimentsOptions): Promise<EnrollmentsResponse> {
        return this._query({
            path: `organizations/${encodeURIComponent(this.organizationId)}/participants/${encodeURIComponent(participant)}/experiments`,
            params: this._buildParams(params),
        });
    }

    async getParticipantExperiment({
        participant,
        experiment,
        ...params
    }: GetParticipantExperimentOptions): Promise<ExperimentResponse> {
        return this._query({
            path: `organizations/${encodeURIComponent(this.organizationId)}/participants/${encodeURIComponent(participant)}/experiments/${encodeURIComponent(experiment)}`,
            params: this._buildParams(params),
        });
    }

    async unenrolParticipant({
        participant,
        experiment,
    }: UnenrolParticipantOptions): Promise<void> {
        return this._query({
            method: "DELETE",
            path: `organizations/${encodeURIComponent(this.organizationId)}/participants/${encodeURIComponent(participant)}/experiments/${encodeURIComponent(experiment)}`,
        });
    }

    async listParticipantAttributes({
        participant,
        ...params
    }: ListParticipantAttributesOptions): Promise<ParticipantAttributesResponse> {
        return this._query({
            path: `organizations/${encodeURIComponent(this.organizationId)}/participants/${encodeURIComponent(participant)}/attributes`,
            params: this._buildParams(params, ["attribute.key"]),
        });
    }

    async updateParticipantAttributes({
        participant,
        ...params
    }: UpdateParticipantAttributesOptions): Promise<ParticipantAttributesResponse> {
        return this._query({
            method: "PUT",
            path: `organizations/${encodeURIComponent(this.organizationId)}/participants/${encodeURIComponent(participant)}/attributes`,
            payload: params,
        });
    }

    async deleteParticipantAttributes({
        participant,
        ...params
    }: DeleteParticipantAttributesOptions): Promise<ParticipantAttributesResponse> {
        return this._query({
            method: "DELETE",
            path: `organizations/${encodeURIComponent(this.organizationId)}/participants/${encodeURIComponent(participant)}/attributes`,
            payload: params,
        });
    }

    async getVariantStatistics({
        experiment,
        key,
        ...params
    }: GetVariantStatisticsOptions): Promise<VariantStatisticResponse> {
        return this._query({
            path: `organizations/${encodeURIComponent(this.organizationId)}/experiments/${encodeURIComponent(experiment)}/variants/${encodeURIComponent(key)}/statistics`,
            params: this._buildParams(params),
        });
    }

    async listFeatures(
        params: ListFeaturesOptions = {},
    ): Promise<FeaturesResponse> {
        return this._query({
            path: `organizations/${encodeURIComponent(this.organizationId)}/features`,
            params: this._buildParams(params),
        });
    }

    async getFeature({
        key,
        ...params
    }: GetFeatureOptions): Promise<FeatureResponse> {
        return this._query({
            path: `organizations/${encodeURIComponent(this.organizationId)}/features/${encodeURIComponent(key)}`,
            params: this._buildParams(params),
        });
    }

    async createFeature(
        params: CreateFeatureOptions,
    ): Promise<FeatureResponse> {
        return this._query({
            method: "POST",
            path: `organizations/${encodeURIComponent(this.organizationId)}/features`,
            payload: params,
        });
    }

    async updateFeature({
        feature,
        ...params
    }: UpdateFeatureOptions): Promise<FeatureResponse> {
        return this._query({
            method: "PUT",
            path: `organizations/${encodeURIComponent(this.organizationId)}/features/${encodeURIComponent(feature)}`,
            payload: params,
        });
    }

    async deleteFeature({ key }: DeleteFeatureOptions): Promise<void> {
        return this._query({
            method: "DELETE",
            path: `organizations/${encodeURIComponent(this.organizationId)}/features/${encodeURIComponent(key)}`,
        });
    }

    /**
     * Get the health of the API.
     */
    async health(): Promise<HealthResponse> {
        return this._query({
            path: "health",
        });
    }
}

export default Checkmango;
export { CheckmangoError } from "./error";
export type * from "./types/api";
export type * from "./types/methods";
