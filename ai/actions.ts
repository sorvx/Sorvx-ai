import { generateObject } from "ai";
import { z } from "zod";

import { geminiFlashModel } from ".";

export async function generateSampleFlightStatus({
  flightNumber,
  date,
}: {
  flightNumber: string;
  date: string;
}) {
  const { object: flightStatus } = await generateObject({
    model: geminiFlashModel,
    prompt: `Flight status for flight number ${flightNumber} on ${date}`,
    schema: z.object({
      flightNumber: z.string().describe("Flight number, e.g., BA123, AA31"),
      departure: z.object({
        cityName: z.string().describe("Name of the departure city"),
        airportCode: z.string().describe("IATA code of the departure airport"),
        airportName: z.string().describe("Full name of the departure airport"),
        timestamp: z.string().describe("ISO 8601 departure date and time"),
        terminal: z.string().describe("Departure terminal"),
        gate: z.string().describe("Departure gate"),
      }),
      arrival: z.object({
        cityName: z.string().describe("Name of the arrival city"),
        airportCode: z.string().describe("IATA code of the arrival airport"),
        airportName: z.string().describe("Full name of the arrival airport"),
        timestamp: z.string().describe("ISO 8601 arrival date and time"),
        terminal: z.string().describe("Arrival terminal"),
        gate: z.string().describe("Arrival gate"),
      }),
      totalDistanceInMiles: z
        .number()
        .describe("Total flight distance in miles"),
    }),
  });

  return flightStatus;
}

export async function generateSampleFlightSearchResults({
  origin,
  destination,
}: {
  origin: string;
  destination: string;
}) {
  const { object: flightSearchResults } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate search results for flights from ${origin} to ${destination}, limit to 4 results`,
    output: "array",
    schema: z.object({
      id: z
        .string()
        .describe("Unique identifier for the flight, like BA123, AA31, etc."),
      departure: z.object({
        cityName: z.string().describe("Name of the departure city"),
        airportCode: z.string().describe("IATA code of the departure airport"),
        timestamp: z.string().describe("ISO 8601 departure date and time"),
      }),
      arrival: z.object({
        cityName: z.string().describe("Name of the arrival city"),
        airportCode: z.string().describe("IATA code of the arrival airport"),
        timestamp: z.string().describe("ISO 8601 arrival date and time"),
      }),
      airlines: z.array(
        z.string().describe("Airline names, e.g., American Airlines, Emirates"),
      ),
      priceInUSD: z.number().describe("Flight price in US dollars"),
      numberOfStops: z.number().describe("Number of stops during the flight"),
    }),
  });

  return { flights: flightSearchResults };
}

export async function generateSampleSeatSelection({
  flightNumber,
}: {
  flightNumber: string;
}) {
  const { object: rows } = await generateObject({
    model: geminiFlashModel,
    prompt: `Simulate available seats for flight number ${flightNumber}, 6 seats on each row and 5 rows in total, adjust pricing based on location of seat`,
    output: "array",
    schema: z.array(
      z.object({
        seatNumber: z.string().describe("Seat identifier, e.g., 12A, 15C"),
        priceInUSD: z
          .number()
          .describe("Seat price in US dollars, less than $99"),
        isAvailable: z
          .boolean()
          .describe("Whether the seat is available for booking"),
      }),
    ),
  });

  return { seats: rows };
}

export async function generateReservationPrice(props: {
  seats: string[];
  flightNumber: string;
  departure: {
    cityName: string;
    airportCode: string;
    timestamp: string;
    gate: string;
    terminal: string;
  };
  arrival: {
    cityName: string;
    airportCode: string;
    timestamp: string;
    gate: string;
    terminal: string;
  };
  passengerName: string;
}) {
  const { object: reservation } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate price for the following reservation \n\n ${JSON.stringify(props, null, 2)}`,
    schema: z.object({
      totalPriceInUSD: z
        .number()
        .describe("Total reservation price in US dollars"),
    }),
  });

  return reservation;
}

export async function generateCodeExplanation({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const { object: explanation } = await generateObject({
    model: geminiFlashModel,
    prompt: `Explain this ${language} code:\n\n${code}`,
    schema: z.object({
      explanation: z.string().describe("Clear explanation of what the code does"),
      keyPoints: z.array(
        z.string().describe("Key concepts and patterns used in the code")
      ),
      possibleImprovements: z.array(
        z.string().describe("Potential ways to improve the code")
      ),
    }),
  });

  return explanation;
}

export async function generateCodeSuggestion({
  task,
  language,
  context,
}: {
  task: string;
  language: string;
  context?: string;
}) {
  const { object: suggestion } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate ${language} code for: ${task}\n${context ? `Context: ${context}` : ''}`,
    schema: z.object({
      code: z.string().describe("The suggested code solution"),
      explanation: z.string().describe("Explanation of how the code works"),
      requirements: z.array(
        z.string().describe("Required dependencies or setup steps")
      ),
    }),
  });

  return suggestion;
}

export async function generateBugFix({
  code,
  error,
  language,
}: {
  code: string;
  error: string;
  language: string;
}) {
  const { object: bugfix } = await generateObject({
    model: geminiFlashModel,
    prompt: `Fix this ${language} code that has the following error:\n\nCode:\n${code}\n\nError:\n${error}`,
    schema: z.object({
      fixedCode: z.string().describe("The corrected code"),
      explanation: z.string().describe("Explanation of what caused the bug"),
      preventionTips: z.array(
        z.string().describe("Tips to prevent similar bugs in the future")
      ),
    }),
  });

  return bugfix;
}

export async function generateCodeReview({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const { object: review } = await generateObject({
    model: geminiFlashModel,
    prompt: `Review this ${language} code for best practices and potential issues:\n\n${code}`,
    schema: z.object({
      score: z.number().min(1).max(10).describe("Code quality score out of 10"),
      strengths: z.array(
        z.string().describe("Good practices found in the code")
      ),
      improvements: z.array(
        z.string().describe("Suggested improvements and best practices")
      ),
      securityIssues: z.array(
        z.string().describe("Potential security concerns")
      ),
      performanceTips: z.array(
        z.string().describe("Performance optimization suggestions")
      ),
    }),
  });

  return review;
}

export async function generateTestCases({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const { object: tests } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate test cases for this ${language} code:\n\n${code}`,
    schema: z.object({
      testCases: z.array(z.object({
        description: z.string().describe("What the test case verifies"),
        input: z.string().describe("Test input values"),
        expectedOutput: z.string().describe("Expected output or behavior"),
        testCode: z.string().describe("The actual test code"),
      })),
      coverage: z.array(
        z.string().describe("Areas of code covered by the tests")
      ),
    }),
  });

  return tests;
}
