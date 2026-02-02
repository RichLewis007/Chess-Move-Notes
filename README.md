# Chess Move Notes

Chess diagrams and move notation inside [Obsidian](https://obsidian.md/).

Repo: https://github.com/RichLewis007/Chess-Move-Notes

## Status and upstream

This project is a maintained fork of [Chesser](https://github.com/SilentVoid13/Chesser) by [SilentVoid13](https://github.com/SilentVoid13). This fork focuses on maintenance, bug fixes, dependency updates, and incremental improvements. When possible, changes will be proposed upstream via pull requests.

License: GNU AGPLv3 (same as upstream). See [LICENSE](LICENSE.TXT).

## Differences from upstream

- Actively maintained fork focused on stability and compatibility first (desktop and mobile).
- Dependency updates and build hygiene, with fixes proposed upstream when practical.
- Separate plugin identity so it can coexist with Chesser (different plugin id and repo).
- Roadmap and issue tracking live here: https://github.com/RichLewis007/Chess-Move-Notes/issues

At the moment, core behavior is intended to match upstream as closely as possible while maintenance fixes land.

## Demonstration

![chesser_demo](https://raw.githubusercontent.com/SilentVoid13/Chesser/master/imgs/chesser_demo.gif)

## Usage

To use this plugin, create a `chess` code block in a note.

Example:

![chesser_block](imgs/chesser_block.png)

This will create a basic chess board in the start position.

You can declare settings inside the `chess` code block, like a FEN string to describe a particular board position. See the full settings list below.

## Settings

Here are the available settings for a `chess` code block:

| Name          | Possible Values                                  | Description                                                  |
| ------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| `fen`         | A valid FEN string                               | Starts the chess board with a particular position.           |
| `pgn`         | A valid PGN string formatted for YAML            | Loads the board with the moves from a PGN game.              |
| `orientation` | `white` / `black`                                | Orientation of the board.                                    |
| `pieceStyle`  | A valid piece style name. See: `assets/piece-css` | Style of the pieces on the board.                            |
| `boardStyle`  | A valid board style name. See: `assets/board-css` | Style of the chess board.                                    |
| `drawable`    | `true` / `false`                                 | Enable drawing annotations (arrows, circles) on the board.   |
| `viewOnly`    | `true` / `false`                                 | If enabled, displays a static chess board (no moves, no annotations). |
| `free`        | `true` / `false`                                 | If enabled, disables chess logic, all moves are valid.       |

You can permanently set some settings in the plugin settings.

## Localization (beta)

Chesser exposes a small localization hook for in-app Notice messages. You can override any default message key at runtime.

Message keys:

- `error.invalid_pgn`
- `error.invalid_fen`
- `error.render_failed`
- `error.update_failed`
- `error.replay_failed`
- `error.illegal_move`
- `error.opening_move_failed`

Call `setMessages` early (for example, in your plugin `onload`) before any boards render.

Example:

```ts
import { setMessages } from "./i18n";

setMessages({
  "error.invalid_fen": "Impossible de lire le FEN. Verifiez la chaine.",
});
```

### PGN formatting notes

PGN must be properly formatted as a multiline YAML string. Use `|` to indicate multiline, then indent the PGN lines by 2 or 4 spaces.

Example:

```yaml
pgn: |
  [Event "Mar del Plata"]
  [Site "Mar del Plata ARG"]
  [Date "1960.03.30"]

  1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4 g4 5. Ne5 Nf6 6. d4 d6
  7. Nd3 Nxe4 8. Bxf4 Bg7 9. Nc3 $6 Nxc3 10. bxc3 10... c5
  11. Be2 cxd4 12. O-O Nc6 13. Bxg4 O-O 14. Bxc8 Rxc8 15. Qg4 f5
  16. Qg3 dxc3 17. Rae1 Kh8 18. Kh1 Rg8 19. Bxd6 Bf8 20. Be5+
  Nxe5 21. Qxe5+ Rg7 22. Rxf5 Qxh4+ 23. Kg1 Qg4 24. Rf2 Be7
  25. Re4 Qg5 26. Qd4 Rf8 27. Re5 Rd8 28. Qe4 Qh4 29. Rf4 1-0
```

## Roadmap

Current priorities for this fork:
- Maintenance: fix bugs, update dependencies, improve compatibility (desktop and mobile)
- Small quality-of-life improvements that users request
- Evaluate PGN file support and other higher-scope features after stability improvements

Upstream TODO carried forward:
- [ ] Add PGN file support

## Installation

### Community plugins (if published)
After disabling Safe Mode, open Settings > Community plugins > Browse and search for "Chess Move Notes".

### Manual install
1. Download the latest release from this repo.
2. Copy the release folder into:
   - `<vault>/.obsidian/plugins/chess-move-notes/`
3. Ensure the folder contains at least:
   - `manifest.json`
   - `main.js`
   - `styles.css` (optional)
4. Enable the plugin in Settings > Community plugins.

## Alternatives

- [THeK3nger/obsidian-chessboard](https://github.com/THeK3nger/obsidian-chessboard)

## Contributing

Issues and pull requests are welcome.

If you are reporting a bug, please include:
- Obsidian version
- Platform (macOS, Windows, Linux, iOS, Android)
- Steps to reproduce
- A minimal example note (if possible)

## License

This project is licensed under the GNU AGPLv3 license. See [LICENSE](LICENSE.TXT).

## Support

### Support upstream
If you want to support the original author of Chesser, you can donate here:
- https://www.paypal.com/donate?hosted_button_id=U2SRGAFYXT32Q
