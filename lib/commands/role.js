import enforceWordCount from '../utls/enforceWordCount';
import getWord from '../utls/getWord';

function role(msg) {
    const userMessage = msg.content;
    if (userMessage.startsWith('!addrole')) {
        // Action
        if (enforceWordCount(userMessage, 2)) {
            let role = getWord(userMessage, 2);
			role = role.toLowerCase();
			if (role === "melee" || role === "ranged" || role === "support") {
				role = role.charAt(0).toUpperCase() + role.slice(1);
				let playerClass = msg.guild.roles.find("name", role);
				msg.member.addRole(playerClass);
				const message = `${msg.author.username} has been designated as a ${role} player.`;		
				
				return {
					responseMessage: message,
					deleteSenderMessage: true
				};
			}
        }

        // Error - Syntax
        return {
            responseMessage:
                'Error: Invalid role. Make sure to type: !addrole <Melee|Ranged|Support>.',
            deleteSenderMessage: false
        };
    }
	if (userMessage.startsWith('!removerole')) {
		// Action
		if (enforceWordCount(userMessage, 2)) {
            let role = getWord(userMessage, 2);
			role = role.toLowerCase();
			if (role === "melee" || role === "ranged" || role === "support") {
				role = role.charAt(0).toUpperCase() + role.slice(1);
				let playerClass = msg.guild.roles.find("name", role);
				msg.member.removeRole(playerClass);
				const message = `${msg.author.username} is no longer a ${role} player.`;		
				
				return {
					responseMessage: message,
					deleteSenderMessage: true
				};
			}
        }

        // Error - Syntax
        return {
            responseMessage:
                'Error: Invalid role. Make sure to type: !removerole <Melee|Ranged|Support>.',
            deleteSenderMessage: false
        };
    }
}

export default role;
