import { useEffect, useState } from 'react'
import './style.css'

import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from "@/components/ui/menubar"

import { useToast } from "@/hooks/use-toast"

export default function Citations() {
    const [citation, setCitation] = useState<string>('');
    const [firstAuthor, setFirstAuthor] = useState<string>('');
    const [citationInfo, setCitationInfo] = useState<string>('');

    const [figure, setFigure] = useState<string>();
    const [figureShort, setFigureShort] = useState<string>('');
    const [figureInfo, setFigureInfo] = useState<string>('');

    const { toast } = useToast();

    const handleViewOnGoogleScholar = () => {
        const url = `https://scholar.google.com/scholar?q=${encodeURI(citationInfo)}`;
        window.open(url);
    }

    const handleRadioChange = (value: string) => {
        switch (value) {
            case 'copy':
                navigator.clipboard.writeText(citation);
                toast({
                    title: 'Copied',
                })
                break;
            case 'google_scholar':
                handleViewOnGoogleScholar();
                break;
        }
    }

    // Listen mouseover event
    useEffect(() => {
        document.addEventListener('mouseover', (event) => {
            const target = event.target as HTMLElement;
            if (target.tagName === 'A' || target.tagName === 'SPAN') {
                const classNames = target.className.split(' ');
                // If is a bib item
                if (classNames.includes('ltx_ref') || classNames.includes('ltx_text')) {
                    const tagType = detectRefType(document, target);
                    if (tagType?.type === 'bibitem') {
                        const ret = extractCitationAndAuthor(tagType?.item);
                        if (ret) {
                            const { citation, firstAuthor, citationInfo } = ret;
                            setCitation(citation.textContent || '');
                            setFirstAuthor(firstAuthor);
                            setCitationInfo(citationInfo);
                        }
                    } else if (tagType?.type === 'figure') {
                        const ret = extractFigures(tagType?.item);
                        if (ret) {
                            const { figure, info, short } = ret;
                            setFigure(figure.outerHTML);
                            setFigureShort(short);
                            setFigureInfo(info);
                        }
                    }
                }
            }
        });
    });

    return (
        <>
            <div className={'fixed bottom-0 right-[40%] translate-x-[50%]'}>
                <Menubar style={{ borderRadius: '0.5rem' }}>
                    <MenubarMenu>
                        <MenubarTrigger>{firstAuthor ? `${firstAuthor} et al.` : 'Citation'}</MenubarTrigger>
                        <MenubarContent style={{ borderRadius: '0.5rem' }}>
                            <MenubarItem disabled={true}>
                                <div dangerouslySetInnerHTML={{ __html: citation }} className='max-w-[40vw]'></div>
                            </MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem onClick={() => handleRadioChange('copy')} disabled={!firstAuthor}>
                                Copy
                            </MenubarItem>
                            <MenubarItem onClick={() => handleRadioChange('google_scholar')} disabled={!firstAuthor}>
                                View on Google Scholar
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger>{figure ? figureShort : 'Figures'}</MenubarTrigger>
                        <MenubarContent style={{ borderRadius: '0.5rem'}}>
                            <MenubarItem className='max-w-[80vw] max-h-[70vh] scroll-auto' disabled={true}>
                                <div dangerouslySetInnerHTML={{__html: figure ?? ''}}/>
                            </MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
            </div>
        </>
    )
}

function detectRefType(document: Document, target: HTMLElement): { type: 'bibitem' | 'figure', item: HTMLElement } | undefined {
    // find the href
    let href = target.getAttribute('href');
    if (!href) {
        // If the target is a span, find the parent element
        const parent = target.parentElement;
        if (parent)
            href = parent.getAttribute('href');
    }
    if (!href) {
        console.warn('No href attribute found on the bib item');
        return;
    }

    // Match the `#` character and the rest of the string
    const matchBib = href.match(/#bib\.\w+/);

    // Match the number after the `#` character
    const bibItemNumber = matchBib ? matchBib[0] : '';
    const bibItem = document.getElementById(bibItemNumber.replace('#', ''));
    if (bibItem) {
        return {
            type: 'bibitem',
            item: bibItem
        }
    }

    // find the figure item
    const matchFigure = href.match(/#S\d+\.\w+/);
    console.log('Matched figure:', matchFigure);
    const figureItemNumber = matchFigure ? matchFigure[0] : '';
    const figureItem = document.getElementById(figureItemNumber.replace('#', ''));
    if (figureItem) {
        return {
            type: 'figure',
            item: figureItem
        }
    }
}

function extractCitationAndAuthor(bibItem: HTMLElement): {
    citation: HTMLElement;
    firstAuthor: string;
    citationInfo: string;
} | undefined {
    let citation;
    let firstAuthor = '';
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

function extractFigures(figureItem: HTMLElement): {
    figure: HTMLElement;
    info: string;
    short: string
} | undefined {
    let figureShort = 'figureShort';
    let figureInfo = 'figureInfo'
    const figcaptionTag = figureItem.getElementsByTagName('figcaption')?.[0];
    if (figcaptionTag) {
        const shortTag = figcaptionTag.querySelector('.ltx_text')
        figureShort = shortTag?.textContent || 'figureShort';
        const infoTag = figcaptionTag.querySelector('.ltx_caption .ltx_text:nth-of-type(2)')
        figureInfo = infoTag?.textContent || 'figureInfo';
        return {
            figure: figureItem,
            info: figureInfo,
            short: figureShort
        }
    }
    return
}