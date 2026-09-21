export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };
export interface ApiTimestamp {
    human: string | null;
    string: string | null;
}
export interface ApiResource<T = Record<string, unknown>> {
    type: string;
    id: string;
    attributes: T;
    relationships?: Record<string, unknown>;
    links?: Record<string, unknown>;
}
export interface ApiResponse<T> {
    data: T;
    jsonapi?: { version: string };
    links?: Record<string, unknown>;
    meta?: Record<string, unknown>;
    included?: ApiResource[];
}
interface Timestamps {
    created: ApiTimestamp;
    updated: ApiTimestamp;
}
interface OrganizationAttributes extends Timestamps {
    id: number;
    name: string;
    slug: string;
    events_count: number | null;
    experiments_count: number | null;
    participants_count: number | null;
    is_free: boolean;
    api_requests: number | null;
}
interface KeyedAttributes extends Timestamps {
    id: number;
    organization_id: number;
    key: string;
}
interface EventAttributes extends KeyedAttributes {
    description: string | null;
    type: "count" | "unique";
    is_revenue: boolean;
    improvement_direction: "higher" | "lower";
    is_guardrail: boolean;
}
export type ExperimentStatus = "draft" | "running" | "stopped";
interface ExperimentAttributes extends KeyedAttributes {
    description: string | null;
    status: ExperimentStatus;
    started: ApiTimestamp;
    stopped: ApiTimestamp;
}
interface VariantAttributes extends KeyedAttributes {
    description: string | null;
    control: boolean;
}
interface ParticipantAttributes extends KeyedAttributes {
    notes: string | null;
    blocked: boolean;
    blocked_at: string | null;
    attributes?: Record<string, JsonValue> | [];
    enrollments?: Record<string, string> | [];
}
interface FeatureAttributes extends KeyedAttributes {
    description: string | null;
    enabled: boolean;
    value: string | null;
    format: "text";
}
interface ParticipantAttributeAttributes extends Timestamps {
    id: number;
    organization_id: number;
    participant_id: number;
    participant_key?: string;
    key: string;
    value: JsonValue;
}
interface VariantStatisticAttributes extends Timestamps {
    organization_id: number;
    experiment_id: number;
    variant_id: number;
    event_id: number;
    count_conversion_rate: number | null;
    unique_conversion_rate: number | null;
    power: number | null;
    z_score: number | null;
    p_value: number | null;
    confidence: number | null;
    uplift: number | null;
}
export interface OrganizationConfigAttributes {
    organization_id: number;
    features: Record<
        string,
        { enabled: boolean; value: string | null; format: "text" }
    >;
    features_revision: string;
    experiments:
        | Record<
              string,
              {
                  endpoint: string;
                  algorithm:
                      | "blockRandomization"
                      | "weightedSample"
                      | "whiplash";
                  status: ExperimentStatus;
                  variant_count: number;
                  total_participants: number;
                  timeline: {
                      created_at: string | null;
                      updated_at: string | null;
                      started_at: string | null;
                      stopped_at: string | null;
                  };
                  variants:
                      | Record<
                            string,
                            {
                                control: boolean;
                                participants: number;
                                impressions: number;
                                conversions: number;
                            }
                        >
                      | [];
              }
          >
        | [];
}
export interface IngestOptions {
    experiment: string;
    participant: string;
    variant: string;
    event?: string | null;
    eventValue?: number;
}
export interface HealthResponse {
    ping: "pong";
    time: string;
}
export type UserResponse = ApiResponse<
    ApiResource<{ name: string; email: string }>
>;
export type OrganizationResponse = ApiResponse<
    ApiResource<OrganizationAttributes>
>;
export type OrganizationsResponse = ApiResponse<
    ApiResource<OrganizationAttributes>[]
>;
/** @deprecated Use OrganizationResponse. */
export type TeamResponse = OrganizationResponse;
/** @deprecated Use OrganizationsResponse. */
export type TeamsResponse = OrganizationsResponse;
export type OrganizationConfigResponse = ApiResponse<
    ApiResource<OrganizationConfigAttributes>
>;
export type EventResponse = ApiResponse<ApiResource<EventAttributes>>;
export type EventsResponse = ApiResponse<ApiResource<EventAttributes>[]>;
export type ExperimentResponse = ApiResponse<ApiResource<ExperimentAttributes>>;
export type ExperimentsResponse = ApiResponse<
    ApiResource<ExperimentAttributes>[]
>;
export type VariantResponse = ApiResponse<ApiResource<VariantAttributes>>;
export type VariantsResponse = ApiResponse<ApiResource<VariantAttributes>[]>;
export type ParticipantResponse = ApiResponse<
    ApiResource<ParticipantAttributes>
>;
export type ParticipantsResponse = ApiResponse<
    ApiResource<ParticipantAttributes>[]
>;
export type FeatureResponse = ApiResponse<ApiResource<FeatureAttributes>>;
export type FeaturesResponse = ApiResponse<ApiResource<FeatureAttributes>[]>;
export type ParticipantAttributesResponse = ApiResponse<
    ApiResource<ParticipantAttributeAttributes>[]
>;
export type VariantStatisticResponse = ApiResponse<
    ApiResource<VariantStatisticAttributes>
>;
export type EnrollmentsResponse = ApiResponse<
    ApiResource<{
        experiment_key: string;
        variant_key: string;
        time: ApiTimestamp;
    }>[]
>;
