import { createElement as e } from './lib/react/ReactElement';
import Header from './components/Header';
import Main from './components/Main';

export default function App () {
	return e('div', { className: 'wrap' }, [
		e(Header, null, null),
		e(Main, null, null),
	]);
}
