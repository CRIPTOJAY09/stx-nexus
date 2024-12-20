export const validateBTCAddress = (address: string): boolean => {
  const btcAddressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  return btcAddressRegex.test(address);
};

export const calculateDiscount = (amount: number): number => {
  return amount * 0.94; // 6% discount
};

export const calculatePlatformFee = (amount: number): number => {
  return amount * 0.03; // 3% platform fee
};