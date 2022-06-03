import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

const Container = styled.div`
    width: inherit;
    max-width: inherit;

    ::after {
        border-bottom: 2px solid rgb(0 0 0 / 75%);
        border-right: 2px solid rgb(0 0 0 / 75%);
        content: '';
        display: block;
        height: 12px;
        pointer-events: none;
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translate(0, -65%) rotate(45deg);
        width: 12px;
    }
`;

const Combobox = styled.div`
    word-wrap: normal;
    text-transform: none;
    margin: 0;
    font-family: inherit;
    cursor: default;

    :focus {
        color: #495057;
        background-color: #fff;
        border-color: #80bdff;
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
`;

const Listbox = styled.div`
    display: ${({ open }) => (open ? 'block' : 'none')};

    position: absolute;
    padding: 0;
    color: #495057;

    max-height: 200px;
    overflow-y: hidden;

    z-index: 100;

    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
`;

const Option = styled.option`
    padding: 0.375rem 2rem;
    background-color: ${({ current }) => (current ? 'rgb(0 0 0 / 10%)' : '')};
    cursor: default;

    :hover {
        background-color: rgb(0 0 0 / 10%);
    }

    &[aria-selected='true'] {
        position: relative;
    }

    &[aria-selected='true']::before {
        position: absolute;

        width: 6px;
        height: 12px;

        left: 12px;
        top: 50%;

        border-bottom: 2px solid #495057;
        border-right: 2px solid #495057;
        content: '';
        transform: translate(0, -50%) rotate(45deg);
    }
`;

// Save a list of named combobox actions
const SelectActions = {
    Close: 0,
    CloseSelect: 1,
    First: 2,
    Last: 3,
    Next: 4,
    Open: 5,
    PageDown: 6,
    PageUp: 7,
    Previous: 8,
    Select: 9,
    Type: 10
};

/*
 * Helper functions
 */

// filter an array of options against an input string
// returns an array of options that begin with the filter string, case-independent
function filterOptions(options = [], filter, exclude = []) {
    return options.filter(option => {
        const matches =
            option.toLowerCase().indexOf(filter.toLowerCase()) === 0;
        return matches && exclude.indexOf(option) < 0;
    });
}

// map a key press to an action
function getActionFromKey(event, menuOpen) {
    const { key, altKey, ctrlKey, metaKey } = event;
    const openKeys = ['ArrowDown', 'ArrowUp', 'Enter', ' ']; // all keys that will do the default open action
    // handle opening when closed
    if (!menuOpen && openKeys.includes(key)) {
        return SelectActions.Open;
    }

    // home and end move the selected option when open or closed
    if (key === 'Home') {
        return SelectActions.First;
    }
    if (key === 'End') {
        return SelectActions.Last;
    }

    // handle typing characters when open or closed
    if (
        key === 'Backspace' ||
        key === 'Clear' ||
        (key.length === 1 && key !== ' ' && !altKey && !ctrlKey && !metaKey)
    ) {
        return SelectActions.Type;
    }

    // handle keys when open
    if (menuOpen) {
        if (key === 'ArrowUp' && altKey) {
            return SelectActions.CloseSelect;
        } else if (key === 'ArrowDown' && !altKey) {
            return SelectActions.Next;
        } else if (key === 'ArrowUp') {
            return SelectActions.Previous;
        } else if (key === 'PageUp') {
            return SelectActions.PageUp;
        } else if (key === 'PageDown') {
            return SelectActions.PageDown;
        } else if (key === 'Escape') {
            return SelectActions.Close;
        } else if (key === 'Enter' || key === ' ') {
            return SelectActions.CloseSelect;
        }
    }
}

