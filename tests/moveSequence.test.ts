import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { applyMoveTokens, normalizeMoveTokens } from "../src/moveSequence";

describe("move sequence helpers", () => {
	it("normalizes whitespace into tokens", () => {
		const tokens = normalizeMoveTokens(["e4 e5", " Nc3", "  d4   d5  ", " "]);
		expect(tokens).toEqual(["e4", "e5", "Nc3", "d4", "d5"]);
	});

	it("skips invalid tokens without throwing", () => {
		const chess = new Chess();
		const moves = applyMoveTokens(chess, ["e4", "e5", "bad", "Nf3"]);
		expect(moves.length).toBe(3);
		expect(chess.history().length).toBe(3);
	});
});
