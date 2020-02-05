export const planInputValidation = {
    userId: {
        in: ["body"],
        isEmpty: false,
        isLength: {
            options: { min: 26, max: 26 },
            errorMessage: "userId is invalid"
        },
        errorMessage: "userID field is required"
    },
    semestersLeft: {
        in: ["body"],
        custom: {
            options: (value, {req, location, path}) => {
                return value.isArray() === true ? true : false;
            }
        },
        errorMessage: "semestersLeft field is required"
    },
    areasSatisfied: {
        in: ["body"],
        custom: {
            options: (value, {req, location, path}) => {
                return value.isArray() === true ? true : false;
            }
        },
        errorMessage: "areasSatisfied field is required"
    },
    unitsLeft: {
        in: ["body"],
        isEmpty: false,
        isFloat: true,
        toFloat: true,
        errorMessage: "unitsLeft field is required"
    }
}

export const planUserIdValidationQuery = {
    userId: {
        in: ["query"],
        isEmpty: false,
        custom: {
            options: (value, {req, location, path}) => {
                if (value !== undefined && value.length === 24) {
                    return true;
                }
                return false;
            },
            errorMessage: "userId is invalid"
        },
        errorMessage: "userId field is required"
    }
}

export const planUserIdValidationBody = {
    userId: {
        in: ["body"],
        isEmpty: false,
        custom: {
            options: (value, {req, location, path}) => {
                if (value !== undefined && value.length === 24) {
                    return true;
                }
                return false;
            },
            errorMessage: "userId is invalid"
        },
        errorMessage: "userId field is required"
    }
}