/** An unsuccessful HTTP response from the Checkmango API. */
export class CheckmangoError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly errors?: unknown,
        public readonly body?: unknown,
    ) {
        super(message);
        this.name = "CheckmangoError";
    }
}
