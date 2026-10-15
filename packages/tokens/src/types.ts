/** CSS custom property names without the leading `--`, mapped to their values. */
export type TokenMap = Readonly<Record<string, string>>;

export interface ThemeDefinition {
  /** Value of the `data-theme` attribute that selects this theme. */
  readonly name: string;
  readonly label: string;
  /** Mode-independent tokens: radii, fonts. */
  readonly base: TokenMap;
  /** Light-mode colours, surfaces and shadows. */
  readonly light: TokenMap;
  /** Dark-mode overrides. Must define exactly the keys `light` defines. */
  readonly dark: TokenMap;
}
