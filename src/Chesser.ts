import { Chess, type Move, SQUARES } from "chess.js";
import { Chessground } from "chessground";
import type { Api } from "chessground/api";
import type { DrawShape } from "chessground/draw";
import type { Color, Key } from "chessground/types";
import { nanoid } from "nanoid";
import {
	type App,
	type EditorPosition,
	type MarkdownPostProcessorContext,
	MarkdownRenderChild,
	MarkdownView,
	Notice,
	parseYaml,
	stringifyYaml,
} from "obsidian";

import { type ChesserConfig, parse_user_config } from "./ChesserConfig";
import type { ChesserSettings } from "./ChesserSettings";
import ChesserMenu from "./menu";
import { applyMoveTokens, normalizeMoveTokens } from "./moveSequence";

// To bundle all css files in styles.css with rollup
import "../assets/custom.css";
import "../node_modules/chessground/assets/chessground.base.css";
import "../node_modules/chessground/assets/chessground.brown.css";
// Piece styles
import "../assets/piece-css/alpha.css";
import "../assets/piece-css/california.css";
import "../assets/piece-css/cardinal.css";
import "../assets/piece-css/cburnett.css";
import "../assets/piece-css/chess7.css";
import "../assets/piece-css/chessnut.css";
import "../assets/piece-css/companion.css";
import "../assets/piece-css/dubrovny.css";
import "../assets/piece-css/fantasy.css";
import "../assets/piece-css/fresca.css";
import "../assets/piece-css/gioco.css";
import "../assets/piece-css/governor.css";
import "../assets/piece-css/horsey.css";
import "../assets/piece-css/icpieces.css";
import "../assets/piece-css/kosal.css";
import "../assets/piece-css/leipzig.css";
import "../assets/piece-css/letter.css";
import "../assets/piece-css/libra.css";
import "../assets/piece-css/maestro.css";
import "../assets/piece-css/merida.css";
import "../assets/piece-css/pirouetti.css";
import "../assets/piece-css/pixel.css";
import "../assets/piece-css/reillycraig.css";
import "../assets/piece-css/riohacha.css";
import "../assets/piece-css/shapes.css";
import "../assets/piece-css/spatial.css";
import "../assets/piece-css/staunty.css";
import "../assets/piece-css/tatiana.css";
// Board styles
import "../assets/board-css/brown.css";
import "../assets/board-css/blue.css";
import "../assets/board-css/green.css";
import "../assets/board-css/purple.css";
import "../assets/board-css/ic.css";

export function draw_chessboard(app: App, settings: ChesserSettings) {
	return (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
		const user_config = parse_user_config(settings, source);
		ctx.addChild(new Chesser(el, ctx, user_config, app));
	};
}

function read_state(id: string) {
	const savedDataStr = localStorage.getItem(`chesser-${id}`);
	try {
		return JSON.parse(savedDataStr);
	} catch (e) {
		console.error(e);
	}
	return {};
}

function write_state(id: string, game_state: ChesserConfig) {
	localStorage.setItem(`chesser-${id}`, JSON.stringify(game_state));
}

export class Chesser extends MarkdownRenderChild {
	private ctx: MarkdownPostProcessorContext;
	private app: App;

	private id: string;
	private cg: Api;
	private chess: Chess;

	private menu: ChesserMenu;
	private moves: Move[];

	public currentMoveIdx: number;

