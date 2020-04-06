import React, { Component } from 'react';

import {
    useMenuState,
    Menu,
    MenuItem,
    MenuButton,
    MenuSeparator
  } from "reakit";
  
const AppMenu = () => {
    const menu = useMenuState();
    return (
        <React.Fragment>
            <MenuButton {...menu}>Gear Icon</MenuButton>
            <Menu {...menu} tabIndex={0} aria-label="Preferences">
                <MenuItem {...menu}>Account Settings</MenuItem>
                <MenuItem {...menu}>User Management</MenuItem>
                <MenuItem {...menu}>Logout</MenuItem>
            </Menu>
        </React.Fragment>
    );
}

  export default AppMenu;