// return the index of an option from an array of options, based on a search string
// if the filter is multiple iterations of the same letter (e.g "aaa"), then cycle through first-letter matches
function getIndexByLetter(options, filter, startIndex = 0) {
    const orderedOptions = [
        ...options.slice(startIndex),
        ...options.slice(0, startIndex)
    ];
    const firstMatch = filterOptions(orderedOptions, filter)[0];
    const allSameLetter = array => array.every(letter => letter === array[0]);

    // first check if there is an exact match for the typed string
    if (firstMatch) {
        return options.indexOf(firstMatch);
    }

    // if the same letter is being repeated, cycle through first-letter matches
    else if (allSameLetter(filter.split(''))) {
        const matches = filterOptions(orderedOptions, filter[0]);
        return options.indexOf(matches[0]);
    }

    // if no matches, return -1
    else {
        return -1;
    }
}

// get an updated option index after performing an action
function getUpdatedIndex(currentIndex, maxIndex, action) {
    const pageSize = 10; // used for pageup/pagedown

    switch (action) {
        case SelectActions.First:
            return 0;
        case SelectActions.Last:
            return maxIndex;
        case SelectActions.Previous:
            return Math.max(0, currentIndex - 1);
        case SelectActions.Next:
            return Math.min(maxIndex, currentIndex + 1);
        case SelectActions.PageUp:
            return Math.max(0, currentIndex - pageSize);
        case SelectActions.PageDown:
            return Math.min(maxIndex, currentIndex + pageSize);
        default:
            return currentIndex;
    }
}

// check if element is visible in browser view port
function isElementInView(element) {
    var bounding = element.getBoundingClientRect();

    return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <=
            (window.innerHeight || document.documentElement.clientHeight) &&
        bounding.right <=
            (window.innerWidth || document.documentElement.clientWidth)
    );
}

// check if an element is currently scrollable
function isScrollable(element) {
    return element && element.clientHeight < element.scrollHeight;
}

// ensure a given child element is within the parent's visible scroll area
// if the child is not visible, scroll the parent
function maintainScrollVisibility(activeElement, scrollParent) {
    const { offsetHeight, offsetTop } = activeElement;
    const { offsetHeight: parentOffsetHeight, scrollTop } = scrollParent;

    const isAbove = offsetTop < scrollTop;
    const isBelow = offsetTop + offsetHeight > scrollTop + parentOffsetHeight;

    if (isAbove) {
        scrollParent.scrollTo(0, offsetTop);
    } else if (isBelow) {
        scrollParent.scrollTo(0, offsetTop - parentOffsetHeight + offsetHeight);
    }
}