	constructor(containerEl: HTMLElement, ctx: MarkdownPostProcessorContext, user_config: ChesserConfig, app: App) {
		super(containerEl);

		this.app = app;
		this.ctx = ctx;
		this.id = user_config.id ?? nanoid(8);
		this.chess = new Chess();

		const saved_config = read_state(this.id);
		const config = Object.assign({}, user_config, saved_config);

		this.sync_board_with_gamestate = this.sync_board_with_gamestate.bind(this);
		this.save_move = this.save_move.bind(this);
		this.save_shapes = this.save_shapes.bind(this);

		// Save `id` into the codeblock yaml
		if (user_config.id === undefined) {
			this.app.workspace.onLayoutReady(() => {
				window.setTimeout(() => {
					this.write_config({ id: this.id });
				}, 0);
			});
		}

		if (config.pgn) {
			console.debug("loading from pgn", config.pgn);
			this.chess.loadPgn(config.pgn);
		} else if (config.fen) {
			console.debug("loading from fen", config.fen);
			this.chess.load(config.fen);
		}

		this.moves = config.moves ?? this.chess.history({ verbose: true });
		this.currentMoveIdx = config.currentMoveIdx ?? this.moves.length - 1;

		let lastMove: [Key, Key];
		if (this.currentMoveIdx >= 0) {
			const move = this.moves[this.currentMoveIdx];
			lastMove = [move.from, move.to];
		}

		// Setup UI
		this.set_style(containerEl, config.pieceStyle, config.boardStyle);
		try {
			this.cg = Chessground(containerEl.createDiv(), {
				fen: this.chess.fen(),
				lastMove,
				orientation: config.orientation as Color,
				viewOnly: config.viewOnly,
				drawable: {
					enabled: config.drawable,
					onChange: this.save_shapes,
				},
			});
		} catch (e) {
			new Notice("Chesser error: Invalid config");
			console.error(e);
			return;
		}

		// Activates the chess logic
		this.setFreeMove(config.free);

		// Draw saved shapes
		if (config.shapes) {
			this.app.workspace.onLayoutReady(() => {
				window.setTimeout(() => {
					this.sync_board_with_gamestate(false);
					this.cg.setShapes(config.shapes);
				}, 100);
			});
		}

		this.menu = new ChesserMenu(containerEl, this);
	}

	private set_style(el: HTMLElement, pieceStyle: string, boardStyle: string) {
		el.addClasses([pieceStyle, `${boardStyle}-board`, "chesser-container"]);
	}

	private get_section_range(): [EditorPosition, EditorPosition] | null {
		const sectionInfo = this.ctx.getSectionInfo(this.containerEl);
		if (!sectionInfo) {
			console.error("Chesser: Failed to retrieve section info for code block");
			return null;
		}

		return [
			{
				line: sectionInfo.lineStart + 1,
				ch: 0,
			},
			{
				line: sectionInfo.lineEnd,
				ch: 0,
			},
		];
	}

	private get_config(view: MarkdownView): ChesserConfig | undefined {
		const sectionRange = this.get_section_range();
		if (!sectionRange) {
			return undefined;
		}
		const [from, to] = sectionRange;
		const codeblockText = view.editor.getRange(from, to);
		try {
			return parseYaml(codeblockText);
		} catch (_e) {
			console.debug("failed to parse codeblock's yaml config", codeblockText);
			// failed to parse. show error...
		}

		return undefined;
	}

	private get_source_view(): MarkdownView | null {
		const leaves = this.app.workspace.getLeavesOfType("markdown");
		for (const leaf of leaves) {
			const view = leaf.view;
			if (view instanceof MarkdownView && view.file?.path === this.ctx.sourcePath) {
				return view;
			}
		}
		return null;
	}

	private write_config(config: Partial<ChesserConfig>) {
		console.debug("writing config to localStorage", config);
		const view = this.get_source_view();
		if (!view) {
			new Notice("Chesser: Failed to retrieve active view");
			console.error("Chesser: Failed to retrieve view when writing config");
			return;
		}
		const sectionRange = this.get_section_range();
		if (!sectionRange) {
			return;
		}
		try {
			const updated = stringifyYaml({
				...this.get_config(view),
				...config,
			});

			const [from, to] = sectionRange;
			view.editor.replaceRange(updated, from, to);
		} catch (e) {
			// failed to parse. show error...
			console.error("failed to write config", e);
		}
	}

	private save_move() {
		const config = read_state(this.id);
		write_state(this.id, {
			...config,
			currentMoveIdx: this.currentMoveIdx,
			moves: this.moves,
			pgn: this.chess.pgn(),
		});
	}

