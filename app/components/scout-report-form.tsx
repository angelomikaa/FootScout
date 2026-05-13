import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSubmit, useNavigation, useFetcher } from "react-router";
import clsx from "clsx";
import type { Player, Scout, Report } from "~/data/types";
import {
reportFormSchema,
type ReportFormValues,
STEP_FIELDS,
STEP_LABELS,
TOTAL_STEPS,
} from "~/data/form-schema";
import { StepIndicator } from "./step-indicator";
import { AttributeRatingRow } from "./attribute-rating-row";
import { PlayerCombobox } from "./player-combobox";
import { NewPlayerFields } from "./new-player-fields";
import { DraftBanner } from "./draft-banner";

interface ScoutReportFormProps {
players: Player[];
scouts: Scout[];
draft: Report | null;
}

const physicalAttributes = [
  { name: "physical.pace" as const, label: "Pace" },
  { name: "physical.strength" as const, label: "Strength" },
  { name: "physical.stamina" as const, label: "Stamina" },
  { name: "physical.agility" as const, label: "Agility" },
];

const technicalAttributes = [
  { name: "technical.finishing" as const, label: "Finishing" },
  { name: "technical.passing" as const, label: "Passing" },
  { name: "technical.dribbling" as const, label: "Dribbling" },
  { name: "technical.firstTouch" as const, label: "First Touch" },
];

const tacticalAttributes = [
  { name: "tactical.positioning" as const, label: "Positioning" },
  { name: "tactical.awareness" as const, label: "Awareness" },
  { name: "tactical.decisionMaking" as const, label: "Decision Making" },
  { name: "tactical.workRate" as const, label: "Work Rate" },
];

const matchNotesAttributes = [
  { name: "matchNotes.attitude" as const, label: "Attitude" },
  { name: "matchNotes.coachability" as const, label: "Coachability" },
  { name: "matchNotes.intensity" as const, label: "Intensity" },
  { name: "matchNotes.impact" as const, label: "Impact" },
];

