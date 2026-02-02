import { Setting, setIcon } from "obsidian";
import type { ChessMoveNotes } from "./ChessMoveNotes";
import startingPositons from "./startingPositions";

type StartingPosition = (typeof startingPositons)[number]["items"][number];

export default class ChessMoveNotesMenu {
	private chessMoveNotes: ChessMoveNotes;
	private containerEl: HTMLElement;

	private movesListEl: HTMLElement;
	private openingIndex: Map<string, StartingPosition>;
	private fenToKey: Map<string, string>;

	constructor(parentEl: HTMLElement, chessMoveNotes: ChessMoveNotes) {
		this.chessMoveNotes = chessMoveNotes;
		this.openingIndex = new Map();
		this.fenToKey = new Map();

		startingPositons.forEach((category) => {
			category.items.forEach((item, itemIndex) => {
				const key = this.buildOpeningKey(category.id, itemIndex);
				this.openingIndex.set(key, item);
				if (!this.fenToKey.has(item.fen)) {
					this.fenToKey.set(item.fen, key);
				}
			});
		});

		this.containerEl = parentEl.createDiv("chess-menu-container", (containerEl) => {
			containerEl.createDiv({ cls: "chess-menu-section" }, (sectionEl) => {
				const selectEl = sectionEl.createEl(
					"select",
					{
						cls: "dropdown chess-starting-position-dropdown",
					},
					(el) => {
						el.createEl("option", {
							value: "starting-position",
							text: "Starting Position",
						});
						el.createEl("option", {
							value: "custom",
							text: "Custom",
						});
						el.createEl("optgroup", {}, (optgroup) => {
							optgroup.label = "Popular Openings";
							startingPositons.forEach((category) => {
								category.items.forEach((item, itemIndex) => {
									const key = this.buildOpeningKey(category.id, itemIndex);
									optgroup.createEl("option", {
										value: key,
										text: `${item.eco} - ${item.name}`,
									});
								});
							});
						});

						const startingPositionKey = this.getStartingPositionKeyFromFen(chessMoveNotes.getFen());
						el.value = startingPositionKey ?? "custom";
					},
				);

				selectEl.addEventListener("change", (ev: Event) => {
					const value = (ev.currentTarget as HTMLSelectElement).value;

					if (value === "starting-position") {
						this.chessMoveNotes.loadFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", []);
						return;
					}
					if (value === "custom") {
						return;
					}

					const startingPosition = this.openingIndex.get(value);
					if (!startingPosition) {
						return;
					}

					this.chessMoveNotes.loadFen(startingPosition.fen, startingPosition.moves);
				});

				new Setting(sectionEl).setName("Enable Free Move?").addToggle((toggle) => {
					toggle.setValue(this.chessMoveNotes.getBoardState().movable.free);
					toggle.onChange((value) => {
						this.chessMoveNotes.setFreeMove(value);
					});
				});
			});
		});

		this.movesListEl = this.containerEl.createDiv({
			cls: "chess-menu-section chess-menu-section-tall",
		});

		this.redrawMoveList();
		this.createToolbar();
	}

	private buildOpeningKey(categoryId: string, itemIndex: number) {
		return `${categoryId}:${itemIndex}`;
	}

	getStartingPositionKeyFromFen(fen: string) {
		return this.fenToKey.get(fen) ?? null;
	}

	createToolbar() {
		const btnContainer = this.containerEl.createDiv("chess-toolbar-container");
		btnContainer.createEl("a", "view-action", (btn: HTMLAnchorElement) => {
			btn.ariaLabel = "Flip board";
			setIcon(btn, "switch");
			btn.addEventListener("click", (e: MouseEvent) => {
				e.preventDefault();
				this.chessMoveNotes.flipBoard();
			});
		});

		btnContainer.createEl("a", "view-action", (btn: HTMLAnchorElement) => {
			btn.ariaLabel = "Reset";
			setIcon(btn, "restore-file-glyph");
			btn.addEventListener("click", (e: MouseEvent) => {
				e.preventDefault();
				while (this.chessMoveNotes.currentMoveIdx >= 0) {
					this.chessMoveNotes.undo_move();
				}
			});
		});

		btnContainer.createEl("a", "view-action", (btn: HTMLAnchorElement) => {
			btn.ariaLabel = "Undo";
			setIcon(btn, "left-arrow");
			btn.addEventListener("click", (e: MouseEvent) => {
				e.preventDefault();
				this.chessMoveNotes.undo_move();
			});
		});

		btnContainer.createEl("a", "view-action", (btn: HTMLAnchorElement) => {
			btn.ariaLabel = "Redo";
			setIcon(btn, "right-arrow");
			btn.addEventListener("click", (e: MouseEvent) => {
				e.preventDefault();
				this.chessMoveNotes.redo_move();
			});
		});

		btnContainer.createEl("a", "view-action", (btn: HTMLAnchorElement) => {
			btn.ariaLabel = "Copy FEN";
			setIcon(btn, "two-blank-pages");
			btn.addEventListener("click", (e: MouseEvent) => {
				e.preventDefault();
				navigator.clipboard.writeText(this.chessMoveNotes.getFen());
			});
		});
	}

	redrawMoveList() {
		this.movesListEl.empty();
		this.movesListEl.createDiv({
			text: this.chessMoveNotes.turn() === "b" ? "Black's turn" : "White's turn",
			cls: "chess-turn-text",
		});
		this.movesListEl.createDiv("chess-move-list", (moveListEl) => {
			this.chessMoveNotes.history().forEach((move, idx) => {
				const moveEl = moveListEl.createDiv({
					cls: `chess-move ${this.chessMoveNotes.currentMoveIdx === idx ? "chess-move-active" : ""}`,
					text: move.san,
				});
				moveEl.addEventListener("click", (ev) => {
					ev.preventDefault();
					this.chessMoveNotes.update_turn_idx(idx);
				});
			});
		});
	}
}
