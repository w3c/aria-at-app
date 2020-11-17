import React from 'react';
import {Dropdown} from '@primer/components';
import '@primer/css/utilities/index.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEllipsisV
} from '@fortawesome/free-solid-svg-icons';

const PrimerDropdown = (props) => {
    const { children } = props;

    return (
        <Dropdown overlay={true} >
        <summary>
            <FontAwesomeIcon icon={faEllipsisV} />
        </summary>
        {children}
        </Dropdown>
    );
}

export default PrimerDropdown;