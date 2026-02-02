const defaultMessages = {
	"error.invalid_pgn": "Chesser could not read the PGN. Please check the formatting.",
	"error.invalid_fen": "Chesser could not read the FEN. Please check the string.",
	"error.render_failed": "Chesser could not render this board. Please check the block settings.",
	"error.update_failed": "Chesser could not update the code block. Open the note and try again.",
	"error.replay_failed": "Chesser could not replay a move in this sequence.",
	"error.illegal_move": "That move is not legal in this position.",
	"error.opening_move_failed": "Chesser could not load one of the opening moves.",
};

export type MessageKey = keyof typeof defaultMessages;

let messages: Record<MessageKey, string> = { ...defaultMessages };

// Allow other modules (or a plugin) to override any Notice strings at runtime.
export function setMessages(overrides: Partial<Record<MessageKey, string>>): void {
	messages = { ...messages, ...overrides };
}

export function t(key: MessageKey, vars?: Record<string, string | number>): string {
	const template = messages[key];
	if (!vars) {
		return template;
	}
	return template.replace(/\{(\w+)\}/g, (match, varName) => {
		const value = vars[varName];
		return value === undefined ? match : String(value);
	});
}
