# sequelize-cursor-pagination-lite

A lightweight, performant cursor-based pagination utility for Sequelize ORM. Built for speed and simplicity with optional features to minimize unnecessary database queries.

## Features

- 🚀 **Fast & Lightweight** - Minimal overhead with optional features
- 🎯 **Cursor-based pagination** - Reliable pagination that works with real-time data
- 🔧 **Highly configurable** - All features are optional to save queries
- 📦 **Zero dependencies** - Works with your existing Sequelize setup

## Installation

```bash
npm install sequelize-cursor-pagination-lite
```

## Quick Start

```javascript

const { makeFindAllPaginated } = require('sequelize-cursor-pagination-lite');

// Define your model
const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Attach paginated method to your model
User.findAllPaginated = makeFindAllPaginated(User);

// Now use it like any other Sequelize method
const result = await User.findAllPaginated({
  limit: 10,
  where: { active: true }
});

console.log(result.records); // Array of user records
console.log(result.cursors); // { before: "cursor", after: "cursor" }
```

## API Reference

### `makeFindAllPaginated(model)`

Attaches a `findAllPaginated` method to your Sequelize model, giving you cursor-based pagination alongside the familiar `findAll` interface.

**Parameters:**
- `model` - Sequelize model instance

**Usage:**
```javascript
// Attach to your model
User.findAllPaginated = makeFindAllPaginated(User);

// Use like any other Sequelize method
const result = await User.findAllPaginated(options);
```

### Pagination Options

```javascript
const result = await User.findAllPaginated({
  where: {},              // Sequelize where clause (optional)
  limit: 10,              // Number of records per page (default: 10)
  after: 'cursor',        // Cursor for forward pagination (optional)
  before: 'cursor',       // Cursor for backward pagination (optional)
  order: [['id', 'ASC']], // Sort order (default: [['id', 'ASC']])
  includePageInfo: false, // Include hasNextPage/hasPrevPage (default: false)
  includeTotalCount: false // Include total count (default: false)
});
```

### Response Format

```javascript
{
  records: [...],           // Array of model instances
  edges: {                  // First and last records
    first: record,
    last: record
  },
  cursors: {               // Navigation cursors
    before: 'cursor',
    after: 'cursor'
  },
  pageInfo: {              // Optional: only if includePageInfo: true
    hasPrevPage: boolean,
    hasNextPage: boolean
  },
  totalCount: number       // Optional: only if includeTotalCount: true
}
```

## Performance Considerations

### Optional Features Save Queries

- **Basic usage**: Single Query (findAll)
- **With `includePageInfo: false`**: Saves 2 additional queries with limit 1 for page checks
- **With `includeTotalCount: false`**: Saves 1 count query

### Best Practices

1. **Use indexed sort fields** - Ensure your `order` field has a database index
2. **Limit page sizes** - Keep `limit` reasonable (10-100 records)
3. **Enable features only when needed** - Use `includePageInfo` and `includeTotalCount` sparingly
4. **Cache cursors** - Store cursors in URL params or session for navigation

## Requirements

- Node.js >= 12
- Sequelize >= 6.0

## License

MIT

## Contributing

Contributions welcome! Please read our contributing guide and submit pull requests to our repository.

---

**Built for developers who need fast, reliable pagination without the bloat.**