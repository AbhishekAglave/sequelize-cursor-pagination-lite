const { Op } = require('sequelize');
const { encodeCursor, decodeCursor } = require('./utils/cursor');

function makeFindAllPaginated(model) {
  return async function ({
    where = {},
    limit = 10,
    after,
    before,
    order = [['id', 'ASC']],
    includePageInfo = false,
    includeTotalCount = false
  }) {
    if (after) {
      after = decodeCursor(after);
    }
    if (before) {
      before = decodeCursor(before);
    }

    const [sortField, sortDirection] = order[0];
    const isDesc = sortDirection.toUpperCase() === 'DESC';

    if (after && before) {
      throw new Error('Only one of after or before can be used.');
    }

    const totalCount = await model.count({ where });

    if (after) {
      where[sortField] = {
        [isDesc ? Op.lt : Op.gt]: after
      };
    } else if (before) {
      where[sortField] = {
        [isDesc ? Op.gt : Op.lt]: before
      };
    }

    let result = await model.findAll({
      where,
      limit,
      order
    });

    const first = result[0];
    const last = result[result.length - 1];

    const newBefore = first ? encodeCursor(first[sortField]) : null;
    const newAfter = last ? encodeCursor(last[sortField]) : null;

    let hasPrevPage = false;
    let hasNextPage = false;

    if (includePageInfo) {
      if (first) {
        const prevCheck = await model.findOne({
          where: {
            ...where,
            [sortField]: {
              [isDesc ? Op.gt : Op.lt]: first[sortField]
            }
          },
          limit: 1
        });
        hasPrevPage = !!prevCheck;
      }

      if (last) {
        const nextCheck = await model.findOne({
          where: {
            ...where,
            [sortField]: {
              [isDesc ? Op.lt : Op.gt]: last[sortField]
            }
          },
          limit: 1
        });
        hasNextPage = !!nextCheck;
      }
    }

    const finalResult = {
      records: result,
      edges: { first, last },
      cursors: {
        before: newBefore,
        after: newAfter
      }
    };

    if (includePageInfo) {
      finalResult.pageInfo = {
        hasPrevPage,
        hasNextPage
      };
    }

    if (includeTotalCount) {
      finalResult.totalCount = totalCount;
    }

    return finalResult;
  };
}

module.exports = { makeFindAllPaginated };
