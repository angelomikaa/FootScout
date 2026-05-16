import { useSearchParams } from "react-router";
import { ATTRIBUTE_KEYS } from "~/lib/scoring/player-average";

const ATTRIBUTE_SHORT: Record<string, string> = {
  pace: "VEL",
  strength: "FOR",
  stamina: "RES",
  agility: "AGI",
  finishing: "FIN",
  passing: "PAS",
  dribbling: "DRI",
  firstTouch: "PTo",
  positioning: "POS",
  awareness: "CON",
  decisionMaking: "DEC",
  workRate: "EMP",
};

const ATTRIBUTE_FULL: Record<string, string> = {
  pace: "Velocidade",
  strength: "Força",
  stamina: "Resistência",
  agility: "Agilidade",
  finishing: "Finalização",
  passing: "Passe",
  dribbling: "Drible",
  firstTouch: "Primeiro Toque",
  positioning: "Posicionamento",
  awareness: "Consciência",
  decisionMaking: "Decisão",
  workRate: "Empenho",
};

const CATEGORIES = [
  {
    label: "Físico",
    keys: ["pace", "strength", "stamina", "agility"] as const,
  },
  {
    label: "Técnico",
    keys: ["finishing", "passing", "dribbling", "firstTouch"] as const,
  },
  {
    label: "Tático",
    keys: ["positioning", "awareness", "decisionMaking", "workRate"] as const,
  },
];

interface AttributeToggleProps {
  boostedAttrs: string[];
}

export function AttributeToggle({ boostedAttrs }: AttributeToggleProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const boostedSet = new Set(boostedAttrs);

  const handleToggle = (key: string) => {
    setSearchParams((prev) => {
      const current = prev.get("w")
        ? prev.get("w")!.split(",").map((k) => k.trim())
        : [];
      const isCurrentlyBoosted = current.includes(key);
      const next = isCurrentlyBoosted
        ? current.filter((k) => k !== key)
        : [...current, key];
      const newParams = new URLSearchParams(prev);
      if (next.length > 0) {
        newParams.set("w", next.join(","));
      } else {
        newParams.delete("w");
      }
      return newParams;
    });
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.flatMap((cat) =>
          cat.keys.map((key) => {
            const isActive = boostedSet.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleToggle(key)}
                className={`
                  inline-flex items-center gap-1.5 select-none rounded-full px-3 py-1 text-xs font-semibold
                  transition-all duration-150 border
                  ${
                    isActive
                      ? "bg-fm-accent text-white border-fm-accent"
                      : "bg-white dark:bg-fm-card-alt text-gray-500 dark:text-fm-label border-gray-200 dark:border-fm-border hover:border-gray-300 dark:hover:border-fm-text-muted"
                  }
                `}
              >
                {isActive ? ATTRIBUTE_FULL[key] : ATTRIBUTE_SHORT[key]}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
