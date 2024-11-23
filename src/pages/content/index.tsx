import { createRoot } from 'react-dom/client';
import './style.css'
const div = document.createElement('div');
div.id = '__root';
document.body.appendChild(div);

const rootContainer = document.querySelector('#__root');
if (!rootContainer) throw new Error("Can't find Content root element");
const root = createRoot(rootContainer);
root.render(
  <div className='absolute bottom-0 left-0 text-lg text-black bg-amber-400 z-50'  >
    content script <span className='your-class'>loaded</span>
  </div>
);

try {
  console.log('content script loaded');
  // src/pages/content/hoverListener.ts
  document.addEventListener('mouseover', (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'A') {
      console.log('Hovered over an <a> element with class:', target.className);
      // If is a bib item
      if (target.className === 'ltx_ref') {
        // find the bib item
        const href = target.getAttribute('href');
        if (!href) {
          console.warn('No href attribute found on the bib item');
          return;
        }
        // Match the `#` character and the rest of the string
        const match = href.match(/#(.*)/);
        // Match the number after the `#` character
        const bibItemNumber = match ? match[1] : '';
        const bibItem = document.getElementById(`${bibItemNumber}`);
        if (!bibItem) {
          console.warn('No bib item found with id:', `bib.bib${bibItemNumber}`);
          return;
        }
        console.log('Found bib item:', bibItem);

        // Create and show the popup
        const popupId = 'bib-item-popup';
        let popup = document.getElementById(popupId);
        if (!popup)
          popup = document.createElement('div');
        popup.id = 'bib-item-popup';
        popup.innerHTML = bibItem.innerHTML;
        // Don't render `button`
        const button = popup.getElementsByTagName('button')[0];
        if (button) button.remove();
        popup.style.position = 'fixed';
        popup.style.bottom = '0';
        popup.style.left = '50%';
        popup.style.transform = 'translateX(-50%)';
        // use --background-color
        popup.style.backgroundColor = 'var(--background-color)';
        popup.style.border = '1px solid black';
        popup.style.padding = '10px';
        popup.style.width = '90vw';
        document.body.appendChild(popup);
      }
    }
  });
} catch (e) {
  console.error(e);
}
