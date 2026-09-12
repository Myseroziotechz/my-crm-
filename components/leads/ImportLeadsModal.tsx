"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import {
  UploadCloud,
  FileSpreadsheet,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";
import { importLeads, type ImportRow, type ImportSummary } from "@/app/leads/actions";

const STEPS = ["Upload File", "Map Columns", "Preview", "Import"];

const CRM_FIELDS: { key: keyof ImportRow | "ignore"; label: string; required?: boolean }[] = [
  { key: "companyName", label: "Company Name", required: true },
  { key: "contactName", label: "Contact Name", required: true },
  { key: "phone", label: "Phone", required: true },
  { key: "industry", label: "Industry" },
  { key: "email", label: "Email" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "designation", label: "Designation" },
  { key: "website", label: "Website" },
  { key: "source", label: "Lead Source" },
  { key: "priority", label: "Priority" },
  { key: "notes", label: "Notes" },
  { key: "ignore", label: "— Ignore —" },
];

function guessField(header: string): (typeof CRM_FIELDS)[number]["key"] {
  const h = header.trim().toLowerCase();
  if (/company|organi[sz]ation|business/.test(h)) return "companyName";
  if (/industry|sector/.test(h)) return "industry";
  if (/phone|mobile|tel/.test(h)) return "phone";
  if (/e[-\s]?mail/.test(h)) return "email";
  if (/city|town/.test(h)) return "city";
  if (/state|province/.test(h)) return "state";
  if (/designation|title|role|position/.test(h)) return "designation";
  if (/web ?site|url/.test(h)) return "website";
  if (/source/.test(h)) return "source";
  if (/priority/.test(h)) return "priority";
  if (/notes?|remarks?|comment/.test(h)) return "notes";
  if (/contact|person|name/.test(h)) return "contactName";
  return "ignore";
}

function buildImportRow(
  raw: Record<string, string>,
  headers: string[],
  mapping: Record<string, string>,
): ImportRow {
  const get = (field: string): string => {
    const header = headers.find((h) => mapping[h] === field);
    return header ? (raw[header] ?? "").trim() : "";
  };
  return {
    companyName: get("companyName"),
    industry: get("industry"),
    website: get("website"),
    phone: get("phone"),
    email: get("email"),
    city: get("city"),
    state: get("state"),
    contactName: get("contactName"),
    designation: get("designation"),
    source: get("source"),
    priority: get("priority"),
    notes: get("notes"),
  };
}

