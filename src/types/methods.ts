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
    params?: Record<string, string>;
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

export interface ListOrganizationsOptions extends PaginatedOptions {
    /**
     * List of record types to include.
     */
    include?: Array<
        "events" | "experiments" | "experiments.variants" | "participants"
    >;

    /**
     * List of sorts available.
     */
    sort?: Array<"id" | "created_at" | "-id" | "-created_at">;
}

export interface GetOrganizationOptions {
    /**
     * The ID of the organization to retrieve.
     */
    id: number | string;

    /**
     * List of record types to include.
     */
    include?: Array<
        "events" | "experiments" | "experiments.variants" | "participants"
    >;
}

export interface ListEventsOptions extends PaginatedOptions {
    /**
     * List of record types to include.
     */
    include?: Array<"experiments" | "organization" | "team">;

    /**
     * List of sorts available.
     */
    sort?: Array<"id" | "key" | "created_at" | "-id" | "-key" | "-created_at">;
}

export interface GetEventOptions {
    /**
     * The key of the event to retrieve.
     */
    key: string;

    /**
     * List of record types to include.
     */
    include?: Array<"experiments" | "organization" | "team">;
}

export interface CreateEventOptions {
    /**
     * The key of the event.
     */
    key: string;

    /**
     * The description of the event.
     */
    description?: string | null;

    /**
     * The type of event.
     */
    type: "unique" | "count";
    is_revenue?: boolean;
    improvement_direction?: "higher" | "lower";
    is_guardrail?: boolean;
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
    description?: string | null;

    /**
     * The new type of event.
     */
    type?: "unique" | "count";
    is_revenue?: boolean;
    improvement_direction?: "higher" | "lower";
    is_guardrail?: boolean;
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
    include?: Array<"event" | "organization" | "team" | "variants">;

    /**
     * List of sorts available.
     */
    sort?: Array<"id" | "key" | "created_at" | "-id" | "-key" | "-created_at">;

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
    include?: Array<"event" | "organization" | "team" | "variants">;
}

export interface ExperimentInput {
    /**
     * The key of the experiment.
     */
    key: string;

    /**
     * The description of the experiment.
     */
    description?: string | null;

    /** @deprecated Use event_key. */
    event?: string;
    event_key?: string;
}

export type CreateExperimentOptions = ExperimentInput &
    (
        | { event_key: string; event?: string }
        | { event: string; event_key?: string }
    );

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
    description?: string | null;

    /**
     * The new event to use.
     */
    event?: string;
    event_key?: string;
    algorithm_type?: "blockRandomization" | "weightedSample" | "whiplash";
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
    include?: Array<"experiment" | "organization" | "team">;

    /**
     * List of sorts available.
     */
    sort?: Array<"id" | "key" | "created_at" | "-id" | "-key" | "-created_at">;
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
    include?: Array<"experiment" | "organization" | "team">;
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
    description?: string | null;

    /**
     * Whether the variant is the control.
     */
    control?: boolean;
    traffic?: number;
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
    key?: string;

    /**
     * The new description of the variant.
     */
    description?: string | null;

    /**
     * Whether the variant is the control.
     */
    control?: boolean;
    traffic?: number;
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
    include?: Array<
        | "attributes"
        | "experiments"
        | "experiments.variants"
        | "organization"
        | "team"
    >;

    /**
     * List of sorts available.
     */
    sort?: Array<"id" | "key" | "created_at" | "-id" | "-key" | "-created_at">;
}

export interface GetParticipantOptions {
    /**
     * The key of the participant to retrieve.
     */
    key: string;

    /**
     * List of record types to include.
     */
    include?: Array<
        | "attributes"
        | "experiments"
        | "experiments.variants"
        | "organization"
        | "team"
    >;
}

export interface CreateParticipantOptions {
    /**
     * The key of the participant.
     */
    key: string;

    /**
     * The participant notes.
     */
    notes?: string | null;
    attributes?: Record<string, import("./api").JsonValue> | null;
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
    notes?: string | null;
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
    include?: Array<"experiment" | "organization" | "team" | "variant">;

    /**
     * List of sorts available.
     */
    sort?: Array<"id" | "time" | "-id" | "-time">;
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
    include?: Array<"organization">;
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
/** @deprecated Use ListOrganizationsOptions. */
export type ListTeamsOptions = ListOrganizationsOptions;
/** @deprecated Use GetOrganizationOptions. */
export type GetTeamOptions = GetOrganizationOptions;
export interface ListFeaturesOptions extends PaginatedOptions {
    include?: Array<"organization">;
    sort?: Array<"id" | "key" | "created_at" | "-id" | "-key" | "-created_at">;
}
export interface GetFeatureOptions {
    key: string;
    include?: Array<"organization">;
}
export interface CreateFeatureOptions {
    key: string;
    description?: string | null;
    enabled?: boolean;
    value?: string | null;
    format?: "text";
}
export interface UpdateFeatureOptions
    extends Partial<Omit<CreateFeatureOptions, "key">> {
    feature: string;
}
export interface DeleteFeatureOptions {
    key: string;
}
export interface ListParticipantAttributesOptions extends PaginatedOptions {
    participant: string;
    "attribute.key"?: string;
    sort?: Array<"attribute.key" | "value" | "-attribute.key" | "-value">;
}
export interface UpdateParticipantAttributesOptions {
    participant: string;
    attributes: Array<{ key: string; value: import("./api").JsonValue }>;
}
export interface DeleteParticipantAttributesOptions {
    participant: string;
    attribute?: string;
}
export interface GetVariantStatisticsOptions {
    experiment: string;
    key: string;
    event_key?: string;
    include?: Array<"organization" | "experiment" | "variant" | "event">;
}
