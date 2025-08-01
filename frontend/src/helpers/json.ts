export const pretty = (j?: unknown): string => {
  if (j === null || j === undefined || j === "") {
    console.log("Null content");
    return "";
  }
  try {
    if (typeof j === "string") return JSON.stringify(JSON.parse(j), null, 2);
    else return JSON.stringify(j, null, 2);
  } catch (err) {
    console.error(err);
    return `${j}`;
  }
};