export function ImportLeadsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [parseError, setParseError] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportSummary | null>(null);
  const [importError, setImportError] = useState("");

  const close = () => {
    onClose();
    setTimeout(() => {
      setStep(0);
      setFileName(null);
      setHeaders([]);
      setRawRows([]);
      setMapping({});
      setParseError("");
      setResult(null);
      setImportError("");
    }, 200);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setParseError("");
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fields = results.meta.fields ?? [];
        if (fields.length === 0 || results.data.length === 0) {
          setParseError("Couldn't find any rows in that file.");
          setHeaders([]);
          setRawRows([]);
          return;
        }
        setHeaders(fields);
        setRawRows(results.data);
        setMapping(Object.fromEntries(fields.map((f) => [f, guessField(f)])));
      },
      error: (err) => setParseError(err.message),
    });
  };

  const mappedRows = useMemo(
    () => rawRows.map((r) => buildImportRow(r, headers, mapping)),
    [rawRows, headers, mapping],
  );

  const missingRequired = useMemo(
    () =>
      mappedRows.filter(
        (r) => !r.companyName || !r.contactName || !r.phone,
      ).length,
    [mappedRows],
  );

  const runImport = async () => {
    setImporting(true);
    setImportError("");
    const res = await importLeads(mappedRows);
    setImporting(false);
    if ("error" in res) {
      setImportError(res.error);
      return;
    }
    setResult(res);
    router.refresh();
  };

  const canContinue =
    (step === 0 && !!fileName && rawRows.length > 0) ||
    (step === 1 &&
      CRM_FIELDS.filter((f) => f.required).every((f) =>
        headers.some((h) => mapping[h] === f.key),
      )) ||
    step === 2;

  return (
    <Modal
      open={open}
      onClose={close}
      title="Import Leads"
      description="Bring leads in from a CSV export."
      size="lg"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => (step === 0 ? close() : setStep((s) => s - 1))}
            disabled={importing}
          >
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              onClick={async () => {
                if (step === 2) {
                  setStep(3);
                  await runImport();
                } else {
                  setStep((s) => s + 1);
                }
              }}
              disabled={!canContinue || importing}
              iconRight={ArrowRight}
            >
              {step === 2 ? "Import" : "Continue"}
            </Button>
          ) : (
            <Button icon={Check} onClick={close} disabled={importing}>
              Done
            </Button>
          )}
        </>
      }
    >
      {/* Stepper */}
      <ol className="mb-6 flex items-center">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                  i < step
                    ? "bg-brand-600 text-white"
                    : i === step
                      ? "bg-brand-100 text-brand-700 ring-2 ring-brand-500"
                      : "bg-ink-100 text-ink-400",
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:inline",
                  i === step ? "text-ink-900" : "text-ink-400",
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "mx-2 h-px flex-1",
                  i < step ? "bg-brand-500" : "bg-ink-200",
                )}
              />
            )}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-300 bg-ink-50 px-6 py-12 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40">
            <UploadCloud className="h-9 w-9 text-ink-400" />
            <p className="mt-3 text-sm font-medium text-ink-800">
              Click to upload or drag and drop
            </p>
            <p className="mt-1 text-xs text-ink-500">
              CSV with a header row, up to 1000 leads
            </p>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {fileName && (
              <span className="mt-4 inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                {fileName} · {rawRows.length} row{rawRows.length === 1 ? "" : "s"}
              </span>
            )}
          </label>
          {parseError && (
            <p className="mt-3 text-sm text-rose-600">{parseError}</p>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-1 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
            <span>CSV Column</span>
            <span />
            <span>CRM Field</span>
          </div>
          {headers.map((col) => (
            <div
              key={col}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border border-ink-200 bg-white px-3 py-2"
            >
              <span className="truncate text-sm font-medium text-ink-700">{col}</span>
              <ArrowRight className="h-4 w-4 text-ink-300" />
              <Select
                value={mapping[col] ?? "ignore"}
                onChange={(e) =>
                  setMapping((m) => ({ ...m, [col]: e.target.value }))
                }
                className="h-9"
              >
                {CRM_FIELDS.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                    {f.required ? " *" : ""}
                  </option>
                ))}
              </Select>
            </div>
          ))}
          {!CRM_FIELDS.filter((f) => f.required).every((f) =>
            headers.some((h) => mapping[h] === f.key),
          ) && (
            <p className="flex items-center gap-1.5 pt-1 text-xs text-amber-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              Map a column to Company Name, Contact Name and Phone (marked *) to
              continue.
            </p>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="mb-3 text-sm text-ink-500">
            <span className="font-medium text-ink-800">
              {mappedRows.length} row{mappedRows.length === 1 ? "" : "s"}
            </span>{" "}
            ready to import
            {missingRequired > 0 && (
              <span className="text-amber-600">
                {" "}
                · {missingRequired} will be skipped (missing required fields)
              </span>
            )}
          </p>
          <div className="max-h-80 overflow-auto rounded-lg border border-ink-200">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="sticky top-0 bg-ink-50">
                <tr>
                  {["Company", "Contact", "Phone", "Industry", "City", "Source"].map(
                    (c) => (
                      <th
                        key={c}
                        className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-ink-500"
                      >
                        {c}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {mappedRows.slice(0, 10).map((row, i) => (
                  <tr
                    key={i}
                    className={
                      !row.companyName || !row.contactName || !row.phone
                        ? "bg-amber-50/60"
                        : undefined
                    }
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-ink-700">
                      {row.companyName || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink-700">
                      {row.contactName || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink-700">
                      {row.phone || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink-700">
                      {row.industry || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink-700">
                      {row.city || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-ink-700">
                      {row.source || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {mappedRows.length > 10 && (
            <p className="mt-2 text-xs text-ink-400">
              Showing the first 10 of {mappedRows.length} rows.
            </p>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="py-4">
          {importing && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
              <p className="mt-4 text-sm text-ink-500">
                Importing {mappedRows.length} rows into Supabase…
              </p>
            </div>
          )}
          {!importing && importError && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertTriangle className="h-10 w-10 text-rose-500" />
              <h3 className="mt-4 text-base font-semibold text-ink-900">
                Import failed
              </h3>
              <p className="mt-1 max-w-sm text-sm text-rose-600">{importError}</p>
            </div>
          )}
          {!importing && result && (
            <div>
              <div className="flex flex-col items-center text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                <h3 className="mt-4 text-base font-semibold text-ink-900">
                  {result.leadsCreated} lead{result.leadsCreated === 1 ? "" : "s"}{" "}
                  imported
                </h3>
                <p className="mt-1 text-sm text-ink-500">
                  {result.companiesCreated} new compan
                  {result.companiesCreated === 1 ? "y" : "ies"} · {result.companiesReused}{" "}
                  existing compan{result.companiesReused === 1 ? "y" : "ies"} reused ·{" "}
                  {result.contactsCreated} contact
                  {result.contactsCreated === 1 ? "" : "s"} created
                </p>
              </div>

              {result.mappedValues.length > 0 && (
                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-semibold text-amber-800">
                    Some values were mapped to the closest valid option:
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs text-amber-700">
                    {result.mappedValues.slice(0, 8).map((m, i) => (
                      <li key={i}>
                        Row {m.row}: {m.field} “{m.from}” → “{m.to}”
                      </li>
                    ))}
                    {result.mappedValues.length > 8 && (
                      <li>…and {result.mappedValues.length - 8} more.</li>
                    )}
                  </ul>
                </div>
              )}

              {result.skipped.length > 0 && (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
                  <p className="text-xs font-semibold text-rose-800">
                    {result.skipped.length} row{result.skipped.length === 1 ? "" : "s"}{" "}
                    skipped:
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs text-rose-700">
                    {result.skipped.slice(0, 8).map((s, i) => (
                      <li key={i}>
                        Row {s.row}: {s.reason}
                      </li>
                    ))}
                    {result.skipped.length > 8 && (
                      <li>…and {result.skipped.length - 8} more.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
