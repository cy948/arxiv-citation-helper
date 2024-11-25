import { useEffect, useState } from 'react'

export default function Citations() {
    const [citation, setCitation] = useState<string>('');
    const [firstAuthor, setFirstAuthor] = useState<string>('');
    const [citationInfo, setCitationInfo] = useState<string>('');
    const [showFull, setShowFull] = useState<boolean>(true);

    const handleViewOnGoogleScholar = () => {
        const url = `https://scholar.google.com/scholar?q=${encodeURI(citationInfo)}`;
        window.open(url);
    }

    // Listen mouseover event
    useEffect(() => {
        document.addEventListener('mouseover', (event) => {
            const target = event.target as HTMLElement;
            if (target.tagName === 'A' || target.tagName === 'SPAN') {
                // If is a bib item
                if (target.className === 'ltx_ref' || target.className === 'ltx_text') {
                    const ret = extractCitationAndAuthor(document, target);
                    if (ret) {
                        const { citation, firstAuthor, citationInfo } = ret;
                        setCitation(citation.textContent || '');
                        setFirstAuthor(firstAuthor);
                        setCitationInfo(citationInfo);
                    }
                }
            }
        });
    });
    return (
        <div className={'fixed bottom-0 right-[40%] translate-x-[50%] arxiv-background border border-black p-2.5 max-w-[80vw] max-h-[20vh] overflow-auto'} id='bib-item-popup'>
            <div className='text-lg font-bold'>{firstAuthor}</div>
            <div dangerouslySetInnerHTML={{ __html: citation }} />
            <button 
                className="p-1 mt-2.5 border border-black cursor-pointer absolute bottom-0 right-0 arxiv-background" 
                onClick={handleViewOnGoogleScholar}
                >
                View on Google Scholar
            </button>
        </div>
    );
}

function extractCitationAndAuthor(document: Document, target: HTMLElement): 
    { 
        citation: HTMLElement;
        firstAuthor: string;
        citationInfo: string;
    } | undefined 
{
    let citation;
    let firstAuthor = '';
    // find the bib item
    let href = target.getAttribute('href');
    if (!href) {
        // If the target is a span, find the parent element
        const parent = target.parentElement;
        if (parent) {
            href = parent.getAttribute('href');
        }
    }
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
        console.warn('No bib item found with id:', `${bibItemNumber}`);
        return;
    }
    console.log('Found bib item:', bibItem);
    citation = bibItem;

    // Minimal the content 
    // Remove the button
    const button = citation.getElementsByTagName('button')[0];
    if (button) button.remove();

    // Get the first author
    const refnumSpan = citation.querySelector('.ltx_tag.ltx_role_refnum.ltx_tag_bibitem');
    if (refnumSpan) {
        const textContent = refnumSpan.textContent || '';
        firstAuthor = textContent.split(' et')[0].trim();
    }

    // Remove co-authors to minimize the popup
    // Concat all sub strings
    const bibblocks = citation.querySelectorAll('.ltx_bibblock');
    let citationInfo = ''
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
        citationInfo += block.textContent || '';
    });
    return { citation, firstAuthor, citationInfo };
}