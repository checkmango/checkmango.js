import {
    EventResponse,
    EventsResponse,
    ExperimentResponse,
    ExperimentsResponse,
    IngestOptions,
    ParticipantResponse,
    ParticipantsResponse,
    TeamResponse,
    TeamsResponse,
    UserResponse,
    VariantResponse,
    VariantsResponse,
} from './types/api'

import {
    CreateEventOptions,
    CreateExperimentOptions,
    CreateParticipantOptions,
    CreateVariantOptions,
    DeleteEventOptions,
    DeleteExperimentOptions,
    DeleteParticipantOptions,
    DeleteVariantOptions,
    GetExperimentOptions,
    GetParticipantOptions,
    GetTeamOptions,
    GetVariantOptions,
    ListEventsOptions,
    ListExperimentsOptions,
    ListParticipantsOptions,
    ListTeamsOptions,
    ListVariantsOptions,
    QueryApiOptions,
    StartExperimentOptions,
    StopExperimentOptions,
    UpdateEventOptions,
    UpdateExperimentOptions,
    UpdateParticipantOptions,
    UpdateVariantOptions,
} from "./types/methods";

export class Checkmango {
    public apiKey: string;

    public apiUrl = "https://checkmango.com/api/";

    public teamId: number;

    /**
     * Checkmango API Client.
     *
     * @param {String} apiKey - Your Checkmango API Key.
     * @param {Number} teamId - Your Checkmango Team ID.
     */
    constructor(apiKey: string, teamId: number) {
        this.apiKey = apiKey;
        this.teamId = teamId;
    }

    /**
     * Builds a params object for the API query based on provided and allowed filters.
     *
     * @params {Object} [args] Arguments to the API method
     * @params {string[]} [allowedFilters] List of filters the API query permits (camelCase)
     */
    private _buildParams<TArgs extends Record<string, any>>(
        args: TArgs,
        allowedFilters: Array<string> = []
    ): Record<string, unknown> {
        let params: Record<string, unknown> = {};

        for (let filter in args) {
            if (allowedFilters.includes(filter)) {
                const queryFilter = filter.replace(
                    /[A-Z]/g,
                    (letter) => `_${letter.toLowerCase()}`
                );

                params["filter[" + queryFilter + "]"] = args[filter];
            } else {
                if (filter === "include") {
                    params["include"] = Array.isArray(args[filter])
                        ? args[filter].join(",")
                        : args[filter];
                }

                if (filter === "page") params["page"] = args[filter];
                if (filter === "perPage") params["per_page"] = args[filter];
            }
        }

        return params;
    }

