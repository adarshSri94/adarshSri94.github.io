export const shallowEquals = (arr1, arr2) => {
    if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
    var equals = true;
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) equals = false;
    }
    return equals;
};

export const arrayDiff = (arr1, arr2) => {
    return arr1.map(function (a, i) {
        return a - arr2[i];
    });
};


