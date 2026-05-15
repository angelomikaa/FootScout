import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Label } from "./ui/label";

interface NewPlayerFieldsProps {
  register: UseFormRegister<any>;
  isVisible: boolean;
  errors: FieldErrors<any>;
}

const positionGroupOptions = ["GK", "DEF", "MID", "FWD"] as const;
const positionOptions = [
  "GK", "CB", "LB", "RB", "LWB", "RWB",
  "CDM", "CM", "CAM", "LM", "RM",
  "LW", "RW", "CF", "ST",
] as const;
const preferredFootOptions = ["left", "right", "both"] as const;

function FieldError({ message }: { message?: any }) {
  if (!message) return null;
  const text = typeof message === "string" ? message : message.message ?? "";
  if (!text) return null;
  return <p className="text-red-500 text-xs mt-1">{text}</p>;
}

export function NewPlayerFields({ register, isVisible, errors }: NewPlayerFieldsProps) {
  if (!isVisible) return null;

  return (
    <div className="border border-fm-accent/30 dark:border-fm-accent/40 rounded-lg bg-fm-accent/5 dark:bg-fm-accent/10 p-4 mt-4 space-y-3">
      <h3 className="text-sm font-semibold text-fm-accent">
        New Player Details
      </h3>

      <div>
        <Label htmlFor="playerName">Player name</Label>
        <Input
          id="playerName"
          type="text"
          {...register("playerName")}
          placeholder="Player name"
        />
        <FieldError message={errors.playerName?.message} />
      </div>

      <div>
        <Label htmlFor="playerDateOfBirth">Date of birth</Label>
        <Input
          id="playerDateOfBirth"
          type="date"
          {...register("playerDateOfBirth")}
        />
        <FieldError message={errors.playerDateOfBirth?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="playerPositionGroup">Position group</Label>
          <Select
            id="playerPositionGroup"
            {...register("playerPositionGroup")}
          >
            <option value="">Select...</option>
            {positionGroupOptions.map((pg) => (
              <option key={pg} value={pg}>{pg}</option>
            ))}
          </Select>
          <FieldError message={errors.playerPositionGroup?.message} />
        </div>

        <div>
          <Label htmlFor="playerPosition">Position</Label>
          <Select
            id="playerPosition"
            {...register("playerPosition")}
          >
            <option value="">Select...</option>
            {positionOptions.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </Select>
          <FieldError message={errors.playerPosition?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="playerClub">Club</Label>
        <Input
          id="playerClub"
          type="text"
          {...register("playerClub")}
          placeholder="Club"
        />
        <FieldError message={errors.playerClub?.message} />
      </div>

      <div>
        <Label htmlFor="playerNationality">Nationality</Label>
        <Input
          id="playerNationality"
          type="text"
          {...register("playerNationality")}
          placeholder="Country code (e.g., AR, ES)"
          maxLength={2}
        />
        <FieldError message={errors.playerNationality?.message} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="playerPreferredFoot">Preferred foot</Label>
          <Select
            id="playerPreferredFoot"
            {...register("playerPreferredFoot")}
          >
            <option value="">Select...</option>
            {preferredFootOptions.map((pf) => (
              <option key={pf} value={pf}>{pf}</option>
            ))}
          </Select>
          <FieldError message={errors.playerPreferredFoot?.message} />
        </div>

        <div>
          <Label htmlFor="playerHeight">Height (cm)</Label>
          <Input
            id="playerHeight"
            type="number"
            {...register("playerHeight", { valueAsNumber: true })}
            placeholder="Height (cm)"
          />
          <FieldError message={errors.playerHeight?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="playerWeight">Weight (kg)</Label>
        <Input
          id="playerWeight"
          type="number"
          {...register("playerWeight", { valueAsNumber: true })}
          placeholder="Weight (kg)"
        />
        <FieldError message={errors.playerWeight?.message} />
      </div>
    </div>
  );
}
