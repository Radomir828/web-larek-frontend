import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { EventEmitter } from '../base/events';

interface ISuccess {
	total: number;
}

export class Success extends Component<ISuccess> {
	protected buttonElement: HTMLButtonElement;
	protected descriptionElement: HTMLElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);
		this.buttonElement = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			container
		);

		this.descriptionElement = ensureElement<HTMLElement>(
			'.order-success__description',
			container
		);

		this.buttonElement.addEventListener('click', () => {
			this.events.emit('order-success:close');
		});
	}

	set total(value: number) {
		this.setText(this.descriptionElement, 'списано ' + value + ' синапсов');
	}
}
