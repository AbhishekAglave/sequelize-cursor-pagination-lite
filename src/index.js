const { Op } = require('sequelize');

function makeFindAllPaginated(model) {
  return async function ({ where = {}, limit = 10, after, before, order = [['id', 'DESC']] }) {
    const [sortField, sortDirection] = order[0];
    const isDesc = sortDirection.toUpperCase() === 'DESC';

    if (after && before) {
      throw new Error('Only one of after or before can be used.');
    }

    if (after) {
      where[sortField] = {
        [isDesc ? Op.lt : Op.gt]: after
      };
    } else if (before) {
      where[sortField] = {
        [isDesc ? Op.gt : Op.lt]: before
      };
    }

    const result = await model.findAll({
      where,
      limit: parseInt(limit, 10),
      order
    });

    const first = result[0];
    const last = result[result.length - 1];

    return {
      records: result,
      cursor: {
        before: first ? first[sortField] : null,
        after: last ? last[sortField] : null
      }
    };
  };
}

module.exports = { makeFindAllPaginated };