const SelectCombobox = ({
    id = 'browser',
    options = ['--', 'Chrome', 'Firefox', 'Safari']
}) => {
    const comboboxRef = useRef();
    const listboxRef = useRef();

    const activeIndexRef = useRef(0);
    const ignoreBlurRef = useRef(false);
    const openRef = useRef(false);
    const searchStringRef = useRef('');
    const searchTimeoutRef = useRef(null);
    const optionElRefs = useRef({});

    const [isOpen, setIsOpen] = useState(false);
    const [activeId, setActiveId] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const getSearchString = char => {
        // reset typing timeout and start new timeout
        // this allows us to make multiple-letter matches, like a native select
        if (typeof searchTimeoutRef.current === 'number') {
            window.clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = window.setTimeout(() => {
            searchStringRef.current = '';
        }, 500);

        // add most recent letter to saved search string
        searchStringRef.current += char;
        return searchStringRef.current;
    };

    const onComboBlur = () => {
        // do not do blur action if ignoreBlur flag has been set
        if (ignoreBlurRef.current) {
            ignoreBlurRef.current = false;
            return;
        }

        // select current option and close
        if (openRef.current) {
            selectOption(activeIndexRef.current);
            updateMenuState(false, false);
        }
    };

    const onComboClick = () => {
        updateMenuState(!openRef.current, false);
    };

    const onComboKeyDown = e => {
        const { key } = e;
        const max = options.length - 1;

        const action = getActionFromKey(e, openRef.current);

        switch (action) {
            case SelectActions.Last:
            case SelectActions.First:
                updateMenuState(true);
            // intentional fallthrough
            case SelectActions.Next:
            case SelectActions.Previous:
            case SelectActions.PageUp:
            case SelectActions.PageDown:
                e.preventDefault();
                return onOptionChange(
                    getUpdatedIndex(activeIndexRef.current, max, action)
                );
            case SelectActions.CloseSelect:
                e.preventDefault();
                selectOption(activeIndexRef.current);
            // intentional fallthrough
            case SelectActions.Close:
                e.preventDefault();
                return updateMenuState(false);
            case SelectActions.Type:
                return onComboType(key);
            case SelectActions.Open:
                e.preventDefault();
                return updateMenuState(true);
        }
    };

    const onComboType = letter => {
        // open the listbox if it is closed
        updateMenuState(true);

        // find the index of the first matching option
        const searchString = getSearchString(letter);
        const searchIndex = getIndexByLetter(
            options,
            searchString,
            activeIndexRef.current + 1
        );

        // if a match was found, go to it
        if (searchIndex >= 0) {
            onOptionChange(searchIndex);
        }
        // if no matches, clear the timeout and search string
        else {
            window.clearTimeout(searchTimeoutRef.current);
            searchStringRef.current = '';
        }
    };

    const onOptionChange = index => {
        // update state
        activeIndexRef.current = index;

        // update aria-activedescendant
        setActiveId(`combobox-${id}-${activeIndexRef.current}`);

        // ensure the new option is in view
        if (isScrollable(listboxRef.current)) {
            maintainScrollVisibility(
                optionElRefs.current[index],
                listboxRef.current
            );
        }

        // ensure the new option is in view
        if (!isElementInView(optionElRefs.current[index])) {
            optionElRefs.current[index].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    };

    const onOptionClick = index => {
        onOptionChange(index);
        selectOption(index);
        updateMenuState(false);
    };

    const onOptionMouseDown = () => {
        // Clicking an option will cause a blur event,
        // but we don't want to perform the default keyboard blur action
        ignoreBlurRef.current = true;
    };

    const selectOption = index => {
        // update state
        activeIndexRef.current = index;

        // update displayed value
        setSelectedIndex(index);
    };

    const updateMenuState = (open, callFocus = true) => {
        if (openRef.current === open) {
            return;
        }

        // update state
        openRef.current = open;

        // update aria-expanded
        setIsOpen(open);

        // update activedescendant
        const activeId = open ? `combobox-${id}-${activeIndexRef.current}` : '';
        setActiveId(activeId);

        if (activeId === '' && !isElementInView(comboboxRef.current)) {
            comboboxRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }

        // move focus back to the combobox, if needed
        callFocus && comboboxRef.current.focus();
    };

    return (
        <Container>
            <Combobox
                ref={comboboxRef}
                role="combobox"
                className="form-control"
                tabIndex="0"
                aria-expanded={isOpen}
                aria-activedescendant={isOpen && activeId ? activeId : null}
                onBlur={onComboBlur}
                onClick={onComboClick}
                onKeyDown={onComboKeyDown}
            >
                {options[selectedIndex]}
            </Combobox>
            <Listbox
                ref={listboxRef}
                role="listbox"
                open={isOpen}
                tabIndex="-1"
            >
                {options.map((option, index) => (
                    <Option
                        ref={ref => [(optionElRefs.current[index] = ref)]}
                        id={`combobox-${id}-${index}`}
                        key={`combobox-${id}-${index}`}
                        current={activeId === `combobox-${id}-${index}`}
                        aria-selected={selectedIndex === index}
                        onClick={e => {
                            e.stopPropagation();
                            onOptionClick(index);
                        }}
                        onMouseDown={onOptionMouseDown}
                    >
                        {option}
                    </Option>
                ))}
            </Listbox>
        </Container>
    );
};

SelectCombobox.propTypes = {
    id: PropTypes.string,
    options: PropTypes.array
};

export default SelectCombobox;
