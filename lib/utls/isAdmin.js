import cfg from '../../config';

/**
 * Helper function to check whether specified user is an administrator.
 * @param  {string}  userID - Discord ID of user.
 * @return {Boolean} - Returns true if the specified user is an administrator.
 *                     Otherwise returns false.
 */
function isAdmin(userID) {
    for (const admin of cfg.admins) {
        if (userID === admin) {
            return true;
        }
    }
    return false;
}

export default isAdmin;
