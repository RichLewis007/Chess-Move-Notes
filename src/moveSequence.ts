import type { Chess, Move } from "chess.js";

export function normalizeMoveTokens(moves: string[]): string[] {
	return moves.flatMap((fullMove) =>
		fullMove
			.split(/\s+/)
			.map((halfMove) => halfMove.trim())
			.filter(Boolean),
	);
}

export function applyMoveTokens(
	chess: Chess,
	tokens: string[],
	onError?: (token: string, error: unknown) => void,
): Move[] {
	const applied: Move[] = [];
	for (const token of tokens) {
		try {
			const move = chess.move(token);
			if (move) {
				applied.push(move);
			}
		} catch (error) {
			onError?.(token, error);
		}
	}
	return applied;
}
