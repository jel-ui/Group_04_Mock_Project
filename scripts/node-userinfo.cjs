// Restricted Windows sessions may reject userInfo(). tsx uses only the username
// for its IPC pipe path. Preserve normal behavior and limit fallback to ENOMEM.
const os = require('node:os');
const original = os.userInfo;
os.userInfo = function (...args) {
    try { return original.apply(this, args); }
    catch (error) {
        if (process.platform !== 'win32' || error.code !== 'ERR_SYSTEM_ERROR' || error.info?.code !== 'ENOMEM') throw error;
        return { username: process.env.USERNAME || 'codex-runner', uid: -1, gid: -1,
            homedir: os.homedir(), shell: null };
    }
};
