module.exports.encodeCursor = (value) =>
  Buffer.from(String(value)).toString('base64');

module.exports.decodeCursor = (cursor) =>
  Buffer.from(cursor, 'base64').toString('utf-8');