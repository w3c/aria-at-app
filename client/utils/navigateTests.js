export const navigateTests = (
  previous = false,
  currentTest,
  tests = [],
  setCurrentTestIndex = () => {},
  setIsFirstTest = () => {},
  setIsLastTest = () => {}
) => {
  // If currentTest is undefined, we are on the summary view
  if (!currentTest) {
    if (!previous) {
      const firstTest = tests.find(t => t.seq === 1);
      setCurrentTestIndex(firstTest.index);
      setIsFirstTest(true);
      setIsLastTest(false);
      return {
        currentIndex: firstTest.index,
        isFirstTest: true,
        isLastTest: false
      };
    }
    // No previous from summary
    return { currentIndex: -1, isFirstTest: false, isLastTest: false };
  }
  // assume navigation forward if previous is false
  let newTestIndex = currentTest.seq;
  if (!previous) {
    // next
    const newTestIndexToEval = currentTest.seq + 1;
    if (newTestIndexToEval <= tests.length) newTestIndex = newTestIndexToEval;
  } else {
    // previous
    const newTestIndexToEval = currentTest.seq - 1;
    // Go to summary when going previous from first test
    if (newTestIndexToEval === 0) {
      setCurrentTestIndex(-1);
      setIsFirstTest(false);
      setIsLastTest(false);
      return { currentIndex: -1, isFirstTest: false, isLastTest: false };
    }
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
