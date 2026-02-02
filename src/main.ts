import { Plugin } from "obsidian";
import { draw_chessboard } from "./ChessMoveNotes";
import { type ChessMoveNotesSettings, ChessMoveNotesSettingTab, DEFAULT_SETTINGS } from "./ChessMoveNotesSettings";

export default class ChessMoveNotesPlugin extends Plugin {
	settings: ChessMoveNotesSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ChessMoveNotesSettingTab(this.app, this));
		this.registerMarkdownCodeBlockProcessor("chess-move-notes", draw_chessboard(this.app, this.settings));
		this.registerMarkdownCodeBlockProcessor("chesser", draw_chessboard(this.app, this.settings));
		this.registerMarkdownCodeBlockProcessor("chess", draw_chessboard(this.app, this.settings));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
