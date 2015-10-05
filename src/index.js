import './Api';
import {Loader} from './Loader';
export {PagesController, Roots, Root, I18n} from './States';
export {Page} from './Page';
export * as pq from './query';
export {preprocess} from './preprocess';

export {Loader as PageLoader};
export var currentLoader = new Loader();

export function setPageLoader(loader: Loader) {
	currentLoader = loader;
}
