const { AuthenticationError } = require('apollo-server');
const {
  unlinkAtBugsFromNegativeSideEffect,
  getNegativeSideEffectByEncodedId
} = require('../models/services/NegativeSideEffectService');

const unlinkAtBugsFromNegativeSideEffectResolver = async (
  _,
  { negativeSideEffectId, atBugIds },
  context
) => {
  const { user, transaction } = context;

  if (!user) {
    throw new AuthenticationError('Must be logged in');
  }

  // Get the negative side effect by encodedId to get the numeric ID
  const negativeSideEffect = await getNegativeSideEffectByEncodedId({
    encodedId: negativeSideEffectId,
    transaction
  });

  if (!negativeSideEffect) {
    throw new Error('Invalid negativeSideEffectId');
  }

  try {
    return await unlinkAtBugsFromNegativeSideEffect({
      negativeSideEffectId: negativeSideEffect.id,
      atBugIds,
      transaction
    });
  } catch (e) {
    console.error('unlinkAtBugsFromNegativeSideEffect error', {
      negativeSideEffectId,
      atBugIds,
      message: e.message,
      code: e?.original?.code || e?.parent?.code || e.code
    });
    throw e;
  }
};

module.exports = unlinkAtBugsFromNegativeSideEffectResolver;
