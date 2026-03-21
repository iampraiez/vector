export const maskEmail = (email: string | null | undefined): string => {
  if (!email) return "N/A";
  const [user, domain] = email.split("@");
  if (!domain) return email;

  if (user.length <= 2) {
    return `${user}***@${domain}`;
  }

  const firstTwo = user.slice(0, 2);
  const lastOne = user.slice(-1);
  return `${firstTwo}***${lastOne}@${domain}`;
};

export const maskPhone = (phone: string | null | undefined): string => {
  if (!phone) return "N/A";
  if (phone.length <= 4) return "****";
  return `${phone.slice(0, 4)}*****${phone.slice(-3)}`;
};
