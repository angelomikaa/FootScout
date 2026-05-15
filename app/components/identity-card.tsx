/**
 * identity-card.tsx — Player identity information card
 *
 * Displays all player identity fields: name, position group + specific,
 * club, nationality (flag emoji + ISO code), DOB + age, preferred foot,
 * height, and weight.
 */

import type { Player } from "~/data/types";
import { getFlagEmoji } from "./attribute-grid";

// —— Props ——

export interface IdentityCardProps {
  player: Player;
}

// —— Helpers ——

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

function capitalizeFoot(foot: string): string {
  return foot.charAt(0).toUpperCase() + foot.slice(1);
}

// —— Component ——

export function IdentityCard({ player }: IdentityCardProps) {
  const age = calculateAge(player.dateOfBirth);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm p-6">
      {/* Player name */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        {player.name}
      </h2>

      {/* Position badges */}
      <div className="flex items-center gap-2 mt-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          {player.positionGroup}
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
          {player.position}
        </span>
      </div>

      {/* Club */}
      <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
        {player.club}
      </p>

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
        {/* Nationality */}
        <DetailItem
          label="Nationality"
          value={`${getFlagEmoji(player.nationality)} ${player.nationality}`}
        />

        {/* Date of Birth */}
        <DetailItem
          label="Date of Birth"
          value={`${player.dateOfBirth} (${age} years old)`}
        />

        {/* Preferred Foot */}
        <DetailItem label="Preferred Foot" value={capitalizeFoot(player.preferredFoot)} />

        {/* Height (optional) */}
        {player.height !== undefined && (
          <DetailItem label="Height" value={`${player.height} cm`} />
        )}

        {/* Weight (optional) */}
        {player.weight !== undefined && (
          <DetailItem label="Weight" value={`${player.weight} kg`} />
        )}
      </div>
    </div>
  );
}

// —— Internal sub-component ——

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
        {value}
      </p>
    </div>
  );
}
