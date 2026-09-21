export const config = { name: "demo", items: [1, 2, 3], enabled: true };
export const getName = (value: string) => {
  return `${value}-${config.name}`;
};

export function padded(value: string) {
  return value;
}
