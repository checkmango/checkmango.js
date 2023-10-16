export interface QueryApiOptions {
    /**
     * The path to the API endpoint.
     */
    path: `${string}`;
    /**
     * The HTTP method to use.
     *
     * @default "GET"
     */
    method?: "POST" | "GET" | "PUT" | "DELETE";
    /**
     * Any query parameters to add to the request.
     */
    params?: unknown;
    /**
     * Any data to send in the request body.
     */
    payload?: object;
}

export interface PaginatedOptions {
    /**
     * Number of records to return (between 1 and 100)
     */
    perPage?: number;
    /**
     * Page of records to return
     */
    page?: number;
}

export interface ListTeamsOptions extends PaginatedOptions {
    /**
     * List of record types to include.
     */
    include?: Array<"events" | "experiments" | "experiments.variants" | "participants">;

    /**
     * List of sorts available.
     */
    sort?: Array<"id" | "created_at">;
}

export interface GetTeamOptions {
    /**
     * The ID of the team to retrieve.
     */
    id: number;

    /**
     * List of record types to include.
     */
    include?: Array<"events" | "experiments" | "experiments.variants" | "participants">;
}

export interface ListEventsOptions extends PaginatedOptions {
    /**
     * List of record types to include.
     */
    include?: Array<"experiments" | "team">;

    /**
     * List of sorts available.
     */
    sort?: Array<"id" | "key" | "created_at">;
}

export interface GetEventOptions {
    /**
     * The key of the event to retrieve.
     */
    key: string;

    /**
     * List of record types to include.
     */
    include?: Array<"experiments" | "team">;
}

export interface CreateEventOptions {
    /**
     * The key of the event.
     */
    key: string;

    /**
     * The description of the event.
     */
    description?: string;

    /**
     * The type of event.
     */
    type?: "unique" | "count";
}

export interface UpdateEventOptions {
    /**
     * The key of the event to update.
     */
    event: string;

    /**
     * The new key of the event.
     */
    key?: string;

    /**
     * The new description of the event.
     */
    description?: string;

    /**
     * The new type of event.
     */
    type?: "unique" | "count";
}

export interface DeleteEventOptions {
    /**
     * The key of the event to delete.
     */
    key: string;
}

export interface ListExperimentsOptions extends PaginatedOptions {
    /**
     * List of record types to include.
     */
    include?: Array<"event" | "team" | "variants">;

    /**
     * List of sorts available.
     */
    sort?: Array<"id" | "key" | "created_at">;

    /**
     * Filter by status.
     */
    status?: "draft" | "running" | "stopped";
}

export interface GetExperimentOptions {
    /**
     * The key of the experiment to retrieve.
     */
    key: string;

    /**
     * List of record types to include.
     */
    include?: Array<"event" | "team" | "variants">;
}

export interface CreateExperimentOptions {
    /**
     * The key of the experiment.
     */
    key: string;

    /**
     * The description of the experiment.
     */
    description?: string;

    /**
     * The event to use.
     */
    event: string;
}

export interface UpdateExperimentOptions {
    /**
     * The key of the experiment to update.
     */
    experiment: string;

    /**
     * The new key of the experiment.
     */
    key?: string;

    /**
     * The new description of the experiment.
     */
    description?: string;

    /**
     * The new event to use.
     */
    event?: string;
}

export interface DeleteExperimentOptions {
    /**
     * The key of the experiment to delete.
     */
    key: string;
}

export interface StartExperimentOptions {
    /**
     * The key of the experiment to start.
     */
    key: string;
}

export interface StopExperimentOptions {
    /**
     * The key of the experiment to stop.
     */
    key: string;
}

export interface ListVariantsOptions extends PaginatedOptions {
    /**
     * The experiment to list variants for.
     */
    experiment: string;

    /**
     * List of record types to include.
     */
    include?: Array<"experiment" | "team">;

    /**
     * List of sorts available.
     */
    sort?: Array<"id" | "key" | "created_at">;
}

export interface GetVariantOptions {
    /**
     * The experiment to get variants for.
     */
    experiment: string;

    /**
     * The key of the experiment to retrieve.
     */
    key: string;

    /**
     * List of record types to include.
     */
    include?: Array<"experiment" | "team">;
}

export interface CreateVariantOptions {
    /**
     * The key of the experiment.
     */
    experiment: string;

    /**
     * The key of the variant.
     */
    key: string;

    /**
     * The description of the variant.
     */
    description?: string;

    /**
     * Whether the variant is the control.
     */
    control: boolean;
}

export interface UpdateVariantOptions {
    /**
     * The key of the experiment.
     */
    experiment: string;

    /**
     * The key of the variant.
     */
    variant: string;

    /**
     * The new key of the variant.
     */
    key: string;

    /**
     * The new description of the variant.
     */
    description?: string;

    /**
     * Whether the variant is the control.
     */
    control?: boolean;
}

export interface DeleteVariantOptions {
    /**
     * The variant's experiment key.
     */
    experiment: string;

    /**
     * The key of the experiment to delete.
     */
    variant: string;
}

export interface ListParticipantsOptions extends PaginatedOptions {
    /**
     * List of record types to include.
     */
    include?: Array<"experiments" | "experiments.variants" | "team">;

    /**
     * List of sorts available.
     */
    sort?: Array<"id" | "key" | "created_at">;
}

export interface GetParticipantOptions {
    /**
     * The key of the participant to retrieve.
     */
    key: string;

    /**
     * List of record types to include.
     */
    include?: Array<"experiments" | "experiments.variants" | "team">;
}

export interface CreateParticipantOptions {
    /**
     * The key of the participant.
     */
    key: string;

    /**
     * The participant notes.
     */
    notes?: string;
}

export interface UpdateParticipantOptions {
    /**
     * The key of the participant to update.
     */
    participant: string;

    /**
     * The new key of the participant.
     */
    key?: string;

    /**
     * The new description of the participant.
     */
    notes?: string;
}

export interface DeleteParticipantOptions {
    /**
     * The key of the participant to delete.
     */
    key: string;
}

export interface ListParticipantExperimentsOptions extends PaginatedOptions {
    /**
     * The participant to list experiments for.
     */
    participant: string;

    /**
     * List of record types to include.
     */
    include?: Array<"experiment" | "team" | "variant">;

    /**
     * List of sorts available.
     */
    sort?: Array<"id" | "key" | "created_at">;
}

export interface GetParticipantExperimentOptions {
    /**
     * The key of the participant to retrieve.
     */
    participant: string;

    /**
     * The key of the experiment to retrieve.
     */
    experiment: string;

    /**
     * List of record types to include.
     */
    include?: Array<"variant">;
}

export interface UnenrolParticipantOptions {
    /**
     * The key of the participant to unenroll.
     */
    participant: string;

    /**
     * The key of the experiment to unenroll from.
     */
    experiment: string;
}