function generateWineId() {
  return 'W' + Utilities.getUuid().substring(0, 8).toUpperCase();
}


function generateTransactionId_() {
  return 'T' + Utilities.getUuid().substring(0, 8).toUpperCase();
}