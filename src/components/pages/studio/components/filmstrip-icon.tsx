/**
 * A plain gold strip of film: three frame windows between two rows of sprocket
 * holes. Windows and holes are cut out (evenodd) rather than painted, so
 * whatever sits behind the glyph shows through them.
 *
 * Shared by the flow builder's rendered-transition marker and the action
 * studio's combination grid, where it stands in for the clip a cell will
 * produce.
 */
export function FilmstripIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 28) / 36}
      viewBox="0 0 36 28"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M2.5 0H33.5A2.5 2.5 0 0 1 36 2.5V25.5A2.5 2.5 0 0 1 33.5 28H2.5A2.5 2.5 0 0 1 0 25.5V2.5A2.5 2.5 0 0 1 2.5 0Z
           M1.75 2.5h2.5v2.5h-2.5Z M7.75 2.5h2.5v2.5h-2.5Z M13.75 2.5h2.5v2.5h-2.5Z
           M19.75 2.5h2.5v2.5h-2.5Z M25.75 2.5h2.5v2.5h-2.5Z M31.75 2.5h2.5v2.5h-2.5Z
           M1.5 7h10v14h-10Z M13 7h10v14h-10Z M24.5 7h10v14h-10Z
           M1.75 23h2.5v2.5h-2.5Z M7.75 23h2.5v2.5h-2.5Z M13.75 23h2.5v2.5h-2.5Z
           M19.75 23h2.5v2.5h-2.5Z M25.75 23h2.5v2.5h-2.5Z M31.75 23h2.5v2.5h-2.5Z"
      />
    </svg>
  );
}