export function ScoutReportForm({ players, scouts, draft }: ScoutReportFormProps) {
const fetcher = useFetcher();
const [currentStep, setCurrentStep] = useState(draft?.currentStep || 0);
const [hasResumed, setHasResumed] = useState(false);
const [hasResumedForAutoSave, setHasResumedForAutoSave] = useState(false);

// Draft resume: compute initial values from draft
const draftInitialValues = useMemo(() => {
if (draft && !hasResumed) {
return {
isNewPlayer: false,
playerId: draft.playerId || "",
scoutId: draft.scoutId || "",
matchDate: draft.matchDate || "",
opponent: draft.opponent || "",
competition: draft.competition || "",
matchResult: draft.matchResult || "",
physical: draft.physical || { pace: null, strength: null, stamina: null, agility: null },
technical: draft.technical || { finishing: null, passing: null, dribbling: null, firstTouch: null },
tactical: draft.tactical || { positioning: null, awareness: null, decisionMaking: null, workRate: null },
matchNotes: draft.matchNotes || { attitude: null, coachability: null, intensity: null, impact: null, notes: "" },
};
}
return null;
}, [draft, hasResumed]);

const form = useForm<ReportFormValues>({
resolver: zodResolver(reportFormSchema),
defaultValues: (draftInitialValues || {
isNewPlayer: false,
playerId: "",
scoutId: "",
matchDate: "",
opponent: "",
competition: "",
matchResult: "",
physical: { pace: null, strength: null, stamina: null, agility: null },
technical: { finishing: null, passing: null, dribbling: null, firstTouch: null },
tactical: { positioning: null, awareness: null, decisionMaking: null, workRate: null },
matchNotes: { attitude: null, coachability: null, intensity: null, impact: null, notes: "" },
}) as any,
});

const { register, control, watch, setValue, formState: { errors }, trigger, clearErrors, handleSubmit } = form;

const isNewPlayer = watch("isNewPlayer");
const navigation = useNavigation();
const isSubmitting = navigation.state === "submitting";
const submit = useSubmit();

// Mark as resumed when draft exists
useEffect(() => {
if (draft && !hasResumed) {
setHasResumed(true);
setHasResumedForAutoSave(true);
}
}, [draft]);

// Auto-save on step change
useEffect(() => {
if (hasResumedForAutoSave && currentStep > 0) {
const formData = new FormData();
formData.append("intent", "save-draft");
formData.append("currentStep", String(currentStep));
// Add all current form values
const values = form.getValues();
// playerId only exists when isNewPlayer is false
if (!values.isNewPlayer && values.playerId) formData.append("playerId", values.playerId);
if (values.scoutId) formData.append("scoutId", values.scoutId);
if (values.matchDate) formData.append("matchDate", values.matchDate);
if (values.opponent) formData.append("opponent", values.opponent);
if (values.competition) formData.append("competition", values.competition);
if (values.matchResult) formData.append("matchResult", values.matchResult);

// Add physical attributes
if (values.physical) {
Object.entries(values.physical).forEach(([key, value]) => {
if (value !== null && value !== undefined) {
formData.append(`physical.${key}`, String(value));
}
});
}
// Add technical attributes
if (values.technical) {
Object.entries(values.technical).forEach(([key, value]) => {
if (value !== null && value !== undefined) {
formData.append(`technical.${key}`, String(value));
}
});
}
// Add tactical attributes
if (values.tactical) {
Object.entries(values.tactical).forEach(([key, value]) => {
if (value !== null && value !== undefined) {
formData.append(`tactical.${key}`, String(value));
}
});
}
// Add match notes
if (values.matchNotes) {
Object.entries(values.matchNotes).forEach(([key, value]) => {
if (value !== null && value !== undefined) {
formData.append(`matchNotes.${key}`, String(value));
}
});
}

fetcher.submit(formData, { method: "POST", action: "/scout/report" });
}
}, [currentStep, hasResumedForAutoSave]);

const handleDiscardDraft = () => {
setHasResumed(false);
setHasResumedForAutoSave(false);
// Clear form
form.reset();
};

const handleResumeDraft = () => {
// Form already has defaultValues, just ensure step is set
setCurrentStep(draft?.currentStep || 0);
setHasResumed(true);
};

const handleNext = async () => {
if (currentStep === 0) {
if (isNewPlayer) {
const playerValid = await trigger([
"playerName", "playerDateOfBirth", "playerPositionGroup",
"playerPosition", "playerClub", "playerNationality", "playerPreferredFoot",
] as any);
if (!playerValid) return;
} else {
const playerValid = await trigger("playerId" as any);
if (!playerValid) return;
}
const scoutValid = await trigger("scoutId" as any);
if (scoutValid) {
setHasResumedForAutoSave(true);
setCurrentStep(1);
}
return;
}

const fieldsToValidate = STEP_FIELDS[currentStep as 0 | 1 | 2 | 3 | 4];
const isValid = await trigger(fieldsToValidate as any);
if (isValid) {
setHasResumedForAutoSave(true);
setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
}
};

  const handleBack = () => {
    clearErrors();
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSelectNew = (searchText: string) => {
    setValue("isNewPlayer" as any, true);
    setValue("playerName" as any, searchText);
  };

  const handleSelectExisting = () => {
    setValue("isNewPlayer" as any, false);
    setValue("playerName" as any, "");
    setValue("playerDateOfBirth" as any, "");
    setValue("playerPositionGroup" as any, "");
    setValue("playerPosition" as any, "");
    setValue("playerClub" as any, "");
    setValue("playerNationality" as any, "");
    setValue("playerPreferredFoot" as any, "");
    setValue("playerHeight" as any, undefined);
    setValue("playerWeight" as any, undefined);
  };

  const onValidSubmit = (data: ReportFormValues) => {
    const formData = new FormData();
    formData.append("intent", data.isNewPlayer ? "create-player-and-report" : "create-report");

    formData.append("scoutId", data.scoutId);
    formData.append("matchDate", data.matchDate);
    formData.append("opponent", data.opponent);
    formData.append("competition", data.competition);
    if (data.matchResult) formData.append("matchResult", data.matchResult);

    if (data.isNewPlayer) {
      formData.append("playerName", data.playerName);
      formData.append("playerDateOfBirth", data.playerDateOfBirth);
      formData.append("playerPositionGroup", data.playerPositionGroup);
      formData.append("playerPosition", data.playerPosition);
      formData.append("playerClub", data.playerClub);
      formData.append("playerNationality", data.playerNationality);
      formData.append("playerPreferredFoot", data.playerPreferredFoot);
      if (data.playerHeight) formData.append("playerHeight", String(data.playerHeight));
      if (data.playerWeight) formData.append("playerWeight", String(data.playerWeight));
    } else {
      formData.append("playerId", data.playerId);
    }

    for (const [key, value] of Object.entries(data.physical)) {
      formData.append(`physical.${key}`, String(value ?? "null"));
    }
    for (const [key, value] of Object.entries(data.technical)) {
      formData.append(`technical.${key}`, String(value ?? "null"));
    }
    for (const [key, value] of Object.entries(data.tactical)) {
      formData.append(`tactical.${key}`, String(value ?? "null"));
    }
    for (const [key, value] of Object.entries(data.matchNotes)) {
      if (key === "notes") {
        if (value) formData.append(`matchNotes.${key}`, String(value));
      } else {
        formData.append(`matchNotes.${key}`, String(value ?? "null"));
      }
    }

    submit(formData, { method: "post" });
  };

const selectedPlayerId = watch("playerId");
const initialDisplayName = selectedPlayerId
? players.find((p) => p.id === selectedPlayerId)?.name ?? ""
: "";

// Get player name for draft banner
const draftPlayerName = draft?.playerId
? players.find((p) => p.id === draft.playerId)?.name ?? "Unknown Player"
: "Unknown Player";

return (
<main className="pt-8 pb-8 container mx-auto max-w-xl px-4">
<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
Scout Report
</h1>

{draft && !hasResumed && (
<DraftBanner
draft={draft}
playerName={draftPlayerName}
onDiscard={handleDiscardDraft}
onResume={handleResumeDraft}
/>
)}

<StepIndicator currentStep={currentStep} steps={STEP_LABELS} totalSteps={TOTAL_STEPS} />

<div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-2">
        {currentStep === 0 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="scoutId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Scout
              </label>
              <select
                id="scoutId"
                {...register("scoutId")}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select scout...</option>
                {scouts.map((scout) => (
                  <option key={scout.id} value={scout.id}>{scout.name}</option>
                ))}
              </select>
              {errors.scoutId && (
                <p className="text-red-500 text-xs mt-1">{errors.scoutId.message}</p>
              )}
            </div>

            {!isNewPlayer && (
              <PlayerCombobox
                players={players}
                control={control}
                onSelectNew={handleSelectNew}
                initialDisplayName={initialDisplayName}
              />
            )}

            {isNewPlayer && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Creating new player</span>
                <button
                  type="button"
                  onClick={handleSelectExisting}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  Select existing instead
                </button>
              </div>
            )}

            <NewPlayerFields
              register={register as any}
              isVisible={isNewPlayer}
              errors={errors as any}
            />
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-1">
            {physicalAttributes.map((attr) => (
              <AttributeRatingRow
                key={attr.name}
                name={attr.name as any}
                label={attr.label}
                control={control as any}
              />
            ))}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-1">
            {technicalAttributes.map((attr) => (
              <AttributeRatingRow
                key={attr.name}
                name={attr.name as any}
                label={attr.label}
                control={control as any}
              />
            ))}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-1">
            {tacticalAttributes.map((attr) => (
              <AttributeRatingRow
                key={attr.name}
                name={attr.name as any}
                label={attr.label}
                control={control as any}
              />
            ))}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="space-y-1">
              {matchNotesAttributes.map((attr) => (
                <AttributeRatingRow
                  key={attr.name}
                  name={attr.name as any}
                  label={attr.label}
                  control={control as any}
                />
              ))}
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label htmlFor="matchDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Match date
                </label>
                <input
                  id="matchDate"
                  type="date"
                  {...register("matchDate")}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.matchDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.matchDate.message as string}</p>
                )}
              </div>

              <div>
                <label htmlFor="opponent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Opponent
                </label>
                <input
                  id="opponent"
                  type="text"
                  {...register("opponent")}
                  placeholder="Opponent team"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.opponent && (
                  <p className="text-red-500 text-xs mt-1">{errors.opponent.message as string}</p>
                )}
              </div>

              <div>
                <label htmlFor="competition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Competition
                </label>
                <input
                  id="competition"
                  type="text"
                  {...register("competition")}
                  placeholder="Competition name"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.competition && (
                  <p className="text-red-500 text-xs mt-1">{errors.competition.message as string}</p>
                )}
              </div>

              <div>
                <label htmlFor="matchResult" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Match result <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  id="matchResult"
                  type="text"
                  {...register("matchResult")}
                  placeholder="e.g., 2-1"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="matchNotes.notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="matchNotes.notes"
                  {...register("matchNotes.notes")}
                  rows={3}
                  placeholder="Additional observations..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {currentStep < TOTAL_STEPS - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Next
          </button>
        ) : (
<button
type="button"
onClick={handleSubmit(onValidSubmit)}
disabled={isSubmitting}
className={clsx(
"px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm",
isSubmitting
? "bg-blue-400 cursor-not-allowed"
: "bg-blue-600 hover:bg-blue-700"
)}
>
{isSubmitting ? "Submitting..." : "Submit Report"}
</button>
)
}

{/* Draft saved indicator */}
{fetcher.state === "idle" && fetcher.data?.success && (
<div className="text-sm text-green-600 mt-2">Draft saved</div>
)}
</div>
</main>
);
}
