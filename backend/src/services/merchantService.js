const { developmentMerchants } = require("../data/merchants");
const { getMerchant, saveMerchant } = require("../data/store");

function seedDevelopmentMerchants() {
  developmentMerchants.forEach((merchant) => {
    if (!getMerchant(merchant.id)) {
      saveMerchant(merchant);
    }
  });
}

module.exports = {
  seedDevelopmentMerchants
};
