/* These are only predefined collections
 * The project is set up to allow run-time collections
 */

module.exports = require('co')(function*() {
  return {

    Collection: {
      schema: {
        name: {
          type: String,
          required: true
        }
      }
    },

    Rule: {
      schema: {
        collection: {
          type: String,
          required: true
        },
        editable: {
          type: Boolean,
          required: true
        },
        key: {
          type: String,
          required: true
        },
        type: {
          type: String,
          required: true
        },
        value: {
          type: String,
          required: false
        }
      }
    },

    User: {
      schema: {
        username: {
          type: String,
          required: true
        },
        password: {
          type: String,
          required: true
        }
      }
    }

  };
});
