function enforceWordCount(sentence, count) {
    if (sentence.split(' ').length === count) {
        return true;
    }
    return false;
}

export default enforceWordCount;
