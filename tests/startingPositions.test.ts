import { describe, expect, it } from "vitest";
import startingPositions from "../src/startingPositions";

const items = startingPositions.flatMap((category) => category.items);

describe("starting positions data", () => {
	it("has unique FENs", () => {
		const fens = items.map((item) => item.fen);
		expect(new Set(fens).size).toBe(fens.length);
	});

	it("has trimmed move strings", () => {
		for (const item of items) {
			for (const move of item.moves) {
				expect(move).toBe(move.trim());
			}
		}
	});
});
