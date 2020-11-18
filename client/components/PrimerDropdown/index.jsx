import React from 'react';
import { SelectMenu } from '@primer/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const PrimerDropdown = props => {
    const { children } = props;

    return (
        <SelectMenu aria-label="Additional actions menu">
            <summary>
                <FontAwesomeIcon icon={faEllipsisV} />
            </summary>
            <SelectMenu.Modal align="right">
                <SelectMenu.List>{children}</SelectMenu.List>
            </SelectMenu.Modal>
        </SelectMenu>
    );
};

PrimerDropdown.propTypes = {
    children: PropTypes.any
};

export default PrimerDropdown;
