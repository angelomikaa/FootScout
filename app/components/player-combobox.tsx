import { useState, useEffect, useRef } from "react";
import { Controller, type Control } from "react-hook-form";
import clsx from "clsx";
import type { Player } from "~/data/types";
import type { ReportFormValues } from "~/data/form-schema";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface PlayerComboboxProps {
  players: Player[];
  control: Control<ReportFormValues>;
  onSelectNew: (searchText: string) => void;
  initialDisplayName?: string;
}

export function PlayerCombobox({
  players,
  control,
  onSelectNew,
  initialDisplayName,
}: PlayerComboboxProps) {
  const [inputValue, setInputValue] = useState(initialDisplayName ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const comboboxRef = useRef<HTMLDivElement>(null);

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(inputValue.toLowerCase())
  );
  const noMatch = inputValue.length > 0 && filteredPlayers.length === 0;

  useEffect(() => {
    if (initialDisplayName) {
      setInputValue(initialDisplayName);
    }
  }, [initialDisplayName]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Controller
      name="playerId"
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div ref={comboboxRef} className="relative">
          <Label htmlFor="player-search">Jogador</Label>
          <Input
            id="player-search"
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="player-listbox"
            aria-activedescendant={
              activeIndex >= 0 && filteredPlayers[activeIndex]
                ? `player-option-${filteredPlayers[activeIndex].id}`
                : undefined
            }
            placeholder="Buscar jogador pelo nome..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
              if (value) {
                onChange("");
              }
            }}
            onFocus={() => {
              if (inputValue.length > 0 || players.length > 0) {
                setIsOpen(true);
              }
            }}
            onKeyDown={(e) => {
              const totalItems = filteredPlayers.length + (noMatch ? 1 : 0);
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((prev) => Math.min(prev + 1, totalItems - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((prev) => Math.max(prev - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < filteredPlayers.length) {
                  const player = filteredPlayers[activeIndex];
                  onChange(player.id);
                  setInputValue(player.name);
                  setIsOpen(false);
                } else if (activeIndex >= filteredPlayers.length && noMatch) {
                  onSelectNew(inputValue);
                }
              } else if (e.key === "Escape") {
                setIsOpen(false);
                setActiveIndex(-1);
              }
            }}
          />

          {isOpen && (filteredPlayers.length > 0 || noMatch) && (
            <ul
              id="player-listbox"
              role="listbox"
              className="absolute z-10 w-full mt-1 bg-white dark:bg-fm-card border border-gray-200 dark:border-fm-border rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              {filteredPlayers.map((player, index) => (
                <li
                  key={player.id}
                  id={`player-option-${player.id}`}
                  role="option"
                  aria-selected={value === player.id}
                  className={clsx(
                    "px-3 py-2 cursor-pointer text-sm",
                    index === activeIndex
                      ? "bg-fm-accent/10 text-fm-accent dark:bg-fm-accent/20 dark:text-fm-accent"
                      : "text-gray-700 dark:text-fm-label hover:bg-gray-50 dark:hover:bg-fm-card-alt"
                  )}
                  onClick={() => {
                    onChange(player.id);
                    setInputValue(player.name);
                    setIsOpen(false);
                    setActiveIndex(-1);
                  }}
                >
                  {player.name} — {player.club}
                </li>
              ))}
              {noMatch && (
                <li
                  className={clsx(
                    "px-3 py-2 cursor-pointer text-sm text-fm-accent dark:text-fm-accent",
                    activeIndex === filteredPlayers.length
                      ? "bg-fm-accent/10 dark:bg-fm-accent/20"
                      : "hover:bg-fm-accent/10 dark:hover:bg-fm-accent/20"
                  )}
                  onClick={() => onSelectNew(inputValue)}
                >
                  Criar &ldquo;{inputValue}&rdquo; como novo jogador
                </li>
              )}
            </ul>
          )}
          {error && (
            <p className="text-red-500 text-xs mt-1">{error.message}</p>
          )}
        </div>
      )}
    />
  );
}
