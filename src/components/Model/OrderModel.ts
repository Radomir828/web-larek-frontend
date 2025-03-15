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
	protected basket: Set<IBasketItem> = new Set();
	protected order: Partial<IOrder> = {};
	protected formErrors: FormErrors = {};

	addToBasket(item: IProduct) {
		const basketItem = {
			id: item.id,
			title: item.title,
			price: item.price,
		};
		this.basket.add(basketItem);

		this.emitChanges('basket: changed', { basket: this.basket });
	}

	removeFromBasket(item: IProduct) {
		const basketItem = Array.from(this.basket).find((b) => b.id === item.id);

		if (basketItem) {
			this.basket.delete(basketItem);
			this.emitChanges('basket: changed', { basket: this.getBasket() });
		} else {
			return;
		}

		// this.basket.filter((basketItem) => basketItem.id !== item.id);
		// this.emitChanges('basket: changed', { basket: this.basket });
	}

	getBasket(): IBasketItem[] {
		return Array.from(this.basket);
	}

	getBasketAmount(): number {
		return this.getBasket().reduce<number>((total, item) => {
			return total + (item.price ?? 0);
		}, 0);
	}

	setOrderField<K extends keyof IOrder>(field: K, value: IOrder[K]) {
		this.order[field] = value;
		if (this.validateOrder()) {
			this.emitChanges('orderForm:ready', this.order);
		} else {
			this.emitChanges('orderForm:error', this.formErrors);
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
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
