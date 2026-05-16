import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import type { Player } from "~/data/types";

interface PlayerSelectorProps {
  players: Player[];
  value: Player | null;
  onChange: (player: Player | null) => void;
  placeholder?: string;
}

export function PlayerSelector({ players, value, onChange, placeholder = "Buscar jogador..." }: PlayerSelectorProps) {
  const [inputValue, setInputValue] = useState(value?.name ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setInputValue(value.name);
    } else {
      setInputValue("");
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (player: Player) => {
    onChange(player);
    setInputValue(player.name);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    onChange(null);
    setInputValue("");
    setIsOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
            if (value) {
              onChange(null);
            }
          }}
          onFocus={() => {
            if (players.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((prev) => Math.min(prev + 1, filteredPlayers.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (activeIndex >= 0 && activeIndex < filteredPlayers.length) {
                handleSelect(filteredPlayers[activeIndex]);
              }
            } else if (e.key === "Escape") {
              setIsOpen(false);
              setActiveIndex(-1);
            }
          }}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-fm-card-alt border border-gray-300 dark:border-fm-border rounded-lg text-gray-900 dark:text-fm-text placeholder-gray-400 dark:placeholder-fm-text-muted focus:outline-none focus:ring-2 focus:ring-fm-accent focus:border-transparent"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-fm-label hover:bg-gray-100 dark:hover:bg-fm-border transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && filteredPlayers.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-10 w-full mt-1 bg-white dark:bg-fm-card border border-gray-200 dark:border-fm-border rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredPlayers.map((player, index) => (
            <li
              key={player.id}
              role="option"
              aria-selected={value?.id === player.id}
              className={clsx(
                "px-3 py-2 cursor-pointer text-sm",
                value?.id === player.id
                  ? "bg-fm-accent/10 text-fm-accent dark:bg-fm-accent/20 dark:text-fm-accent"
                  : index === activeIndex
                    ? "bg-fm-accent/10 text-fm-accent dark:bg-fm-accent/20 dark:text-fm-accent"
                    : "text-gray-700 dark:text-fm-label hover:bg-gray-50 dark:hover:bg-fm-card-alt"
              )}
              onClick={() => handleSelect(player)}
            >
              {player.name} — {player.position} · {player.club}
            </li>
          ))}
        </ul>
      )}

      {isOpen && inputValue.length > 0 && filteredPlayers.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-fm-card border border-gray-200 dark:border-fm-border rounded-lg shadow-lg px-3 py-4 text-sm text-gray-500 dark:text-fm-text-secondary text-center">
          Nenhum jogador encontrado
        </div>
      )}
    </div>
  );
}
