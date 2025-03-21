import { IProduct } from './../../types/index';
import { categoryColor, ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { EventEmitter } from '../base/events';

export class Card extends Component<IProduct> {
	protected categoryElement: HTMLElement;
	protected titleElement: HTMLElement;
	protected imageElement: HTMLImageElement;
	protected priceElement: HTMLElement;
	protected cardButton?: HTMLButtonElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this.categoryElement = ensureElement<HTMLElement>(
			'.card__category',
			container
		);

		this.titleElement = ensureElement<HTMLElement>('.card__title', container);

		this.imageElement = ensureElement<HTMLImageElement>(
			'.card__image',
			container
		);

		this.priceElement = ensureElement<HTMLElement>('.card__price', container);

		// Используем `querySelector вместо `ensureElement чтобы избежать ошибок, если элемента нет
		this.cardButton = container.querySelector(
			'.card__button'
		) as HTMLButtonElement | null;

		if (!this.cardButton) {
			// карточка каталога -> при клике открываем предпросмотр
			container.addEventListener('click', () => {
				this.events.emit('card:selected', { id: this.id });
			});
		} else {
			// Карточка в модальном окне -> при клике добавляем в корзину
			this.cardButton.addEventListener('click', () => {
				this.events.emit('basket:addedToBasket', { id: this.id });
			});
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set category(value: string) {
		this.setText(this.categoryElement, value);
		this.categoryElement.classList.add(categoryColor(value));
	}

	set title(value: string) {
		this.setText(this.titleElement, value);
	}

	get title(): string {
		return this.titleElement.textContent || '';
	}

	set image(value: string) {
		this.setImage(this.imageElement, value, this.title);
	}

	set price(value: number) {
		if (value === null && this.cardButton !== null) {
			this.setButtonInactive();
			this.cardButton.textContent = 'Бесценный товар';
		}
		this.setText(this.priceElement, value + ' синапсов');
	}

	get price(): number {
		return Number(this.priceElement.textContent) || null;
	}

	setButtonInactive(): void {
		this.cardButton.disabled = true;
	}
}

export class CardPreview extends Card {
	protected descriptionElement: HTMLElement;

	constructor(container: HTMLElement, events: EventEmitter) {
		super(container, events);
		this.descriptionElement = ensureElement<HTMLElement>(
			'.card__text',
			this.container
		);
	}

	set description(value: string) {
		this.setText(this.descriptionElement, value);
	}
}
