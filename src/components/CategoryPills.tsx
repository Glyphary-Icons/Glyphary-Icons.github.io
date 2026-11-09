import { labelFor } from "../lib/text";

const VISIBLE_LIMIT = 3;

interface CategoryPillsProps {
  categories: string[];
}

/**
 * One pill per category, capped so headers and cards stay compact. The joined
 * string used previously overflowed its fixed-height pill on sets with many
 * categories (pride flags, Phosphor, Pixel Icon Library).
 */
export function CategoryPills({ categories }: CategoryPillsProps) {
  if (categories.length <= 1) return null;

  const shown = categories.slice(0, VISIBLE_LIMIT);
  const hidden = categories.length - shown.length;

  return (
    <>
      {shown.map((category) => (
        <span className="chip" key={category}>
          {labelFor(category)}
        </span>
      ))}
      {hidden > 0 && (
        <span className="chip chip-muted" title={categories.map(labelFor).join(", ")}>
          +{hidden} more
        </span>
      )}
    </>
  );
}
