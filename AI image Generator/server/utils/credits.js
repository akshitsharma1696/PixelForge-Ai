const GENERATION_COST = 5;
const PROCESS_COST = 5;
const VARIATION_COST = 5;

const requireCredits = (user, amount) => {
  console.log(
    `[Credits] requireCredits check — userId: ${user?._id}, userCredits: ${user?.credits ?? "N/A"}, needed: ${amount}`
  );
  if (!user || user.credits < amount) {
    console.warn(
      `[Credits] BLOCKED — user ${user?._id} has ${user?.credits ?? 0} credits, needs ${amount}`
    );
    const error = new Error(
      `Insufficient credits. Need ${amount}, have ${user?.credits ?? 0}. Top up in Billing.`
    );
    error.statusCode = 403;
    throw error;
  }
  console.log(`[Credits] PASSED — ${user.credits} >= ${amount}`);
};

/** Atomic deduct — only after a successful generation */
const deductCredits = async (user, amount) => {
  requireCredits(user, amount);
  const updated = await user.constructor.findOneAndUpdate(
    { _id: user._id, credits: { $gte: amount } },
    { $inc: { credits: -amount } },
    { new: true }
  );
  if (!updated) {
    const error = new Error("Insufficient credits.");
    error.statusCode = 403;
    throw error;
  }
  user.credits = updated.credits;
  return updated.credits;
};

module.exports = {
  GENERATION_COST,
  PROCESS_COST,
  VARIATION_COST,
  requireCredits,
  deductCredits,
};
