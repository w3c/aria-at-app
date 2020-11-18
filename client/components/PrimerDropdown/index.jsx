import React, { useState, useEffect } from 'react';
import {Dropdown} from '@primer/components';
import '@primer/css/utilities/index.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEllipsisV
} from '@fortawesome/free-solid-svg-icons';

const PrimerDropdown = (props) => {
    const { children } = props;

    const [open, setOpen] = useState(false);

    const handleToggle = (e) => setOpen(e.target.open)
    const handleClickOutside = () => setOpen(false)

    useEffect(() => {
        const handleEsc = (event) => {
           if (event.keyCode === 27) {
            setOpen(false);
          }
        };

        window.addEventListener('keydown', handleEsc, false);
    
        return () => {
          window.removeEventListener('keydown', handleEsc, false);
        };
      });

    return (
        <Dropdown open={open} onToggle={handleToggle} onClickOutside={handleClickOutside} overlay={true} >
        <summary>
            <FontAwesomeIcon icon={faEllipsisV} />
        </summary>
        {children}
        </Dropdown>
    );
}

export default PrimerDropdown;