import {
	FormErrors,
	IBasketItem,
	IContactForm,
	IOrder,
	IOrderForm,
	IProduct,
	paymentMethod,
} from './../../types/index';
import { Model } from '../base/Model';

export class Order extends Model<IOrder> {
	protected basket: IBasketItem[] = [];
	order: Partial<IOrder> = {
		payment: '',
		address: '',
		email: '',
		phone: '',
	};
	protected formErrors: FormErrors = {};

	getOrder(): Partial<IOrder> {
		return this.order;
	}

	addToBasket(item: IProduct) {
		const basketItem = {
			id: item.id,
			title: item.title,
			price: item.price,
		};
		this.basket.push(basketItem);

		this.emitChanges('basket:changed');
	}

	removeFromBasket(item: IBasketItem) {
		this.basket = this.basket.filter((basketItem) => basketItem.id !== item.id);
		this.emitChanges('basket:changed');
	}

	clearBasket(): void {
		this.basket = [];
	}

	getBasket(): IBasketItem[] {
		return this.basket;
	}

	getBasketItem(id: string): IBasketItem {
		return this.basket.find((basketElement) => basketElement.id === id);
	}

	getBasketAmount(): number {
		return this.getBasket().reduce<number>((total, item) => {
			return total + (item.price ?? 0);
		}, 0);
	}

	isInBasket(item: IProduct): boolean {
		return this.getBasketItem(item.id) ? true : false;
	}

	setOrderItems(): string[] {
		return this.basket.map((item) => item.id);
	}

	setOrderField<K extends keyof IOrderForm>(field: K, value: IOrder[K]) {
		this.order[field] = value;

		if (this.validateOrder()) {
			this.emitChanges('orderForm:ready');
		}
	}
	setContactField<K extends keyof IContactForm>(field: K, value: IOrder[K]) {
		this.order[field] = value;

		if (this.validateContacts()) {
			this.emitChanges('contactForm:ready');
		}
	}

	validateOrder() {
		const errors: typeof this.formErrors = {};
		if (!this.order.payment) {
			errors.payment = 'Необходимо указать способ оплаты';
		}
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		this.formErrors = errors;
		this.events.emit('orderFormErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateContacts() {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.formErrors = errors;
		this.events.emit('contactFormErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
