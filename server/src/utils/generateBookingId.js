const generateBookingId = () => {

  const random = Math.floor(100000 + Math.random() * 900000);

  return `RSM-${random}`;
};

module.exports = generateBookingId;