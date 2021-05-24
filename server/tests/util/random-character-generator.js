const randomStringGenerator = (length = 8) => {
    const result = [];
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result.push(
            characters.charAt(Math.floor(Math.random() * characters.length))
        );
    }
    return result.join('');
};

module.exports = randomStringGenerator;
