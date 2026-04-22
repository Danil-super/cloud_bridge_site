const SPREADSHEET_ID = '1RYaED0_XElrkB18T-D-Q2l_2sfdvKujBYV31g_bdNco';
const SHEET_NAME = 'Заявки';
const WEBHOOK_SECRET = 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET';

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const secret = String((e && e.parameter && e.parameter.secret) || '');

    if (!isAuthorized(secret || String(payload.secret || ''))) {
      return jsonResponse({
        ok: false,
        message: 'Unauthorized webhook request.',
      });
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0];
    if (!sheet) {
      return jsonResponse({
        ok: false,
        message: `No writable sheet found in spreadsheet.`,
      });
    }

    const createdAt = String(payload.createdAt || new Date().toISOString());
    const updatedAt = String(payload.updatedAt || createdAt);
    const files = Array.isArray(payload.files) ? payload.files : [];
    const fileLinks = files
      .map((file) => {
        const name = String((file && file.name) || '').trim();
        const url = String((file && file.url) || '').trim();
        return name && url ? `${name}: ${url}` : name || url;
      })
      .filter(Boolean)
      .join(' | ');

    sheet.appendRow([
      String(payload.leadId || ''),
      String(payload.date || formatDateOnly(createdAt)),
      String(payload.time || formatTimeOnly(createdAt)),
      String(payload.name || ''),
      String(payload.phone || ''),
      String(payload.service || 'Не выбрана'),
      String(payload.comment || ''),
      String(payload.filesText || fileLinks),
      String(payload.source || 'Сайт'),
      String(payload.status || 'Новая'),
      String(payload.manager || ''),
      String(payload.managerComment || ''),
      formatDateTime(updatedAt),
    ]);

    return jsonResponse({
      ok: true,
      message: 'Lead appended to Google Sheets.',
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: error && error.message ? error.message : 'Unexpected Apps Script error.',
    });
  }
}

function isAuthorized(secret) {
  return Boolean(secret) && secret === WEBHOOK_SECRET;
}

function formatDateOnly(value) {
  return Utilities.formatDate(new Date(value), Session.getScriptTimeZone(), 'dd.MM.yyyy');
}

function formatTimeOnly(value) {
  return Utilities.formatDate(new Date(value), Session.getScriptTimeZone(), 'HH:mm:ss');
}

function formatDateTime(value) {
  return Utilities.formatDate(new Date(value), Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm:ss');
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
