// @ts-check

/** @param {number} seconds */
async function sleep(seconds) {
    await new Promise((resolve) => {
        setTimeout(resolve, 1000 * seconds);
    });
}

module.exports.sleep = sleep;