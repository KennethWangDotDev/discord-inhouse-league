function version(userMessage) {
    if (userMessage.startsWith('!version')) {
        return {
            responseMessage: 'Version 0.0.1',
            deleteSenderMessage: true
        };
    }
}

export default version;
