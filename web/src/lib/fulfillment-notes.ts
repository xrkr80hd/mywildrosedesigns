export const FULFILLMENT_NOTE_PREFIX = "[FULFILLMENT]";

type FulfillmentEntry = {
  timestamp: string | null;
  text: string;
};

type ParsedFulfillmentNotes = {
  bodyNotes: string | null;
  fulfillmentMethod: string | null;
  entries: FulfillmentEntry[];
};

function normalizeLineBreaks(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

export function parseFulfillmentNotes(notes: string | null): ParsedFulfillmentNotes {
  if (!notes) {
    return { bodyNotes: null, fulfillmentMethod: null, entries: [] };
  }

  const bodyLines: string[] = [];
  const entries: FulfillmentEntry[] = [];
  let fulfillmentMethod: string | null = null;

  const normalized = normalizeLineBreaks(notes);
  for (const line of normalized.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith(FULFILLMENT_NOTE_PREFIX)) {
      if (trimmed.startsWith("Cart items:")) {
        continue;
      }
      if (trimmed.startsWith("Fulfillment:")) {
        const methodText = trimmed.slice("Fulfillment:".length).trim();
        fulfillmentMethod = methodText || null;
        continue;
      }
      bodyLines.push(line);
      continue;
    }

    const payload = trimmed.slice(FULFILLMENT_NOTE_PREFIX.length).trim();
    const divider = payload.indexOf("::");
    if (divider < 0) {
      entries.push({ timestamp: null, text: payload });
      continue;
    }

    const timestampRaw = payload.slice(0, divider).trim();
    const textRaw = payload.slice(divider + 2).trim();
    entries.push({
      timestamp: timestampRaw || null,
      text: textRaw,
    });
  }

  const compactBody = bodyLines.join("\n").trim();
  return {
    bodyNotes: compactBody ? compactBody : null,
    fulfillmentMethod,
    entries,
  };
}

export function appendFulfillmentNote(existingNotes: string | null, note: string): string {
  const parsed = parseFulfillmentNotes(existingNotes);
  const cleanNote = note.trim();
  const entry = `${FULFILLMENT_NOTE_PREFIX} ${new Date().toISOString()} :: ${cleanNote}`;

  const lines: string[] = [];
  if (parsed.bodyNotes) {
    lines.push(parsed.bodyNotes);
  }
  for (const existingEntry of parsed.entries) {
    const timestampText = existingEntry.timestamp ? `${existingEntry.timestamp} ` : "";
    lines.push(`${FULFILLMENT_NOTE_PREFIX} ${timestampText}:: ${existingEntry.text}`);
  }
  lines.push(entry);

  return lines.filter((line) => line.trim().length > 0).join("\n");
}
