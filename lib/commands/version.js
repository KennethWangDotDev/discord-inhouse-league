function version(msg) {
	const userMessage = msg.content.toLowerCase();
    if (userMessage.startsWith('!version')) {
        return {
            responseMessage: 'Version 0.0.1',
            deleteSenderMessage: true
        };
    }
}

export default version;
