import { createRoot } from 'react-dom/client';
import './style.css'
import Citations from './Citations';
const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const rootContainer = document.querySelector('#root');
if (!rootContainer) throw new Error("Can't find Content root element");
const root = createRoot(rootContainer);
root.render(
  <Citations/>
);
