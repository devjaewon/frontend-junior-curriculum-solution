import { createElement as e } from '../lib/ReactElement';

export default function Header() {
	return e('header', { className: 'header' }, [
		e('h1', null, 'Team Sparta'),
	]);
};
