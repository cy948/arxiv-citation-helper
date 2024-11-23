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
  const popupId = 'bib-item-popup';
  console.log('content script loaded');
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

        // ==============================
        // ===== The popup content ======
        // ==============================

        // ------------------------------
        // 1. Create and show the popup
        // ------------------------------
        let popup = document.getElementById(popupId);
        if (!popup)
          popup = document.createElement('div');
        popup.id = 'bib-item-popup';
        popup.innerHTML = bibItem.innerHTML;

        // ------------------------------
        // 2. Minimal the content
        // - Remove the button
        // - Remove co-authors
        // ------------------------------

        // Don't render `button`
        const button = popup.getElementsByTagName('button')[0];
        if (button) button.remove();

        // Get the first author's name
        const refnumSpan = popup.querySelector('.ltx_tag.ltx_role_refnum.ltx_tag_bibitem');
        let firstAuthor = '';
        if (refnumSpan) {
          const textContent = refnumSpan.textContent || '';
          firstAuthor = textContent.split(' et')[0].trim();
        }

        // Remove co-authors to minimize the popup
        // Concat all sub strings
        const bibblocks = popup.querySelectorAll('.ltx_bibblock');
        let articalInfos = ''
        bibblocks.forEach((block) => {
          // Use regex to match the first author's name
          const match = block.textContent?.match(new RegExp(firstAuthor, 'i'));
          const matched = match && match.length > 0;
          if (matched) {
            block.remove();
            let nextSibling = block.nextElementSibling;
            while (nextSibling && nextSibling.classList.contains('ltx_bibblock')) {
              nextSibling.remove();
              nextSibling = block.nextElementSibling;
            }
          }

          // Concat all sub strings
          articalInfos += block.textContent || '';
        });

        // ------------------------------
        // 3. Style the popup
        // - position: fixed
        // - color: support dark or light mode
        // - size
        //  - max-height: 20vh
        //  - max-width: 80vw
        // ------------------------------

        // positioning: bottom-right
        popup.style.position = 'fixed';
        popup.style.bottom = '0';
        popup.style.right = '40%';
        popup.style.transform = 'translateX(50%)';

        // color
        popup.style.backgroundColor = 'var(--background-color)';

        // size
        popup.style.border = '1px solid black';
        popup.style.padding = '10px';
        popup.style.maxWidth = '80vw';
        popup.style.maxHeight = '20vh';

        // make the content scrollable
        popup.style.overflow = 'auto';

        // ------------------------------
        // 4. Render the buttons
        // ------------------------------

        // Create a button to goto the google scholar page
        let buttonElement = document.getElementById('goto-google-scholar');
        if (!buttonElement) 
          buttonElement = document.createElement('button');
        buttonElement.id = 'goto-google-scholar';
        buttonElement.textContent = 'View in Google Scholar';
        buttonElement.style.padding = '5px';
        buttonElement.style.marginTop = '10px';
        buttonElement.style.backgroundColor = 'var(--background-color)';
        buttonElement.style.color = 'var(--color)';
        buttonElement.style.border = '1px solid black';
        buttonElement.style.cursor = 'pointer';
        // Position on bottom right
        buttonElement.style.position = 'absolute';
        buttonElement.style.bottom = '0';
        buttonElement.style.right = '0';
        buttonElement.onclick = () => {
          window.open(`https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=${encodeURI(articalInfos)}`);
        };
        popup.appendChild(buttonElement);

        document.body.appendChild(popup);
      }
    }
  });
} catch (e) {
  console.error(e);
}
