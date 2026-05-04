export type Service = {
  id: string;
  name: string;
  duration: number;
  price: number | null;
  paused?: boolean;
};
