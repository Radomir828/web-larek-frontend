export type categoryType =
	| 'софт-скил'
	| 'дополнительное'
	| 'другое'
	| 'кнопка'
	| 'хард-скил';

export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: categoryType;
	price: number | null;
}

export type IBasketItem = Pick<IProduct, 'id' | 'title' | 'price'>;

export type paymentMethod = 'online' | 'offline';

export interface IOrderForm {
	payment: paymentMethod;
	address: string;
}

export interface IContactForm {
	email: string;
	phone: string;
}

export interface IOrder extends IOrderForm, IContactForm {
	items: string[];
	total: number;
}

export interface IOrderResult {
	id: string;
	total: number;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface ILarekApi {
	getCatalog(): Promise<IProduct[]>;
	getCatalogItem(id: string): Promise<IProduct>;
	orderItems(order: IOrder): Promise<IOrderResult>;
}
