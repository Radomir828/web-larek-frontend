import { ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';
import { Component } from '../base/Component';

interface IPage {
	catalog: HTMLElement[];
	counter: number;
	locked: boolean;
}

export class Page extends Component<IPage> {
	protected catalogContainer: HTMLElement;
	protected counterElement: HTMLElement;
	protected basketButton: HTMLButtonElement;
	protected wrapperElement: HTMLElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);
		this.catalogContainer = ensureElement<HTMLElement>(
			'.gallery',
			this.container
		);
		this.counterElement = ensureElement<HTMLElement>(
			'.header__basket-counter',
			this.container
		);
		this.basketButton = ensureElement<HTMLButtonElement>(
			'.header__basket',
			this.container
		);

		this.wrapperElement = ensureElement<HTMLElement>(
			'.page__wrapper',
			this.container
		);

		this.basketButton.addEventListener('click', () => {
			this.events.emit('basket:open');
		});
	}

	set catalog(items: HTMLElement[]) {
		this.catalogContainer.replaceChildren(...items);
	}

	set counter(value: number) {
		this.setText(this.counterElement, String(value));
	}

	set locked(value: boolean) {
		if (value) {
			this.wrapperElement.classList.add('page__wrapper_locked');
		} else {
			this.wrapperElement.classList.remove('page__wrapper_locked');
		}
	}
}
