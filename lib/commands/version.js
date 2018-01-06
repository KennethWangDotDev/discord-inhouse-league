function version(command) {
    if (command.startsWith('!version')) {
        return {
            responseMessage: 'Version 0.0.1',
            deleteSenderMessage: true
        };
    }
}

export default version;
