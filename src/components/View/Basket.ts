import { IBasketItem } from './../../types/index';
import { createElement, ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { EventEmitter } from '../base/events';

interface IBasket {
	basketList: HTMLElement[];
	totalPrice: number;
}
export class Basket extends Component<IBasket> {
	protected basketListElement: HTMLUListElement;
	protected basketButtonelement: HTMLButtonElement;
	protected basketpriceElement: HTMLElement;
	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this.basketListElement = ensureElement<HTMLUListElement>(
			'.basket__list',
			container
		);

		this.basketButtonelement = ensureElement<HTMLButtonElement>(
			'.basket__button',
			container
		);

		this.basketpriceElement = ensureElement<HTMLElement>(
			'.basket__price',
			container
		);

		this.basketButtonelement.addEventListener('click', () => {
			this.events.emit('basket:order');
		});
	}

	set totalPrice(value: number) {
		this.setText(this.basketpriceElement, value);
	}

	set basketList(basketItems: HTMLElement[]) {
		if (basketItems.length) {
			this.basketListElement.replaceChildren(...basketItems);
			this.basketButtonelement.disabled = false;
		} else {
			this.basketButtonelement.disabled = true;
			this.basketListElement.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
		}
	}
}

interface IBasketItemView extends IBasketItem {
	index: number;
}

export class BasketItem extends Component<IBasketItemView> {
	protected basketItemIndex: HTMLElement;
	protected basketItemTitle: HTMLElement;
	protected basketItemPrice: HTMLElement;
	protected basketItemButton: HTMLButtonElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this.basketItemIndex = ensureElement<HTMLElement>(
			'.basket__item-index',
			container
		);

		this.basketItemTitle = ensureElement<HTMLElement>(
			'.card__title',
			container
		);
		this.basketItemPrice = ensureElement<HTMLElement>(
			'.card__price',
			container
		);

		this.basketItemButton = ensureElement<HTMLButtonElement>(
			'.card__button',
			container
		);

		this.basketItemButton.addEventListener('click', () => {
			this.events.emit('basket:removedFromBasket', { id: this.id });
		});
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this.basketItemTitle, value);
	}

	get title(): string {
		return this.basketItemTitle.textContent || '';
	}

	set price(value: number) {
		this.setText(this.basketItemPrice, value + ' синапсов');
	}

	get price(): number {
		return Number(this.basketItemPrice.textContent) || null;
	}

	set index(value: number) {
		this.setText(this.basketItemIndex, value);
	}
}
