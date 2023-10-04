




const generateTransactionId = () => {
    const datePart = new Date().toISOString().replace(/[-T:\.Z]/g, ""); // Get the current date in YYYYMMDDHHMMSSmmm format
    const randomPart = Math.floor(Math.random() * 10000); // Get a random number between 0-9999
    return `TX${datePart}${randomPart}`; // Prefix with 'TX' for "Transaction"
};

module.exports = {
    generateTransactionId
};
