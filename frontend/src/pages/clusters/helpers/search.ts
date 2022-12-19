export const containsAllWords = (input: string, search: string): boolean => {
  if (search == "") return true;
  const lowerCaseInput = input.toLowerCase();
  const lowerCaseSearch = search.toLowerCase();

  const lowerCaseInputWords = lowerCaseInput.split(" ").filter((w) => w != "");
  const lowerCaseSearchWords = lowerCaseSearch.split(" ").filter((w) => w != "");

  return (
    lowerCaseSearchWords.map((w) => lowerCaseInputWords.includes(w)).reduce((a, b) => a && b, true) ||
    lowerCaseInput.includes(lowerCaseSearch)
  );
};
