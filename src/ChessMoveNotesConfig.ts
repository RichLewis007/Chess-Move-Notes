import type { DrawShape } from "chessground/draw";
import { parseYaml } from "obsidian";

import type { ChessMoveNotesSettings } from "./ChessMoveNotesSettings";

export interface ChessMoveNotesConfig extends ChessMoveNotesSettings {
	id?: string;
	fen: string;
	pgn?: string;
	shapes?: DrawShape[];
	currentMoveIdx?: number;
	moves?: string[];
}

export const PIECE_STYLES = [
	"alpha",
	"california",
	"cardinal",
	"cburnett",
	"chess7",
	"chessnut",
	"companion",
	"dubrovny",
	"fantasy",
	"fresca",
	"gioco",
	"governor",
	"horsey",
	"icpieces",
	"kosal",
	"leipzig",
	"letter",
	"libra",
	"maestro",
	"merida",
	"pirouetti",
	"pixel",
	"reillycraig",
	"riohacha",
	"shapes",
	"spatial",
	"staunty",
	"tatiana",
];
export const BOARD_STYLES = ["blue", "brown", "green", "ic", "purple"];

export function parse_user_config(settings: ChessMoveNotesSettings, content: string): ChessMoveNotesConfig {
	const userConfig: ChessMoveNotesConfig = {
		...settings,
		fen: "",
	};

	try {
		return {
			...userConfig,
			...parseYaml(content),
		};
	} catch {
		// failed to parse
		return userConfig;
	}
}
