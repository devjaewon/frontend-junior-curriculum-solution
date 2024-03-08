import App from './App';
import { createElement as e } from './lib/ReactElement';
import { createRoot } from './lib/Renderer';

const root = createRoot(document.getElementById('app')!);
root.render(e(App, null, null));
