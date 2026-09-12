"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField, Select, Textarea } from "@/components/ui/FormField";
import { createFollowUp } from "@/app/followups/actions";
import type { EmployeeOption, LeadOption } from "@/lib/supabase/queries";

const REASONS = [
  "Send proposal document",
  "Confirm budget approval",
  "Product demo call",
  "Discuss contract terms",
  "Follow up on brochure",
  "Share pricing breakdown",
  "Check decision timeline",
];

interface Props {
  open: boolean;
  onClose: () => void;
  /** Known lead context — hides the lead picker. */
  leadId?: string;
  companyName?: string;
  contactName?: string;
  /** Leads to choose from when leadId isn't already known. */
  leadOptions?: LeadOption[];
  employees: EmployeeOption[];
  /** Called after a successful save, so the caller can refresh server data. */
  onSaved?: () => void;
}

export function AddFollowUpModal({
  open,
  onClose,
  leadId,
  companyName,
  contactName,
  leadOptions,
  employees,
  onSaved,
}: Props) {
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const effectiveLeadId = leadId ?? selectedLeadId;

  const reset = () => {
    setSelectedLeadId("");
    setDate("");
    setTime("");
    setReason(REASONS[0]);
    setNotes("");
    setError("");
  };

  const save = async () => {
    if (!effectiveLeadId) {
      setError("Select a lead.");
      return;
    }
    if (!date || !time) {
      setError("Date and time are required.");
      return;
    }
    setSaving(true);
    setError("");
    const result = await createFollowUp({
      leadId: effectiveLeadId,
      employeeId,
      date,
      time,
      reason,
      notes,
    });
    setSaving(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    reset();
    onClose();
    onSaved?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule Follow-up"
      description={
        companyName ? `${companyName} · ${contactName}` : "Add a follow-up task"
      }
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button icon={CalendarClock} onClick={save} disabled={saving}>
            {saving ? "Scheduling…" : "Schedule"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {!leadId && (
          <FormField label="Lead" required>
            <Select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
            >
              <option value="">Select a lead</option>
              {(leadOptions ?? []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.companyName} — {l.contactName}
                </option>
              ))}
            </Select>
          </FormField>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Follow-up Date" required>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </FormField>
          <FormField label="Time" required>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-10 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </FormField>
        </div>
        <FormField label="Reason">
          <Select value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Assigned Employee">
          <Select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Notes">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional context for the follow-up…"
          />
        </FormField>
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
