interface IconGlyphProps {
  svg: string;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
}

/** Renders a trusted, pre-normalized SVG string from a bundled icon manifest. */
export function IconGlyph({ svg, size = 24, width, height, className }: IconGlyphProps) {
  return (
    <span
      className={className ? `glyph ${className}` : "glyph"}
      style={{ width: width ?? size, height: height ?? size, overflow: "hidden" }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
