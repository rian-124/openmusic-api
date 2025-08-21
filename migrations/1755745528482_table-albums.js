/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/* eslint-disable camelcase */

export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    name: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('albums');
};
