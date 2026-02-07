import { useEffect, RefObject } from 'react';

type Event = MouseEvent | TouchEvent;

export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
    ref: RefObject<T | null>,
    handler: (event: Event) => void
) => {
    useEffect(() => {
        const mouseDownListener = (event: Event) => {
            const el = ref?.current;
            // Do nothing if clicking ref's element or descendent elements
            if (!el || el.contains((event?.target as Node) || null)) {
                return;
            }

            handler(event);
        };

        document.addEventListener('mousedown', mouseDownListener);
        document.addEventListener('touchstart', mouseDownListener);

        return () => {
            document.removeEventListener('mousedown', mouseDownListener);
            document.removeEventListener('touchstart', mouseDownListener);
        };
    }, [ref, handler]);
};
