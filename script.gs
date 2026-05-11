// ================================================================
// WorkArt 2026 — Auto Copy with Subtema Categorization
// ================================================================
// HOW TO USE:
//   1. Open your Google Form → ⋮ menu → "Apps Script"
//   2. Paste this entire file, replacing any existing code
//   3. Run setupTrigger() ONCE manually (Run → setupTrigger)
//   4. Authorize when prompted — done!
// ================================================================

const DESTINATION_FOLDER_NAME = "Submission Test 2 - BYTEFEST 2026";

// ── Adjust these to match your exact form question titles ───────
// The script matches by keyword (case-insensitive substring match)
const FIELD_EMAIL    = "email";
const FIELD_KODE     = "kode";      // "Kode peserta"
const FIELD_NAMA     = "nama";      // "Nama lengkap"
const FIELD_SUBTEMA  = "subtema";   // "Subtema yang dipilih"
const FIELD_LINK     = "link";      // "Link folder drive"
// ───────────────────────────────────────────────────────────────


// ================================================================
// MAIN TRIGGER — fires automatically on every form submission
// ================================================================

function onFormSubmit(e) {
  try {
    const responses = e.response.getItemResponses();

    let email   = "";
    let kode    = "";
    let nama    = "";
    let subtema = "";
    let link    = "";

    for (const item of responses) {
      const title  = item.getItem().getTitle().toLowerCase();
      const answer = String(item.getResponse()).trim();

      if (title.includes(FIELD_EMAIL)   && !email)   email   = answer;
      if (title.includes(FIELD_KODE)    && !kode)    kode    = answer;
      if (title.includes(FIELD_NAMA)    && !nama)    nama    = answer;
      if (title.includes(FIELD_SUBTEMA) && !subtema) subtema = answer;
      if (title.includes(FIELD_LINK)    && !link)    link    = answer;
    }

    // Validate required fields
    const missing = [];
    if (!email)   missing.push("Email");
    if (!kode)    missing.push("Kode Peserta");
    if (!nama)    missing.push("Nama Lengkap");
    if (!subtema) missing.push("Subtema");
    if (!link)    missing.push("Drive Link");

    if (missing.length > 0) {
      Logger.log(`[SKIP] Missing fields: ${missing.join(", ")}`);
      return;
    }

    Logger.log(`[START] ${kode} | ${nama} | Subtema: ${subtema}`);

    // 1. Locate (or create) root "WorkArt 2026"
    const rootFolder = getOrCreateFolderInRoot(DESTINATION_FOLDER_NAME);

    // 2. Locate (or create) subtema folder  →  WorkArt 2026 / Kesehatan
    const subtemaFolder = getOrCreateSubFolder(rootFolder, subtema);

    // 3. Participant folder name  →  J001 - John Doe - john@example.com
    const participantFolderName = `${kode} - ${nama} - ${email}`;

    // 4. Locate (or create) participant folder inside subtema
    const participantFolder = getOrCreateSubFolder(subtemaFolder, participantFolderName);

    // 5. Count existing submissions to determine ordinal
    const existingCount   = countSubFolders(participantFolder);
    const label           = getOrdinalLabel(existingCount + 1) + " Submission";

    // 6. Create this submission's tagged folder
    //    WorkArt 2026 / Kesehatan / J001 - John Doe - john@example.com / 1st Submission
    const submissionFolder = participantFolder.createFolder(label);
    Logger.log(`[FOLDER] ${subtema} / ${participantFolderName} / ${label}`);

    // 7. Parse Drive URL and copy everything
    const resourceId = extractDriveId(link);
    if (!resourceId) {
      Logger.log(`[ERROR] Could not parse Drive ID from: ${link}`);
      return;
    }

    copyDriveResource(resourceId, submissionFolder);
    Logger.log(`[DONE] ${kode} — ${label} copied successfully.`);

  } catch (err) {
    Logger.log("[FATAL] " + err.toString());
  }
}


// ================================================================
// DRIVE — copy logic
// ================================================================

function copyDriveResource(resourceId, destinationFolder) {
  let isFolder = false;

  try {
    const folder = DriveApp.getFolderById(resourceId);
    isFolder = true;
    Logger.log(`[COPY] Source is a folder: ${folder.getName()}`);
    copyFolderContents(folder, destinationFolder);
  } catch (_) {}

  if (!isFolder) {
    try {
      const file = DriveApp.getFileById(resourceId);
      Logger.log(`[COPY] Source is a file: ${file.getName()}`);
      file.makeCopy(file.getName(), destinationFolder);
    } catch (err) {
      Logger.log(`[ERROR] Cannot access resource ${resourceId}: ${err}`);
    }
  }
}

function copyFolderContents(sourceFolder, destinationFolder) {
  const files = sourceFolder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    try {
      file.makeCopy(file.getName(), destinationFolder);
      Logger.log(`  [FILE] Copied: ${file.getName()}`);
    } catch (err) {
      Logger.log(`  [WARN] Skipped "${file.getName()}": ${err}`);
    }
  }

  const subFolders = sourceFolder.getFolders();
  while (subFolders.hasNext()) {
    const sub    = subFolders.next();
    const newSub = destinationFolder.createFolder(sub.getName());
    Logger.log(`  [DIR] Entering: ${sub.getName()}`);
    copyFolderContents(sub, newSub);
  }
}


// ================================================================
// DRIVE — folder utilities
// ================================================================

function getOrCreateFolderInRoot(name) {
  const iter = DriveApp.getFoldersByName(name);
  if (iter.hasNext()) return iter.next();
  Logger.log(`[SETUP] Root folder "${name}" not found — creating it.`);
  return DriveApp.createFolder(name);
}

function getOrCreateSubFolder(parentFolder, name) {
  const iter = parentFolder.getFoldersByName(name);
  if (iter.hasNext()) return iter.next();
  return parentFolder.createFolder(name);
}

function countSubFolders(folder) {
  const iter = folder.getFolders();
  let count  = 0;
  while (iter.hasNext()) { iter.next(); count++; }
  return count;
}


// ================================================================
// URL PARSING
// ================================================================

function extractDriveId(url) {
  const patterns = [
    /\/folders\/([a-zA-Z0-9_-]{10,})/,
    /\/file\/d\/([a-zA-Z0-9_-]{10,})/,
    /[?&]id=([a-zA-Z0-9_-]{10,})/,
    /\/d\/([a-zA-Z0-9_-]{10,})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}


// ================================================================
// ORDINAL LABELS  →  1st, 2nd, 3rd, 4th …
// ================================================================

function getOrdinalLabel(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return n + "th";
  switch (n % 10) {
    case 1:  return n + "st";
    case 2:  return n + "nd";
    case 3:  return n + "rd";
    default: return n + "th";
  }
}


// ================================================================
// SETUP — Run this ONCE to register the trigger
// ================================================================

function setupTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === "onFormSubmit")
    .forEach(t => ScriptApp.deleteTrigger(t));

  const form = FormApp.getActiveForm();

  ScriptApp.newTrigger("onFormSubmit")
    .forForm(form)
    .onFormSubmit()
    .create();

  Logger.log("✅ Trigger registered for form: " + form.getTitle());
}