	private save_shapes(shapes: DrawShape[]) {
		const config = read_state(this.id);
		write_state(this.id, {
			...config,
			shapes,
		});
	}

	private sync_board_with_gamestate(shouldSave: boolean = true) {
		this.cg.set({
			check: this.check(),
			turnColor: this.color_turn(),
			movable: {
				free: false,
				color: this.color_turn(),
				dests: this.dests(),
			},
		});

		this.menu?.redrawMoveList();
		if (shouldSave) {
			this.save_move();
		}
	}

	public color_turn(): Color {
		return this.chess.turn() === "w" ? "white" : "black";
	}

	public dests(): Map<Key, Key[]> {
		const dests = new Map();
		SQUARES.forEach((s) => {
			const ms = this.chess.moves({ square: s, verbose: true });
			if (ms.length)
				dests.set(
					s,
					ms.map((m) => m.to),
				);
		});
		return dests;
	}

	public check(): boolean {
		return this.chess.inCheck();
	}

	public undo_move() {
		this.update_turn_idx(this.currentMoveIdx - 1);
	}

	public redo_move() {
		this.update_turn_idx(this.currentMoveIdx + 1);
	}

	public update_turn_idx(moveIdx: number): void {
		if (moveIdx < -1 || moveIdx >= this.moves.length) {
			return;
		}

		const isUndoing = moveIdx < this.currentMoveIdx;
		if (isUndoing) {
			while (this.currentMoveIdx > moveIdx) {
				this.currentMoveIdx--;
				this.chess.undo();
			}
		} else {
			while (this.currentMoveIdx < moveIdx) {
				this.currentMoveIdx++;
				const move = this.moves[this.currentMoveIdx];
				this.chess.move(move);
			}
		}

		let lastMove: [Key, Key];
		if (this.currentMoveIdx >= 0) {
			const move = this.moves[this.currentMoveIdx];
			lastMove = [move.from, move.to];
		}

		this.cg.set({
			fen: this.chess.fen(),
			lastMove,
		});
		this.sync_board_with_gamestate();
	}

	public setFreeMove(enabled: boolean): void {
		if (enabled) {
			this.cg.set({
				events: {
					move: this.save_move,
				},
				movable: {
					free: true,
					color: "both",
					dests: undefined,
				},
			});
		} else {
			this.cg.set({
				events: {
					move: (orig: Key, dest: Key) => {
						let move: Move | null = null;
						try {
							move = this.chess.move({ from: orig, to: dest });
						} catch (e) {
							console.error("Chesser: invalid move", e);
							return;
						}
						if (!move) {
							return;
						}
						this.currentMoveIdx++;
						this.moves = [...this.moves.slice(0, this.currentMoveIdx), move];
						this.sync_board_with_gamestate();
					},
				},
			});
			this.sync_board_with_gamestate();
		}
	}

	public turn() {
		return this.chess.turn();
	}

	public history() {
		return this.moves;
	}

	public flipBoard() {
		return this.cg.toggleOrientation();
	}

	public getBoardState() {
		return this.cg.state;
	}

	public getFen() {
		return this.chess.fen();
	}

	public loadFen(fen: string, moves?: string[]): void {
		let lastMove: [Key, Key];
		if (moves) {
			this.currentMoveIdx = -1;
			this.moves = [];
			this.chess.reset();

			const tokens = normalizeMoveTokens(moves);
			this.moves = applyMoveTokens(this.chess, tokens, (token, error) => {
				console.error(`Chesser: invalid move in opening sequence (${token})`, error);
			});
			this.currentMoveIdx = this.moves.length - 1;

			if (this.currentMoveIdx >= 0) {
				const move = this.moves[this.currentMoveIdx];
				lastMove = [move.from, move.to];
			}
		} else {
			this.chess.load(fen);
		}

		this.cg.set({ fen: this.chess.fen(), lastMove });
		this.sync_board_with_gamestate();
	}
}
