function sortByRatings(a, b) {
    if (a.rating > b.rating) {
        return -1;
    }
    if (a.rating < b.rating) {
        return 1;
    }
    return 0;
}

export default sortByRatings;
