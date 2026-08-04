import { Card } from "./ui.jsx";

export default function MindMap({ data }) {
  if (!data?.centro) return null;
  return (
    <Card className="p-6 overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="mb-5">
          <span className="inline-block bg-tinta text-white font-display font-semibold px-4 py-2 rounded-xl text-sm">
            {data.centro}
          </span>
        </div>
        <div className="space-y-4 pl-3 border-l-2 border-tintaSoft">
          {(data.ramas || []).map((r, i) => (
            <Branch key={i} rama={r} depth={0} />
          ))}
        </div>
      </div>
    </Card>
  );
}

function Branch({ rama, depth }) {
  const color = depth === 0 ? "text-tinta" : "text-oro";
  return (
    <div className="pl-4 relative">
      <span className="absolute -left-[7px] top-2 w-3 h-[2px] bg-tintaSoft" />
      <div className={`font-display font-semibold text-sm ${color}`}>{rama.titulo}</div>
      {rama.puntos?.length > 0 && (
        <ul className="mt-1 space-y-0.5">
          {rama.puntos.map((p, i) => (
            <li key={i} className="text-sm text-ink/75 flex gap-2">
              <span className="text-oro">•</span> {p}
            </li>
          ))}
        </ul>
      )}
      {rama.ramas?.length > 0 && (
        <div className="mt-2 ml-2 space-y-2 border-l border-line pl-2">
          {rama.ramas.map((sr, i) => <Branch key={i} rama={sr} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}
