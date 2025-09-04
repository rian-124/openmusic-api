const InvariantError = require('../../exceptions/InvariantError');
const { userPayloadSchema } = require('./schema');

const usersValidator = {
  validateUserPayload: (payload) => {
    const validateResult = userPayloadSchema.validate(payload);

    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
};

module.exports = { usersValidator };