    /**
     * Send an API query to the LemonSqueezy API
     *
     * @param {string} path
     * @param {string} [method] POST, GET, PUT, DELETE
     * @param {Object} [params] URL query parameters
     * @param {Object} [payload] Object/JSON payload
     *
     * @returns {Object} JSON
     */
    private async _query({
        path,
        method = "GET",
        params,
        payload,
    }: QueryApiOptions) {
        try {
            const url = new URL(path, this.apiUrl);
            if (params && method === "GET")
                Object.entries(params).forEach(([key, value]) =>
                    url.searchParams.append(key, value)
                );

            const headers = new Headers();
            headers.set("Accept", "application/vnd.api+json");
            headers.set("Authorization", `Bearer ${this.apiKey}`);
            headers.set("Content-Type", "application/vnd.api+json");

            const response = await fetch(url.href, {
                headers,
                method,
                body: payload ? JSON.stringify(payload) : undefined,
            });

            if (!response.ok) {
                let errorsJson = await response.json();
                throw {
                    status: response.status,
                    message: response.statusText,
                    errors: errorsJson.errors,
                };
            }

            if (method !== "DELETE") return await response.json();
        } catch (error) {
            throw error;
        }
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
     * List teams.
     *
     * @param {Object} [params]
     * @param {Number} [params.page] The page number to retrieve.
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async listTeams(params: ListTeamsOptions = {}): Promise<TeamsResponse> {
        return this._query({
            path: "teams",
            params: this._buildParams(params),
        });
    }

    /**
     * Get a team.
     *
     * @param {Object} [params]
     * @param {Number} [params.id] The ID of the team to retrieve.
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async getTeam({ id, ...params }: GetTeamOptions): Promise<TeamResponse> {
        return this._query({
            path: `teams/${id}`,
            params: this._buildParams(params),
        });
    }

    /**
     * Get the current team.
     *
     * @returns {Object} JSON
     */
    async getCurrentTeam(): Promise<TeamResponse> {
        return this._query({
            path: "current-team",
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
    async ingest({experiment, variant, participant, event}: IngestOptions): Promise<void> {
        return this._query({
            path: `teams/${this.teamId}/ingest`,
            method: "POST",
            payload: {
                experiment: experiment,
                participant: participant,
                variant: variant,
                event: event,
            },
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
    async listExperiments(params: ListExperimentsOptions = {}): Promise<ExperimentsResponse> {
        return this._query({
            path: `teams/${this.teamId}/experiments`,
            params: this._buildParams(params),
        });
    }

    /**
     * Get an experiment.
     *
     * @param {Object} [params]
     * @param {Number} [params.key] The key of the experiment to retrieve.
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async getExperiment({ key, ...params }: GetExperimentOptions): Promise<ExperimentResponse> {
        return this._query({
            path: `teams/${this.teamId}/experiments/${key}`,
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
    async createExperiment(params: CreateExperimentOptions): Promise<ExperimentResponse> {
        return this._query({
            method: 'POST',
            path: `teams/${this.teamId}/experiments`,
            payload: params,
        })
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
    async updateExperiment({ experiment, ...params }: UpdateExperimentOptions): Promise<ExperimentResponse> {
        return this._query({
            method: 'PUT',
            path: `teams/${this.teamId}/experiments/${experiment}`,
            payload: params,
        })
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
            method: 'DELETE',
            path: `teams/${this.teamId}/experiments/${key}`,
        })
    }

    /**
     * Start an experiment.
     *
     * @param {Object} [params]
     * @param {String} [params.key] The key of the experiment to start.
     *
     * @returns {Object} JSON
     */
    async startExperiment({ key }: StartExperimentOptions): Promise<ExperimentResponse> {
        return this._query({
            method: 'POST',
            path: `teams/${this.teamId}/experiments/${key}/start`,
        })
    }

    /**
     * Stop an experiment.
     *
     * @param {Object} [params]
     * @param {String} [params.key] The key of the experiment to stop.
     *
     * @returns {Object} JSON
     */
    async stopExperiment({ key }: StopExperimentOptions): Promise<ExperimentResponse> {
        return this._query({
            method: 'POST',
            path: `teams/${this.teamId}/experiments/${key}/stop`,
        })
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
    async listParticipants(params: ListParticipantsOptions): Promise<ParticipantsResponse> {
        return this._query({
            path: `teams/${this.teamId}/participants`,
            params: this._buildParams(params),
        });
    }

    /**
     * Get a participant.
     *
     * @param {Object} [params]
     * @param {Number} [params.key] The key of the participant to retrieve.
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async getParticipant({ key, ...params }: GetParticipantOptions): Promise<ParticipantResponse> {
        return this._query({
            path: `teams/${this.teamId}/participants/${key}`,
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
    async createParticipant(params: CreateParticipantOptions): Promise<ParticipantResponse> {
        return this._query({
            method: 'POST',
            path: `teams/${this.teamId}/participants`,
            payload: params,
        })
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
    async updateParticipant({ participant, ...params }: UpdateParticipantOptions): Promise<ParticipantResponse> {
        return this._query({
            method: 'PUT',
            path: `teams/${this.teamId}/participants/${participant}`,
            payload: params,
        })
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
            method: 'DELETE',
            path: `teams/${this.teamId}/participants/${key}`,
        })
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
    async listVariants({ experiment, ...params }: ListVariantsOptions): Promise<VariantsResponse> {
        return this._query({
            path: `teams/${this.teamId}/experiments/${experiment}/variants`,
            params: this._buildParams(params),
        });
    }

    /**
     * Get a variant.
     *
     * @param {Object} [params]
     * @param {String} [params.experiment] The key of experiment the variant belongs to.
     * @param {Number} [params.key] The key of the variant to retrieve.
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async getVariant({ experiment, key, ...params }: GetVariantOptions): Promise<VariantResponse> {
        return this._query({
            path: `teams/${this.teamId}/experiments/${experiment}/variants/${key}`,
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
    async createVariant({ experiment, ...params}: CreateVariantOptions): Promise<VariantResponse> {
        return this._query({
            method: 'POST',
            path: `teams/${this.teamId}/experiments/${experiment}/variants`,
            payload: params,
        })
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
    async updateVariant({ experiment, variant, ...params }: UpdateVariantOptions): Promise<ExperimentResponse> {
        return this._query({
            method: 'PUT',
            path: `teams/${this.teamId}/experiments/${experiment}/variants/${variant}`,
            payload: params,
        })
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
    async deleteVariant({ experiment, variant }: DeleteVariantOptions): Promise<void> {
        return this._query({
            method: 'DELETE',
            path: `teams/${this.teamId}/experiments/${experiment}/variants/${variant}`,
        })
    }

    ///

    /**
     * List events.
     *
     * @param {Object} [params]
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async listEvents(params: ListEventsOptions): Promise<EventsResponse> {
        return this._query({
            path: `teams/${this.teamId}/events`,
            params: this._buildParams(params),
        });
    }

    /**
     * Get an event.
     *
     * @param {Object} [params]
     * @param {Number} [params.key] The key of the event to retrieve.
     * @param {Array} [params.include] The relationships to include in the response.
     *
     * @returns {Object} JSON
     */
    async getEvent({ key, ...params }: GetVariantOptions): Promise<VariantResponse> {
        return this._query({
            path: `teams/${this.teamId}/events/${key}`,
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
            method: 'POST',
            path: `teams/${this.teamId}/events`,
            payload: params,
        })
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
    async updateEvent({ event, ...params }: UpdateEventOptions): Promise<EventResponse> {
        return this._query({
            method: 'PUT',
            path: `teams/${this.teamId}/events/${event}`,
            payload: params,
        })
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
            method: 'DELETE',
            path: `teams/${this.teamId}/events/${key}`,
        })
    }

    /**
     * Get the health of the API.
     */
    async health(): Promise<void> {
        return this._query({
            path: "health",
        });
    }
}

export default Checkmango;