const { saveMerchant } = require("./store");

const developmentMerchants = [
  {
    merchantId: "SPZ12345",
    id: "SPZ12345",
    name: "Thuba’s Spaza",
    ownerFirstName: "Thuba"
  },
  {
    merchantId: "SPZ67890",
    id: "SPZ67890",
    name: "Mama Nomsa’s Tuck Shop",
    ownerFirstName: "Nomsa"
  }
];

async function seedMerchants() {
  for (const merchant of developmentMerchants) {
    await saveMerchant(merchant);
  }
}

function toApiMerchant(merchant) {
  if (!merchant) return null;

  return {
    id: merchant.id || merchant.merchantId,
    name: merchant.name,
    ownerFirstName: merchant.ownerFirstName
  };
}

module.exports = {
  developmentMerchants,
  seedMerchants,
  toApiMerchant
};
