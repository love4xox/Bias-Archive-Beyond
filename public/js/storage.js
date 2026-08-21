// public/js/storage.js

const STORAGE_KEY = "bias_archive_records";

export function getRecords() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveRecord(record) {
  const records = getRecords();
  const newRecord = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...record,
  };
  records.unshift(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return newRecord;
}

export function deleteRecord(id) {
  const records = getRecords().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return records;
}