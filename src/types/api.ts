interface BaseListResponse {
    meta: object;
    jsonapi: {
        version: "1.0";
    };
    links: object;
    included?: Record<string, any>;
}

interface BaseIndividualResponse {
    jsonapi: {
        version: "1.0";
    };
    links: object;
    included?: Record<string, any>;
}

interface BaseApiObject {
    type: string;
    id: string;
    relationships: object;
    links: object;
}

interface UserAttributes {
    /**
     * The name of the user.
     */
    name: string;

    /**
     * The email of the user.
     */
    email: string;
}

interface UserObject extends BaseApiObject {
    attributes: UserAttributes;
}

export interface UserResponse extends BaseIndividualResponse {
    data: UserObject;
}

interface TeamAttributes {
    /**
     * The ID of the team.
     */
    id: number;

    /**
     * The name of the team.
     */
    name: string;

    /**
     * The number of events the team has.
     */
    event_count: number | null;

    /**
     * The number of experiments the team has.
     */
    experiment_count: number | null;

    /**
     * The number of participants the team has.
     */
    participant_count: number | null;

    /**
     * Whether the team is on a free plan.
     */
    is_free: boolean;

    /**
     * The number of API requests the team has made in this billing period.
     */
    api_requests: number | null;

    /**
     * When the team was created.
     */
    created: {
        human: string;
        string: string;
    };

    /**
     * When the team was last updated.
     */
    updated: {
        human: string;
        string: string;
    };
}

interface TeamObject extends BaseApiObject {
    attributes: TeamAttributes;
}

export interface TeamsResponse extends BaseListResponse {
    data: TeamObject[]
}

export interface TeamResponse extends BaseIndividualResponse {
    data: TeamObject;
}

export interface IngestOptions {
    /**
     * The experiment to ingest the data into.
     */
    experiment: string;

    /**
     * The participant to ingest the data into.
     */
    participant: string;

    /**
     * The variant to ingest the data into.
     */
    variant: string;

    /**
     * The event to ingest the data into.
     */
    event?: string;
}

interface EventAttributes {
    /**
     * The id of the event.
     */
    id: number;

    /**
     * The key of the event.
     */
    key: string;

    /**
     * The team id of the event.
     */
    team_id: number;

    /**
     * The description of the event.
     */
    description: string;

    /**
     * The type of event.
     */
    type: "count" | "unique";

    /**
     * The date the event was created.
     */
    created: {
        human: string;
        string: string;
    };

    /**
     * The date the event was last updated.
     */
    updated: {
        human: string;
        string: string;
    };
}

interface EventObject extends BaseApiObject {
    attributes: EventAttributes;
}

export interface EventsResponse extends BaseListResponse {
    data: EventObject[]
}

export interface EventResponse extends BaseIndividualResponse {
    data: EventObject;
}

interface ExperimentAttributes {
    /**
     * The id of the experiment.
     */
    id: number;

    /**
     * The key of the experiment.
     */
    key: string;

    /**
     * The team id of the experiment.
     */
    team_id: number;

    /**
     * The description of the experiment.
     */
    description: string;

    /**
     * The status of the experiment.
     */
    status: "draft" | "running" | "stopped";

    /**
     * The date the experiment was created.
     */
    created: {
        human: string;
        string: string;
    };

    /**
     * The date the experiment was last updated.
     */
    updated: {
        human: string;
        string: string;
    };

    /**
     * The date the experiment was started.
     */
    started: {
        human: string;
        string: string;
    };

    /**
     * The date the experiment was stopped.
     */
    stopped: {
        human: string;
        string: string;
    };
}

interface ExperimentObject extends BaseApiObject {
    attributes: ExperimentAttributes;
}

export interface ExperimentsResponse extends BaseListResponse {
    data: ExperimentObject[]
}

export interface ExperimentResponse extends BaseIndividualResponse {
    data: ExperimentObject;
}

interface VariantAttributes {
    /**
     * The id of the variant.
     */
    id: number;

    /**
     * The key of the variant.
     */
    key: string;

    /**
     * The team id of the variant.
     */
    team_id: number;

    /**
     * The description of the variant.
     */
    description: string;

    /**
     * Whether the variant is the control.
     */
    control: boolean;

    /**
     * The conversion rate of the variant.
     */
    conversion_rate: number;

    /**
     * The power of the variant.
     */
    power: number;

    /**
     * The z-score of the variant.
     */
    z_score: number;

    /**
     * The p-value of the variant.
     */
    p_value: number;

    /**
     * The uplift of the variant.
     */
    uplift: number;

    /**
     * The date the variant was created.
     */
    created: {
        human: string;
        string: string;
    };

    /**
     * The date the variant was last updated.
     */
    updated: {
        human: string;
        string: string;
    };
}

interface VariantObject extends BaseApiObject {
    attributes: VariantAttributes;
}

export interface VariantsResponse extends BaseListResponse {
    data: VariantObject[]
}

export interface VariantResponse extends BaseIndividualResponse {
    data: VariantObject;
}

interface ParticipantAttributes {
    /**
     * The id of the participant.
     */
    id: number;

    /**
     * The key of the participant.
     */
    key: string;

    /**
     * The team id of the participant.
     */
    team_id: number;

    /**
     * The notes of the participant.
     */
    notes: string;

    /**
     * The date the participant was created.
     */
    created: {
        human: string;
        string: string;
    };

    /**
     * The date the participant was last updated.
     */
    updated: {
        human: string;
        string: string;
    };
}

interface ParticipantObject extends BaseApiObject {
    attributes: ParticipantAttributes;
}

export interface ParticipantsResponse extends BaseListResponse {
    data: ParticipantObject[]
}

export interface ParticipantResponse extends BaseIndividualResponse {
    data: ParticipantObject;
}