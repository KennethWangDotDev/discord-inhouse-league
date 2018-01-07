function getWord(sentence, count) {
    if (sentence.split(' ').length >= count) {
        return sentence.split(' ')[count - 1];
    }
    return false;
}

export default getWord;
