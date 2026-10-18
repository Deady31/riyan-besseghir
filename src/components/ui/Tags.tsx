export function Tags({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <li key={s} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-mist">
          {s}
        </li>
      ))}
    </ul>
  )
}
