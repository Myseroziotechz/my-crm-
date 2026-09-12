"use client";

import { useState } from "react";
import { Phone, PhoneOff, Clock, RotateCcw, Ban } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField, Textarea } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";
import { CALL_STATUSES, INTEREST_LEVELS } from "@/lib/constants";
import type { CallStatus, InterestLevel } from "@/lib/types";

const STATUS_ICON: Record<CallStatus, typeof Phone> = {
  Answered: Phone,
  "No Answer": PhoneOff,
  Busy: Clock,
  "Call Back": RotateCcw,
  "Wrong Number": Ban,
};

const STATUS_ACCENT: Record<CallStatus, string> = {
  Answered: "border-emerald-500 bg-emerald-50 text-emerald-700",
  "No Answer": "border-ink-400 bg-ink-50 text-ink-700",
  Busy: "border-amber-500 bg-amber-50 text-amber-700",
  "Call Back": "border-sky-500 bg-sky-50 text-sky-700",
  "Wrong Number": "border-rose-500 bg-rose-50 text-rose-700",
};

interface Props {
  open: boolean;
  onClose: () => void;
  companyName?: string;
  contactName?: string;
  onSave?: (result: {
    status: CallStatus;
    interest: InterestLevel | null;
    remarks: string;
    nextDate?: string;
    nextTime?: string;
  }) => void;
}

export function CallResultModal({
  open,
  onClose,
  companyName = "ABC Hospital",
  contactName = "Ramesh Kumar",
  onSave,
}: Props) {
  const [status, setStatus] = useState<CallStatus | null>(null);
  const [interest, setInterest] = useState<InterestLevel | null>(null);
  const [remarks, setRemarks] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setStatus(null);
    setInterest(null);
    setRemarks("");
    setNextDate("");
    setNextTime("");
    setError("");
  };

  const showInterest = status === "Answered";
  const showSchedule =
    status === "Call Back" ||
    (status === "Answered" &&
      interest !== null &&
      interest !== "Not Interested");

  const handleSave = () => {
    if (!status) {
      setError("Select a call status to continue.");
      return;
    }
    if (showSchedule && (!nextDate || !nextTime)) {
      setError("Set the next follow-up date and time.");
      return;
    }
    onSave?.({ status, interest, remarks, nextDate, nextTime });
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Record Call Result"
      description={`${companyName} · ${contactName}`}
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} icon={Phone}>
            Save Call
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <FormField label="Call Status" required>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CALL_STATUSES.map((s) => {
              const Icon = STATUS_ICON[s];
              const selected = status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatus(s);
                    setError("");
                    if (s !== "Answered") setInterest(null);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors",
                    selected
                      ? STATUS_ACCENT[s]
                      : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {s}
                </button>
              );
            })}
          </div>
        </FormField>

        {showInterest && (
          <FormField label="Interest Level" required className="animate-fade-in">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {INTEREST_LEVELS.map((lvl) => {
                const selected = interest === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setInterest(lvl)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                      selected
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50",
                    )}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </FormField>
        )}

        {status && (
          <FormField label="Remarks" className="animate-fade-in">
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Summarise the conversation, objections and next steps…"
            />
          </FormField>
        )}

        {showSchedule && (
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-sky-200 bg-sky-50/60 p-3 animate-fade-in sm:grid-cols-2">
            <FormField label="Next Follow-up Date" required>
              <input
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="h-10 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </FormField>
            <FormField label="Next Follow-up Time" required>
              <input
                type="time"
                value={nextTime}
                onChange={(e) => setNextTime(e.target.value)}
                className="h-10 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </FormField>
          </div>
        )}

        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
