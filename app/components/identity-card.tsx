import type { Player } from "~/data/types";
import { getFlagEmoji } from "./attribute-grid";

export interface IdentityCardProps {
  player: Player;
}

function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

const FOOT_LABELS: Record<string, string> = {
  left: "Esquerdo",
  right: "Direito",
  both: "Ambos",
};

function capitalizeFoot(foot: string): string {
  return FOOT_LABELS[foot] ?? foot;
}

export function IdentityCard({ player }: IdentityCardProps) {
  const age = calculateAge(player.dateOfBirth);

  return (
    <div className="bg-gray-50 dark:bg-fm-card rounded-lg border border-gray-200 dark:border-fm-border p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-fm-text">
        {player.name}
      </h2>

      <div className="flex items-center gap-2 mt-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-fm-card-alt dark:text-fm-label">
          {player.positionGroup}
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-fm-accent/10 text-fm-accent dark:bg-fm-accent/20">
          {player.position}
        </span>
      </div>

      <p className="text-gray-600 dark:text-fm-label text-sm mt-2">
        {player.club}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
        <DetailItem
          label="Nacionalidade"
          value={`${getFlagEmoji(player.nationality)} ${player.nationality}`}
        />
        <DetailItem
          label="Data de Nascimento"
          value={`${player.dateOfBirth} (${age} anos)`}
        />
        <DetailItem label="Pé Preferido" value={capitalizeFoot(player.preferredFoot)} />
        {player.height !== undefined && (
          <DetailItem label="Altura" value={`${player.height} cm`} />
        )}
        {player.weight !== undefined && (
          <DetailItem label="Peso" value={`${player.weight} kg`} />
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-fm-text-muted uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-900 dark:text-fm-text mt-1">
        {value}
      </p>
    </div>
  );
}
