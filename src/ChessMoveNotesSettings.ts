import { type App, PluginSettingTab, Setting } from "obsidian";
import { BOARD_STYLES, PIECE_STYLES } from "./ChessMoveNotesConfig";
import type ChessMoveNotesPlugin from "./main";

export interface ChessMoveNotesSettings {
	orientation: string;
	viewOnly: boolean;
	drawable: boolean;
	free: boolean;
	pieceStyle: string;
	boardStyle: string;
}

export const DEFAULT_SETTINGS: ChessMoveNotesSettings = {
	orientation: "white",
	viewOnly: false,
	drawable: true,
	free: false,
	pieceStyle: "cburnett",
	boardStyle: "brown",
};

export class ChessMoveNotesSettingTab extends PluginSettingTab {
	plugin: ChessMoveNotesPlugin;

	constructor(app: App, plugin: ChessMoveNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Obsidian Chess Settings" });

		new Setting(containerEl)
			.setName("Piece Style")
			.setDesc("Sets the piece style.")
			.addDropdown((dropdown) => {
				const styles = Object.fromEntries(PIECE_STYLES.map((style) => [style, style])) as Record<string, string>;

				dropdown.addOptions(styles);

				dropdown.setValue(this.plugin.settings.pieceStyle).onChange((pieceStyle) => {
					this.plugin.settings.pieceStyle = pieceStyle;
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Board Style")
			.setDesc("Sets the board style.")
			.addDropdown((dropdown) => {
				const styles = Object.fromEntries(BOARD_STYLES.map((style) => [style, style])) as Record<string, string>;

				dropdown.addOptions(styles);

				dropdown.setValue(this.plugin.settings.boardStyle).onChange((boardStyle) => {
					this.plugin.settings.boardStyle = boardStyle;
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Orientation")
			.setDesc("Sets the default board orientation.")
			.addDropdown((dropdown) => {
				dropdown.addOption("white", "White");
				dropdown.addOption("black", "Black");

				dropdown.setValue(this.plugin.settings.orientation).onChange((orientation) => {
					this.plugin.settings.orientation = orientation;
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Drawable")
			.setDesc("Controls the ability to draw annotations (arrows, circles) on the board.")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.drawable).onChange((drawable) => {
					this.plugin.settings.drawable = drawable;
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("View-only")
			.setDesc("If enabled, displays a static chess board (no moves, annotations, ...).")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.viewOnly).onChange((viewOnly) => {
					this.plugin.settings.viewOnly = viewOnly;
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Free")
			.setDesc("If enabled, disables the chess logic, all moves are valid.")
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.free).onChange((free) => {
					this.plugin.settings.free = free;
					this.plugin.saveSettings();
				});
			});
	}
}
