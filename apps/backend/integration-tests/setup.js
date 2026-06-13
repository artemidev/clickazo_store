const { MetadataStorage } = require("@mikro-orm/core")

// Referenced by jest.config.js (setupFiles). Clears MikroORM metadata between
// test files so model re-definitions across suites don't collide.
MetadataStorage.clear()
