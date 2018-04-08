import enforceWordCount from '../utls/enforceWordCount';
import getWord from '../utls/getWord';
import { logger } from '../';

function role(msg) {
    const userMessage = msg.content;
    if (userMessage.startsWith('!addrole')) {
        // Action
        if (enforceWordCount(userMessage, 2)) {
            const selectedRole = getWord(userMessage, 2).toLowerCase();
            if (selectedRole === 'melee' || selectedRole === 'ranged' || selectedRole === 'support') {
                const playerClass = msg.guild.roles.find('name', selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1));
                msg.member.addRole(playerClass);
                const message = `${msg.author.username} has been designated as a ${role} player.`;
                logger.log('info', `${msg.author.username} has been designated as a ${role} player.`);

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
            const selectedRole = getWord(userMessage, 2).toLowerCase();
            if (selectedRole === 'melee' || selectedRole === 'ranged' || selectedRole === 'support') {
                const playerClass = msg.guild.roles.find('name', selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1));
                msg.member.removeRole(playerClass);
                const message = `${msg.author.username} is no longer a ${role} player.`;
                logger.log('info', `${msg.author.username} is no longer a ${role} player.`);

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
