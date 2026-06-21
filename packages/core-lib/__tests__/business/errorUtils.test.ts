import { extractApiError } from "../../business/errorUtils";

describe("extractApiError", () => {
  const fallback = "Something went wrong";

  it("returns fallback when result is undefined", () => {
    expect(extractApiError(undefined, fallback)).toBe(fallback);
  });

  it("returns fallback when result is null", () => {
    expect(extractApiError(null, fallback)).toBe(fallback);
  });

  it("returns fallback when result.data is undefined", () => {
    expect(extractApiError({}, fallback)).toBe(fallback);
  });

  it("returns the first error from errors array when present", () => {
    const result = {
      data: {
        statusCode: 400,
        success: false,
        response: null,
        message: "General error",
        errors: ["Specific error one", "Specific error two"],
      },
    };
    expect(extractApiError(result, fallback)).toBe("Specific error one");
  });

  it("returns message when errors array is empty", () => {
    const result = {
      data: {
        statusCode: 400,
        success: false,
        response: null,
        message: "Custom error message",
        errors: [],
      },
    };
    expect(extractApiError(result, fallback)).toBe("Custom error message");
  });

  it("returns message when errors is null", () => {
    const result = {
      data: {
        statusCode: 400,
        success: false,
        response: null,
        message: "Custom error message",
        errors: null,
      },
    };
    expect(extractApiError(result, fallback)).toBe("Custom error message");
  });

  it("returns fallback when both message and errors are null", () => {
    const result = {
      data: {
        statusCode: 400,
        success: false,
        response: null,
        message: null,
        errors: null,
      },
    };
    expect(extractApiError(result, fallback)).toBe(fallback);
  });
});
