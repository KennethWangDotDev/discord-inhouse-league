function sortByRatings(a, b) {
    if (a.rating > b.rating) {
        return -1;
    }
    if (a.rating < b.rating) {
        return 1;
    }
    return 0;
}

function sortByRatingsPro(a, b) {
    if (a.ratingPro > b.ratingPro) {
        return -1;
    }
    if (a.ratingPro < b.ratingPro) {
        return 1;
    }
    return 0;
}

export { sortByRatings, sortByRatingsPro };
