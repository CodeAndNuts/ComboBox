const isNotNullOrEmpty = (param) => {
    return param !== null && param !== undefined && param.length > 0;
};

const isNotNullOrUndefined = (param) => {
    return param !== null && param !== undefined;
};
const clean = (input) => {
    if (input === null || input === undefined) return "";

    if (typeof input === "string") {
        return input
            .trim()
            .replace(/\s+/g, " ")
            .replace(/[|~]/g, "");
    }
    return input;
};