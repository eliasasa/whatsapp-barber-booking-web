export type Client = {
	id: string;
	name: string;
	phone?: string | null;
	notes?: string | null;
	botDisabled?: boolean;
	createdAt?: string;
	updatedAt?: string;
};