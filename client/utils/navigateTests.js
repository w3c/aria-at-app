export const navigateTests = (
  previous = false,
  currentTest,
  tests = [],
  setCurrentTestIndex = () => {},
  setIsFirstTest = () => {},
  setIsLastTest = () => {}
) => {
  // assume navigation forward if previous is false
  let newTestIndex = currentTest.seq;
  if (!previous) {
    // next
    const newTestIndexToEval = currentTest.seq + 1;
    if (newTestIndexToEval <= tests.length) newTestIndex = newTestIndexToEval;
  } else {
    // previous
    const newTestIndexToEval = currentTest.seq - 1;
    if (newTestIndexToEval >= 1 && newTestIndexToEval <= tests.length)
      newTestIndex = newTestIndexToEval;
  }

  const currentIndex = tests.find(t => t.seq === newTestIndex).index;
  const isFirstTest = newTestIndex - 1 === 0;
  const isLastTest = newTestIndex === tests.length;

  setCurrentTestIndex && setCurrentTestIndex(currentIndex);
  setIsFirstTest && setIsFirstTest(isFirstTest);
  setIsLastTest && setIsLastTest(isLastTest);

  return { currentIndex, isFirstTest, isLastTest };
};
